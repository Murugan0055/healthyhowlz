import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/database.js';
import { config } from '../config/index.js';

const router = express.Router();

// 1. SaaS Platform Global Stats & KPIs
router.get('/stats', async (req, res) => {
  try {
    const db = await getDb();

    const gyms = await db.all(`
      SELECT g.*, 
        (SELECT COUNT(*) FROM members WHERE gym_id = g.id) as total_members,
        (SELECT COALESCE(SUM(grand_total), 0) FROM invoices WHERE gym_id = g.id) as total_revenue,
        (SELECT COUNT(*) FROM checkins WHERE gym_id = g.id AND date(checkin_time, 'localtime') = date('now', 'localtime')) as today_checkins
      FROM gyms g
      ORDER BY g.created_at ASC
    `);

    const totalGyms = gyms.length;
    const activeGyms = gyms.filter(g => g.status === 'active').length;
    const trialGyms = gyms.filter(g => g.status === 'trial').length;
    const suspendedGyms = gyms.filter(g => g.status === 'suspended').length;
    const totalMRR = gyms
      .filter(g => g.status === 'active' || g.status === 'trial')
      .reduce((acc, g) => acc + (Number(g.monthly_fee) || 0), 0);

    const totalPlatformMembers = gyms.reduce((acc, g) => acc + (Number(g.total_members) || 0), 0);
    const globalTodayCheckins = gyms.reduce((acc, g) => acc + (Number(g.today_checkins) || 0), 0);

    // Owners breakdown
    const ownersMap = {};
    for (const g of gyms) {
      if (!ownersMap[g.owner_id]) {
        ownersMap[g.owner_id] = {
          ownerId: g.owner_id,
          ownerName: g.owner_name,
          phone: g.phone,
          gyms: []
        };
      }
      ownersMap[g.owner_id].gyms.push({
        id: g.id,
        name: g.name,
        city: g.city,
        status: g.status,
        tier: g.subscription_tier,
        mrr: g.monthly_fee,
        members: g.total_members
      });
    }

    const ownersList = Object.values(ownersMap);

    res.json({
      status: 'success',
      platform: {
        name: 'HealthyHowlz Fitness OS',
        version: '2.5.0-SaaS',
        totalGyms,
        activeGyms,
        trialGyms,
        suspendedGyms,
        totalMRR,
        totalPlatformMembers,
        globalTodayCheckins,
        totalOwners: ownersList.length
      },
      gyms,
      owners: ownersList
    });
  } catch (err) {
    console.error('Error fetching platform stats:', err);
    res.status(500).json({ error: 'Failed to retrieve SaaS platform stats' });
  }
});

// 2. List All Gyms with Stats
router.get('/gyms', async (req, res) => {
  try {
    const db = await getDb();
    const gyms = await db.all(`
      SELECT g.*, 
        (SELECT COUNT(*) FROM members WHERE gym_id = g.id) as total_members,
        (SELECT COALESCE(SUM(grand_total), 0) FROM invoices WHERE gym_id = g.id) as total_revenue,
        (SELECT COUNT(*) FROM checkins WHERE gym_id = g.id) as total_checkins
      FROM gyms g
      ORDER BY g.created_at ASC
    `);
    res.json(gyms);
  } catch (err) {
    console.error('Error fetching gyms:', err);
    res.status(500).json({ error: 'Failed to retrieve gyms' });
  }
});

