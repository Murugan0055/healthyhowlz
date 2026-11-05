import express from 'express';
import { getKanbanLeads, createLead, updateLeadStage, getWinBackCampaigns, getStaffSalesPerformance } from '../services/crmService.js';
import { getTenantGymId } from '../middleware/tenant.js';

const router = express.Router();

router.get('/kanban', async (req, res) => {
  try {
    const gymId = getTenantGymId(req);
    const data = await getKanbanLeads(gymId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Kanban leads' });
  }
});

router.post('/', async (req, res) => {
  try {
    const gymId = req.body.gym_id || getTenantGymId(req);
    const lead = await createLead({ ...req.body, gym_id: gymId });
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

router.put('/:id/stage', async (req, res) => {
  try {
    const { stage, notes, lostReason } = req.body;
    const result = await updateLeadStage(req.params.id, stage, notes, lostReason);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update lead stage' });
  }
});

router.get('/win-back', async (req, res) => {
  try {
    const days = parseInt(req.query.days || '30', 10);
    const candidates = await getWinBackCampaigns(days);
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch win-back leads' });
  }
});

router.get('/staff-performance', async (req, res) => {
  try {
    const perf = await getStaffSalesPerformance();
    res.json(perf);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff performance' });
  }
});

export default router;

