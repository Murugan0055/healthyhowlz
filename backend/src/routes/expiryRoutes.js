import express from 'express';
import { getExpiryAlertQueue } from '../services/expiryService.js';

const router = express.Router();

router.get('/alerts', async (req, res) => {
  try {
    const alerts = await getExpiryAlertQueue();
    res.json(alerts);
  } catch (err) {
    console.error('Expiry alerts error:', err);
    res.status(500).json({ error: 'Failed to fetch expiry alerts' });
  }
});

export default router;