// 3. Provision New Gym Tenant
router.post('/gyms', async (req, res) => {
  try {
    const db = await getDb();
    const {
      name,
      slug,
      owner_name,
      owner_id,
      phone,
      email,
      address,
      city,
      state = 'Tamil Nadu',
      pincode,
      gstin,
      subscription_tier = 'pro_growth',
      monthly_fee = 2499.0,
      kiosk_pin = '1234',
      status = 'active'
    } = req.body;

    if (!name || !owner_name) {
      return res.status(400).json({ error: 'Gym name and owner name are required' });
    }

    const safeSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')).trim();
    const id = `gym-${safeSlug}-${Date.now().toString().slice(-4)}`;

    const resolvedOwnerId = owner_id || 'staff-owner'; // defaults to Karthik Raja if linking to him

    await db.run(
      `INSERT INTO gyms (id, name, slug, owner_id, owner_name, phone, email, address, city, state, pincode, gstin, status, subscription_tier, monthly_fee, kiosk_pin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, safeSlug, resolvedOwnerId, owner_name, phone || '', email || '', address || '', city || 'Vellore', state, pincode || '', gstin || '', status, subscription_tier, Number(monthly_fee), kiosk_pin]
    );

    // Also copy official plans for the new gym so it has standard starter, classic, transformation, annual
    const basePlans = [
      { id: `${id}-plan-1m`, name: '1 Month Starter', duration_months: 1, duration_days: 30, base_price: 761.86, total_price: 899.0 },
      { id: `${id}-plan-3m`, name: '3 Month Classic Fitness', duration_months: 3, duration_days: 90, base_price: 2117.80, total_price: 2499.0 },
      { id: `${id}-plan-6m`, name: '6 Month Transformation', duration_months: 6, duration_days: 180, base_price: 3982.20, total_price: 4699.0 },
      { id: `${id}-plan-12m`, name: '12 Month Elite Annual', duration_months: 12, duration_days: 365, base_price: 7626.27, total_price: 8999.0 }
    ];

    for (const bp of basePlans) {
      await db.run(
        `INSERT OR IGNORE INTO membership_plans (id, name, duration_months, duration_days, base_price, gst_rate, total_price, gym_id, is_active)
         VALUES (?, ?, ?, ?, ?, 18.0, ?, ?, 1)`,
        [bp.id, bp.name, bp.duration_months, bp.duration_days, bp.base_price, bp.total_price, id]
      );
    }

    const created = await db.get('SELECT * FROM gyms WHERE id = ?', [id]);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error provisioning gym:', err);
    res.status(500).json({ error: 'Failed to provision new gym: ' + err.message });
  }
});

// 4. Update Gym Status (Active / Trial / Suspended / Inactive - Soft Deleted)
router.patch('/gyms/:id/status', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['active', 'trial', 'suspended', 'inactive'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${allowed.join(', ')}` });
    }

    await db.run('UPDATE gyms SET status = ? WHERE id = ?', [status, id]);
    const updated = await db.get('SELECT * FROM gyms WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    console.error('Error updating gym status:', err);
    res.status(500).json({ error: 'Failed to update gym status' });
  }
});

