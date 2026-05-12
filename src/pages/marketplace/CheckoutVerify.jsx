import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyPayment } from '../../api/payments';
import { useCart } from '../../context/CartContext';
import { PageSpinner } from '../../components/shared/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const CheckoutVerify = () => {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'failed'
  const [order, setOrder] = useState(null);
  const { clearCart } = useCart();

  useEffect(() => {
    const reference = params.get('reference');
    if (!reference) {
      setStatus('failed');
      return;
    }

    verifyPayment(reference)
      .then(({ data }) => {
        setOrder(data.order);
        setStatus('success');
        clearCart(); // clear cart after successful payment
      })
      .catch(() => setStatus('failed'));
  }, []);

  if (status === 'loading') return <PageSpinner />;

  if (status === 'failed') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Payment Failed</h1>
        <p className="text-gray-500 mb-6">Your payment could not be verified. Please try again or contact support.</p>
        <Link to="/checkout" className="btn-primary">Try Again</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
      <p className="text-gray-500 mb-6">Your payment was successful. Your order is being processed.</p>

      {order && (
        <div className="card p-5 text-left mb-6">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-500">Order Date</span>
            <span className="font-medium">{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-500">Status</span>
            <span className="font-medium capitalize text-primary-600">{order.status}</span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-500">Total Paid</span>
            <span className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
          </div>

          {/* Items */}
          <div className="border-t border-gray-100 pt-3 mt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Items</p>
            {order.items?.map((item) => (
              <div key={item.product._id} className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                  {item.product.images?.[0]
                    ? <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-sm">🌿</div>
                  }
                </div>
                <span className="text-xs text-gray-700 flex-1 truncate">{item.product.name}</span>
                <span className="text-xs text-gray-500">×{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <Link to="/dashboard" className="btn-secondary">View Orders</Link>
        <Link to="/marketplace" className="btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
};

export default CheckoutVerify;
