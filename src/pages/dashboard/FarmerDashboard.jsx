import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getDiagnosisHistory } from '../../api/diagnosis';
import { getBuyerOrders } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../../components/shared/Spinner';
import SeverityBadge from '../../components/shared/SeverityBadge';
import { formatDate } from '../../utils/formatDate';
import EmptyState from '../../components/shared/EmptyState';

const COLORS = ['#16a34a', '#d97706', '#ef4444', '#3b82f6', '#8b5cf6'];

const StatCard = ({ label, value, icon }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
  </div>
);

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [diagnoses, setDiagnoses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDiagnosisHistory({ limit: 50 }),
      getBuyerOrders(),
    ])
      .then(([dRes, oRes]) => {
        setDiagnoses(dRes.data.diagnoses);
        setOrders(oRes.data.orders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  // ── Stats ─────────────────────────────────────────────────────────────────
  const mostCommon = diagnoses.reduce((acc, d) => {
    acc[d.diseaseName] = (acc[d.diseaseName] || 0) + 1;
    return acc;
  }, {});
  const topDisease = Object.entries(mostCommon).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
  const lastDiagnosis = diagnoses[0]?.createdAt;

  // ── Line chart: diagnoses per day over last 30 days ───────────────────────
  const last30 = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    last30[key] = 0;
  }
  diagnoses.forEach((d) => {
    const key = d.createdAt.split('T')[0];
    if (last30[key] !== undefined) last30[key]++;
  });
  const lineData = Object.entries(last30).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    diagnoses: count,
  }));

  // ── Pie chart: disease distribution ──────────────────────────────────────
  const pieData = Object.entries(mostCommon)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500">Here's your crop health overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Diagnoses" value={diagnoses.length} icon="🔬" />
        <StatCard label="Most Common Disease" value={topDisease} icon="🦠" />
        <StatCard label="Last Diagnosis" value={lastDiagnosis ? formatDate(lastDiagnosis) : 'None'} icon="📅" />
        <StatCard label="Total Orders" value={orders.length} icon="🛒" />
      </div>

      {/* Charts */}
      {diagnoses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line chart */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Diagnoses (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="diagnoses"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Disease Distribution</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => <span className="text-xs">{value}</span>}
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data</div>
            )}
          </div>
        </div>
      ) : null}

      {/* Diagnosis history table */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Diagnosis History</h3>
          <Link to="/diagnosis" className="btn-primary text-xs px-3 py-1.5">
            + New Diagnosis
          </Link>
        </div>

        {diagnoses.length === 0 ? (
          <EmptyState
            icon="🌿"
            title="No diagnoses yet"
            description="Upload a leaf photo to get your first AI diagnosis."
            action={<Link to="/diagnosis" className="btn-primary">Diagnose Now</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Crop</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Disease</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Severity</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Confidence</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {diagnoses.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(d.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{d.cropType}</td>
                    <td className="px-4 py-3 text-gray-700">{d.diseaseName}</td>
                    <td className="px-4 py-3"><SeverityBadge severity={d.severity} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="h-full rounded-full bg-primary-500"
                            style={{ width: `${d.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 w-8 text-right">{d.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          to={`/diagnosis/result/${d._id}`}
                          className="text-xs text-primary-600 hover:underline"
                        >
                          View
                        </Link>
                        <Link
                          to={`/marketplace?disease=${encodeURIComponent(d.diseaseName)}`}
                          className="text-xs text-accent-600 hover:underline"
                        >
                          Shop treatments
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
