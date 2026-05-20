import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyPayment } from '../../api/payments';
import { useCart } from '../../context/CartContext';
import { PageSpinner } from '../../components/shared/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const CheckoutVerify = () => {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [order, setOrder] = useState(null);
  const { clearCart } = useCart();

  useEffect(() => {
    const reference = params.get('reference');
    if (!reference) { setStatus('failed'); return; }
    verifyPayment(reference).then(({ data }) => { setOrder(data.order); setStatus('success'); clearCart(); }).catch(() => setStatus('failed'));
  }, []);

  if (status === 'loading') return <PageSpinner />;

  if (status === 'failed') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-xl font-bold text-theme-text mb-2">Payment Failed</h1>
        <p className="text-theme-muted mb-6">Your payment could not be verified. Please try again or contact support.</p>
        <Link to="/checkout" className="btn-primary">Try Again</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-2xl font-bold text-theme-text mb-2">Order Confirmed!</h1>
      <p className="text-theme-muted mb-6">Your payment was successful. Your order is being processed.</p>

      {order && (
        <div className="card p-5 text-left mb-6">
          {[
            { label: 'Order Date', value: formatDate(order.createdAt) },
            { label: 'Status', value: order.status, green: true },
            { label: 'Total Paid', value: formatCurrency(order.totalAmount), bold: true },
          ].map(({ label, value, green, bold }) => (
            <div key={label} className="flex justify-between text-sm mb-3">
              <span className="text-theme-dim">{label}</span>
              <span className={`${bold ? 'font-bold text-theme-text' : 'font-medium'} ${green ? 'text-theme-green capitalize' : 'text-theme-label'}`}>{value}</span>
            </div>
          ))}

          <div className="pt-3 mt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <p className="text-xs font-semibold text-theme-hint uppercase mb-2">Items</p>
            {order.items?.map((item) => (
              <div key={item.product._id} className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--bg-surface)' }}>
                  {item.product.images?.[0] ? <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm">🌿</div>}
                </div>
                <span className="text-xs text-theme-label flex-1 truncate">{item.product.name}</span>
                <span className="text-xs text-theme-40">×{item.quantity}</span>
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
