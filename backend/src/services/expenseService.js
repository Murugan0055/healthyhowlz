import { getDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

export async function getAllExpenses({ category, month, search, gymId } = {}) {
  const db = await getDb();
  let query = 'SELECT * FROM expenses WHERE 1=1';
  const params = [];

  if (gymId && gymId !== 'all') {
    query += ' AND gym_id = ?';
    params.push(gymId);
  }

  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (month) {
    query += ' AND strftime("%Y-%m", expense_date) = ?';
    params.push(month);
  }

  if (search) {
    query += ' AND (title LIKE ? OR vendor_name LIKE ? OR notes LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY expense_date DESC, created_at DESC';
  return await db.all(query, params);
}

export async function createExpense({
  title,
  category,
  amount,
  paymentMethod = 'upi',
  paymentRef,
  expenseDate,
  vendorName,
  notes,
  loggedBy = 'Karthik Raja (Owner)',
  gymId = 'gym-gudiyatham'
}) {
  const db = await getDb();
  const id = `exp-${uuidv4().slice(0, 8)}`;
  const date = expenseDate || new Date().toISOString().split('T')[0];

  await db.run(
    `INSERT INTO expenses (id, title, category, amount, payment_method, payment_ref, expense_date, vendor_name, notes, logged_by, gym_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, title, category, parseFloat(amount) || 0, paymentMethod, paymentRef, date, vendorName, notes, loggedBy, gymId]
  );

  return await db.get('SELECT * FROM expenses WHERE id = ?', [id]);
}

export async function deleteExpense(id) {
  const db = await getDb();
  await db.run('DELETE FROM expenses WHERE id = ?', [id]);
  return { success: true, id };
}

export async function getIncomeExpenseSummary(gymId) {
  const db = await getDb();
  const filterGym = gymId && gymId !== 'all';
  const gymClauseInv = filterGym ? ' AND gym_id = ?' : '';
  const gymClauseExp = filterGym ? ' WHERE gym_id = ?' : '';
  const gymClauseExpAnd = filterGym ? ' AND gym_id = ?' : '';
  const gymParam = filterGym ? [gymId] : [];

  // 1. Total Gross Revenue from invoices
  const revenueRow = await db.get(`SELECT SUM(grand_total) as total_income, COUNT(*) as invoice_count FROM invoices WHERE status = "paid"${gymClauseInv}`, gymParam);
  const totalIncome = revenueRow?.total_income || 0;

  // 2. Total Operating Expenses
  const expenseRow = await db.get(`SELECT SUM(amount) as total_expense, COUNT(*) as expense_count FROM expenses${gymClauseExp}`, gymParam);
  const totalExpense = expenseRow?.total_expense || 0;

  // 3. Net Profit / Cash Flow
  const netProfit = totalIncome - totalExpense;
  const profitMarginPercent = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0.0';

  // 4. Expenses by Category
  const categoryBreakdown = await db.all(
    `SELECT category, SUM(amount) as total, COUNT(*) as count 
     FROM expenses${gymClauseExp}
     GROUP BY category 
     ORDER BY total DESC`,
    gymParam
  );

  // 5. Recent 6 Months Trend (Income vs Expense)
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthIncome = await db.get(
    `SELECT SUM(grand_total) as mtd_income FROM invoices WHERE strftime("%Y-%m", created_at) = ? AND status = "paid"${gymClauseInv}`,
    filterGym ? [currentMonth, gymId] : [currentMonth]
  );
  const currentMonthExpense = await db.get(
    `SELECT SUM(amount) as mtd_expense FROM expenses WHERE strftime("%Y-%m", expense_date) = ?${gymClauseExpAnd}`,
    filterGym ? [currentMonth, gymId] : [currentMonth]
  );

  const mtdIncome = currentMonthIncome?.mtd_income || 0;
  const mtdExpense = currentMonthExpense?.mtd_expense || 0;
  const mtdNetProfit = mtdIncome - mtdExpense;

  return {
    totalIncome,
    totalExpense,
    netProfit,
    profitMarginPercent,
    mtdIncome,
    mtdExpense,
    mtdNetProfit,
    categoryBreakdown,
    invoiceCount: revenueRow?.invoice_count || 0,
    expenseCount: expenseRow?.expense_count || 0
  };
}
