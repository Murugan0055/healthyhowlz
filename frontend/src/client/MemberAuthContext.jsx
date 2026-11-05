import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const MemberAuthContext = createContext(null);

export const DEMO_MEMBERS = [
  {
    name: 'Vigneshwaran K',
    memberCode: 'EG-1001',
    phone: '9876543210',
    plan: '12 Month Elite Annual',
    pin: '3210',
    device: 'iPhone 15 Pro • Authorized Device'
  },
  {
    name: 'Aravind Swamy',
    memberCode: 'EG-1002',
    phone: '9876543211',
    plan: '6 Month Transformation',
    pin: '3211',
    device: 'Samsung Galaxy S24 • Authorized Device'
  },
  {
    name: 'Sneha R',
    memberCode: 'EG-1004',
    phone: '9876543213',
    plan: '3 Month Classic Fitness',
    pin: '3213',
    device: 'OnePlus 12 • Authorized Device'
  }
];

export function MemberAuthProvider({ children }) {
  const [member, setMember] = useState(() => {
    try {
      const stored = localStorage.getItem('elite_member_session');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [boundDevice, setBoundDevice] = useState(() => {
    try {
      const stored = localStorage.getItem('elite_member_device');
      return stored ? JSON.parse(stored) : { device_name: 'iPhone 15 Pro • Authorized Device' };
    } catch (e) {
      return { device_name: 'iPhone 15 Pro • Authorized Device' };
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-login or refresh member session on load so PT balances and points stay live
  useEffect(() => {
    const idToFetch = member?.phone || member?.member_code || '9876543210';
    loginWithIdentifier(idToFetch, '1234').catch(() => {});
  }, []);

  const loginWithIdentifier = async (identifier, secret) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.clientLogin({
        identifier,
        secret,
        deviceFingerprint: 'fingerprint-pwa-iphone-safari',
        deviceName: 'iPhone 15 Pro • iOS Safari PWA'
      });

      if (res && res.member) {
        setMember(res.member);
        setBoundDevice(res.boundDevice || { device_name: 'iPhone 15 Pro • iOS Safari PWA' });
        localStorage.setItem('elite_member_session', JSON.stringify(res.member));
        if (res.boundDevice) {
          localStorage.setItem('elite_member_device', JSON.stringify(res.boundDevice));
        }
        setIsLoading(false);
        return { success: true, member: res.member };
      }
      throw new Error(res.error || 'Failed to authenticate member');
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  };

  const switchDemoMember = async (demo) => {
    return await loginWithIdentifier(demo.phone, demo.pin);
  };

  const logout = () => {
    setMember(null);
    localStorage.removeItem('elite_member_session');
  };

  const refreshMemberProfile = async () => {
    if (!member) return;
    try {
      const res = await api.getClientWallet(member.id);
      if (res) {
        setMember((prev) => ({
          ...prev,
          loyalty_points: res.loyaltyPoints,
          days_left: res.daysLeft,
          expiry_date: res.expiryDate
        }));
      }
    } catch (e) {
      // ignore
    }
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
        switchDemoMember,
        logout,
        refreshMemberProfile
      }}
    >
      {children}
    </MemberAuthContext.Provider>
  );
}

export const useMemberAuth = () => useContext(MemberAuthContext);

