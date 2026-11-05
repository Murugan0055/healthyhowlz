import { getDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

export async function createInvoice({
  memberId,
  memberName,
  memberPhone,
  itemType = 'membership',
  itemDescription,
  subtotal,
  cgst,
  sgst,
  discountAmount = 0,
  loyaltyPointsRedeemed = 0,
  grandTotal,
  paymentMethod = 'upi',
  paymentRef,
  b2bCompany,
  b2bGstin,
  collectedByStaffId,
  collectedByStaffName,
  autoExtendMembership = false,
  extendMonths = 0,
  extendDays = 0
}) {
  const db = await getDb();
  const id = uuidv4();

  // Generate sequential invoice number: EG-INV-YYYY-XXXX
  const year = new Date().getFullYear();
  const countRow = await db.get("SELECT COUNT(*) as count FROM invoices WHERE strftime('%Y', created_at) = strftime('%Y', 'now')");
  const nextSeq = (countRow?.count || 0) + 1;
  const invoiceNumber = `EG-INV-${year}-${String(nextSeq).padStart(4, '0')}`;

  // Validate loyalty points redemption cap (max 15% of total)
  let actualPointsRedeemed = loyaltyPointsRedeemed;
  let loyaltyDiscountVal = loyaltyPointsRedeemed; // 1 pt = ₹1

  if (actualPointsRedeemed > 0 && memberId) {
    const member = await db.get('SELECT loyalty_points FROM members WHERE id = ?', [memberId]);
    const availablePoints = member ? member.loyalty_points : 0;
    actualPointsRedeemed = Math.min(actualPointsRedeemed, availablePoints);

    // Enforce 15% cap of subtotal + taxes
    const maxCapVal = Math.round((subtotal * 1.18) * 0.15);
    loyaltyDiscountVal = Math.min(actualPointsRedeemed, maxCapVal);
    actualPointsRedeemed = loyaltyDiscountVal;

    // Deduct points from member balance
    await db.run('UPDATE members SET loyalty_points = loyalty_points - ? WHERE id = ?', [actualPointsRedeemed, memberId]);
  }

  await db.run(
    `INSERT INTO invoices (
      id, invoice_number, member_id, member_name, member_phone, item_type,
      item_description, subtotal, cgst, sgst, discount_amount, loyalty_points_redeemed,
      loyalty_discount_value, grand_total, payment_method, payment_ref, status,
      b2b_gstin, b2b_company_name, collected_by_staff_id, collected_by_staff_name, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?, ?, ?, ?, datetime('now', 'localtime'))`,
    [
      id,
      invoiceNumber,
      memberId || null,
      memberName,
      memberPhone,
      itemType,
      itemDescription,
      subtotal,
      cgst,
      sgst,
      discountAmount,
      actualPointsRedeemed,
      loyaltyDiscountVal,
      grandTotal,
      paymentMethod,
      paymentRef || 'TXN-CONFIRMED',
      b2bGstin || null,
      b2bCompany || null,
      collectedByStaffId || null,
      collectedByStaffName || null
    ]
  );

  // If this was a membership renewal/join, automatically update member status and expiry date!
  if (autoExtendMembership && memberId) {
    const mem = await db.get('SELECT * FROM members WHERE id = ?', [memberId]);
    if (mem) {
      const now = new Date();
      let baseDate = new Date();
      // If member still active, extend from their current expiry date; if expired, start from today
      const currentExpiry = new Date(mem.expiry_date);
      if (currentExpiry > now) {
        baseDate = currentExpiry;
      }

      const daysToAdd = extendDays > 0 ? extendDays : (extendMonths * 30 || 30);
      baseDate.setDate(baseDate.getDate() + daysToAdd);
      const newExpiryStr = baseDate.toISOString().split('T')[0];

      await db.run(
        `UPDATE members 
         SET status = 'active', is_frozen = 0, expiry_date = ?, plan_name = COALESCE(?, plan_name) 
         WHERE id = ?`,
        [newExpiryStr, itemDescription, memberId]
      );
    }
  }

  return await getInvoiceById(id);
}

export async function getInvoiceById(invoiceId) {
  const db = await getDb();
  return await db.get('SELECT * FROM invoices WHERE id = ? OR invoice_number = ?', [invoiceId, invoiceId]);
}

export async function getInvoicesList(limit = 50) {
  const db = await getDb();
  return await db.all('SELECT * FROM invoices ORDER BY created_at DESC LIMIT ?', [limit]);
}

