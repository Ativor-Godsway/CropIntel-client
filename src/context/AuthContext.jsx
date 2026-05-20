import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { setAccessToken, clearAccessToken } from '../api/axios';
import { logout as apiLogout, toggleRole as apiToggleRole } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On every app load, silently try to restore the session from the
  // httpOnly refresh-token cookie. No localStorage involved.
  const restoreSession = useCallback(async () => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );
      setAccessToken(data.accessToken);
      setUser(data.user);
    } catch {
      // Cookie missing or expired — treat as logged out
      clearAccessToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /**
   * Called after a successful login/register/OTP-verify response.
   * Stores the access token in memory only — never in localStorage.
   */
  const login = (accessToken, userData) => {
    setAccessToken(accessToken);
    setUser(userData);
  };

  const logout = async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    clearAccessToken();
    setUser(null);
  };

  const toggleRole = async () => {
    const { data } = await apiToggleRole();
    // Server issues a new access token reflecting the new role
    if (data.accessToken) setAccessToken(data.accessToken);
    setUser(data.user);
    return data.activeRole;
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, toggleRole, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
