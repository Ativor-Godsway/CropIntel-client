import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { analyzeCrop, analyzeText } from '../../api/diagnosis';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';

// ─── Colour maps (CSS-variable driven) ───────────────────────────────────────

const CONFIDENCE_STYLES = {
  High:   { bg: 'var(--surface-accent)',    color: 'var(--green-bright)', border: 'var(--border-accent)' },
  Medium: { bg: 'var(--surface-gold)',      color: 'var(--gold)',         border: 'var(--border-gold)'   },
  Low:    { bg: 'var(--surface-red)',       color: 'var(--red-text)',     border: 'var(--border-red)'    },
};

const SEVERITY_STYLES = {
  Mild:     { bg: 'var(--surface-accent)', color: 'var(--green-bright)', border: 'var(--border-accent)' },
  Moderate: { bg: 'var(--surface-gold)',   color: 'var(--gold)',         border: 'var(--border-gold)'   },
  Severe:   { bg: 'var(--surface-red)',    color: 'var(--red-text)',     border: 'var(--border-red)'    },
};

const SEVERITY_HEADER_BG = {
  Mild:     { from: 'var(--surface-accent)', to: 'var(--surface-accent)', border: 'var(--border-accent)' },
  Moderate: { from: 'var(--surface-gold)',   to: 'var(--surface-gold)',   border: 'var(--border-gold)'   },
  Severe:   { from: 'var(--surface-red)',    to: 'var(--surface-red)',    border: 'var(--border-red)'    },
};

// ─── Crop type options ────────────────────────────────────────────────────────

const CROP_OPTIONS = [
  'Tomato','Maize','Cassava','Yam','Cocoa','Rice','Plantain',
  'Pepper','Cowpea','Groundnut','Sorghum','Millet','Soybean',
  'Okra','Sweet Potato','Banana','Mango','Pineapple','Citrus','Other',
];

// ─── Accordion ────────────────────────────────────────────────────────────────

