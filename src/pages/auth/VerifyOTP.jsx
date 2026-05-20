import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOtp, verifyOtp } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/shared/Spinner';

const VerifyOTP = () => {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone.startsWith('+')) return toast.error('Phone number must start with country code (e.g. +233...)');
    setLoading(true);
    try {
      await sendOtp(phone);
      toast.success('OTP sent! Check your phone.');
      setStep('otp');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await verifyOtp({ phone, otp, name });
      login(data.accessToken, data.user);
      toast.success('Phone verified! Welcome to CropIntel.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, var(--hero-glow-1) 0%, transparent 60%)' }} />

      <div className="relative w-full max-w-md">
        <div className="glass-card p-8">
          <h1 className="text-xl font-semibold text-theme-text mb-2">Phone Login</h1>
          <p className="text-sm mb-6 text-theme-muted">
            {step === 'phone' ? 'Enter your phone number to receive an OTP.' : `OTP sent to ${phone}. Enter it below.`}
          </p>

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-theme-label">Phone Number</label>
                <input type="tel" className="input" placeholder="+233 24 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                <p className="text-xs mt-1 text-theme-hint">Include country code, e.g. +233 for Ghana</p>
              </div>
              <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-theme-label">Your Name (optional)</label>
                <input type="text" className="input" placeholder="Kofi Mensah" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-theme-label">6-digit OTP</label>
                <input type="text" className="input text-center tracking-widest text-xl font-bold" placeholder="000000" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required />
              </div>
              <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Verify OTP'}
              </button>
              <button type="button" className="text-sm text-theme-green hover:underline w-full text-center" onClick={() => setStep('phone')}>
                ← Change phone number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
