import express from 'express';
import {
  getAllExpenses,
  createExpense,
  deleteExpense,
  getIncomeExpenseSummary
} from '../services/expenseService.js';
import { getTenantGymId } from '../middleware/tenant.js';

const router = express.Router();

// Get summary metrics (Income, Expenses, Net Profit)
router.get('/summary', async (req, res) => {
  try {
    const gymId = getTenantGymId(req);
    const summary = await getIncomeExpenseSummary(gymId);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all expenses with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, month, search } = req.query;
    const gymId = getTenantGymId(req);
    const expenses = await getAllExpenses({ category, month, search, gymId });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new expense
router.post('/', async (req, res) => {
  try {
    const gymId = req.body.gym_id || getTenantGymId(req);
    const { title, category, amount, paymentMethod, paymentRef, expenseDate, vendorName, notes, loggedBy } = req.body;
    if (!title || !category || !amount) {
      return res.status(400).json({ error: 'Title, category, and amount are required' });
    }
    const newExpense = await createExpense({
      title,
      category,
      amount,
      paymentMethod,
      paymentRef,
      expenseDate,
      vendorName,
      notes,
      loggedBy,
      gymId
    });
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteExpense(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

