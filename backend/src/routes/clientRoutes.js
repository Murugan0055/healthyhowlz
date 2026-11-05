import express from 'express';
import {
  loginMember,
  generateDynamicQrPass,
  getMemberWorkoutHub,
  logWorkoutSet,
  getMemberDietHub,
  toggleMealEaten,
  getMemberWalletHub,
  executeMemberRenewal,
  getFacilityNoticeBoard,
  getMemberPtHistory
} from '../services/clientPwaService.js';
import { getFloorRushMeter } from '../services/attendanceService.js';

const router = express.Router();

// 1. Member Login & Session
router.post('/login', async (req, res) => {
  try {
    const { identifier, secret, deviceFingerprint, deviceName } = req.body;
    const result = await loginMember({ identifier, secret, deviceFingerprint, deviceName });
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// 2. Dynamic Rotating Anti-Screenshot QR Pass
router.get('/pass/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;
    const fingerprint = req.headers['x-device-fingerprint'];
    const pass = await generateDynamicQrPass(memberId, fingerprint);
    res.json(pass);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Workouts & Interactive Set Logger
router.get('/workout/:memberId', async (req, res) => {
  try {
    const workout = await getMemberWorkoutHub(req.params.memberId);
    res.json(workout);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/workout/log', async (req, res) => {
  try {
    const { memberId, exerciseName, setNumber, weightKg, reps } = req.body;
    const result = await logWorkoutSet({ memberId, exerciseName, setNumber, weightKg, reps });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Nutrition & Meals
router.get('/diet/:memberId', async (req, res) => {
  try {
    const diet = await getMemberDietHub(req.params.memberId);
    res.json(diet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/diet/toggle-meal', async (req, res) => {
  try {
    const { mealId, isEaten } = req.body;
    const result = await toggleMealEaten(mealId, isEaten);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Loyalty Points Wallet & Renewals
router.get('/wallet/:memberId', async (req, res) => {
  try {
    const wallet = await getMemberWalletHub(req.params.memberId);
    res.json(wallet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/renew', async (req, res) => {
  try {
    const { memberId, planId, pointsToRedeem, paymentMethod, paymentRef } = req.body;
    const result = await executeMemberRenewal({ memberId, planId, pointsToRedeem, paymentMethod, paymentRef });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Floor Rush & Notice Board
router.get('/notices', async (req, res) => {
  try {
    const notices = await getFacilityNoticeBoard();
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
});

router.get('/rush', async (req, res) => {
  try {
    const rush = await getFloorRushMeter();
    res.json(rush);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch floor rush' });
  }
});

// 7. Member PT Pass & Verification Code
router.get('/pt-pass/:memberId', async (req, res) => {
  try {
    const ptData = await getMemberPtHistory(req.params.memberId);
    res.json(ptData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

