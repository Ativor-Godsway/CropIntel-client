import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateProfile } from '../../api/auth';
import { Spinner } from '../../components/shared/Spinner';
import { getBuyerOrders } from '../../api/orders';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const STATUS_STYLES = {
  pending:    { bg: 'var(--bg-surface)',   color: 'var(--text-muted)' },
  paid:       { bg: 'var(--surface-blue)', color: '#60a5fa'           },
  processing: { bg: 'var(--surface-gold)', color: 'var(--gold)'       },
  shipped:    { bg: 'rgba(167,139,250,0.10)', color: '#a78bfa'        },
  delivered:  { bg: 'var(--surface-accent)', color: 'var(--green-bright)' },
  cancelled:  { bg: 'var(--surface-red)',  color: 'var(--red-text)'   },
};

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', businessName: user?.sellerProfile?.businessName || '', description: user?.sellerProfile?.description || '', location: user?.sellerProfile?.location || '' });

  useEffect(() => { getBuyerOrders().then(({ data }) => setOrders(data.orders)).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await updateProfile({ name: form.name, sellerProfile: { businessName: form.businessName, description: form.description, location: form.location } });
      updateUser(data.user); toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-theme-green" style={{ color: 'var(--green-btn-text)' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-theme-text">{user?.name}</h1>
          <p className="text-sm text-theme-dim">{user?.email || user?.phone}</p>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block" style={{
            background: user?.activeRole === 'seller' ? 'var(--surface-gold)' : 'var(--surface-accent)',
            color: user?.activeRole === 'seller' ? 'var(--gold)' : 'var(--green-bright)',
          }}>{user?.activeRole}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)' }}>
        {['profile','orders','seller'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className="flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize"
            style={{ background: tab === t ? 'var(--surface-active)' : 'transparent', color: tab === t ? 'var(--text-primary)' : 'var(--text-50)' }}>
            {t === 'seller' ? 'Seller Profile' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <h2 className="font-semibold text-theme-text">Personal Information</h2>
          <div>
            <label className="block text-sm font-medium text-theme-label mb-1">Full Name</label>
            <input type="text" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-theme-label mb-1">Email</label>
            <input type="email" className="input" value={user?.email || ''} disabled />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? <Spinner size="sm" /> : 'Save Changes'}</button>
        </form>
      )}

      {tab === 'orders' && (
        <div className="card">
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <h2 className="font-semibold text-theme-text">My Orders ({orders.length})</h2>
          </div>
          {orders.length === 0 ? (
            <div className="py-12 text-center text-theme-hint text-sm">No orders yet.</div>
          ) : (
            <div>
              {orders.map((order, idx) => (
                <div key={order._id} className="px-5 py-4" style={idx > 0 ? { borderTop: '1px solid var(--border-subtle)' } : {}}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-medium text-theme-text">Order #{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-theme-hint">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize" style={STATUS_STYLES[order.status] || STATUS_STYLES.pending}>{order.status}</span>
                  </div>
                  <p className="text-xs text-theme-dim mb-1">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  <p className="text-sm font-bold text-theme-green">{formatCurrency(order.totalAmount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'seller' && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <h2 className="font-semibold text-theme-text">Seller Profile</h2>
          <p className="text-xs text-theme-hint">This information appears on your product listings.</p>
          {[
            { label: 'Business Name', key: 'businessName', placeholder: 'AgroSupply Ghana', type: 'input' },
            { label: 'Business Description', key: 'description', placeholder: 'Tell buyers about your business...', type: 'textarea' },
            { label: 'Location', key: 'location', placeholder: 'Kumasi, Ashanti Region', type: 'input' },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-theme-label mb-1">{label}</label>
              {type === 'textarea' ? (
                <textarea className="input min-h-[80px] resize-y" placeholder={placeholder} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              ) : (
                <input type="text" className="input" placeholder={placeholder} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              )}
            </div>
          ))}
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? <Spinner size="sm" /> : 'Save Seller Profile'}</button>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
