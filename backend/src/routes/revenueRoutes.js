import express from 'express';
import { getRevenueDashboard, submitCashDrawerReconciliation, getCashReconciliationHistory, getProjectedCashFlow } from '../services/revenueService.js';
import { getTenantGymId } from '../middleware/tenant.js';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    const gymId = getTenantGymId(req);
    const data = await getRevenueDashboard(gymId);
    res.json(data);
  } catch (err) {
    console.error('Revenue dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

router.get('/forecast', async (req, res) => {
  try {
    const gymId = getTenantGymId(req);
    const forecast = await getProjectedCashFlow(gymId);
    res.json(forecast);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate cash flow forecast' });
  }
});

router.post('/reconcile-cash', async (req, res) => {
  try {
    const gymId = req.body.gym_id || getTenantGymId(req);
    const { staffId, staffName, physicalCashCounted, notes } = req.body;
    if (physicalCashCounted === undefined || physicalCashCounted === null) {
      return res.status(400).json({ error: 'Physical cash count is required' });
    }
    const result = await submitCashDrawerReconciliation({
      staffId: staffId || 'staff-front-desk',
      staffName: staffName || 'Duty Officer',
      physicalCashCounted: parseFloat(physicalCashCounted),
      notes,
      gymId
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit cash reconciliation' });
  }
});

router.get('/reconciliations', async (req, res) => {
  try {
    const gymId = getTenantGymId(req);
    const history = await getCashReconciliationHistory(15, gymId);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reconciliation history' });
  }
});

export default router;

