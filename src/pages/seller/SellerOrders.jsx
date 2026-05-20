import React, { useEffect, useState } from 'react';
import { getSellerOrders, updateOrderStatus } from '../../api/orders';
import { useToast } from '../../context/ToastContext';
import { PageSpinner } from '../../components/shared/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import EmptyState from '../../components/shared/EmptyState';

const STATUS_STYLES = {
  paid:       { bg: 'var(--surface-blue)', color: '#60a5fa'            },
  processing: { bg: 'var(--surface-gold)', color: 'var(--gold)'        },
  shipped:    { bg: 'rgba(167,139,250,0.10)', color: '#a78bfa'         },
  delivered:  { bg: 'var(--surface-accent)', color: 'var(--green-bright)' },
  cancelled:  { bg: 'var(--surface-red)',  color: 'var(--red-text)'    },
};
const NEXT_STATUS = { paid: 'processing', processing: 'shipped', shipped: 'delivered' };

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const toast = useToast();

  useEffect(() => {
    getSellerOrders().then(({ data }) => setOrders(data.orders)).catch(() => toast.error('Failed to load orders')).finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
      toast.success(`Order status updated to ${status}`);
    } catch { toast.error('Failed to update order'); } finally { setUpdating(null); }
  };

  if (loading) return <PageSpinner />;
  if (orders.length === 0) return <EmptyState icon="📦" title="No orders yet" description="Your orders will appear here once customers purchase your products." />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-theme-dim">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
      {orders.map((order) => (
        <div key={order._id} className="card p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-theme-text">Order #{order._id.slice(-8).toUpperCase()}</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize" style={STATUS_STYLES[order.status] || STATUS_STYLES.paid}>{order.status}</span>
              </div>
              <p className="text-xs text-theme-hint">{formatDateTime(order.createdAt)}</p>
            </div>
            <div className="text-sm text-right">
              <p className="font-medium text-theme-label">{order.buyer?.name}</p>
              <p className="text-xs text-theme-hint">{order.buyer?.phone || order.buyer?.email}</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {order.items.map((item) => (
              <div key={item.product._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--bg-surface)' }}>
                  {item.product.images?.[0] ? <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm">🌿</div>}
                </div>
                <span className="text-sm text-theme-label flex-1">{item.product.name}</span>
                <span className="text-xs text-theme-40">×{item.quantity}</span>
                <span className="text-sm font-semibold text-theme-text">{formatCurrency(item.priceAtPurchase * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-3 text-xs mb-4" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)' }}>
            <p className="font-medium text-theme-label mb-1">Shipping To:</p>
            <p className="text-theme-muted">{order.shippingAddress?.fullName} · {order.shippingAddress?.phone}</p>
            <p className="text-theme-dim">{order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.region}</p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-theme-text">Total: {formatCurrency(order.items.reduce((s, i) => s + i.priceAtPurchase * i.quantity, 0))}</p>
            {NEXT_STATUS[order.status] && (
              <button onClick={() => handleStatusUpdate(order._id, NEXT_STATUS[order.status])} disabled={updating === order._id} className="btn-primary text-xs px-3 py-1.5">
                {updating === order._id ? 'Updating...' : `Mark as ${NEXT_STATUS[order.status]}`}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SellerOrders;
