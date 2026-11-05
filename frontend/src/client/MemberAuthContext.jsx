import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const MemberAuthContext = createContext(null);

export function MemberAuthProvider({ children }) {
  const [member, setMember] = useState(() => {
    try {
      // Check unified auth session first
      const unifiedUser = localStorage.getItem('elite_gym_user');
      if (unifiedUser) {
        const parsed = JSON.parse(unifiedUser);
        if (parsed.role === 'member') return parsed;
      }
      const stored = localStorage.getItem('healthyhowlz_member_session') || localStorage.getItem('elite_member_session');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [boundDevice, setBoundDevice] = useState(() => {
    try {
      const stored = localStorage.getItem('elite_member_device');
      return stored ? JSON.parse(stored) : { device_name: 'Current Mobile PWA Device' };
    } catch (e) {
      return { device_name: 'Current Mobile PWA Device' };
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    if (member) {
      localStorage.setItem('healthyhowlz_member_session', JSON.stringify(member));
      localStorage.setItem('elite_member_session', JSON.stringify(member));
      if (member.gym_id) {
        localStorage.setItem('healthyhowlz_active_gym_id', member.gym_id);
      }
    } else {
      localStorage.removeItem('healthyhowlz_member_session');
      localStorage.removeItem('elite_member_session');
    }
  }, [member]);

  const loginWithIdentifier = async (identifier, secret, deviceFingerprint = null, deviceName = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.clientLogin({
        identifier: identifier.trim(),
        secret: secret.trim(),
        deviceFingerprint: deviceFingerprint || 'pwa-fingerprint-' + Math.random().toString(36).substring(2, 9),
        deviceName: deviceName || (navigator.userAgent.includes('Mobile') ? 'Mobile Smartphone' : 'Desktop Browser')
      });

      if (res.member) {
        setMember(res.member);
        if (res.boundDevice) {
          setBoundDevice(res.boundDevice);
          localStorage.setItem('elite_member_device', JSON.stringify(res.boundDevice));
        }
        return res.member;
      }
      throw new Error(res.error || 'Authentication failed');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setMember(null);
    localStorage.removeItem('healthyhowlz_member_session');
    localStorage.removeItem('elite_member_session');
    localStorage.removeItem('elite_gym_user');
    localStorage.removeItem('elite_gym_token');
    localStorage.removeItem('elite_member_user');
    localStorage.removeItem('elite_member_token');
    localStorage.removeItem('elite_gym_active_portal');
    try {
      const url = new URL(window.location.origin + window.location.pathname);
      window.history.replaceState({}, '', url);
    } catch (e) {}
  };

  return (
    <MemberAuthContext.Provider
      value={{
        member,
        boundDevice,
        isAuthenticated: !!member,
        isLoading,
        error,
        loginWithIdentifier,
        logout
      }}
    >
      {children}
    </MemberAuthContext.Provider>
  );
}

export const useMemberAuth = () => useContext(MemberAuthContext);
