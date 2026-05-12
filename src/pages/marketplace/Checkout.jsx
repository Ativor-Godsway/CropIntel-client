import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { createOrder } from '../../api/orders';
import { initializePayment } from '../../api/payments';
import { formatCurrency } from '../../utils/formatCurrency';
import { Spinner } from '../../components/shared/Spinner';

const GHANA_REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central',
  'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong-Ahafo',
  'Oti', 'Bono East', 'Ahafo', 'Savannah', 'North East',
  'Western North',
];

const Checkout = () => {
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    region: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.fullName || !address.phone || !address.address || !address.city || !address.region) {
      return toast.error('Please fill in all shipping details');
    }
    if (items.length === 0) {
      return toast.error('Your cart is empty');
    }

    setLoading(true);
    try {
      // 1. Create the order in the database
      const orderItems = items.map((i) => ({
        productId: i.product._id,
        quantity: i.quantity,
      }));

      const { data: orderData } = await createOrder({
        items: orderItems,
        shippingAddress: address,
      });

      // 2. Initialize Paystack payment
      const { data: payData } = await initializePayment(orderData.order._id);

      // 3. Redirect to Paystack payment page
      // Cart will be cleared after payment verification
      window.location.href = payData.authorizationUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipping form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">Shipping Information</h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="input"
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="+233 24 000 0000"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  className="input"
                  placeholder="House No., Street, Area"
                  value={address.address}
                  onChange={(e) => setAddress({ ...address, address: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Kumasi"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <select
                  className="input"
                  value={address.region}
                  onChange={(e) => setAddress({ ...address, region: e.target.value })}
                  required
                >
                  <option value="">Select region...</option>
                  {GHANA_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* Payment note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-medium">Secure Payment via Paystack</p>
              <p className="text-xs mt-0.5">You'll be redirected to Paystack to complete your payment. Accepts Mobile Money & Cards.</p>
            </div>

            <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Spinner size="sm" /> Preparing payment...
                </span>
              ) : (
                `Pay ${formatCurrency(totalAmount)} →`
              )}
            </button>
          </form>
        </div>

        {/* Order summary */}
        <div>
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Order ({items.length} items)</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map(({ product, quantity }) => (
                <div key={product._id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                    {product.images?.[0]
                      ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">🌿</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">×{quantity}</p>
                  </div>
                  <p className="text-xs font-bold text-gray-700">{formatCurrency(product.price * quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary-600">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
