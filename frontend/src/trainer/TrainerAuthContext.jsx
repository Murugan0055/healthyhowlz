import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const TrainerAuthContext = createContext(null);

export const DEMO_TRAINERS = [
  {
    id: 'staff-trainer-1',
    name: 'Murugan S (Head Coach)',
    role: 'trainer',
    phone: '9840123458',
    pin: '5555',
    tagline: 'Head Strength & Floor Specialist',
    baseSalary: 18000,
    commissionRate: 20
  },
  {
    id: 'staff-trainer-2',
    name: 'Dinesh Kumar (Strength Coach)',
    role: 'trainer',
    phone: '9840123459',
    pin: '7777',
    tagline: 'Hypertrophy & Conditioning Coach',
    baseSalary: 15000,
    commissionRate: 18
  }
];

export function TrainerAuthProvider({ children }) {
  const [trainer, setTrainer] = useState(() => {
    try {
      const saved = localStorage.getItem('elite_gym_trainer_user');
      if (saved) return JSON.parse(saved);
      // Default to Coach Murugan S for effortless demo experience
      return DEMO_TRAINERS[0];
    } catch (e) {
      return DEMO_TRAINERS[0];
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trainer) {
      localStorage.setItem('elite_gym_trainer_user', JSON.stringify(trainer));
    } else {
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

  const switchTrainer = (trainerObj) => {
    setTrainer(trainerObj);
  };

  const logout = () => {
    setTrainer(null);
    localStorage.removeItem('elite_gym_trainer_user');
  };

  return (
    <TrainerAuthContext.Provider
      value={{
        trainer,
        isAuthenticated: !!trainer,
        loading,
        login,
        switchTrainer,
        logout,
        demoTrainers: DEMO_TRAINERS
      }}
    >
      {children}
    </TrainerAuthContext.Provider>
  );
}

export function useTrainerAuth() {
  const ctx = useContext(TrainerAuthContext);
  if (!ctx) throw new Error('useTrainerAuth must be used within TrainerAuthProvider');
  return ctx;
}

