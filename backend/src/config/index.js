import path from 'path';
import { fileURLToPath } from 'url';

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'elite_gym_gudiyatham_jwt_secret_2026',
  officerMasterPin: process.env.OFFICER_MASTER_PIN || '1234',
  gym: {
    name: 'Elite Fitness Center',
    tagline: 'Premium Strength & High-Performance Club',
    location: 'Gudiyatham, Tamil Nadu',
    address: 'Plot 14, Katpadi Main Road, Near New Bus Stand, Gudiyatham, Vellore Dist - 632602',
    phone: '+91 98401 23456',
    email: 'operations@elitegymgudiyatham.com',
    website: 'https://elitegymgudiyatham.com',
    gstin: '33AAAAE1234M1Z5',
    cgstRate: 9.0,
    sgstRate: 9.0,
    currencySymbol: '₹',
    gracePeriodDays: 2,
    dailyAttendancePoints: 20,
    pointRupeeValue: 1.0,
    maxLoyaltyRedemptionPercent: 15.0
  }
};

