import React, { useEffect, useRef, useCallback } from 'react';
import { useCart } from '../context/CartContext';

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

const Badge = ({ label, styleMap }) => {
  const s = styleMap[label] || {};
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {label}
    </span>
  );
};

const Section = ({ title, children }) => (
  <div className="space-y-2">
    <h4 className="text-sm font-semibold text-theme-text">{title}</h4>
    {children}
  </div>
);

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const image = product.images?.[0];
  return (
    <div className="card p-3 flex gap-3 items-start">
      <div
        className="w-12 h-12 rounded-lg flex-shrink-0 bg-cover bg-center"
        style={{
          backgroundImage: image ? `url(${image})` : undefined,
          background: image ? undefined : 'var(--bg-surface)',
        }}
      >
        {!image && <span className="flex items-center justify-center w-full h-full text-xl">🌿</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-theme-text truncate">{product.name}</p>
        <p className="text-xs text-theme-muted">GHS {product.price?.toLocaleString()}</p>
      </div>
      <button
        onClick={() => addItem(product, 1)}
        className="btn-primary text-xs px-3 py-1.5 flex-shrink-0"
      >
        Add
      </button>
    </div>
  );
};

const DiagnosisDetailModal = ({ diagnosis, onClose, onPrev, onNext, hasPrev, hasNext }) => {
  const overlayRef = useRef(null);
  const panelRef   = useRef(null);

  const result = diagnosis?.result || {};
  const {
    cropIdentified, diseaseIdentified, confidence, severity,
    description, causes = [], treatmentSteps = [], preventionTips = [],
  } = result;

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && hasPrev) onPrev?.();
    if (e.key === 'ArrowRight' && hasNext) onNext?.();
    // Focus trap
    if (e.key === 'Tab') {
      const focusable = panelRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    }
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!diagnosis) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease' }}
      role="dialog"
      aria-modal="true"
      aria-label={`Diagnosis: ${diseaseIdentified}`}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl outline-none"
        style={{
          background: 'var(--modal-bg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)',
          animation: 'scaleIn 0.2s ease',
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between p-5 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="space-y-1 pr-4">
            <h2 className="text-lg font-bold text-theme-text leading-tight">
              {diseaseIdentified || 'Unknown Disease'}
            </h2>
            <p className="text-sm text-theme-muted">
              {diagnosis.cropType || cropIdentified} &bull; {formatDate(diagnosis.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-lg text-theme-hint hover:text-theme-text transition-colors"
            style={{ background: 'var(--bg-surface)' }}
            aria-label="Close modal"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
            </svg>
          </button>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          {confidence && <Badge label={confidence} styleMap={CONFIDENCE_STYLE} />}
          {severity   && <Badge label={severity}   styleMap={SEVERITY_STYLE} />}
          <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}
          >
            {diagnosis.diagnosisMethod === 'image' ? '📸 Image' : '✍️ Text'}
          </span>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* Image */}
          {diagnosis.imageUrl && (
            <div className="rounded-xl overflow-hidden" style={{ maxHeight: '220px' }}>
              <img
                src={diagnosis.imageUrl}
                alt="Diagnosed crop"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Text description */}
          {diagnosis.diagnosisMethod === 'text' && diagnosis.textDescription && (
            <Section title="Symptom Description">
              <p className="text-sm text-theme-muted leading-relaxed">{diagnosis.textDescription}</p>
            </Section>
          )}

          {/* What's happening */}
          {description && (
            <Section title="What's happening">
              <p className="text-sm text-theme-muted leading-relaxed">{description}</p>
            </Section>
          )}

          {/* Causes */}
          {causes.length > 0 && (
            <Section title="Causes">
              <ul className="space-y-1.5">
                {causes.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-theme-muted">
                    <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs" style={{ background: 'var(--surface-red)', color: 'var(--red-text)' }}>!</span>
                    {c}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Treatment steps */}
          {treatmentSteps.length > 0 && (
            <Section title="Treatment Steps">
              <ol className="space-y-2">
                {treatmentSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-theme-muted">
                    <span
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: 'var(--surface-accent)', color: 'var(--green-bright)' }}
                    >
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {/* Prevention tips */}
          {preventionTips.length > 0 && (
            <Section title="Prevention Tips">
              <ul className="space-y-1.5">
                {preventionTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-theme-muted">
                    <span className="mt-0.5 flex-shrink-0 text-base" style={{ color: 'var(--green-bright)' }}>✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Recommended products */}
          {diagnosis.recommendedProducts?.length > 0 && (
            <Section title="Recommended Products">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {diagnosis.recommendedProducts.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Footer nav */}
        {(hasPrev || hasNext) && (
          <div
            className="flex items-center justify-between px-5 py-3 flex-shrink-0"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="flex items-center gap-1.5 text-sm text-theme-muted hover:text-theme-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M10.78 3.22a.75.75 0 010 1.06L7.06 8l3.72 3.72a.75.75 0 11-1.06 1.06L5.47 8.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0z"/></svg>
              Previous
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="flex items-center gap-1.5 text-sm text-theme-muted hover:text-theme-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M5.22 3.22a.75.75 0 000 1.06L8.94 8l-3.72 3.72a.75.75 0 001.06 1.06l4.25-4.25a.75.75 0 000-1.06L6.28 3.22a.75.75 0 00-1.06 0z"/></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosisDetailModal;
