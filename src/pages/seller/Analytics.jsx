import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getSellerAnalytics } from '../../api/analytics';
import { PageSpinner } from '../../components/shared/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';

const COLORS = ['#22c55e', '#d4a843', '#3b82f6', '#8b5cf6', '#ef4444'];

const StatCard = ({ label, value, icon, sub }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-theme-muted">{label}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-2xl font-bold text-theme-text">{value}</p>
    {sub && <p className="text-xs text-theme-hint mt-0.5">{sub}</p>}
  </div>
);

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSellerAnalytics().then(({ data }) => setData(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;
  if (!data) return <div className="text-center py-10 text-theme-dim">Failed to load analytics.</div>;

  const { stats, monthlyChartData, categoryChartData } = data;
  const chartData = monthlyChartData.map((d) => ({ ...d, month: new Date(d.month + '-01').toLocaleString('en', { month: 'short' }) }));

  const tooltipStyle = { background: 'var(--dropdown-bg)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', color: 'var(--text-primary)' };
  const axisStyle = { fill: 'var(--text-40)', fontSize: 12 };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`₵${stats.totalRevenue.toFixed(2)}`} icon="💰" sub="All time" />
        <StatCard label="Total Orders" value={stats.totalOrders} icon="📦" sub="Paid orders" />
        <StatCard label="Active Listings" value={stats.activeListings} icon="🏪" sub="Live products" />
        <StatCard label="Top Product" value={stats.topProduct} icon="⭐" sub="By units sold" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-theme-text mb-4">Monthly Revenue (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" tick={axisStyle} />
              <YAxis tick={axisStyle} tickFormatter={(v) => `₵${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`₵${value.toFixed(2)}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="var(--green-bright)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-theme-text mb-4">Sales by Category</h3>
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryChartData} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {categoryChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend formatter={(value) => <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{value.charAt(0).toUpperCase() + value.slice(1)}</span>} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`₵${value.toFixed(2)}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-theme-hint text-sm">No sales data yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
