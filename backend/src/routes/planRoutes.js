import express from 'express';
import { getDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const plans = await db.all('SELECT * FROM membership_plans WHERE is_active = 1 ORDER BY duration_months ASC');
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch membership plans' });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const { name, durationMonths, durationDays, basePrice, totalPrice, isOffPeak, ptSessionsIncluded, maxFreezeDays } = req.body;
    const id = uuidv4();

    await db.run(
      `INSERT INTO membership_plans (id, name, duration_months, duration_days, base_price, gst_rate, total_price, is_off_peak, pt_sessions_included, max_freeze_days)
       VALUES (?, ?, ?, ?, ?, 18.0, ?, ?, ?, ?)`,
      [id, name, durationMonths || 1, durationDays || (durationMonths * 30), basePrice, totalPrice, isOffPeak ? 1 : 0, ptSessionsIncluded || 0, maxFreezeDays || 30]
    );

    res.status(201).json({ id, name, totalPrice });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create plan' });
  }
});

export default router;

