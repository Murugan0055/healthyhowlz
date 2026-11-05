import express from 'express';
import { getRevenueDashboard, submitCashDrawerReconciliation, getCashReconciliationHistory, getProjectedCashFlow } from '../services/revenueService.js';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    const data = await getRevenueDashboard();
    res.json(data);
  } catch (err) {
    console.error('Revenue dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

router.get('/forecast', async (req, res) => {
  try {
    const forecast = await getProjectedCashFlow();
    res.json(forecast);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate cash flow forecast' });
  }
});

router.post('/reconcile-cash', async (req, res) => {
  try {
    const { staffId, staffName, physicalCashCounted, notes } = req.body;
    if (physicalCashCounted === undefined || physicalCashCounted === null) {
      return res.status(400).json({ error: 'Physical cash count is required' });
    }
    const result = await submitCashDrawerReconciliation({
      staffId: staffId || 'staff-front-desk',
      staffName: staffName || 'Duty Officer',
      physicalCashCounted: parseFloat(physicalCashCounted),
      notes
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit cash reconciliation' });
  }
});

router.get('/reconciliations', async (req, res) => {
  try {
    const history = await getCashReconciliationHistory(15);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reconciliation history' });
  }
});

export default router;

