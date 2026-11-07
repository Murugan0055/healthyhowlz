import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const [currentGymId, setCurrentGymId] = useState(() => {
    try {
      return localStorage.getItem('healthyhowlz_active_gym_id') || 'gym-gudiyatham';
    } catch (e) {
      return 'gym-gudiyatham';
    }
  });

  const [currentGym, setCurrentGym] = useState(null);
  const [availableGyms, setAvailableGyms] = useState([]);
  const [loadingGym, setLoadingGym] = useState(true);

  // Load accessible gyms based on authenticated user role & ownership
  const refreshGymData = async () => {
    try {
      setLoadingGym(true);
      let ownerId = 'staff-owner';
      let role = 'owner';
      try {
        const storedUser = localStorage.getItem('elite_gym_user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          ownerId = u.id || ownerId;
          role = u.role || role;
        }
      } catch (e) { }

      const gyms = await api.getAccessibleGyms(ownerId, role);
      setAvailableGyms(gyms || []);

      const current = await api.getCurrentGym();
      setCurrentGym(current);
    } catch (err) {
      console.error('Failed to load gym tenant data:', err);
    } finally {
      setLoadingGym(false);
    }
  };

  useEffect(() => {
    refreshGymData();
  }, [currentGymId]);

  const switchGym = (gymId) => {
    try {
      localStorage.setItem('healthyhowlz_active_gym_id', gymId);
      setCurrentGymId(gymId);
      window.dispatchEvent(new CustomEvent('healthyhowlz:gym-switched', { detail: { gymId } }));
    } catch (e) {
      console.error('Error switching gym:', e);
    }
  };

  // Resolve gym by slug, id, or alias (e.g. 'gudiyatham' or 'gym-gudiyatham')
  const findGymByIdOrSlug = (identifier) => {
    if (!identifier) return null;
    const clean = identifier.toLowerCase().trim();
    return availableGyms.find(
      (g) =>
        g.slug?.toLowerCase() === clean ||
        g.id?.toLowerCase() === clean ||
        g.id?.toLowerCase() === `gym-${clean}`
    ) || null;
  };

  return (
    <TenantContext.Provider
      value={{
        currentGymId,
        currentGym,
        availableGyms,
        loadingGym,
        switchGym,
        refreshGymData,
        findGymByIdOrSlug
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    return {
      currentGymId: 'gym-gudiyatham',
      currentGym: { id: 'gym-gudiyatham', name: 'HealthyHowlz Elite (Gudiyatham HQ)', city: 'Gudiyatham' },
      availableGyms: [],
      loadingGym: false,
      switchGym: () => { },
      refreshGymData: () => { },
      findGymByIdOrSlug: () => null
    };
  }
  return context;
}
