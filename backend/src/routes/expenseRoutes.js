import express from 'express';
import {
  getAllExpenses,
  createExpense,
  deleteExpense,
  getIncomeExpenseSummary
} from '../services/expenseService.js';

const router = express.Router();

// Get summary metrics (Income, Expenses, Net Profit)
router.get('/summary', async (req, res) => {
  try {
    const summary = await getIncomeExpenseSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all expenses with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, month, search } = req.query;
    const expenses = await getAllExpenses({ category, month, search });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new expense
router.post('/', async (req, res) => {
  try {
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
      loggedBy
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