const Accordion = ({ icon, title, items }) => {
  const [open, setOpen] = useState(false);
  if (!items?.length) return null;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
        style={{ background: 'var(--bg-surface-2)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface-2)'}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-theme-80">
          <span>{icon}</span>{title}
          <span className="text-xs font-normal text-theme-hint">({items.length})</span>
        </span>
        <svg className={`w-4 h-4 text-theme-hint transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
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

// ─── Product recommendation card ──────────────────────────────────────────────

const RecommendedProductCard = ({ product }) => {
  const { addItem } = useCart();
  const toast = useToast();

  return (
    <div className="flex-shrink-0 w-44 rounded-xl overflow-hidden hover:shadow-lg transition-shadow" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
      <div className="h-32 overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
        {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">🌿</div>}
      </div>
      <div className="p-3 space-y-2">
        <p className="text-xs font-semibold text-theme-text line-clamp-2 leading-tight">{product.name}</p>
        <p className="text-sm font-bold text-theme-green">{formatCurrency(product.price)}</p>
        <div className="flex gap-1.5">
          <button onClick={() => { addItem(product, 1); toast.success(`${product.name} added to cart`); }} className="flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors bg-theme-green" style={{ color: 'var(--green-btn-text)' }}>
            Add to Cart
          </button>
          <Link to={`/marketplace/${product._id}`} className="flex-1 text-xs font-medium py-1.5 rounded-lg text-center text-theme-muted hover:bg-theme-surface transition-colors" style={{ border: '1px solid var(--border-color)' }}>
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const DiagnosisPage = () => {
  const [mode, setMode] = useState('image');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [textDescription, setTextDescription] = useState('');
  const [cropType, setCropType] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef();
  const resultRef = useRef();
  const toast = useToast();

  const resetForm = () => { setImage(null); setPreview(null); setTextDescription(''); setCropType(''); setResult(null); };
  const switchMode = (next) => { setMode(next); setResult(null); };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10 MB'); return; }
    setImage(file); setPreview(URL.createObjectURL(file)); setResult(null);
  };

  const handleDrop = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (!image) { toast.error('Please upload a crop photo first'); return; }
    setLoading(true); setResult(null);
    try {
      const fd = new FormData(); fd.append('cropImage', image);
      const { data } = await analyzeCrop(fd);
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Diagnosis failed — please try again.');
    } finally { setLoading(false); }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textDescription.trim()) { toast.error('Please describe the symptoms'); return; }
    if (!cropType) { toast.error('Please select a crop type'); return; }
    setLoading(true); setResult(null);
    try {
      const { data } = await analyzeText({ textDescription: textDescription.trim(), cropType });
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Diagnosis failed — please try again.');
    } finally { setLoading(false); }
  };

  const d = result?.diagnosis;
  const hdr = d ? (SEVERITY_HEADER_BG[d.severity] || SEVERITY_HEADER_BG.Mild) : null;

  const spinnerEl = (
    <>
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Analyzing your crop...
    </>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-theme-text mb-2">Diagnose Your Crop</h1>
        <p className="text-sm text-theme-muted">Upload a photo or describe the symptoms and our AI will identify the disease and recommend treatments.</p>
      </div>

      {/* Mode tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)' }}>
        {[
          { key: 'image', label: 'Upload Image', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
          { key: 'text',  label: 'Describe Symptoms', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => switchMode(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${mode === key ? 'text-theme-text' : 'text-theme-50 hover:text-theme-80'}`}
            style={{ background: mode === key ? 'var(--surface-active)' : 'transparent' }}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Image upload form */}
      {mode === 'image' && (
        <form onSubmit={handleImageSubmit} className="space-y-4">
          <div
            role="button" tabIndex={0}
            onClick={() => !loading && fileRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && !loading && fileRef.current?.click()}
            onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
            className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer select-none ${loading ? 'pointer-events-none opacity-60' : ''}`}
            style={{ borderColor: preview ? 'var(--green-bright)' : 'var(--border-color)', background: preview ? 'var(--surface-accent)' : 'var(--bg-surface-2)' }}
          >
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Crop preview" className="w-full max-h-80 object-contain rounded-2xl" />
                {!loading && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); resetForm(); }} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-theme-muted hover:text-theme-red transition-colors text-lg leading-none" style={{ background: 'var(--dropdown-bg)' }} aria-label="Remove image">×</button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--surface-accent)' }}>
                  <svg className="w-10 h-10 text-theme-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-theme-80 mb-1">Upload a photo of your crop</p>
                <p className="text-sm text-theme-40">Drag and drop or click to browse</p>
                <p className="text-xs text-theme-hint mt-1">JPG, PNG, WEBP — up to 10 MB</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          {!preview && (
            <div className="rounded-xl px-4 py-3 text-xs" style={{ background: 'var(--surface-gold)', border: '1px solid var(--border-gold)', color: 'var(--gold)' }}>
              <span className="font-semibold">📸 Tips for best results: </span>
              Use natural daylight · Show the affected area up close · Keep the leaf flat and fully in frame · Avoid blurry or shadowy shots
            </div>
          )}
          <button type="submit" disabled={!image || loading} className="btn-primary w-full py-3 text-base rounded-xl">{loading ? spinnerEl : '🔬 Diagnose Crop'}</button>
        </form>
      )}

      {/* Text description form */}
      {mode === 'text' && (
        <form onSubmit={handleTextSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-label mb-1.5">Crop Type</label>
            <select value={cropType} onChange={(e) => setCropType(e.target.value)} disabled={loading} className="input">
              <option value="">Select crop type...</option>
              {CROP_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-theme-label mb-1.5">Describe the Symptoms</label>
            <textarea value={textDescription} onChange={(e) => setTextDescription(e.target.value)} disabled={loading} rows={6} placeholder="e.g. My tomato leaves have yellow spots with brown edges and are curling inward..." className="input resize-none" />
            <p className="mt-1 text-xs text-theme-hint">Include details like colour changes, texture, smell, affected parts, and how long symptoms have been visible.</p>
          </div>
          <button type="submit" disabled={!textDescription.trim() || !cropType || loading} className="btn-primary w-full py-3 text-base rounded-xl">{loading ? spinnerEl : '🔬 Get Diagnosis'}</button>
        </form>
      )}

      {/* Results */}
      {result && (
        <div ref={resultRef} className="mt-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
            <span className="text-xs font-semibold uppercase tracking-wide text-theme-hint">Diagnosis Result</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
          </div>

          {/* Diagnosis card */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
            {/* Header */}
            <div className="px-6 py-5" style={{ background: hdr?.from, borderBottom: `1px solid ${hdr?.border}` }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-theme-hint">{d.cropIdentified}</p>
                  <h2 className="text-xl font-bold text-theme-text">{d.diseaseIdentified}</h2>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0 pt-0.5">
                  {[
                    { s: CONFIDENCE_STYLES[d.confidence], label: `${d.confidence} Confidence` },
                    { s: SEVERITY_STYLES[d.severity], label: `${d.severity} Severity` },
                  ].map(({ s, label }) => s ? (
                    <span key={label} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{label}</span>
                  ) : null)}
                </div>
              </div>
            </div>
            {/* Body */}
            <div className="px-6 py-5 space-y-4" style={{ background: 'var(--bg-surface-2)' }}>
              <p className="text-sm text-theme-label leading-relaxed">{d.description}</p>
              <div className="space-y-2">
                <Accordion icon="🦠" title="Causes" items={d.causes} />
                <Accordion icon="💊" title="Treatment Steps" items={d.treatmentSteps} />
                <Accordion icon="🛡️" title="Prevention Tips" items={d.preventionTips} />
              </div>
            </div>
          </div>

          {/* Marketplace recommendations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-theme-text">Products that may help</h3>
              <Link to={`/marketplace?disease=${encodeURIComponent(d.diseaseIdentified)}`} className="text-sm text-theme-green hover:underline">Browse all →</Link>
            </div>
            {result.marketplaceRecommendations?.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
                {result.marketplaceRecommendations.map((product) => <RecommendedProductCard key={product._id} product={product} />)}
              </div>
            ) : (
              <div className="rounded-xl p-6 text-center" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)' }}>
                <p className="text-sm text-theme-dim mb-2">No matching products found in the marketplace yet.</p>
                <Link to="/marketplace" className="text-sm text-theme-green hover:underline">Browse all products →</Link>
              </div>
            )}
          </div>

          {/* Bottom actions */}
          <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <button onClick={() => { resetForm(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn-secondary flex-1 py-2.5 text-sm rounded-xl">New Diagnosis</button>
            <Link to="/dashboard" className="btn-primary flex-1 py-2.5 text-sm text-center rounded-xl">View History</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosisPage;