// 5. Update Gym Full Details (Edit Gym)
router.patch('/gyms/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const {
      name,
      slug,
      owner_name,
      owner_id,
      subscription_tier,
      monthly_fee,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      gstin,
      kiosk_pin,
      status
    } = req.body;

    const existing = await db.get('SELECT * FROM gyms WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Gym not found' });
    }

    await db.run(
      `UPDATE gyms 
       SET name = COALESCE(?, name),
           slug = COALESCE(?, slug),
           owner_name = COALESCE(?, owner_name),
           owner_id = COALESCE(?, owner_id),
           subscription_tier = COALESCE(?, subscription_tier),
           monthly_fee = COALESCE(?, monthly_fee),
           phone = COALESCE(?, phone),
           email = COALESCE(?, email),
           address = COALESCE(?, address),
           city = COALESCE(?, city),
           state = COALESCE(?, state),
           pincode = COALESCE(?, pincode),
           gstin = COALESCE(?, gstin),
           kiosk_pin = COALESCE(?, kiosk_pin),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [
        name ?? null,
        slug ?? null,
        owner_name ?? null,
        owner_id ?? null,
        subscription_tier ?? null,
        monthly_fee !== undefined && monthly_fee !== null ? Number(monthly_fee) : null,
        phone ?? null,
        email ?? null,
        address ?? null,
        city ?? null,
        state ?? null,
        pincode ?? null,
        gstin ?? null,
        kiosk_pin ?? null,
        status ?? null,
        id
      ]
    );

    const updated = await db.get('SELECT * FROM gyms WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    console.error('Error updating gym:', err);
    res.status(500).json({ error: 'Failed to update gym: ' + err.message });
  }
});

// 6. Soft Delete Gym (Status changed to inactive)
router.post('/gyms/:id/soft-delete', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    await db.run("UPDATE gyms SET status = 'inactive' WHERE id = ?", [id]);
    const updated = await db.get('SELECT * FROM gyms WHERE id = ?', [id]);
    res.json({ success: true, message: `Gym ${id} has been soft deleted (status set to inactive).`, gym: updated });
  } catch (err) {
    console.error('Error soft deleting gym:', err);
    res.status(500).json({ error: 'Failed to soft delete gym' });
  }
});

// 6. Delete / Archive Gym
router.delete('/gyms/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    await db.run('DELETE FROM gyms WHERE id = ?', [id]);
    res.json({ success: true, message: `Gym ${id} deleted` });
  } catch (err) {
    console.error('Error deleting gym:', err);
    res.status(500).json({ error: 'Failed to delete gym' });
  }
});

// =========================================================================
// PHASE 1: Urgent Floor Operations & Troubleshooting
// =========================================================================

// 7. Support Impersonation: Generate temporary support session for any gym
router.post('/impersonate/:gymId', async (req, res) => {
  try {
    const db = await getDb();
    const { gymId } = req.params;

    const gym = await db.get('SELECT * FROM gyms WHERE id = ?', [gymId]);
    if (!gym) {
      return res.status(404).json({ error: 'Gym facility not found' });
    }

    // Resolve owner account for this gym
    let owner = await db.get('SELECT * FROM staff WHERE id = ?', [gym.owner_id]);
    if (!owner) {
      owner = await db.get("SELECT * FROM staff WHERE role = 'owner' LIMIT 1");
    }

    if (!owner) {
      return res.status(404).json({ error: 'No owner account found for this facility' });
    }

    const adminId = req.user?.id || 'healthyhowlz_admin';

    // Issue support JWT with impersonation metadata
    const tokenPayload = {
      id: owner.id,
      name: owner.name,
      role: 'owner',
      app: 'admin',
      gym_id: gym.id,
      isImpersonated: true,
      originalAdminId: adminId,
      impersonatedAt: new Date().toISOString()
    };

    const supportToken = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '8h' });

    // Log impersonation in platform audit logs
    const auditId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await db.run(
      `INSERT INTO platform_audit_logs (id, admin_id, action, target_gym_id, target_user_id, details_json, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        auditId,
        adminId,
        'impersonate_start',
        gym.id,
        owner.id,
        JSON.stringify({ gymName: gym.name, ownerName: owner.name, gymSlug: gym.slug }),
        req.ip || ''
      ]
    );

    res.json({
      success: true,
      supportToken,
      gym: {
        id: gym.id,
        name: gym.name,
        slug: gym.slug
      },
      user: {
        id: owner.id,
        name: owner.name,
        role: 'owner',
        app: 'admin',
        gym_id: gym.id,
        gym_name: gym.name,
        isImpersonated: true
      }
    });
  } catch (err) {
    console.error('Error starting support impersonation:', err);
    res.status(500).json({ error: 'Failed to start support session: ' + err.message });
  }
});

