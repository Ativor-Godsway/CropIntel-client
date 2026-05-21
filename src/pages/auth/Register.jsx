import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/shared/Spinner';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      return toast.error('Password must contain an uppercase letter, a lowercase letter, and a number');
    setLoading(true);
    try {
      const { data } = await apiRegister({ name: form.name, email: form.email, password: form.password });
      login(data.accessToken, data.user);
      toast.success('Account created! Welcome to CropIntel.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, var(--hero-glow-1) 0%, transparent 60%)' }} />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
            <span className="w-2 h-2 rounded-full bg-theme-green animate-pulse-dot" />
            <span className="font-display text-2xl font-light text-theme-text">CropIntel</span>
          </Link>
          <p className="text-sm text-theme-muted">Create your free account</p>
        </div>

        <div className="glass-card p-8">
          <h1 className="text-xl font-semibold text-theme-text mb-6">Create account</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-theme-label">Full Name</label>
              <input type="text" className="input" placeholder="Kofi Mensah" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-theme-label">Email</label>
              <input type="email" className="input" placeholder="kofi@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-theme-label">Password</label>
              <input type="password" className="input" placeholder="Min. 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <p className="mt-1.5 text-xs text-theme-hint">Must include uppercase, lowercase, and a number</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-theme-label">Confirm Password</label>
              <input type="password" className="input" placeholder="Repeat password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
            </div>
            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Create account'}
            </button>
          </form>

          <p className="text-center text-xs mt-4 text-theme-hint">By signing up you agree to our Terms & Privacy Policy.</p>
          <p className="text-center text-sm mt-3 text-theme-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-theme-green font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
