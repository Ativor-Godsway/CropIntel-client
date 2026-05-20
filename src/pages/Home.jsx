import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useReveal } from '../hooks/useReveal';

const Home = () => {
  const { user } = useAuth();
  useReveal();

  return (
    <>
      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: 'calc(100vh - 4rem)', paddingTop: '56px' }}>
        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, var(--hero-glow-1) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 40% 40% at 80% 60%, var(--hero-glow-2) 0%, transparent 50%)' }} />
        <div className="absolute inset-0 pointer-events-none hero-grid-bg" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-24">
          <div className="max-w-[800px]">
            {/* Badge */}
            <div
              className="animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6"
              style={{ background: 'var(--surface-accent)', border: '1px solid var(--border-accent)', color: 'var(--green-bright)' }}
            >
              <span className="animate-pulse-dot w-1.5 h-1.5 rounded-full bg-theme-green inline-block" />
              AI-Powered Crop Intelligence for Ghana
            </div>

            {/* H1 */}
            <h1
              className="animate-fade-up-1 font-display font-light text-theme-text mb-6"
              style={{ fontSize: 'clamp(48px, 7vw, 88px)', lineHeight: 1.05 }}
            >
              Diagnose. Treat.{' '}
              <em className="not-italic text-theme-green">Thrive.</em>
            </h1>

            {/* Subtext */}
            <p
              className="animate-fade-up-2 font-body font-light mb-8 max-w-[520px] text-theme-muted"
              style={{ fontSize: '17px' }}
            >
              Upload a photo or describe symptoms. Our AI gives you an instant diagnosis,
              treatment plan, and connects you to Ghana's farming marketplace.
            </p>

            {/* CTA buttons */}
            <div className="animate-fade-up-3 flex items-center gap-4 flex-wrap">
              <Link
                to={user ? '/diagnosis' : '/register'}
                className="btn-primary px-8 py-3.5 text-sm"
              >
                Start free diagnosis →
              </Link>
              <Link to="/marketplace" className="btn-secondary px-8 py-3.5 text-sm">
                Explore marketplace
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="animate-fade-up-4 mt-16">
            <div className="glass inline-flex rounded-2xl overflow-hidden" style={{ maxWidth: '680px' }}>
              {[
                { num: '98%', label: 'Accuracy rate' },
                { num: '40+', label: 'Crop diseases' },
                { num: '12k', label: 'Farmers served' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex-1 px-8 py-5 text-center"
                  style={i > 0 ? { borderLeft: '1px solid var(--border-subtle)' } : {}}
                >
                  <div className="font-display text-3xl font-light text-theme-text mb-0.5">{stat.num}</div>
                  <div className="text-xs text-theme-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating diagnosis card */}
        <div className="absolute right-6 xl:right-20 top-1/2 -translate-y-1/2 hidden lg:block w-[300px] animate-float" style={{ zIndex: 10 }}>
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: 'var(--surface-accent)', color: 'var(--green-bright)' }}>
                Diagnosis result
              </span>
              <span className="text-xs text-theme-hint">92% confident</span>
            </div>
            <div>
              <p className="font-display text-lg font-light text-theme-text">Late Blight</p>
              <p className="text-xs mt-0.5 text-theme-hint">Phytophthora infestans</p>
            </div>
            <p className="text-xs leading-relaxed text-theme-dim">
              Fungal infection causing dark lesions on leaves and stems. Spreads rapidly in cool, wet conditions.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-theme-hint">Severity</span>
              <span className="text-sm font-medium text-theme-gold">Moderate</span>
            </div>
            <div className="h-1 rounded-full" style={{ background: 'var(--border-color)' }}>
              <div className="h-full rounded-full" style={{ width: '65%', background: 'linear-gradient(90deg, var(--gold), #f59e0b)' }} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest mb-2 text-theme-hint">Recommended treatments</p>
              <div className="space-y-1.5">
                {['Copper-based fungicide spray', 'Mancozeb 80% WP application'].map((t) => (
                  <div key={t} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-theme-text" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-theme-green flex-shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works ──────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-8 py-20 max-w-7xl mx-auto">
        <div className="reveal mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-theme-green mb-3">How it works</p>
          <h2 className="font-display font-light text-4xl text-theme-text mb-4">From photo to treatment in seconds</h2>
          <p className="text-base max-w-lg text-theme-muted">
            Our AI pathologist analyses your crop instantly and connects you with the right treatments — no agronomy degree required.
          </p>
        </div>

        <div className="reveal grid grid-cols-1 md:grid-cols-3 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
          {[
            { num: '01', icon: '📸', title: 'Upload or describe', desc: 'Take a photo of the affected leaf or simply describe what you see. Both methods give equally accurate results.' },
            { num: '02', icon: '🧠', title: 'AI analyses instantly', desc: 'Claude AI — trained on thousands of crop diseases — identifies the pathogen and assesses severity within seconds.' },
            { num: '03', icon: '🛒', title: 'Buy the right treatment', desc: 'Receive a precise treatment plan and shop for the exact products from verified Ghanaian suppliers.' },
          ].map((step, i) => (
            <div key={i} className="p-8" style={i > 0 ? { borderLeft: '1px solid var(--border-color)' } : {}}>
              <p className="font-display text-5xl font-light mb-6" style={{ color: 'var(--step-num-color)' }}>{step.num}</p>
              <div className="text-3xl mb-4">{step.icon}</div>
              <h3 className="text-base font-medium text-theme-text mb-2">{step.title}</h3>
              <p className="text-sm leading-relaxed text-theme-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-8 py-20 max-w-7xl mx-auto">
        <div className="reveal mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-theme-green mb-3">Platform features</p>
          <h2 className="font-display font-light text-4xl text-theme-text">Everything a Ghanaian farmer needs</h2>
        </div>

        <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full-width hero feature */}
          <div className="md:col-span-2 rounded-2xl p-8 transition-all hover:-translate-y-0.5" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-surface-2)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4" style={{ background: 'var(--bg-surface)' }}>🔬</div>
                <h3 className="text-base font-medium text-theme-text mb-2">Dual-mode AI diagnosis</h3>
                <p className="text-sm leading-relaxed mb-5 text-theme-muted">
                  Upload a photo or describe what you see in plain language. Our AI diagnoses diseases, recommends treatments, and rates its own confidence.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Image upload', 'Text description', 'Instant results'].map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--surface-accent)', border: '1px solid var(--border-accent)', color: 'var(--green-bright)' }}>{tag}</span>
                  ))}
                </div>
              </div>
              {/* Mini preview panel */}
              <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)' }}>
                <p className="text-xs uppercase tracking-widest mb-3 text-theme-hint">Recent diagnoses</p>
                {[
                  { crop: 'Tomato', disease: 'Late Blight', conf: 'High' },
                  { crop: 'Maize', disease: 'Northern Leaf Blight', conf: 'Medium' },
                  { crop: 'Cassava', disease: 'Mosaic Virus', conf: 'High' },
                  { crop: 'Cocoa', disease: 'Black Pod Disease', conf: 'Low' },
                ].map((d) => (
                  <div key={d.disease} className="flex items-center justify-between px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-surface-2)' }}>
                    <div>
                      <span className="text-theme-text font-medium">{d.disease}</span>
                      <span className="ml-2 text-theme-40">{d.crop}</span>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={{
                        background: d.conf === 'High' ? 'var(--surface-accent)' : d.conf === 'Medium' ? 'var(--surface-gold)' : 'var(--surface-red)',
                        color: d.conf === 'High' ? 'var(--green-bright)' : d.conf === 'Medium' ? 'var(--gold)' : 'var(--red-text)',
                      }}
                    >
                      {d.conf}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2×2 feature cards */}
          {[
            { icon: '🏪', name: 'Verified marketplace', desc: 'Browse hundreds of seeds, fertilizers, and crop protection products from verified Ghanaian sellers.' },
            { icon: '📊', name: 'Crop history dashboard', desc: 'Track every diagnosis, monitor disease trends on your farm, and review past treatment outcomes.' },
            { icon: '🌱', name: 'Sell as a supplier', desc: 'Register as a seller to list your agro-inputs and reach thousands of farmers across Ghana.' },
            { icon: '🔐', name: 'Flexible sign-in', desc: 'Sign up with email, Google OAuth, or your Ghana phone number — no barriers to access.' },
          ].map((f) => (
            <div key={f.name} className="rounded-2xl p-6 transition-all hover:-translate-y-0.5" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-surface-2)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg mb-4" style={{ background: 'var(--bg-surface)' }}>{f.icon}</div>
              <h3 className="text-base font-medium text-theme-text mb-1.5">{f.name}</h3>
              <p className="text-sm leading-relaxed text-theme-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Marketplace preview ────────────────────────────────────────────── */}
      <section className="px-6 lg:px-8 py-20 max-w-7xl mx-auto">
        <div className="reveal flex items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-theme-green mb-3">Marketplace</p>
            <h2 className="font-display font-light text-4xl text-theme-text">Treatments, ready to order</h2>
          </div>
          <Link to="/marketplace" className="btn-secondary text-xs whitespace-nowrap">View all products →</Link>
        </div>

        <div className="reveal grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { gradientVar: '--product-img-green', emoji: '🍃', name: 'Mancozeb 80% WP', seller: 'AgroKing Supplies', location: 'Kumasi', price: 'GH₵ 45.00', unit: '250g' },
            { gradientVar: '--product-img-amber', emoji: '🌿', name: 'Copper Oxychloride', seller: 'FarmFirst Ghana', location: 'Accra', price: 'GH₵ 68.00', unit: '500g' },
            { gradientVar: '--product-img-blue', emoji: '💧', name: 'Neem Oil Spray', seller: 'GreenField Inputs', location: 'Tamale', price: 'GH₵ 32.00', unit: '1L' },
          ].map((p) => (
            <div key={p.name} className="rounded-2xl overflow-hidden transition-all hover:-translate-y-1" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-surface-2)' }}>
              <div className="h-[120px] flex items-center justify-center text-4xl" style={{ background: `var(${p.gradientVar})` }}>{p.emoji}</div>
              <div className="p-5">
                <p className="text-sm font-medium text-theme-text mb-1">{p.name}</p>
                <p className="text-xs mb-3 text-theme-dim">{p.seller} · {p.location}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-semibold text-theme-green">{p.price}</span>
                    <span className="text-xs ml-1 text-theme-40">/ {p.unit}</span>
                  </div>
                  <Link to="/marketplace" className="btn-primary text-xs px-3 py-1.5">+ Add</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-8 py-10 max-w-7xl mx-auto">
        <div className="reveal relative rounded-3xl px-8 py-16 text-center overflow-hidden" style={{ background: 'var(--cta-bg)', border: '1px solid var(--cta-border)' }}>
          <div className="absolute inset-x-0 top-0 h-px pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, var(--green-bright), transparent)', opacity: 0.4 }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, var(--surface-accent), transparent 70%)' }} />
          <h2 className="font-display font-light text-theme-text mx-auto mb-4" style={{ fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1.1, maxWidth: '560px' }}>
            Your crops deserve<br />
            <em className="not-italic text-theme-green">expert intelligence</em>
          </h2>
          <p className="text-base mb-8 mx-auto text-theme-muted" style={{ maxWidth: '420px' }}>
            Join thousands of Ghanaian farmers already using AI to protect their harvests and boost yields.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to={user ? '/diagnosis' : '/register'} className="btn-primary px-8 py-3.5 text-sm">Start diagnosing free →</Link>
            <Link to="/marketplace" className="btn-secondary px-8 py-3.5 text-sm">Browse marketplace</Link>
          </div>
        </div>
      </section>

      <div className="h-16" />
    </>
  );
};

export default Home;
