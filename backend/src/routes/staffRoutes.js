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
    const { gymId } = req.query;
    let query = `
      SELECT s.id, s.name, s.role, s.phone, s.email, s.security_pin, s.commission_rate, 
             s.base_salary, s.gym_id, s.is_active, s.created_at,
             g.name as gym_name, g.city as gym_city
      FROM staff s
      LEFT JOIN gyms g ON s.gym_id = g.id
      WHERE 1=1
    `;
    const params = [];
    if (gymId && gymId !== 'all') {
      query += ` AND s.gym_id = ?`;
      params.push(gymId);
    }
    query += ` ORDER BY CASE s.role WHEN "super_admin" THEN 1 WHEN "owner" THEN 2 WHEN "manager" THEN 3 WHEN "trainer" THEN 4 ELSE 5 END, s.name ASC`;
    const staff = await db.all(query, params);
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
    const { name, role, phone, email, password, pin, commissionRate, gymId, baseSalary } = req.body;

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
    const assignedGymId = gymId || 'gym-gudiyatham';
    const salary = parseFloat(baseSalary || (assignedRole === 'trainer' ? 18000.0 : 15000.0));

    await db.run(
      `INSERT INTO staff (id, name, role, phone, email, password_hash, security_pin, commission_rate, base_salary, gym_id, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now', 'localtime'))`,
      [id, name, assignedRole, phone, email || '', hashedPassword, securityPin, commRate, salary, assignedGymId]
    );

    const createdStaff = await db.get(
      `SELECT s.id, s.name, s.role, s.phone, s.email, s.security_pin, s.commission_rate, s.base_salary, s.gym_id, s.is_active,
              g.name as gym_name, g.city as gym_city
       FROM staff s
       LEFT JOIN gyms g ON s.gym_id = g.id
       WHERE s.id = ?`,
      [id]
    );

    res.status(201).json(createdStaff);
  } catch (err) {
    console.error('Create staff error:', err);
    res.status(500).json({ error: err.message || 'Failed to create user' });
  }
});

// Update staff user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, phone, email, pin, commissionRate, password, gymId, baseSalary } = req.body;
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

    const assignedGymId = gymId || currentStaff.gym_id || 'gym-gudiyatham';
    const salary = baseSalary !== undefined ? parseFloat(baseSalary) : currentStaff.base_salary;

    await db.run(
      `UPDATE staff 
       SET name = COALESCE(?, name),
           role = ?,
           phone = COALESCE(?, phone),
           email = COALESCE(?, email),
           security_pin = COALESCE(?, security_pin),
           commission_rate = COALESCE(?, commission_rate),
           base_salary = COALESCE(?, base_salary),
           gym_id = ?,
           password_hash = ?
       WHERE id = ?`,
      [name, finalRole, phone, email, pin, commissionRate, salary, assignedGymId, passwordHash, id]
    );

    const updated = await db.get(
      `SELECT s.id, s.name, s.role, s.phone, s.email, s.security_pin, s.commission_rate, s.base_salary, s.gym_id, s.is_active,
              g.name as gym_name, g.city as gym_city
       FROM staff s
       LEFT JOIN gyms g ON s.gym_id = g.id
       WHERE s.id = ?`,
      [id]
    );

    res.json({ success: true, user: updated });
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
