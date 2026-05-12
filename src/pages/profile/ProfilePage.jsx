import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateProfile } from '../../api/auth';
import { Spinner } from '../../components/shared/Spinner';
import { getBuyerOrders } from '../../api/orders';
import { useEffect } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-600',
  paid: 'bg-blue-100 text-blue-700',
  processing: 'bg-amber-100 text-amber-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('profile'); // 'profile' | 'orders' | 'seller'

  const [form, setForm] = useState({
    name: user?.name || '',
    businessName: user?.sellerProfile?.businessName || '',
    description: user?.sellerProfile?.description || '',
    location: user?.sellerProfile?.location || '',
  });

  useEffect(() => {
    getBuyerOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await updateProfile({
        name: form.name,
        sellerProfile: {
          businessName: form.businessName,
          description: form.description,
          location: form.location,
        },
      });
      updateUser(data.user);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
          <p className="text-sm text-gray-500">{user?.email || user?.phone}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block
            ${user?.activeRole === 'seller' ? 'bg-accent-100 text-accent-700' : 'bg-primary-100 text-primary-700'}`}>
            {user?.activeRole}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        {['profile', 'orders', 'seller'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize
              ${tab === t ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600'}`}
          >
            {t === 'seller' ? 'Seller Profile' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Personal Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="input bg-gray-50" value={user?.email || ''} disabled />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Save Changes'}
          </button>
        </form>
      )}

      {/* Orders tab */}
      {tab === 'orders' && (
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">My Orders ({orders.length})</h2>
          </div>
          {orders.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">No orders yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order._id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm font-bold text-primary-600">{formatCurrency(order.totalAmount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Seller profile tab */}
      {tab === 'seller' && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Seller Profile</h2>
          <p className="text-xs text-gray-500">This information appears on your product listings.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input
              type="text"
              className="input"
              placeholder="AgroSupply Ghana"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
            <textarea
              className="input min-h-[80px] resize-y"
              placeholder="Tell buyers about your business..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              className="input"
              placeholder="Kumasi, Ashanti Region"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Save Seller Profile'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
