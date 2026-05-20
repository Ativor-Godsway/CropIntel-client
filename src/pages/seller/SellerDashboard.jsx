import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const TABS = [
  { path: '/seller', label: 'Analytics', icon: '📊', exact: true },
  { path: '/seller/listings', label: 'My Listings', icon: '📦' },
  { path: '/seller/list', label: 'List Product', icon: '➕' },
  { path: '/seller/orders', label: 'Orders', icon: '🛒' },
];

const SellerDashboard = () => {
  const { pathname } = useLocation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-theme-text mb-1">Seller Hub</h1>
        <p className="text-sm text-theme-muted">Manage your listings, orders, and business analytics</p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)' }}>
        {TABS.map((tab) => {
          const isActive = tab.exact ? pathname === tab.path : pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
              style={{ background: isActive ? 'var(--surface-active)' : 'transparent', color: isActive ? 'var(--text-primary)' : 'var(--text-50)' }}
            >
              {tab.icon} {tab.label}
            </Link>
          );
        })}
      </div>

      <Outlet />
    </div>
  );
};

export default SellerDashboard;
