import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/shared/Spinner';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await apiLogin(form);
      login(data.accessToken, data.user);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => { window.location.href = '/api/auth/google'; };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, var(--hero-glow-1) 0%, transparent 60%)' }} />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
            <span className="w-2 h-2 rounded-full bg-theme-green animate-pulse-dot" />
            <span className="font-display text-2xl font-light text-theme-text">CropIntel</span>
          </Link>
          <p className="text-sm text-theme-muted">AI-powered crop disease diagnosis</p>
        </div>

        <div className="glass-card p-8">
          <h1 className="text-xl font-semibold text-theme-text mb-6">Welcome back</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-theme-label">Email</label>
              <input type="email" className="input" placeholder="kofi@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-theme-label">Password</label>
              <input type="password" className="input" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Sign in'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid var(--border-color)' }} />
            </div>
            <div className="relative flex justify-center text-xs text-theme-hint">
              <span className="px-3" style={{ background: 'var(--bg-card)' }}>or continue with</span>
            </div>
          </div>

          <div className="space-y-2">
            <Link to="/login/phone" className="btn-secondary w-full py-2.5 gap-2 text-center block">📱 Continue with Phone</Link>
          </div>

          <p className="text-center text-sm mt-5 text-theme-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-theme-green font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
