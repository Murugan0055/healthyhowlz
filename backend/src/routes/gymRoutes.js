import express from 'express';
import { getDb } from '../db/database.js';
import { getTenantGymId } from '../middleware/tenant.js';

const router = express.Router();

// 1. Get gyms accessible to the current logged-in user / owner
router.get('/accessible', async (req, res) => {
  try {
    const db = await getDb();
    const ownerId = req.query.ownerId || 'staff-owner'; // Default to Karthik Raja
    const role = req.query.role || 'owner';

    let gyms;
    if (role === 'platform_admin' || role === 'super_admin') {
      gyms = await db.all(`
        SELECT g.*, 
          (SELECT COUNT(*) FROM members WHERE gym_id = g.id) as total_members
        FROM gyms g 
        ORDER BY g.created_at ASC
      `);
    } else {
      // Owner or staff: fetch gyms owned by this owner
      gyms = await db.all(`
        SELECT g.*, 
          (SELECT COUNT(*) FROM members WHERE gym_id = g.id) as total_members
        FROM gyms g 
        WHERE g.owner_id = ? OR g.id = 'gym-gudiyatham'
        ORDER BY g.created_at ASC
      `, [ownerId]);
    }

    res.json(gyms);
  } catch (err) {
    console.error('Error fetching accessible gyms:', err);
    res.status(500).json({ error: 'Failed to retrieve accessible gyms' });
  }
});

// 2. Get current active gym tenant profile & branding
router.get('/current', async (req, res) => {
  try {
    const db = await getDb();
    const gymId = getTenantGymId(req);

    const gym = await db.get(`
      SELECT g.*, 
        (SELECT COUNT(*) FROM members WHERE gym_id = g.id) as total_members,
        (SELECT COUNT(*) FROM checkins WHERE gym_id = g.id AND date(checkin_time, 'localtime') = date('now', 'localtime')) as today_checkins
      FROM gyms g 
      WHERE g.id = ?
    `, [gymId]);

    if (!gym) {
      // Fallback to default
      const fallback = await db.get('SELECT * FROM gyms WHERE id = ?', ['gym-gudiyatham']);
      return res.json(fallback || { id: gymId, name: 'HealthyHowlz Fitness Center', city: 'Gudiyatham' });
    }

    res.json(gym);
  } catch (err) {
    console.error('Error fetching current gym:', err);
    res.status(500).json({ error: 'Failed to retrieve gym details' });
  }
});

// 3. Update current gym profile
router.put('/current', async (req, res) => {
  try {
    const db = await getDb();
    const gymId = getTenantGymId(req);
    const { name, phone, email, address, city, pincode, gstin, kiosk_pin } = req.body;

    await db.run(`
      UPDATE gyms 
      SET name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          email = COALESCE(?, email),
          address = COALESCE(?, address),
          city = COALESCE(?, city),
          pincode = COALESCE(?, pincode),
          gstin = COALESCE(?, gstin),
          kiosk_pin = COALESCE(?, kiosk_pin)
      WHERE id = ?
    `, [name, phone, email, address, city, pincode, gstin, kiosk_pin, gymId]);

    const updated = await db.get('SELECT * FROM gyms WHERE id = ?', [gymId]);
    res.json(updated);
  } catch (err) {
    console.error('Error updating current gym:', err);
    res.status(500).json({ error: 'Failed to update current gym' });
  }
});

export default router;

