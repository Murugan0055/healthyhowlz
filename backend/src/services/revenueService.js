import { getDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

export async function getRevenueDashboard() {
  const db = await getDb();

  // 1. Real-time counters
  // Today's Collections
  const todayRow = await db.get(
    `SELECT COALESCE(SUM(grand_total), 0) as total, COUNT(*) as count 
     FROM invoices 
     WHERE date(created_at) = date('now', 'localtime') AND status = 'paid'`
  );

  // Month-to-Date (MTD)
  const mtdRow = await db.get(
    `SELECT COALESCE(SUM(grand_total), 0) as total, COUNT(*) as count 
     FROM invoices 
     WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'localtime') AND status = 'paid'`
  );

  // Year-to-Date (YTD)
  const ytdRow = await db.get(
    `SELECT COALESCE(SUM(grand_total), 0) as total, COUNT(*) as count 
     FROM invoices 
     WHERE strftime('%Y', created_at) = strftime('%Y', 'now', 'localtime') AND status = 'paid'`
  );

  // Payment Method Breakdown (Today & MTD)
  const methodRows = await db.all(
    `SELECT payment_method, 
            COALESCE(SUM(grand_total), 0) as total_amount, 
            COUNT(*) as invoice_count 
     FROM invoices 
     WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'localtime') AND status = 'paid'
     GROUP BY payment_method`
  );

  // Category Breakdown (Membership vs POS Retail vs Locker vs PT)
  const categoryRows = await db.all(
    `SELECT item_type, 
            COALESCE(SUM(grand_total), 0) as total_amount, 
            COUNT(*) as count 
     FROM invoices 
     WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'localtime') AND status = 'paid'
     GROUP BY item_type`
  );

  // Active Member Count & ARPM (Average Revenue Per Member)
  const activeMembersRow = await db.get(
    "SELECT COUNT(*) as count FROM members WHERE status IN ('active', 'grace')"
  );
  const activeMembersCount = activeMembersRow?.count || 1;
  const arpm = Math.round((mtdRow?.total || 0) / activeMembersCount);

  // Today's Cash Expected (for front desk cash drawer)
  const todayCashRow = await db.get(
    `SELECT COALESCE(SUM(grand_total), 0) as cash_total 
     FROM invoices 
     WHERE date(created_at) = date('now', 'localtime') 
       AND payment_method = 'cash' 
       AND status = 'paid'`
  );

  return {
    counters: {
      todayRevenue: todayRow?.total || 0,
      todayInvoices: todayRow?.count || 0,
      mtdRevenue: mtdRow?.total || 0,
      mtdInvoices: mtdRow?.count || 0,
      ytdRevenue: ytdRow?.total || 0,
      ytdInvoices: ytdRow?.count || 0,
      arpm,
      activeMembersCount,
      todayExpectedCash: todayCashRow?.cash_total || 0
    },
    paymentMethods: methodRows,
    categoryBreakdown: categoryRows
  };
}

export async function submitCashDrawerReconciliation({ staffId, staffName, physicalCashCounted, notes }) {
  const db = await getDb();
  const id = uuidv4();
  const dateStr = new Date().toISOString().split('T')[0];

  // Calculate actual system cash recorded today
  const cashRow = await db.get(
    `SELECT COALESCE(SUM(grand_total), 0) as system_cash 
     FROM invoices 
     WHERE date(created_at) = date('now', 'localtime') 
       AND payment_method = 'cash' 
       AND status = 'paid'`
  );

  const systemCashExpected = cashRow ? cashRow.system_cash : 0;
  const discrepancy = physicalCashCounted - systemCashExpected;

  let status = 'balanced';
  if (discrepancy < 0) {
    status = 'shortage';
  } else if (discrepancy > 0) {
    status = 'surplus';
  }

  await db.run(
    `INSERT INTO cash_drawer_reconciliations (id, reconciliation_date, staff_id, staff_name, system_cash_expected, physical_cash_counted, discrepancy, status, notes, submitted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
    [id, dateStr, staffId, staffName, systemCashExpected, physicalCashCounted, discrepancy, status, notes || '']
  );

  return {
    id,
    reconciliationDate: dateStr,
    systemCashExpected,
    physicalCashCounted,
    discrepancy,
    status,
    notes
  };
}

export async function getCashReconciliationHistory(limit = 10) {
  const db = await getDb();
  return await db.all(
    `SELECT * FROM cash_drawer_reconciliations 
     ORDER BY submitted_at DESC 
     LIMIT ?`,
    [limit]
  );
}

export async function getProjectedCashFlow() {
  const db = await getDb();

  // Find expiring memberships in next 7, 14, 30 days
  const query = `
    SELECT m.id, m.member_code, m.name, m.phone, m.expiry_date, m.plan_name, 
           COALESCE(p.total_price, 6500) as renewal_estimate,
           julianday(m.expiry_date) - julianday('now', 'localtime') as days_left
    FROM members m
    LEFT JOIN membership_plans p ON m.plan_id = p.id
    WHERE m.status IN ('active', 'grace')
      AND julianday(m.expiry_date) - julianday('now', 'localtime') <= 30
      AND julianday(m.expiry_date) - julianday('now', 'localtime') >= -2
    ORDER BY m.expiry_date ASC
  `;

  const expiringMembers = await db.all(query);

  const next7Days = [];
  const next14Days = [];
  const next30Days = [];

  let next7Revenue = 0;
  let next14Revenue = 0;
  let next30Revenue = 0;

  for (const m of expiringMembers) {
    const days = Math.ceil(m.days_left);
    if (days <= 7) {
      next7Days.push(m);
      next7Revenue += m.renewal_estimate;
    } else if (days <= 14) {
      next14Days.push(m);
      next14Revenue += m.renewal_estimate;
    } else {
      next30Days.push(m);
      next30Revenue += m.renewal_estimate;
    }
  }

  return {
    forecasts: {
      next7Days: { count: next7Days.length, potentialRevenue: next7Revenue, members: next7Days },
      next14Days: { count: next14Days.length, potentialRevenue: next14Revenue, members: next14Days },
      next30Days: { count: next30Days.length, potentialRevenue: next30Revenue, members: next30Days }
    },
    totalUpcoming30DaysRevenue: next7Revenue + next14Revenue + next30Revenue,
    totalUpcoming30DaysCount: expiringMembers.length
  };
}

