import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getDiagnosisHistory, getDiagnosisById } from '../../api/diagnosis';
import { getBuyerOrders } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../../components/shared/Spinner';
import { formatDate } from '../../utils/formatDate';
import EmptyState from '../../components/shared/EmptyState';
import DiagnosisDetailModal from '../../components/DiagnosisDetailModal';

const COLORS = ['#22c55e', '#d4a843', '#ef4444', '#3b82f6', '#8b5cf6'];

const StatCard = ({ label, value, icon }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-theme-muted">{label}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-xl font-bold text-theme-text truncate">{value}</p>
  </div>
);

const CONFIDENCE_STYLE = {
  High:   { bg: 'var(--surface-accent)',  color: 'var(--green-bright)' },
  Medium: { bg: 'var(--surface-gold)',    color: 'var(--gold)' },
  Low:    { bg: 'var(--surface-red)',     color: 'var(--red-text)' },
};

const SEVERITY_STYLE = {
  Mild:     { bg: 'var(--surface-accent)', color: 'var(--green-bright)' },
  Moderate: { bg: 'var(--surface-gold)',   color: 'var(--gold)' },
  Severe:   { bg: 'var(--surface-red)',    color: 'var(--red-text)' },
};

const HistorySkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="card p-4 animate-pulse space-y-3">
        <div className="rounded-lg h-36" style={{ background: 'var(--bg-surface)' }} />
        <div className="rounded h-4 w-3/4" style={{ background: 'var(--bg-surface)' }} />
        <div className="rounded h-3 w-1/2" style={{ background: 'var(--bg-surface-2)' }} />
        <div className="flex gap-2">
          <div className="rounded-full h-5 w-14" style={{ background: 'var(--bg-surface)' }} />
          <div className="rounded-full h-5 w-14" style={{ background: 'var(--bg-surface)' }} />
        </div>
      </div>
    ))}
  </div>
);

