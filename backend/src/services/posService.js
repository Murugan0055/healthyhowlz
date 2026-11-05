import { getDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';
import { createInvoice } from './invoiceService.js';

export async function getProducts() {
  const db = await getDb();
  return await db.all('SELECT * FROM pos_products WHERE is_active = 1 ORDER BY category, name');
}

export async function processPosCheckout({ items, paymentMethod, customerName, customerPhone, staffId, staffName }) {
  const db = await getDb();
  const saleId = uuidv4();

  let subtotal = 0;
  const itemsDetailed = [];

  for (const it of items) {
    const prod = await db.get('SELECT * FROM pos_products WHERE id = ?', [it.id]);
    if (!prod) continue;

    if (prod.stock_quantity < it.qty) {
      throw new Error(`Insufficient stock for ${prod.name}. Available: ${prod.stock_quantity}`);
    }

    const itemTotal = prod.price * it.qty;
    subtotal += itemTotal;

    // Deduct stock
    await db.run('UPDATE pos_products SET stock_quantity = stock_quantity - ? WHERE id = ?', [it.qty, prod.id]);

    itemsDetailed.push({
      id: prod.id,
      name: prod.name,
      sku: prod.sku,
      unitPrice: prod.price,
      qty: it.qty,
      itemTotal
    });
  }

  // Calculate 18% GST (inclusive or exclusive)
  // Let's calculate standard 18% breakdown
  const baseSubtotal = Math.round((subtotal / 1.18) * 100) / 100;
  const tax = Math.round((subtotal - baseSubtotal) * 100) / 100;
  const cgst = Math.round((tax / 2) * 100) / 100;
  const sgst = Math.round((tax / 2) * 100) / 100;

  const summaryDesc = itemsDetailed.map((i) => `${i.qty}x ${i.name}`).join(', ');

  // Create Invoice
  const invoice = await createInvoice({
    memberName: customerName || 'Walk-in Gym Member',
    memberPhone: customerPhone || '9840123456',
    itemType: 'pos_retail',
    itemDescription: summaryDesc,
    subtotal: baseSubtotal,
    cgst,
    sgst,
    grandTotal: subtotal,
    paymentMethod,
    collectedByStaffId: staffId,
    collectedByStaffName: staffName
  });

  // Record Sale
  await db.run(
    `INSERT INTO pos_sales (id, invoice_id, items_json, total_amount, payment_method, staff_id, staff_name, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
    [saleId, invoice.id, JSON.stringify(itemsDetailed), subtotal, paymentMethod, staffId, staffName]
  );

  return {
    saleId,
    invoice,
    itemsDetailed,
    grandTotal: subtotal
  };
}

export async function getLockersGrid() {
  const db = await getDb();
  // Fetch lockers with member details
  const lockers = await db.all(`
    SELECT l.*, m.phone as member_phone, m.status as member_status, m.photo_url as member_photo
    FROM lockers l
    LEFT JOIN members m ON l.assigned_member_id = m.id
    ORDER BY l.locker_number ASC
  `);

  const summary = {
    total: lockers.length,
    available: lockers.filter((l) => l.status === 'available').length,
    occupied: lockers.filter((l) => l.status === 'occupied').length,
    maintenance: lockers.filter((l) => l.status === 'maintenance').length
  };

  return { lockers, summary };
}

export async function assignLocker({ lockerId, memberId, expiryDate }) {
  const db = await getDb();
  const member = await db.get('SELECT * FROM members WHERE id = ?', [memberId]);
  if (!member) throw new Error('Member not found');

  const locker = await db.get('SELECT * FROM lockers WHERE id = ?', [lockerId]);
  if (!locker) throw new Error('Locker not found');

  const todayStr = new Date().toISOString().split('T')[0];
  const assignedExpiry = expiryDate || member.expiry_date;

  await db.run(
    `UPDATE lockers 
     SET status = 'occupied', assigned_member_id = ?, assigned_member_name = ?, assigned_date = ?, expiry_date = ?
     WHERE id = ?`,
    [member.id, member.name, todayStr, assignedExpiry, lockerId]
  );

  await db.run('UPDATE members SET assigned_locker_id = ? WHERE id = ?', [lockerId, memberId]);

  return { success: true, lockerId, memberId, memberName: member.name, expiryDate: assignedExpiry };
}

export async function releaseLocker(lockerId) {
  const db = await getDb();
  const locker = await db.get('SELECT * FROM lockers WHERE id = ?', [lockerId]);
  if (locker && locker.assigned_member_id) {
    await db.run('UPDATE members SET assigned_locker_id = NULL WHERE id = ?', [locker.assigned_member_id]);
  }

  await db.run(
    `UPDATE lockers 
     SET status = 'available', assigned_member_id = NULL, assigned_member_name = NULL, assigned_date = NULL, expiry_date = NULL 
     WHERE id = ?`,
    [lockerId]
  );

  return { success: true, lockerId };
}

export async function createLocker({ locker_number, zone = 'Main Floor', monthly_rent = 500 }) {
  const db = await getDb();
  if (!locker_number) throw new Error('Locker number is required');

  const existing = await db.get('SELECT * FROM lockers WHERE LOWER(locker_number) = LOWER(?)', [locker_number.trim()]);
  if (existing) {
    throw new Error(`Locker "${locker_number}" already exists`);
  }

  const lockerId = `locker-${uuidv4().slice(0, 8)}`;
  await db.run(
    `INSERT INTO lockers (id, locker_number, zone, status, monthly_rent)
     VALUES (?, ?, ?, 'available', ?)`,
    [lockerId, locker_number.trim().toUpperCase(), zone || 'Main Floor', Number(monthly_rent) || 500]
  );

  return await db.get('SELECT * FROM lockers WHERE id = ?', [lockerId]);
}

export async function deleteLocker(lockerId) {
  const db = await getDb();
  const locker = await db.get('SELECT * FROM lockers WHERE id = ?', [lockerId]);
  if (!locker) throw new Error('Locker not found');

  if (locker.assigned_member_id) {
    await db.run('UPDATE members SET assigned_locker_id = NULL WHERE id = ?', [locker.assigned_member_id]);
  }

  await db.run('DELETE FROM lockers WHERE id = ?', [lockerId]);
  return { success: true, lockerId, lockerNumber: locker.locker_number };
}


