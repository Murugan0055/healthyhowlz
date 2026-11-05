import express from 'express';
import { getDb } from '../db/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT key, value FROM gym_settings');
    const settings = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const updates = req.body;

    for (const [key, value] of Object.entries(updates)) {
      await db.run('INSERT OR REPLACE INTO gym_settings (key, value) VALUES (?, ?)', [key, String(value)]);
    }

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;

