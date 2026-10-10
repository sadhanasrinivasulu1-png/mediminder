import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mediminder_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('mediminder_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  useEffect(() => {
    async function verifyUser() {
      if (token) {
        try {
          const res = await api.auth.getProfile();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('mediminder_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Failed to verify token on boot:', err.message);
          logout();
        }
      }
      setLoading(false);
    }
    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res.token) {
      localStorage.setItem('mediminder_token', res.token);
      localStorage.setItem('mediminder_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.token) {
      localStorage.setItem('mediminder_token', res.token);
      localStorage.setItem('mediminder_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('mediminder_token');
    localStorage.removeItem('mediminder_user');
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (data) => {
    const res = await api.auth.updateProfile(data);
    if (res.user) {
      setUser(res.user);
      localStorage.setItem('mediminder_user', JSON.stringify(res.user));
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