const DiagnosisCard = ({ diagnosis, onClick }) => {
  const result = diagnosis.result || {};
  const confidence = CONFIDENCE_STYLE[result.confidence] || {};
  const severity   = SEVERITY_STYLE[result.severity]     || {};
  const isImage = diagnosis.diagnosisMethod === 'image';

  return (
    <button
      onClick={onClick}
      className="card text-left w-full group hover:scale-[1.01] transition-transform duration-200 overflow-hidden"
      style={{ cursor: 'pointer' }}
    >
      {/* Thumbnail */}
      <div
        className="h-36 w-full flex items-center justify-center"
        style={{
          background: isImage && diagnosis.imageUrl
            ? undefined
            : 'var(--bg-surface)',
          backgroundImage: isImage && diagnosis.imageUrl
            ? `url(${diagnosis.imageUrl})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!(isImage && diagnosis.imageUrl) && (
          <span className="text-5xl opacity-40">🌿</span>
        )}
      </div>

      <div className="p-4 space-y-2">
        <p className="font-semibold text-theme-text text-sm leading-snug line-clamp-2">
          {result.diseaseIdentified || 'Unknown Disease'}
        </p>
        <p className="text-xs text-theme-muted">
          {diagnosis.cropType || result.cropIdentified || '—'}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {result.confidence && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: confidence.bg, color: confidence.color }}>
              {result.confidence}
            </span>
          )}
          {result.severity && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: severity.bg, color: severity.color }}>
              {result.severity}
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
            {isImage ? '📸 Image' : '✍️ Text'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-theme-hint">{formatDate(diagnosis.createdAt)}</span>
          <span className="text-xs font-medium group-hover:underline" style={{ color: 'var(--green-bright)' }}>
            View details →
          </span>
        </div>
      </div>
    </button>
  );
};

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [diagnoses, setDiagnoses]       = useState([]);
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [detailDiagnosis, setDetailDiagnosis] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    Promise.all([getDiagnosisHistory({ limit: 50 }), getBuyerOrders()])
      .then(([dRes, oRes]) => {
        setDiagnoses(dRes.data.diagnoses || []);
        setOrders(oRes.data.orders || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openModal = async (index) => {
    const d = diagnoses[index];
    if (!d) return;
    setSelectedIndex(index);
    // If already fully populated (has result + recommendedProducts as objects), use directly
    if (d.result && Array.isArray(d.recommendedProducts) && (d.recommendedProducts[0]?._id || !d.recommendedProducts.length)) {
      setDetailDiagnosis(d);
    } else {
      setDetailLoading(true);
      try {
        const res = await getDiagnosisById(d._id);
        setDetailDiagnosis(res.data.diagnosis);
      } catch {
        setDetailDiagnosis(d);
      } finally {
        setDetailLoading(false);
      }
    }
  };

  const closeModal = () => {
    setSelectedIndex(null);
    setDetailDiagnosis(null);
  };

  if (loading) return <PageSpinner />;

  const mostCommon = diagnoses.reduce((acc, d) => {
    const name = d.result?.diseaseIdentified || 'Unknown';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const topDisease   = Object.entries(mostCommon).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
  const lastDiagnosis = diagnoses[0]?.createdAt;

  const last30 = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    last30[d.toISOString().split('T')[0]] = 0;
  }
  diagnoses.forEach((d) => {
    const key = (d.createdAt || '').split('T')[0];
    if (last30[key] !== undefined) last30[key]++;
  });
  const lineData = Object.entries(last30).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    diagnoses: count,
  }));
  const pieData = Object.entries(mostCommon).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));

  const tooltipStyle = { background: 'var(--dropdown-bg)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', color: 'var(--text-primary)' };
  const axisStyle    = { fill: 'var(--text-40)', fontSize: 10 };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-theme-text mb-1">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-theme-muted">Here's your crop health overview</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Diagnoses"    value={diagnoses.length}                             icon="🔬" />
          <StatCard label="Most Common Disease" value={topDisease}                                   icon="🦠" />
          <StatCard label="Last Diagnosis"      value={lastDiagnosis ? formatDate(lastDiagnosis) : 'None'} icon="📅" />
          <StatCard label="Total Orders"        value={orders.length}                               icon="🛒" />
        </div>

        {diagnoses.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="font-semibold text-theme-text mb-4">Diagnoses (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="date" tick={axisStyle} interval={4} />
                  <YAxis tick={axisStyle} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="diagnoses" stroke="var(--green-bright)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-theme-text mb-4">Disease Distribution</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend formatter={(v) => <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{v}</span>} />
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-40 text-theme-hint text-sm">No data</div>
              )}
            </div>
          </div>
        )}

        <div className="card">
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <h3 className="font-semibold text-theme-text">Diagnosis History</h3>
            <Link to="/diagnosis" className="btn-primary text-xs px-3 py-1.5">+ New Diagnosis</Link>
          </div>

          <div className="p-5">
            {detailLoading ? (
              <HistorySkeleton />
            ) : diagnoses.length === 0 ? (
              <EmptyState
                icon="🌿"
                title="No diagnoses yet"
                description="Upload a leaf photo or describe symptoms to get your first AI diagnosis."
                action={<Link to="/diagnosis" className="btn-primary">Diagnose Now</Link>}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {diagnoses.map((d, i) => (
                  <DiagnosisCard key={d._id} diagnosis={d} onClick={() => openModal(i)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {detailDiagnosis && (
        <DiagnosisDetailModal
          diagnosis={detailDiagnosis}
          onClose={closeModal}
          onPrev={() => openModal(selectedIndex - 1)}
          onNext={() => openModal(selectedIndex + 1)}
          hasPrev={selectedIndex > 0}
          hasNext={selectedIndex < diagnoses.length - 1}
        />
      )}
    </>
  );
};

export default FarmerDashboard;
