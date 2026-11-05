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
  const [loading, setLoading] = useState(false);

  // Unified Login for all roles: Super Admin, Owner, Manager, Desk Admin, Trainer, Member
  const login = async (identifier, secret) => {
    setLoading(true);
    try {
      const res = await api.unifiedLogin(identifier, secret);
      if (res.token && res.user) {
        setUser(res.user);
        setToken(res.token);

        // Store primary unified auth state
        localStorage.setItem('elite_gym_user', JSON.stringify(res.user));
        localStorage.setItem('elite_gym_token', res.token);

        // Synchronize active gym facility
        if (res.user.gym_id) {
          localStorage.setItem('healthyhowlz_active_gym_id', res.user.gym_id);
        }

        // Synchronize sub-context tokens for backward compatibility
        if (res.user.role === 'trainer') {
          localStorage.setItem('healthyhowlz_trainer_session', JSON.stringify(res.user));
          localStorage.setItem('elite_gym_active_portal', 'trainer');
        } else if (res.user.role === 'member') {
          localStorage.setItem('healthyhowlz_member_session', JSON.stringify(res.user));
          localStorage.setItem('elite_member_user', JSON.stringify(res.user));
          localStorage.setItem('elite_member_token', res.token);
          localStorage.setItem('elite_gym_active_portal', 'client');
        } else if (res.user.role === 'super_admin' || res.user.role === 'platform_admin') {
          localStorage.setItem('elite_gym_active_portal', 'platform');
        } else {
          localStorage.setItem('elite_gym_active_portal', 'admin');
        }

        return { success: true, user: res.user };
      }
      throw new Error(res.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('elite_gym_user');
    localStorage.removeItem('elite_gym_token');
    localStorage.removeItem('healthyhowlz_trainer_session');
    localStorage.removeItem('healthyhowlz_member_session');
    localStorage.removeItem('elite_member_user');
    localStorage.removeItem('elite_member_token');
    localStorage.removeItem('elite_gym_active_portal');
    
    // Clear URL search params
    try {
      const url = new URL(window.location.origin + window.location.pathname);
      window.history.replaceState({}, '', url);
    } catch (e) {}
  };

  const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'platform_admin';
  const isOwner = user?.role === 'owner' || isSuperAdmin;
  const isManager = user?.role === 'manager' || isOwner;
  const isAdmin = user?.role === 'admin' || isManager;
  const isTrainer = user?.role === 'trainer';
  const isMember = user?.role === 'member';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        isSuperAdmin,
        isOwner,
        isManager,
        isAdmin,
        isTrainer,
        isMember,
        app: user?.app || (isSuperAdmin ? 'platform' : isTrainer ? 'trainer' : isMember ? 'client' : 'admin')
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
