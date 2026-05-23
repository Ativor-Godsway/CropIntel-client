import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { createOrder } from '../../api/orders';
import { formatCurrency } from '../../utils/formatCurrency';
import { Spinner } from '../../components/shared/Spinner';

const GHANA_REGIONS = [
  'Greater Accra','Ashanti','Western','Eastern','Central','Northern',
  'Upper East','Upper West','Volta','Brong-Ahafo','Oti','Bono East',
  'Ahafo','Savannah','North East','Western North',
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
    if (items.length === 0) return toast.error('Your cart is empty');

    setLoading(true);
    try {
      const { data } = await createOrder({
        items: items.map((i) => ({ productId: i.product._id, quantity: i.quantity })),
        shippingAddress: address,
      });

      clearCart();
      navigate('/orders/success', { state: { order: data.data?.order || data.order } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-theme-text mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <h2 className="font-semibold text-theme-text">Shipping Information</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { span: 2, label: 'Full Name',      type: 'text', key: 'fullName', placeholder: 'Your full name' },
                { span: 2, label: 'Phone Number',   type: 'tel',  key: 'phone',    placeholder: '+233 24 000 0000' },
                { span: 2, label: 'Street Address', type: 'text', key: 'address',  placeholder: 'House No., Street, Area' },
                { span: 1, label: 'City',           type: 'text', key: 'city',     placeholder: 'Kumasi' },
              ].map(({ span, label, type, key, placeholder }) => (
                <div key={key} className={`col-span-${span}`}>
                  <label className="block text-sm font-medium text-theme-label mb-1">{label}</label>
                  <input
                    type={type}
                    className="input"
                    placeholder={placeholder}
                    value={address[key]}
                    onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
                    required
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-theme-label mb-1">Region</label>
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

            <div
              className="rounded-xl p-3 text-sm"
              style={{ background: 'var(--surface-accent)', border: '1px solid var(--border-accent)', color: 'var(--green-bright)' }}
            >
              <p className="font-medium">Secure Checkout</p>
              <p className="text-xs mt-0.5 opacity-80">Your order will be confirmed immediately after placing.</p>
            </div>

            <button type="submit" className="btn-primary w-full py-3 text-base rounded-xl" disabled={loading}>
              {loading
                ? <span className="flex items-center gap-2 justify-center"><Spinner size="sm" /> Placing order...</span>
                : `Make Payment — ${formatCurrency(totalAmount)}`}
            </button>
          </form>
        </div>

        <div>
          <div className="card p-5">
            <h2 className="font-semibold text-theme-text mb-4">Order ({items.length} items)</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map(({ product, quantity }) => (
                <div key={product._id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                    {product.images?.[0]
                      ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">🌿</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-theme-text truncate">{product.name}</p>
                    <p className="text-xs text-theme-40">×{quantity}</p>
                  </div>
                  <p className="text-xs font-bold text-theme-label">{formatCurrency(product.price * quantity)}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold mt-4 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <span className="text-theme-text">Total</span>
              <span className="text-theme-green">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
