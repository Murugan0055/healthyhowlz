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

  // Load accessible gyms and current gym profile
  const refreshGymData = async () => {
    try {
      setLoadingGym(true);
      const gyms = await api.getAccessibleGyms();
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
      // Dispatch event for components that might not be under context
      window.dispatchEvent(new CustomEvent('healthyhowlz:gym-switched', { detail: { gymId } }));
    } catch (e) {
      console.error('Error switching gym:', e);
    }
  };

  return (
    <TenantContext.Provider
      value={{
        currentGymId,
        currentGym,
        availableGyms,
        loadingGym,
        switchGym,
        refreshGymData
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      currentGymId: 'gym-gudiyatham',
      currentGym: { id: 'gym-gudiyatham', name: 'HealthyHowlz Elite (Gudiyatham HQ)', city: 'Gudiyatham' },
      availableGyms: [],
      loadingGym: false,
      switchGym: () => {},
      refreshGymData: () => {}
    };
  }
  return context;
}

