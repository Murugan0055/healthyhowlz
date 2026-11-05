import express from 'express';
import { getDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';
import { freezeMembership, unfreezeMembership } from '../services/expiryService.js';
import { createInvoice } from '../services/invoiceService.js';
import { getTenantGymId } from '../middleware/tenant.js';

const router = express.Router();

// List members with search and filter
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { status, search } = req.query;
    const gymId = getTenantGymId(req);

    let query = `
      SELECT m.*, p.name as plan_title, s.name as trainer_name, l.locker_number,
             CAST(julianday(m.expiry_date) - julianday('now', 'localtime') AS INT) as days_left
      FROM members m
      LEFT JOIN membership_plans p ON m.plan_id = p.id
      LEFT JOIN staff s ON m.assigned_trainer_id = s.id
      LEFT JOIN lockers l ON m.assigned_locker_id = l.id
      WHERE 1=1
    `;
    const params = [];

    if (gymId && gymId !== 'all') {
      query += ` AND m.gym_id = ?`;
      params.push(gymId);
    }

    if (status && status !== 'all') {
      query += ` AND m.status = ?`;
      params.push(status);
    }

    const cleanSearch = (search || '').trim();
    if (cleanSearch && cleanSearch !== 'undefined' && cleanSearch !== 'null') {
      query += ` AND (m.name LIKE ? OR m.phone LIKE ? OR m.member_code LIKE ?)`;
      params.push(`%${cleanSearch}%`, `%${cleanSearch}%`, `%${cleanSearch}%`);
    }

    query += ` ORDER BY m.created_at DESC`;

    const members = await db.all(query, params);
    res.json(members);
  } catch (err) {
    console.error('Fetch members error:', err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Single member details + attendance history
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const member = await db.get(
      `SELECT m.*, p.name as plan_title, p.total_price as plan_price, s.name as trainer_name, l.locker_number,
              CAST(julianday(m.expiry_date) - julianday('now', 'localtime') AS INT) as days_left
       FROM members m
       LEFT JOIN membership_plans p ON m.plan_id = p.id
       LEFT JOIN staff s ON m.assigned_trainer_id = s.id
       LEFT JOIN lockers l ON m.assigned_locker_id = l.id
       WHERE m.id = ? OR m.member_code = ?`,
      [req.params.id, req.params.id]
    );

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const checkins = await db.all(
      `SELECT * FROM checkins WHERE member_id = ? ORDER BY checkin_time DESC LIMIT 30`,
      [member.id]
    );

    const invoices = await db.all(
      `SELECT * FROM invoices WHERE member_id = ? ORDER BY created_at DESC LIMIT 10`,
      [member.id]
    );

    res.json({ member, checkins, invoices });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch member details' });
  }
});

// Create new member
router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const {
      name, phone, email, gender, dob, emergencyContactName, emergencyContactPhone,
      fitnessGoals, medicalFlags, planId, startDate, assignedTrainerId, assignedLockerId,
      paymentMethod = 'upi'
    } = req.body;

    if (!name || !phone || !planId) {
      return res.status(400).json({ error: 'Name, Phone, and Plan are required' });
    }

    // Check duplicate phone
    const existing = await db.get('SELECT id FROM members WHERE phone = ?', [phone]);
    if (existing) {
      return res.status(400).json({ error: 'A member with this phone number already exists.' });
    }

    // Get plan details
    const plan = await db.get('SELECT * FROM membership_plans WHERE id = ?', [planId]);
    if (!plan) return res.status(400).json({ error: 'Selected plan not found' });

    // Generate Member Code: EG-XXXX
    const countRow = await db.get('SELECT COUNT(*) as count FROM members');
    const memberCode = `EG-${1001 + (countRow?.count || 0)}`;

    const id = uuidv4();
    const gymId = req.body.gym_id || getTenantGymId(req);
    const start = startDate || new Date().toISOString().split('T')[0];
    const expiry = new Date(start);
    expiry.setDate(expiry.getDate() + (plan.duration_days || plan.duration_months * 30));
    const expiryDateStr = expiry.toISOString().split('T')[0];

    const defaultAvatar = gender === 'Female' 
      ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
      : 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80';

    await db.run(
      `INSERT INTO members (
        id, member_code, name, phone, email, photo_url, gender, dob, emergency_contact_name,
        emergency_contact_phone, fitness_goals, medical_flags, plan_id, plan_name,
        start_date, expiry_date, status, loyalty_points, assigned_trainer_id, assigned_locker_id, gym_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 50, ?, ?, ?, datetime('now', 'localtime'))`,
      [
        id, memberCode, name, phone, email || '', req.body.photoUrl || defaultAvatar, gender || 'Male',
        dob || null, emergencyContactName || '', emergencyContactPhone || '', fitnessGoals || 'Fitness',
        medicalFlags || '', plan.id, plan.name, start, expiryDateStr, assignedTrainerId || null, assignedLockerId || null, gymId
      ]
    );

    // Generate Invoice
    const baseSubtotal = plan.base_price;
    const cgst = Math.round(((plan.total_price - baseSubtotal) / 2) * 100) / 100;
    const sgst = cgst;

    const invoice = await createInvoice({
      memberId: id,
      memberName: name,
      memberPhone: phone,
      itemType: 'membership',
      itemDescription: `New Joining — ${plan.name}`,
      subtotal: baseSubtotal,
      cgst,
      sgst,
      grandTotal: plan.total_price,
      paymentMethod,
      collectedByStaffId: req.body.staffId,
      collectedByStaffName: req.body.staffName
    });

    res.status(201).json({ id, memberCode, invoice });
  } catch (err) {
    console.error('Create member error:', err);
    res.status(500).json({ error: err.message || 'Failed to create member' });
  }
});

