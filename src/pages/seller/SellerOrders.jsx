import React, { useEffect, useState } from 'react';
import { getSellerOrders, updateOrderStatus } from '../../api/orders';
import { useToast } from '../../context/ToastContext';
import { PageSpinner } from '../../components/shared/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import EmptyState from '../../components/shared/EmptyState';

const STATUS_COLORS = {
  paid: 'bg-blue-100 text-blue-700',
  processing: 'bg-amber-100 text-amber-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const NEXT_STATUS = {
  paid: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
};

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const toast = useToast();

  useEffect(() => {
    getSellerOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
      toast.success(`Order status updated to ${status}`);
    } catch {
      toast.error('Failed to update order');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <PageSpinner />;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="📦"
        title="No orders yet"
        description="Your orders will appear here once customers purchase your products."
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>

      {orders.map((order) => (
        <div key={order._id} className="card p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-800">
                  Order #{order._id.slice(-8).toUpperCase()}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</p>
            </div>

            {/* Buyer info */}
            <div className="text-sm text-right">
              <p className="font-medium text-gray-700">{order.buyer?.name}</p>
              <p className="text-xs text-gray-400">{order.buyer?.phone || order.buyer?.email}</p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2 mb-4">
            {order.items.map((item) => (
              <div key={item.product._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                  {item.product.images?.[0]
                    ? <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-sm">🌿</div>
                  }
                </div>
                <span className="text-sm text-gray-700 flex-1">{item.product.name}</span>
                <span className="text-xs text-gray-500">×{item.quantity}</span>
                <span className="text-sm font-semibold text-gray-800">
                  {formatCurrency(item.priceAtPurchase * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Shipping */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 mb-4">
            <p className="font-medium text-gray-700 mb-1">Shipping To:</p>
            <p>{order.shippingAddress?.fullName} · {order.shippingAddress?.phone}</p>
            <p>{order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.region}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-800">
              Total: {formatCurrency(order.items.reduce((s, i) => s + i.priceAtPurchase * i.quantity, 0))}
            </p>

            {NEXT_STATUS[order.status] && (
              <button
                onClick={() => handleStatusUpdate(order._id, NEXT_STATUS[order.status])}
                disabled={updating === order._id}
                className="btn-primary text-xs px-3 py-1.5"
              >
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