// 8. End Support Impersonation (Audit Log)
router.post('/impersonate-exit', async (req, res) => {
  try {
    const db = await getDb();
    const adminId = req.user?.originalAdminId || req.user?.id || 'healthyhowlz_admin';
    const gymId = req.user?.gym_id || null;

    const auditId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await db.run(
      `INSERT INTO platform_audit_logs (id, admin_id, action, target_gym_id, target_user_id, details_json, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        auditId,
        adminId,
        'impersonate_exit',
        gymId,
        req.user?.id || null,
        JSON.stringify({ exitTime: new Date().toISOString() }),
        req.ip || ''
      ]
    );

    res.json({ success: true, message: 'Support session closed and audited.' });
  } catch (err) {
    console.error('Error recording impersonation exit:', err);
    res.status(500).json({ error: 'Failed to record session exit' });
  }
});

// 9. Fetch Staff for a Gym (for Emergency Access & Credential Management)
router.get('/gyms/:id/staff', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    const gym = await db.get('SELECT * FROM gyms WHERE id = ?', [id]);
    if (!gym) return res.status(404).json({ error: 'Gym not found' });

    const staffMembers = await db.all(
      `SELECT id, name, role, phone, email, security_pin, is_active, created_at
       FROM staff
       WHERE gym_id = ? OR id = ?
       ORDER BY role ASC, name ASC`,
      [id, gym.owner_id]
    );

    res.json(staffMembers);
  } catch (err) {
    console.error('Error fetching gym staff:', err);
    res.status(500).json({ error: 'Failed to retrieve staff' });
  }
});

// 10. Emergency Credential Reset (PIN / Password) from HQ
router.post('/gyms/:id/reset-credentials', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { staffId, newPin, newPassword } = req.body;

    if (!staffId) {
      return res.status(400).json({ error: 'Staff ID is required' });
    }
    if (!newPin && !newPassword) {
      return res.status(400).json({ error: 'Please provide either a new PIN or a new Password' });
    }

    const staff = await db.get('SELECT * FROM staff WHERE id = ?', [staffId]);
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    const updates = [];
    const params = [];

    if (newPin) {
      updates.push('security_pin = ?');
      params.push(newPin.trim());
    }

    if (newPassword) {
      const hashed = await bcrypt.hash(newPassword.trim(), 10);
      updates.push('password_hash = ?');
      params.push(hashed);
    }

    params.push(staffId);
    await db.run(`UPDATE staff SET ${updates.join(', ')} WHERE id = ?`, params);

    // Audit log
    const adminId = req.user?.id || 'healthyhowlz_admin';
    const auditId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await db.run(
      `INSERT INTO platform_audit_logs (id, admin_id, action, target_gym_id, target_user_id, details_json, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        auditId,
        adminId,
        'credential_reset',
        id,
        staffId,
        JSON.stringify({ staffName: staff.name, resetPin: !!newPin, resetPassword: !!newPassword }),
        req.ip || ''
      ]
    );

    res.json({
      success: true,
      message: `Credentials successfully reset for ${staff.name}.`
    });
  } catch (err) {
    console.error('Error resetting credentials:', err);
    res.status(500).json({ error: 'Failed to reset credentials: ' + err.message });
  }
});

// 11. Active Incident Broadcasts (Public to logged in gym users)
router.get('/broadcasts/active', async (req, res) => {
  try {
    const db = await getDb();
    const active = await db.all(
      `SELECT * FROM platform_broadcasts 
       WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > datetime('now'))
       ORDER BY created_at DESC LIMIT 3`
    );
    res.json(active);
  } catch (err) {
    console.error('Error fetching active broadcasts:', err);
    res.status(500).json({ error: 'Failed to retrieve broadcasts' });
  }
});

// 12. Create / Publish Global Incident Broadcast (HQ Admin only)
router.post('/broadcasts', async (req, res) => {
  try {
    const db = await getDb();
    const { title, message, severity = 'info', target_audience = 'all', expires_hours = 24 } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const id = `bc-${Date.now()}`;
    const adminId = req.user?.id || 'healthyhowlz_admin';

    await db.run(
      `INSERT INTO platform_broadcasts (id, title, message, severity, target_audience, created_by, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now', '+' || ? || ' hours'))`,
      [id, title, message, severity, target_audience, adminId, Number(expires_hours) || 24]
    );

    // Audit log
    const auditId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await db.run(
      `INSERT INTO platform_audit_logs (id, admin_id, action, target_gym_id, target_user_id, details_json, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [auditId, adminId, 'broadcast_create', null, null, JSON.stringify({ title, severity }), req.ip || '']
    );

    const created = await db.get('SELECT * FROM platform_broadcasts WHERE id = ?', [id]);
    res.status(201).json({ success: true, broadcast: created });
  } catch (err) {
    console.error('Error creating broadcast:', err);
    res.status(500).json({ error: 'Failed to publish broadcast: ' + err.message });
  }
});

// 13. Dismiss / Deactivate Global Broadcast
router.delete('/broadcasts/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    await db.run('UPDATE platform_broadcasts SET is_active = 0 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Broadcast deactivated' });
  } catch (err) {
    console.error('Error dismissing broadcast:', err);
    res.status(500).json({ error: 'Failed to dismiss broadcast' });
  }
});

// 14. HQ Audit Log Stream
router.get('/audit-logs', async (req, res) => {
  try {
    const db = await getDb();
    const logs = await db.all(
      `SELECT a.*, g.name as gym_name, g.slug as gym_slug
       FROM platform_audit_logs a
       LEFT JOIN gyms g ON a.target_gym_id = g.id
       ORDER BY a.created_at DESC
       LIMIT 50`
    );
    res.json(logs);
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

export default router;

