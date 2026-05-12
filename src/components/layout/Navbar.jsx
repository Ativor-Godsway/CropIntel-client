import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../shared/Spinner';

const Navbar = () => {
  const { user, logout, toggleRole } = useAuth();
  const { totalItems } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
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
      // Redirect to appropriate dashboard
      navigate(newRole === 'seller' ? '/seller' : '/dashboard');
    } catch {
      toast.error('Failed to switch role');
    } finally {
      setToggling(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 1.5a.5.5 0 01.5.5v4.5H14a.5.5 0 010 1H10a.5.5 0 01-.5-.5V4a.5.5 0 01.5-.5z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-primary-700">Farmly</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/marketplace" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
              Marketplace
            </Link>
            {user && (
              <>
                <Link to="/diagnosis" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  Diagnose Crop
                </Link>
                {user.activeRole === 'buyer' ? (
                  <Link to="/dashboard" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                    My Dashboard
                  </Link>
                ) : (
                  <Link to="/seller" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                    Seller Hub
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Role toggle pill */}
                <button
                  onClick={handleToggleRole}
                  disabled={toggling}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors
                    bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-100"
                >
                  {toggling ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      <span className={`w-2 h-2 rounded-full ${user.activeRole === 'seller' ? 'bg-accent-500' : 'bg-primary-500'}`} />
                      {user.activeRole === 'buyer' ? 'Buyer' : 'Seller'}
                      <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Cart icon */}
                <Link
                  to="/cart"
                  className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </Link>

                {/* Avatar / dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Profile</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-xs px-3 py-1.5">Log in</Link>
                <Link to="/register" className="btn-primary text-xs px-3 py-1.5">Sign up</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-500"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          <Link to="/marketplace" className="block py-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>Marketplace</Link>
          {user && (
            <>
              <Link to="/diagnosis" className="block py-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>Diagnose Crop</Link>
              <Link to={user.activeRole === 'seller' ? '/seller' : '/dashboard'} className="block py-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={handleToggleRole} className="w-full text-left py-2 text-sm text-primary-600 font-medium">
                Switch to {user.activeRole === 'buyer' ? 'Seller' : 'Buyer'} Mode
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
