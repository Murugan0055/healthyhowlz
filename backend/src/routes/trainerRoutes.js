import express from 'express';
import { trainerService } from '../services/trainerService.js';

const router = express.Router();

// Get list of active trainers (optionally filtered by gym)
router.get('/list', async (req, res, next) => {
  try {
    const { gymId } = req.query;
    const trainers = await trainerService.getTrainers(gymId);
    res.json({ trainers });
  } catch (err) {
    next(err);
  }
});

// Trainer Login with Phone & PIN
router.post('/login', async (req, res, next) => {
  try {
    const { phone, securityPin } = req.body;
    if (!phone || !securityPin) {
      return res.status(400).json({ error: 'Phone number and Security PIN are required.' });
    }
    const trainer = await trainerService.loginTrainer(phone, securityPin);
    res.json({ success: true, trainer });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// Trainer Profile & Metric Counts
router.get('/profile/:trainerId', async (req, res, next) => {
  try {
    const profile = await trainerService.getTrainerProfile(req.params.trainerId);
    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

// Assigned Client Roster with Medical Flags & 4+ Days Absent Alert
router.get('/roster/:trainerId', async (req, res, next) => {
  try {
    const roster = await trainerService.getTrainerRoster(req.params.trainerId);
    res.json({ roster });
  } catch (err) {
    next(err);
  }
});

// 1-Tap Floor Attendance Check-in
router.post('/floor-attendance', async (req, res, next) => {
  try {
    const { trainerId, memberId, notes } = req.body;
    if (!trainerId || !memberId) {
      return res.status(400).json({ error: 'Trainer ID and Member ID are required.' });
    }
    const result = await trainerService.markFloorAttendance(trainerId, memberId, notes);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Anti-Fraud Personal Training (PT) Punch-In
router.post('/verify-pt-session', async (req, res, next) => {
  try {
    const { trainerId, memberId, verificationCode, focusArea, notes } = req.body;
    if (!trainerId || !memberId || !verificationCode) {
      return res.status(400).json({ error: 'Trainer ID, Member ID, and 4-digit verification code are required.' });
    }
    const result = await trainerService.verifyPtSession({
      trainerId,
      memberId,
      verificationCode,
      focusArea,
      notes
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Trainer Earnings & Commission Dashboard
router.get('/earnings/:trainerId', async (req, res, next) => {
  try {
    const { month } = req.query;
    const earnings = await trainerService.getTrainerEarnings(req.params.trainerId, month);
    res.json({ earnings });
  } catch (err) {
    next(err);
  }
});

// Master Workout & Diet Templates
router.get('/templates', async (req, res, next) => {
  try {
    const templates = await trainerService.getTemplates();
    res.json(templates);
  } catch (err) {
    next(err);
  }
});

// Clone Workout Template to Client
router.post('/assign-workout', async (req, res, next) => {
  try {
    const { trainerId, memberId, templateId, customNotes } = req.body;
    if (!trainerId || !memberId || !templateId) {
      return res.status(400).json({ error: 'Trainer ID, Member ID, and Template ID are required.' });
    }
    const result = await trainerService.cloneWorkoutTemplate({
      trainerId,
      memberId,
      templateId,
      customNotes
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Clone Diet Template to Client
router.post('/assign-diet', async (req, res, next) => {
  try {
    const { trainerId, memberId, templateId, customNotes } = req.body;
    if (!trainerId || !memberId || !templateId) {
      return res.status(400).json({ error: 'Trainer ID, Member ID, and Template ID are required.' });
    }
    const result = await trainerService.cloneDietTemplate({
      trainerId,
      memberId,
      templateId,
      customNotes
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get Member's Currently Active Routine & Diet
router.get('/member-program/:memberId', async (req, res, next) => {
  try {
    const data = await trainerService.getMemberActiveProgram(req.params.memberId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Save Customized or From-Scratch Workout Program
router.post('/save-custom-workout', async (req, res, next) => {
  try {
    const result = await trainerService.saveCustomWorkoutProgram(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Save Customized or From-Scratch Diet Blueprint
router.post('/save-custom-diet', async (req, res, next) => {
  try {
    const result = await trainerService.saveCustomDietPlan(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Assign Client to Trainer's Roster
router.post('/assign-client', async (req, res, next) => {
  try {
    const { trainerId, memberId } = req.body;
    if (!trainerId || !memberId) {
      return res.status(400).json({ error: 'Trainer ID and Member ID are required' });
    }
    const result = await trainerService.assignClientToTrainer({ trainerId, memberId });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get All Members for Trainer Assignment Modal
router.get('/all-members', async (req, res, next) => {
  try {
    const members = await trainerService.getAllMembersForAssignment();
    res.json({ members });
  } catch (err) {
    next(err);
  }
});

export default router;

