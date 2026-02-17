// src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
  try {
    const response = await fetch('/api/auth/me/', {
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      setUser(data);
    } else {
      setUser(null);
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    setUser(null);
  } finally {
    setLoading(false);
  }
};

  const login = async (username, password) => {
    try {
      const response = await apiRequest('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      if (!response || !response.ok) {
        const error = await response?.json();
        throw new Error(error?.error || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await apiRequest('/api/auth/register/', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });

      if (!response || !response.ok) {
        const error = await response?.json();
        throw new Error(error?.error || 'Registration failed');
      }

      return await login(username, password);
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout/', {
        method: 'POST',
      });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}