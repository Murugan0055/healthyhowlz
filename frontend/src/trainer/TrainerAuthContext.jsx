import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const TrainerAuthContext = createContext(null);

export function TrainerAuthProvider({ children }) {
  const [trainer, setTrainer] = useState(() => {
    try {
      // Check unified auth session first
      const unifiedUser = localStorage.getItem('elite_gym_user');
      if (unifiedUser) {
        const parsed = JSON.parse(unifiedUser);
        if (parsed.role === 'trainer') return parsed;
      }
      const saved = localStorage.getItem('healthyhowlz_trainer_session') || localStorage.getItem('elite_gym_trainer_user');
      if (saved) return JSON.parse(saved);
      return null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trainer) {
      localStorage.setItem('healthyhowlz_trainer_session', JSON.stringify(trainer));
      localStorage.setItem('elite_gym_trainer_user', JSON.stringify(trainer));
      if (trainer.gym_id) {
        localStorage.setItem('healthyhowlz_active_gym_id', trainer.gym_id);
      }
    } else {
      localStorage.removeItem('healthyhowlz_trainer_session');
      localStorage.removeItem('elite_gym_trainer_user');
    }
  }, [trainer]);

  const login = async (phone, securityPin) => {
    setLoading(true);
    try {
      const data = await api.loginTrainer(phone, securityPin);
      if (data?.trainer) {
        setTrainer(data.trainer);
        return data.trainer;
      }
      throw new Error('Trainer credentials verification failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setTrainer(null);
    localStorage.removeItem('healthyhowlz_trainer_session');
    localStorage.removeItem('elite_gym_trainer_user');
    localStorage.removeItem('elite_gym_user');
    localStorage.removeItem('elite_gym_token');
    localStorage.removeItem('elite_gym_active_portal');
    try {
      const url = new URL(window.location.origin + window.location.pathname);
      window.history.replaceState({}, '', url);
    } catch (e) {}
  };

  return (
    <TrainerAuthContext.Provider
      value={{
        trainer,
        isAuthenticated: !!trainer,
        loading,
        login,
        logout
      }}
    >
      {children}
    </TrainerAuthContext.Provider>
  );
}

export const useTrainerAuth = () => useContext(TrainerAuthContext);
