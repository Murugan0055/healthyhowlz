import express from 'express';
import { verifyQrToken, verifyManualCheckin, confirmManualCheckin, getFloorRushMeter, getRecentCheckins } from '../services/attendanceService.js';

const router = express.Router();

// On-demand QR scan verification
router.post('/scan', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    const result = await verifyQrToken(token);
    res.json(result);
  } catch (err) {
    console.error('Scan error:', err);
    res.status(500).json({ error: 'Failed to process QR scan' });
  }
});

// Officer PIN verification for manual check-in
router.post('/manual-auth', async (req, res) => {
  try {
    const { query, officerPin, staffId } = req.body;
    if (!officerPin) {
      return res.status(400).json({ error: 'Officer 4-digit PIN is required' });
    }
    const result = await verifyManualCheckin({ query: query || '', officerPin, staffId });
    if (!result.success) {
      return res.status(401).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('Manual auth error:', err);
    res.status(500).json({ error: 'Manual check-in lookup failed' });
  }
});

// Confirm manual check-in with officer audit trail
router.post('/manual-confirm', async (req, res) => {
  try {
    const { memberId, officerId, officerName, notes } = req.body;
    if (!memberId || !officerId) {
      return res.status(400).json({ error: 'Member ID and Officer ID are required' });
    }
    const result = await confirmManualCheckin({ memberId, officerId, officerName, notes });
    res.json(result);
  } catch (err) {
    console.error('Confirm manual checkin error:', err);
    res.status(500).json({ error: 'Failed to confirm manual check-in' });
  }
});

// Live floor rush meter
router.get('/rush-meter', async (req, res) => {
  try {
    const rush = await getFloorRushMeter();
    res.json(rush);
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate floor rush' });
  }
});

// Recent check-in stream
router.get('/recent', async (req, res) => {
  try {
    const checkins = await getRecentCheckins(20);
    res.json(checkins);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recent check-ins' });
  }
});

export default router;

