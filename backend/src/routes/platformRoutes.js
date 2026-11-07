import express from 'express';
import { getDb } from '../db/database.js';

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

export default router;

