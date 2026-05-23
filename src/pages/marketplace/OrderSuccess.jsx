import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';

const OrderSuccess = () => {
  const { state } = useLocation();
  const order = state?.order;

  if (!order) return <Navigate to="/marketplace" replace />;

  const orderId = order._id?.toString().slice(-8).toUpperCase();

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, var(--hero-glow-1) 0%, transparent 60%)' }} />

      <div className="relative w-full max-w-md text-center">
        <div className="text-7xl mb-6 animate-float">🌿</div>

        <h1 className="font-display text-3xl font-light text-theme-text mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-theme-muted mb-8">
          Thank you for your purchase. We'll get your items to you shortly.
        </p>

        <div className="glass-card p-6 text-left space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <span className="text-sm text-theme-muted">Order ID</span>
            <span className="text-sm font-mono font-semibold text-theme-text">#{orderId}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-theme-muted">Total Paid</span>
            <span className="text-sm font-bold text-theme-green">{formatCurrency(order.totalAmount)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-theme-muted">Status</span>
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: 'var(--surface-accent)', color: 'var(--green-bright)' }}
            >
              Confirmed
            </span>
          </div>

          {order.shippingAddress && (
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <p className="text-xs text-theme-muted mb-1">Delivering to</p>
              <p className="text-sm text-theme-text">{order.shippingAddress.fullName}</p>
              <p className="text-xs text-theme-muted">
                {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.region}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/marketplace" className="btn-primary flex-1 py-2.5 text-center">
            Continue Shopping
          </Link>
          <Link to="/dashboard" className="btn-secondary flex-1 py-2.5 text-center">
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
