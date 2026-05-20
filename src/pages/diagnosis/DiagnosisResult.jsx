import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getDiagnosis } from '../../api/diagnosis';
import { PageSpinner } from '../../components/shared/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const BADGE_STYLES = {
  High:     { bg: 'var(--surface-accent)', color: 'var(--green-bright)', border: 'var(--border-accent)' },
  Medium:   { bg: 'var(--surface-gold)',   color: 'var(--gold)',         border: 'var(--border-gold)'   },
  Low:      { bg: 'var(--surface-red)',    color: 'var(--red-text)',     border: 'var(--border-red)'    },
  Mild:     { bg: 'var(--surface-accent)', color: 'var(--green-bright)', border: 'var(--border-accent)' },
  Moderate: { bg: 'var(--surface-gold)',   color: 'var(--gold)',         border: 'var(--border-gold)'   },
  Severe:   { bg: 'var(--surface-red)',    color: 'var(--red-text)',     border: 'var(--border-red)'    },
};

const Accordion = ({ icon, title, items }) => {
  const [open, setOpen] = useState(false);
  if (!items?.length) return null;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors" style={{ background: 'var(--bg-surface-2)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface-2)'}>
        <span className="flex items-center gap-2 text-sm font-medium text-theme-80"><span>{icon}</span>{title}<span className="text-xs font-normal text-theme-hint">({items.length})</span></span>
        <svg className={`w-4 h-4 text-theme-hint transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <ul style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 px-4 py-3 text-sm text-theme-label" style={i > 0 ? { borderTop: '1px solid var(--border-subtle)' } : {}}>
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--surface-accent)', color: 'var(--green-bright)' }}>{i + 1}</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const DiagnosisResult = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const [diagnosis, setDiagnosis] = useState(state?.diagnosis || null);
  const [loading, setLoading] = useState(!state?.diagnosis);
  const { addItem } = useCart();
  const toast = useToast();

  useEffect(() => {
    if (!diagnosis) {
      getDiagnosis(id).then(({ data }) => setDiagnosis(data.diagnosis)).catch(() => {}).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <PageSpinner />;
  if (!diagnosis) return (
    <div className="text-center py-16 text-theme-muted">
      Diagnosis not found.{' '}
      <Link to="/dashboard" className="text-theme-green hover:underline">Back to dashboard</Link>
    </div>
  );

  const hdr = BADGE_STYLES[diagnosis.severity] || BADGE_STYLES.Mild;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header card */}
      <div className="rounded-2xl p-6" style={{ background: hdr.bg, border: `1px solid ${hdr.border}` }}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-theme-hint">
              {diagnosis.cropIdentified} · {formatDate(diagnosis.createdAt)}
            </p>
            <h1 className="text-2xl font-bold text-theme-text">{diagnosis.diseaseIdentified}</h1>
          </div>
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            {[
              { key: diagnosis.confidence, label: `${diagnosis.confidence} Confidence` },
              { key: diagnosis.severity,   label: `${diagnosis.severity} Severity` },
            ].map(({ key, label }) => {
              const s = BADGE_STYLES[key];
              return s ? (
                <span key={label} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{label}</span>
              ) : null;
            })}
          </div>
        </div>
        {diagnosis.description && <p className="text-sm text-theme-label leading-relaxed">{diagnosis.description}</p>}
      </div>

      {/* Leaf image */}
      {diagnosis.imageUrl && (
        <div className="card overflow-hidden">
          <img src={diagnosis.imageUrl} alt="Analyzed crop" className="w-full max-h-72 object-cover" />
        </div>
      )}

      {/* Accordion */}
      <div className="card p-6 space-y-2">
        <h2 className="text-base font-semibold text-theme-text mb-3">Detailed Analysis</h2>
        <Accordion icon="🦠" title="Causes" items={diagnosis.causes} />
        <Accordion icon="💊" title="Treatment Steps" items={diagnosis.treatmentSteps} />
        <Accordion icon="🛡️" title="Prevention Tips" items={diagnosis.preventionTips} />
      </div>

      {/* Recommended products */}
      {diagnosis.marketplaceRecommendations?.length > 0 && (
        <div className="card p-6">
          <h2 className="text-base font-semibold text-theme-text mb-1 flex items-center gap-2"><span>🛒</span> Recommended Products</h2>
          <p className="text-sm text-theme-muted mb-4">Products that may help treat {diagnosis.diseaseIdentified}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {diagnosis.marketplaceRecommendations.map((product) => (
              <div key={product._id} className="rounded-xl p-3 transition-colors" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-surface-2)' }}>
                {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-full h-24 object-cover rounded-lg mb-2" />}
                <p className="text-xs font-medium text-theme-text line-clamp-2 mb-1">{product.name}</p>
                <p className="text-xs font-bold text-theme-green mb-2">{formatCurrency(product.price)}</p>
                <button onClick={() => { addItem(product, 1); toast.success(`${product.name} added to cart`); }} className="btn-primary w-full text-xs py-1.5 rounded-lg">Add to Cart</button>
              </div>
            ))}
          </div>
          <Link to={`/marketplace?disease=${encodeURIComponent(diagnosis.diseaseIdentified)}`} className="inline-flex items-center gap-1 text-sm text-theme-green hover:underline mt-4">
            See all treatments in marketplace →
          </Link>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link to="/diagnosis" className="btn-secondary flex-1 justify-center py-2.5">New Diagnosis</Link>
        <Link to="/dashboard" className="btn-primary flex-1 justify-center py-2.5">View History</Link>
      </div>
    </div>
  );
};

export default DiagnosisResult;