// Freeze membership
router.post('/:id/freeze', async (req, res) => {
  try {
    const { freezeDays, reason } = req.body;
    const result = await freezeMembership(req.params.id, freezeDays || 15, reason);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Unfreeze membership
router.post('/:id/unfreeze', async (req, res) => {
  try {
    const result = await unfreezeMembership(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Renew membership with loyalty points redemption option
router.post('/:id/renew', async (req, res) => {
  try {
    const { planId, paymentMethod = 'upi', pointsToRedeem = 0, staffId, staffName } = req.body;
    const db = await getDb();

    const member = await db.get('SELECT * FROM members WHERE id = ?', [req.params.id]);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const plan = await db.get('SELECT * FROM membership_plans WHERE id = ?', [planId]);
    if (!plan) return res.status(400).json({ error: 'Plan not found' });

    const subtotal = plan.base_price;
    const tax = plan.total_price - subtotal;
    const cgst = Math.round((tax / 2) * 100) / 100;
    const sgst = Math.round((tax / 2) * 100) / 100;

    // Enforce 15% redemption cap (50 points = 1 INR)
    const POINTS_PER_RUPEE = 50;
    const maxDiscountRupeesAllowed = Math.floor(plan.total_price * 0.15);
    const maxAllowedPoints = maxDiscountRupeesAllowed * POINTS_PER_RUPEE;
    const actualPoints = Math.min(pointsToRedeem, member.loyalty_points || 0, maxAllowedPoints);
    const discountRupees = Math.floor(actualPoints / POINTS_PER_RUPEE);
    const grandTotal = Math.max(0, plan.total_price - discountRupees);

    const invoice = await createInvoice({
      memberId: member.id,
      memberName: member.name,
      memberPhone: member.phone,
      itemType: 'membership',
      itemDescription: `Membership Renewal — ${plan.name}`,
      subtotal,
      cgst,
      sgst,
      loyaltyPointsRedeemed: actualPoints,
      loyaltyDiscountValue: discountRupees,
      grandTotal,
      paymentMethod,
      collectedByStaffId: staffId,
      collectedByStaffName: staffName,
      autoExtendMembership: true,
      extendDays: plan.duration_days
    });

    res.json({ success: true, invoice, renewedPlan: plan.name });
  } catch (err) {
    console.error('Renew error:', err);
    res.status(500).json({ error: 'Failed to renew membership' });
  }
});

// Assign or Change Assigned Trainer for a Member (Admin/Manager/Owner Action)
router.post('/:id/assign-trainer', async (req, res) => {
  try {
    const { trainerId } = req.body;
    const db = await getDb();

    const member = await db.get('SELECT id, name FROM members WHERE id = ?', [req.params.id]);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    let trainerName = null;
    if (trainerId) {
      const trainer = await db.get('SELECT id, name FROM staff WHERE id = ?', [trainerId]);
      if (!trainer) return res.status(400).json({ error: 'Trainer not found' });
      trainerName = trainer.name;
    }

    await db.run('UPDATE members SET assigned_trainer_id = ? WHERE id = ?', [trainerId || null, member.id]);

    res.json({
      success: true,
      memberId: member.id,
      assignedTrainerId: trainerId || null,
      trainerName,
      message: trainerName
        ? `Coach ${trainerName} assigned to ${member.name} successfully!`
        : `Trainer unassigned from ${member.name}.`
    });
  } catch (err) {
    console.error('Assign trainer error:', err);
    res.status(500).json({ error: err.message || 'Failed to assign trainer' });
  }
});

export default router;

