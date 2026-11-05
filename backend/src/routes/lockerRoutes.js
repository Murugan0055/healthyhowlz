import express from 'express';
import { getLockersGrid, assignLocker, releaseLocker, createLocker, deleteLocker } from '../services/posService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const grid = await getLockersGrid();
    res.json(grid);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lockers' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { locker_number, zone, monthly_rent } = req.body;
    const locker = await createLocker({ locker_number, zone, monthly_rent });
    res.status(201).json(locker);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteLocker(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/assign', async (req, res) => {
  try {
    const { lockerId, memberId, expiryDate } = req.body;
    const result = await assignLocker({ lockerId, memberId, expiryDate });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/release', async (req, res) => {
  try {
    const { lockerId } = req.body;
    const result = await releaseLocker(lockerId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

