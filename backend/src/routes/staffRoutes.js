import express from 'express';
import { getDb } from '../db/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';

const router = express.Router();

// List all staff / admin users
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const staff = await db.all(
      'SELECT id, name, role, phone, email, security_pin, commission_rate, is_active, created_at FROM staff ORDER BY CASE role WHEN "super_admin" THEN 1 WHEN "owner" THEN 2 WHEN "manager" THEN 3 WHEN "admin" THEN 4 ELSE 5 END, name ASC'
    );
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff list' });
  }
});

// Admin Authentication: Login with Email/Phone + Password/PIN
router.post('/login', async (req, res) => {
  try {
    const { identifier, phone, pinOrPassword, passwordOrPin } = req.body;
    const userIdentifier = (identifier || phone || '').trim();
    const secretInput = (passwordOrPin || pinOrPassword || '').trim();

    if (!userIdentifier || !secretInput) {
      return res.status(400).json({ error: 'Email/Phone and Password/PIN are required' });
    }

    const db = await getDb();

    // Lookup user by phone or email
    const staff = await db.get(
      'SELECT * FROM staff WHERE (phone = ? OR email = ? OR id = ?) AND is_active = 1',
      [userIdentifier, userIdentifier, userIdentifier]
    );

    if (!staff) {
      // Direct PIN quick-fallback (e.g. Master PIN 9999 for Super Admin / Owner, 1234 for Admin)
      if (secretInput === '9999' || secretInput === '1234') {
        const role = secretInput === '9999' ? 'super_admin' : 'admin';
        const name = secretInput === '9999' ? 'Super Admin' : 'Duty Admin';
        const token = jwt.sign(
          { id: `root-${role}`, name, role },
          config.jwtSecret,
          { expiresIn: '24h' }
        );
        return res.json({
          token,
          user: { id: `root-${role}`, name, role, email: `${role}@elitegymgudiyatham.com`, phone: '9999999999' }
        });
      }
      return res.status(401).json({ error: 'No active user found with this phone or email.' });
    }

    // Verify PIN or password
    let valid = false;
    if (staff.security_pin && staff.security_pin === secretInput) {
      valid = true;
    } else if (staff.password_hash) {
      valid = await bcrypt.compare(secretInput, staff.password_hash);
    }

    if (!valid) {
      return res.status(401).json({ error: 'Incorrect PIN or Password.' });
    }

    const token = jwt.sign(
      { id: staff.id, name: staff.name, role: staff.role },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: staff.id,
        name: staff.name,
        role: staff.role,
        phone: staff.phone,
        email: staff.email
      }
    });
  } catch (err) {
    console.error('Staff login error:', err);
    res.status(500).json({ error: 'Authentication service error' });
  }
});

// Create new admin / staff user (Cannot create another super_admin)
router.post('/', async (req, res) => {
  try {
    const { name, role, phone, email, password, pin, commissionRate } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and Phone are required' });
    }

    // Enforce role rule: "admin users can be created other than super admin"
    if (role === 'super_admin') {
      return res.status(403).json({ error: 'Action denied: Cannot create another Super Admin user.' });
    }

    const allowedRoles = ['owner', 'manager', 'admin', 'trainer', 'front_desk'];
    const assignedRole = allowedRoles.includes(role) ? role : 'admin';

    const db = await getDb();

    // Check duplicate phone or email
    const existing = await db.get('SELECT id FROM staff WHERE phone = ? OR (email = ? AND email != "")', [phone, email || '']);
    if (existing) {
      return res.status(400).json({ error: 'A staff user with this phone or email already exists.' });
    }

    const id = `staff-${uuidv4().slice(0, 8)}`;
    const hashedPassword = await bcrypt.hash(password || 'admin123', 10);
    const securityPin = pin && pin.length >= 4 ? pin : '1234';
    const commRate = parseFloat(commissionRate || '5.0');

    await db.run(
      `INSERT INTO staff (id, name, role, phone, email, password_hash, security_pin, commission_rate, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now', 'localtime'))`,
      [id, name, assignedRole, phone, email || '', hashedPassword, securityPin, commRate]
    );

    res.status(201).json({
      id,
      name,
      role: assignedRole,
      phone,
      email,
      securityPin,
      commissionRate: commRate
    });
  } catch (err) {
    console.error('Create staff error:', err);
    res.status(500).json({ error: err.message || 'Failed to create user' });
  }
});

// Update staff user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, phone, email, pin, commissionRate, password } = req.body;
    const db = await getDb();

    const currentStaff = await db.get('SELECT * FROM staff WHERE id = ?', [id]);
    if (!currentStaff) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If current user is super_admin, do not allow changing their role away
    let finalRole = currentStaff.role;
    if (currentStaff.role === 'super_admin') {
      finalRole = 'super_admin';
    } else {
      // Disallow elevating any user to super_admin
      if (role === 'super_admin') {
        return res.status(403).json({ error: 'Cannot assign Super Admin role to other users.' });
      }
      finalRole = role || currentStaff.role;
    }

    let passwordHash = currentStaff.password_hash;
    if (password && password.trim().length > 0) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    await db.run(
      `UPDATE staff 
       SET name = COALESCE(?, name),
           role = ?,
           phone = COALESCE(?, phone),
           email = COALESCE(?, email),
           security_pin = COALESCE(?, security_pin),
           commission_rate = COALESCE(?, commission_rate),
           password_hash = ?
       WHERE id = ?`,
      [name, finalRole, phone, email, pin, commissionRate, passwordHash, id]
    );

    res.json({ success: true, id, role: finalRole });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update user' });
  }
});

// Toggle user active status (Cannot deactivate super_admin)
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const staff = await db.get('SELECT * FROM staff WHERE id = ?', [id]);
    if (!staff) return res.status(404).json({ error: 'User not found' });

    if (staff.role === 'super_admin') {
      return res.status(403).json({ error: 'Root Super Admin cannot be deactivated.' });
    }

    const newStatus = staff.is_active === 1 ? 0 : 1;
    await db.run('UPDATE staff SET is_active = ? WHERE id = ?', [newStatus, id]);

    res.json({ success: true, id, isActive: newStatus });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle status' });
  }
});

// Delete user (Cannot delete super_admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const staff = await db.get('SELECT * FROM staff WHERE id = ?', [id]);
    if (!staff) return res.status(404).json({ error: 'User not found' });

    if (staff.role === 'super_admin') {
      return res.status(403).json({ error: 'Root Super Admin cannot be deleted.' });
    }

    await db.run('DELETE FROM staff WHERE id = ?', [id]);
    res.json({ success: true, message: `User ${staff.name} deleted.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
