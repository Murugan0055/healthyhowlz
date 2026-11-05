import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('elite_gym_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('elite_gym_token') || null);

  const login = async (identifier, secret) => {
    const res = await api.loginStaff(identifier, secret);
    if (res.token && res.user) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('elite_gym_user', JSON.stringify(res.user));
      localStorage.setItem('elite_gym_token', res.token);
      return { success: true, user: res.user };
    }
    throw new Error(res.error || 'Authentication failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('elite_gym_user');
    localStorage.removeItem('elite_gym_token');
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isOwner = user?.role === 'owner' || isSuperAdmin;
  const isManager = user?.role === 'manager' || isOwner;
  const isAdmin = user?.role === 'admin' || isManager;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        logout,
        isSuperAdmin,
        isOwner,
        isManager,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

