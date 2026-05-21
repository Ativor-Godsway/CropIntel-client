import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { Spinner } from '../shared/Spinner';

const SunIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

const Navbar = () => {
  const { user, logout, toggleRole } = useAuth();
  const { totalItems } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [toggling, setToggling] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleToggleRole = async () => {
    setToggling(true);
    try {
      const newRole = await toggleRole();
      toast.success(`Switched to ${newRole} mode`);
      navigate(newRole === 'seller' ? '/seller' : '/dashboard');
    } catch {
      toast.error('Failed to switch role');
    } finally {
      setToggling(false);
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16"
      style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-color)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <span className="logo-dot animate-pulse-dot w-2 h-2 rounded-full bg-theme-green inline-block" />
            <span className="font-display text-[22px] font-light text-theme-text">CropIntel</span>
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-8">
            {user && (
              <Link to="/diagnosis" className="text-sm text-theme-nav-link hover:text-theme-text transition-colors">Diagnose</Link>
            )}
            <Link to="/marketplace" className="text-sm text-theme-nav-link hover:text-theme-text transition-colors">Marketplace</Link>
            {user && (
              user.activeRole === 'seller' ? (
                <Link to="/seller" className="text-sm text-theme-nav-link hover:text-theme-text transition-colors">Seller Hub</Link>
              ) : (
                <Link to="/dashboard" className="text-sm text-theme-nav-link hover:text-theme-text transition-colors">Dashboard</Link>
              )
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                height: '36px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <><SunIcon /><span>Light</span></> : <><MoonIcon /><span>Dark</span></>}
            </button>

            {user ? (
              <>
                {/* Role toggle */}
                <button
                  onClick={handleToggleRole}
                  disabled={toggling}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    color: user.activeRole === 'seller' ? 'var(--gold)' : 'var(--green-bright)',
                  }}
                >
                  {toggling ? <Spinner size="sm" /> : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: user.activeRole === 'seller' ? 'var(--gold)' : 'var(--green-bright)' }} />
                      {user.activeRole === 'buyer' ? 'Buyer' : 'Seller'}
                      <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Cart */}
                <Link to="/cart" className="relative p-2 text-theme-nav-link hover:text-theme-text transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-theme-green text-[var(--green-btn-text)] text-xs rounded-full flex items-center justify-center font-bold">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </Link>

                {/* Avatar dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full transition-colors"
                    style={{ background: menuOpen ? 'var(--bg-surface-hover)' : 'transparent' }}
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-theme-green" style={{ color: 'var(--green-btn-text)' }}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {menuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 rounded-xl py-1 z-50"
                      style={{ background: 'var(--dropdown-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
                    >
                      <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <p className="text-sm font-medium text-theme-text truncate">{user.name}</p>
                        <p className="text-xs text-theme-hint truncate">{user.email}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-theme-muted hover:text-theme-text hover:bg-theme-surface transition-colors" onClick={() => setMenuOpen(false)}>Profile</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-theme-red-surface" style={{ color: 'var(--red-text)' }}>Sign out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-xs px-4 py-2">Sign in</Link>
                <Link to="/register" className="btn-primary text-xs px-4 py-2">Get started</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button className="md:hidden p-2 text-theme-nav-link hover:text-theme-text" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <div
          className="md:hidden px-4 py-3 space-y-1"
          style={{ background: 'var(--dropdown-bg)', borderTop: '1px solid var(--border-subtle)' }}
        >
          <Link to="/marketplace" className="block py-2.5 text-sm text-theme-muted hover:text-theme-text" onClick={() => setMenuOpen(false)}>Marketplace</Link>
          {user && (
            <Link to="/diagnosis" className="block py-2.5 text-sm text-theme-muted hover:text-theme-text" onClick={() => setMenuOpen(false)}>Diagnose</Link>
          )}
          {user ? (
            <>
              <Link to={user.activeRole === 'seller' ? '/seller' : '/dashboard'} className="block py-2.5 text-sm text-theme-muted hover:text-theme-text" onClick={() => setMenuOpen(false)}>
                {user.activeRole === 'seller' ? 'Seller Hub' : 'Dashboard'}
              </Link>
              <button onClick={handleToggleRole} className="w-full text-left py-2.5 text-sm font-medium text-theme-green">
                Switch to {user.activeRole === 'buyer' ? 'Seller' : 'Buyer'} Mode
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="btn-secondary text-xs flex-1 text-center py-2.5" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/register" className="btn-primary text-xs flex-1 text-center py-2.5" onClick={() => setMenuOpen(false)}>Get started</Link>
            </div>
          )}
          {/* Mobile theme toggle */}
          <button onClick={toggleTheme} className="flex items-center gap-2 py-2.5 text-sm text-theme-muted hover:text-theme-text w-full">
            {theme === 'dark' ? <><SunIcon /><span>Switch to Light Mode</span></> : <><MoonIcon /><span>Switch to Dark Mode</span></>}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
