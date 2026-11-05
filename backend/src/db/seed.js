import { getDb } from './database.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  const db = await getDb();

  console.log('🌱 Checking & syncing Elite Gym Operating Platform Database...');

  const hashedPw = await bcrypt.hash('admin123', 10);

  // 1. Staff & Admins Roster
  const staffMembers = [
    {
      id: 'staff-platform-admin',
      name: 'HealthyHowlz HQ Admin',
      role: 'platform_admin',
      phone: '8888888888',
      email: 'hq@healthyhowlz.com',
      password_hash: hashedPw,
      security_pin: '8888',
      commission_rate: 0.0,
      gym_id: 'gym-gudiyatham'
    },
    {
      id: 'staff-super-admin',
      name: 'Super Admin (Root System)',
      role: 'super_admin',
      phone: '9999999999',
      email: 'superadmin@healthyhowlz.com',
      password_hash: hashedPw,
      security_pin: '9999',
      commission_rate: 0.0,
      gym_id: 'gym-gudiyatham'
    },
    {
      id: 'staff-owner',
      name: 'Karthik Raja (Multi-Gym Owner)',
      role: 'owner',
      phone: '9840123456',
      email: 'owner@healthyhowlz.com',
      password_hash: hashedPw,
      security_pin: '1111',
      commission_rate: 10.0,
      gym_id: 'gym-gudiyatham'
    },
    {
      id: 'staff-owner-2',
      name: 'Suresh Natarajan (Owner - Coimbatore)',
      role: 'owner',
      phone: '9840155667',
      email: 'suresh@healthyhowlz.com',
      password_hash: hashedPw,
      security_pin: '3333',
      commission_rate: 10.0,
      gym_id: 'gym-coimbatore'
    },
    {
      id: 'staff-owner-3',
      name: 'Ramesh Patel (Owner - Bangalore)',
      role: 'owner',
      phone: '9840133445',
      email: 'ramesh@healthyhowlz.com',
      password_hash: hashedPw,
      security_pin: '4444',
      commission_rate: 10.0,
      gym_id: 'gym-bangalore'
    },
    {
      id: 'staff-manager',
      name: 'Venkatesh Rao (General Manager)',
      role: 'manager',
      phone: '9840123460',
      email: 'manager@healthyhowlz.com',
      password_hash: hashedPw,
      security_pin: '2222',
      commission_rate: 7.5,
      gym_id: 'gym-gudiyatham'
    },
    {
      id: 'staff-front-desk',
      name: 'Priya V (Front Desk Admin)',
      role: 'admin',
      phone: '9840123457',
      email: 'reception@healthyhowlz.com',
      password_hash: hashedPw,
      security_pin: '1234', // Default Front Desk Officer PIN
      commission_rate: 5.0,
      gym_id: 'gym-gudiyatham'
    },
    {
      id: 'staff-trainer-1',
      name: 'Murugan S (Head Coach)',
      role: 'trainer',
      phone: '9840123458',
      email: 'murugan@healthyhowlz.com',
      password_hash: hashedPw,
      security_pin: '5555',
      commission_rate: 20.0,
      base_salary: 18000.0,
      gym_id: 'gym-gudiyatham'
    },
    {
      id: 'staff-trainer-2',
      name: 'Dinesh Kumar (Strength Coach)',
      role: 'trainer',
      phone: '9840123459',
      email: 'dinesh@healthyhowlz.com',
      password_hash: hashedPw,
      security_pin: '7777',
      commission_rate: 18.0,
      base_salary: 15000.0,
      gym_id: 'gym-gudiyatham'
    },
    {
      id: 'staff-trainer-vel',
      name: 'Karthik V (Vellore Head Coach)',
      role: 'trainer',
      phone: '9840199010',
      email: 'karthik.vel@healthyhowlz.com',
      password_hash: hashedPw,
      security_pin: '6666',
      commission_rate: 20.0,
      base_salary: 18000.0,
      gym_id: 'gym-vellore'
    },
    {
      id: 'staff-trainer-chn',
      name: 'Arun Prasad (Chennai Strength Coach)',
      role: 'trainer',
      phone: '9840188010',
      email: 'arun.chn@healthyhowlz.com',
      password_hash: hashedPw,
      security_pin: '8888',
      commission_rate: 22.0,
      base_salary: 22000.0,
      gym_id: 'gym-chennai'
    }
  ];

  for (const s of staffMembers) {
    const existing = await db.get('SELECT id FROM staff WHERE id = ?', [s.id]);
    const baseSal = s.base_salary || 15000.0;
    const gymId = s.gym_id || 'gym-gudiyatham';
    if (!existing) {
      await db.run(
        `INSERT INTO staff (id, name, role, phone, email, password_hash, security_pin, commission_rate, base_salary, gym_id, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [s.id, s.name, s.role, s.phone, s.email, s.password_hash, s.security_pin, s.commission_rate, baseSal, gymId]
      );
    } else {
      await db.run(
        `UPDATE staff SET name = ?, role = ?, phone = ?, email = ?, security_pin = ?, commission_rate = ?, base_salary = ?, gym_id = ? WHERE id = ?`,
        [s.name, s.role, s.phone, s.email, s.security_pin, s.commission_rate, baseSal, gymId, s.id]
      );
    }
  }

  // 1b. Multi-Tenant SaaS Gyms (Tenants)
  // Karthik Raja (staff-owner) owns 3 gyms: Gudiyatham, Vellore, and Chennai!
  const gymsList = [
    {
      id: 'gym-gudiyatham',
      name: 'HealthyHowlz Elite (Gudiyatham HQ)',
      slug: 'gudiyatham',
      owner_id: 'staff-owner',
      owner_name: 'Karthik Raja',
      phone: '+91 98401 23456',
      email: 'gudiyatham@healthyhowlz.com',
      address: 'Plot 14, Katpadi Main Road, Gudiyatham',
      city: 'Gudiyatham',
      state: 'Tamil Nadu',
      pincode: '632602',
      gstin: '33AAAAE1234M1Z5',
      status: 'active',
      subscription_tier: 'starter',
      monthly_fee: 899.0,
      kiosk_pin: '1234'
    },
    {
      id: 'gym-vellore',
      name: 'HealthyHowlz Club (Vellore East)',
      slug: 'vellore',
      owner_id: 'staff-owner',
      owner_name: 'Karthik Raja',
      phone: '+91 98401 98765',
      email: 'vellore@healthyhowlz.com',
      address: '88, Gandhi Road, Near VIT, Vellore',
      city: 'Vellore',
      state: 'Tamil Nadu',
      pincode: '632014',
      gstin: '33BBBE1234M2Z6',
      status: 'active',
      subscription_tier: 'pro_growth',
      monthly_fee: 2499.0,
      kiosk_pin: '2345'
    },
    {
      id: 'gym-chennai',
      name: 'HealthyHowlz Arena (Chennai Anna Nagar)',
      slug: 'chennai',
      owner_id: 'staff-owner',
      owner_name: 'Karthik Raja',
      phone: '+91 98401 11223',
      email: 'chennai@healthyhowlz.com',
      address: '2nd Avenue, Anna Nagar West, Chennai',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600040',
      gstin: '33CCCCE1234M3Z7',
      status: 'active',
      subscription_tier: 'enterprise',
      monthly_fee: 4999.0,
      kiosk_pin: '3456'
    },
    {
      id: 'gym-coimbatore',
      name: 'HealthyHowlz Studio (Coimbatore RS Puram)',
      slug: 'coimbatore',
      owner_id: 'staff-owner-2',
      owner_name: 'Suresh Natarajan',
      phone: '+91 98401 55667',
      email: 'coimbatore@healthyhowlz.com',
      address: 'DB Road, RS Puram, Coimbatore',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641002',
      gstin: '33DDDDE1234M4Z8',
      status: 'trial',
      subscription_tier: 'pro_growth',
      monthly_fee: 2499.0,
      kiosk_pin: '4567'
    },
    {
      id: 'gym-bangalore',
      name: 'HealthyHowlz Powerhouse (Bangalore Koramangala)',
      slug: 'bangalore',
      owner_id: 'staff-owner-3',
      owner_name: 'Ramesh Patel',
      phone: '+91 98401 33445',
      email: 'bangalore@healthyhowlz.com',
      address: '80 Feet Road, 4th Block, Koramangala, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560034',
      gstin: '29EEEEE1234M5Z9',
      status: 'active',
      subscription_tier: 'enterprise',
      monthly_fee: 4999.0,
      kiosk_pin: '5678'
    }
  ];

  for (const g of gymsList) {
    const existing = await db.get('SELECT id FROM gyms WHERE id = ?', [g.id]);
    if (!existing) {
      await db.run(
        `INSERT INTO gyms (id, name, slug, owner_id, owner_name, phone, email, address, city, state, pincode, gstin, status, subscription_tier, monthly_fee, kiosk_pin)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [g.id, g.name, g.slug, g.owner_id, g.owner_name, g.phone, g.email, g.address, g.city, g.state, g.pincode, g.gstin, g.status, g.subscription_tier, g.monthly_fee, g.kiosk_pin]
      );
    } else {
      await db.run(
        `UPDATE gyms SET name = ?, slug = ?, owner_id = ?, owner_name = ?, phone = ?, email = ?, address = ?, city = ?, state = ?, pincode = ?, gstin = ?, status = ?, subscription_tier = ?, monthly_fee = ?, kiosk_pin = ? WHERE id = ?`,
        [g.name, g.slug, g.owner_id, g.owner_name, g.phone, g.email, g.address, g.city, g.state, g.pincode, g.gstin, g.status, g.subscription_tier, g.monthly_fee, g.kiosk_pin, g.id]
      );
    }
  }

  // Ensure default gym_id for all existing legacy rows
  await db.run(`UPDATE members SET gym_id = 'gym-gudiyatham' WHERE gym_id IS NULL OR gym_id = ''`);
  await db.run(`UPDATE checkins SET gym_id = 'gym-gudiyatham' WHERE gym_id IS NULL OR gym_id = ''`);
  await db.run(`UPDATE leads SET gym_id = 'gym-gudiyatham' WHERE gym_id IS NULL OR gym_id = ''`);
  await db.run(`UPDATE invoices SET gym_id = 'gym-gudiyatham' WHERE gym_id IS NULL OR gym_id = ''`);
  await db.run(`UPDATE expenses SET gym_id = 'gym-gudiyatham' WHERE gym_id IS NULL OR gym_id = ''`);
  await db.run(`UPDATE pos_products SET gym_id = 'gym-gudiyatham' WHERE gym_id IS NULL OR gym_id = ''`);
  await db.run(`UPDATE pos_sales SET gym_id = 'gym-gudiyatham' WHERE gym_id IS NULL OR gym_id = ''`);
  await db.run(`UPDATE lockers SET gym_id = 'gym-gudiyatham' WHERE gym_id IS NULL OR gym_id = ''`);
  await db.run(`UPDATE workout_routines SET gym_id = 'gym-gudiyatham' WHERE gym_id IS NULL OR gym_id = ''`);
  await db.run(`UPDATE diet_plans SET gym_id = 'gym-gudiyatham' WHERE gym_id IS NULL OR gym_id = ''`);
  await db.run(`UPDATE pt_sessions SET gym_id = 'gym-gudiyatham' WHERE gym_id IS NULL OR gym_id = ''`);
  await db.run(`UPDATE floor_checkins SET gym_id = 'gym-gudiyatham' WHERE gym_id IS NULL OR gym_id = ''`);
  await db.run(`UPDATE gym_notices SET gym_id = 'gym-gudiyatham' WHERE gym_id IS NULL OR gym_id = ''`);
  await db.run(`UPDATE cash_drawer_reconciliations SET gym_id = 'gym-gudiyatham' WHERE gym_id IS NULL OR gym_id = ''`);

  // 2. Membership Plans (Synced with exact specifications)
  const officialPlans = [
    { id: 'plan-1m', name: '1 Month Starter', duration_months: 1, duration_days: 30, total_price: 899.0, is_off_peak: 0, pt_sessions_included: 0, max_freeze_days: 7 },
    { id: 'plan-3m', name: '3 Month Classic Fitness', duration_months: 3, duration_days: 90, total_price: 2499.0, is_off_peak: 0, pt_sessions_included: 0, max_freeze_days: 15 },
    { id: 'plan-6m', name: '6 Month Transformation', duration_months: 6, duration_days: 180, total_price: 4699.0, is_off_peak: 0, pt_sessions_included: 2, max_freeze_days: 25 },
    { id: 'plan-12m', name: '12 Month Elite Annual', duration_months: 12, duration_days: 365, total_price: 8999.0, is_off_peak: 0, pt_sessions_included: 5, max_freeze_days: 30 },
    { id: 'plan-pt-sub', name: 'PT Subscription (10 Sessions)', duration_months: 1, duration_days: 30, total_price: 2500.0, is_off_peak: 0, pt_sessions_included: 10, max_freeze_days: 10 }
  ];

  for (const p of officialPlans) {
    const base = +(p.total_price / 1.18).toFixed(2);
    const existing = await db.get('SELECT id FROM membership_plans WHERE id = ?', [p.id]);
    if (!existing) {
      await db.run(
        `INSERT INTO membership_plans (id, name, duration_months, duration_days, base_price, gst_rate, total_price, is_off_peak, pt_sessions_included, max_freeze_days, is_active)
         VALUES (?, ?, ?, ?, ?, 18.0, ?, ?, ?, ?, 1)`,
        [p.id, p.name, p.duration_months, p.duration_days, base, p.total_price, p.is_off_peak, p.pt_sessions_included, p.max_freeze_days]
      );
    } else {
      await db.run(
        `UPDATE membership_plans 
         SET name = ?, duration_months = ?, duration_days = ?, base_price = ?, total_price = ?, pt_sessions_included = ?, max_freeze_days = ?, is_active = 1
         WHERE id = ?`,
        [p.name, p.duration_months, p.duration_days, base, p.total_price, p.pt_sessions_included, p.max_freeze_days, p.id]
      );
    }
  }

  // Deactivate old unused demo plans if any
  await db.run(
    `UPDATE membership_plans SET is_active = 0 WHERE id NOT IN ('plan-1m', 'plan-3m', 'plan-6m', 'plan-12m', 'plan-pt-sub')`
  );

  // Sync member active plan labels with official plan names
  await db.run(`UPDATE members SET plan_name = '12 Month Elite Annual', plan_id = 'plan-12m' WHERE member_code = 'EG-1001'`);
  await db.run(`UPDATE members SET plan_name = '6 Month Transformation', plan_id = 'plan-6m' WHERE member_code = 'EG-1002'`);
  await db.run(`UPDATE members SET plan_name = '3 Month Classic Fitness', plan_id = 'plan-3m' WHERE member_code = 'EG-1004'`);
  await db.run(`UPDATE members SET plan_name = '1 Month Starter', plan_id = 'plan-1m' WHERE member_code = 'EG-1005'`);

  // 3. Settings sync (50 Points = 1 INR)
  const defaultSettings = [
    ['gym_name', 'Elite Fitness Center'],
    ['gym_tagline', 'Gudiyatham Premier Strength & Performance Club'],
    ['gym_address', 'Plot 14, Katpadi Main Road, Near New Bus Stand, Gudiyatham - 632602'],
    ['gym_phone', '+91 98401 23456'],
    ['gym_email', 'operations@elitegymgudiyatham.com'],
    ['gym_gstin', '33AAAAE1234M1Z5'],
    ['officer_master_pin', '1234'],
    ['grace_period_days', '2'],
    ['daily_attendance_points', '20'],
    ['points_per_rupee', '50'], // 50 points = 1 INR
    ['point_rupee_value', '0.02'], // 1 point = 0.02 INR
    ['max_loyalty_redemption_percent', '15.0'],
    ['upi_vpa', 'elitegymgudiyatham@okaxis']
  ];

  for (const [k, v] of defaultSettings) {
    const existing = await db.get('SELECT key FROM gym_settings WHERE key = ?', [k]);
    if (!existing) {
      await db.run('INSERT INTO gym_settings (key, value) VALUES (?, ?)', [k, v]);
    } else {
      await db.run('UPDATE gym_settings SET value = ? WHERE key = ?', [v, k]);
    }
  }

  // 3b. Branch Members & Check-ins for Vellore East & Chennai Anna Nagar
  const branchMembers = [
    {
      id: 'mem-vel-101',
      member_code: 'HH-VEL-101',
      name: 'Anand Krishnan',
      phone: '9840199001',
      email: 'anand.k@example.com',
      plan_id: 'plan-3m',
      plan_name: '3 Month Classic Fitness',
      start_date: '2026-09-01',
      expiry_date: '2026-12-01',
      status: 'active',
      loyalty_points: 160,
      gym_id: 'gym-vellore',
      assigned_trainer_id: 'staff-trainer-1'
    },
    {
      id: 'mem-vel-102',
      member_code: 'HH-VEL-102',
      name: 'Deepa Sundaram',
      phone: '9840199002',
      email: 'deepa.s@example.com',
      plan_id: 'plan-6m',
      plan_name: '6 Month Transformation',
      start_date: '2026-08-15',
      expiry_date: '2027-02-15',
      status: 'active',
      loyalty_points: 240,
      gym_id: 'gym-vellore',
      assigned_trainer_id: 'staff-trainer-2'
    },
    {
      id: 'mem-vel-103',
      member_code: 'HH-VEL-103',
      name: 'Ganesh Moorthy',
      phone: '9840199003',
      email: 'ganesh.m@example.com',
      plan_id: 'plan-1m',
      plan_name: '1 Month Starter',
      start_date: '2026-10-01',
      expiry_date: '2026-11-04',
      status: 'grace',
      loyalty_points: 80,
      gym_id: 'gym-vellore'
    },
    {
      id: 'mem-vel-104',
      member_code: 'HH-VEL-104',
      name: 'Koushik V',
      phone: '9840199004',
      email: 'koushik.v@example.com',
      plan_id: 'plan-12m',
      plan_name: '12 Month Elite Annual',
      start_date: '2026-06-01',
      expiry_date: '2027-06-01',
      status: 'active',
      loyalty_points: 410,
      gym_id: 'gym-vellore',
      assigned_trainer_id: 'staff-trainer-1'
    },
    {
      id: 'mem-vel-105',
      member_code: 'HH-VEL-105',
      name: 'Shalini R',
      phone: '9840199005',
      email: 'shalini.r@example.com',
      plan_id: 'plan-pt-sub',
      plan_name: 'PT Subscription (10 Sessions)',
      start_date: '2026-10-15',
      expiry_date: '2026-11-15',
      status: 'active',
      loyalty_points: 290,
      pt_sessions_total: 10,
      pt_sessions_remaining: 7,
      gym_id: 'gym-vellore',
      assigned_trainer_id: 'staff-trainer-2'
    },
    {
      id: 'mem-vel-106',
      member_code: 'HH-VEL-106',
      name: 'Harish Babu',
      phone: '9840199006',
      email: 'harish.b@example.com',
      plan_id: 'plan-6m',
      plan_name: '6 Month Transformation',
      start_date: '2026-04-01',
      expiry_date: '2026-10-01',
      status: 'expired',
      loyalty_points: 120,
      gym_id: 'gym-vellore'
    },
    {
      id: 'mem-vel-107',
      member_code: 'HH-VEL-107',
      name: 'Nithya S',
      phone: '9840199007',
      email: 'nithya.s@example.com',
      plan_id: 'plan-1m',
      plan_name: '1 Month Starter',
      start_date: '2026-09-15',
      expiry_date: '2026-11-20',
      status: 'frozen',
      is_frozen: 1,
      freeze_start_date: '2026-10-25',
      loyalty_points: 150,
      gym_id: 'gym-vellore'
    },
    {
      id: 'mem-chn-201',
      member_code: 'HH-CHN-201',
      name: 'Siddharth Roy',
      phone: '9840188001',
      email: 'siddharth.r@example.com',
      plan_id: 'plan-12m',
      plan_name: '12 Month Elite Annual',
      start_date: '2026-05-10',
      expiry_date: '2027-05-10',
      status: 'active',
      loyalty_points: 520,
      gym_id: 'gym-chennai',
      assigned_trainer_id: 'staff-trainer-1'
    },
    {
      id: 'mem-chn-202',
      member_code: 'HH-CHN-202',
      name: 'Meera Nambiar',
      phone: '9840188002',
      email: 'meera.n@example.com',
      plan_id: 'plan-pt-sub',
      plan_name: 'PT Subscription (10 Sessions)',
      start_date: '2026-10-20',
      expiry_date: '2026-11-20',
      status: 'active',
      loyalty_points: 350,
      pt_sessions_total: 10,
      pt_sessions_remaining: 8,
      gym_id: 'gym-chennai',
      assigned_trainer_id: 'staff-trainer-2'
    },
    {
      id: 'mem-chn-203',
      member_code: 'HH-CHN-203',
      name: 'Vikram Seth',
      phone: '9840188003',
      email: 'vikram.s@example.com',
      plan_id: 'plan-6m',
      plan_name: '6 Month Transformation',
      start_date: '2026-07-01',
      expiry_date: '2027-01-01',
      status: 'active',
      loyalty_points: 310,
      gym_id: 'gym-chennai'
    },
    {
      id: 'mem-chn-204',
      member_code: 'HH-CHN-204',
      name: 'Divya Balaji',
      phone: '9840188004',
      email: 'divya.b@example.com',
      plan_id: 'plan-12m',
      plan_name: '12 Month Elite Annual',
      start_date: '2026-03-01',
      expiry_date: '2027-03-01',
      status: 'active',
      loyalty_points: 640,
      gym_id: 'gym-chennai',
      assigned_trainer_id: 'staff-trainer-1'
    },
    {
      id: 'mem-chn-205',
      member_code: 'HH-CHN-205',
      name: 'Ashwin Kumar',
      phone: '9840188005',
      email: 'ashwin.k@example.com',
      plan_id: 'plan-3m',
      plan_name: '3 Month Classic Fitness',
      start_date: '2026-09-10',
      expiry_date: '2026-12-10',
      status: 'active',
      loyalty_points: 220,
      gym_id: 'gym-chennai'
    },
    {
      id: 'mem-chn-206',
      member_code: 'HH-CHN-206',
      name: 'Preethi V',
      phone: '9840188006',
      email: 'preethi.v@example.com',
      plan_id: 'plan-1m',
      plan_name: '1 Month Starter',
      start_date: '2026-10-02',
      expiry_date: '2026-11-04',
      status: 'grace',
      loyalty_points: 90,
      gym_id: 'gym-chennai'
    },
    {
      id: 'mem-chn-207',
      member_code: 'HH-CHN-207',
      name: 'Karthikeyan M',
      phone: '9840188007',
      email: 'karthik.m@example.com',
      plan_id: 'plan-6m',
      plan_name: '6 Month Transformation',
      start_date: '2026-03-15',
      expiry_date: '2026-09-15',
      status: 'expired',
      loyalty_points: 180,
      gym_id: 'gym-chennai'
    },
    {
      id: 'mem-chn-208',
      member_code: 'HH-CHN-208',
      name: 'Rohit Sharma',
      phone: '9840188008',
      email: 'rohit.s@example.com',
      plan_id: 'plan-12m',
      plan_name: '12 Month Elite Annual',
      start_date: '2026-06-01',
      expiry_date: '2027-07-01',
      status: 'frozen',
      is_frozen: 1,
      freeze_start_date: '2026-10-20',
      loyalty_points: 460,
      gym_id: 'gym-chennai'
    }
  ];

  for (const bm of branchMembers) {
    const existing = await db.get('SELECT id FROM members WHERE id = ?', [bm.id]);
    if (!existing) {
      await db.run(
        `INSERT INTO members (id, member_code, name, phone, email, plan_id, plan_name, start_date, expiry_date, status, loyalty_points, gym_id, assigned_trainer_id, pt_sessions_total, pt_sessions_remaining, is_frozen, freeze_start_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [bm.id, bm.member_code, bm.name, bm.phone, bm.email, bm.plan_id, bm.plan_name, bm.start_date, bm.expiry_date, bm.status, bm.loyalty_points, bm.gym_id, bm.assigned_trainer_id || null, bm.pt_sessions_total || 0, bm.pt_sessions_remaining || 0, bm.is_frozen || 0, bm.freeze_start_date || null]
      );
    } else {
      await db.run(
        `UPDATE members SET member_code = ?, name = ?, phone = ?, email = ?, plan_id = ?, plan_name = ?, start_date = ?, expiry_date = ?, status = ?, loyalty_points = ?, gym_id = ?, assigned_trainer_id = ?, pt_sessions_total = ?, pt_sessions_remaining = ?, is_frozen = ?, freeze_start_date = ? WHERE id = ?`,
        [bm.member_code, bm.name, bm.phone, bm.email, bm.plan_id, bm.plan_name, bm.start_date, bm.expiry_date, bm.status, bm.loyalty_points, bm.gym_id, bm.assigned_trainer_id || null, bm.pt_sessions_total || 0, bm.pt_sessions_remaining || 0, bm.is_frozen || 0, bm.freeze_start_date || null, bm.id]
      );
    }
  }

  // Branch Invoices for Vellore and Chennai
  const branchInvoices = [
    {
      id: 'inv-vel-1',
      invoice_number: 'INV-VEL-2026-001',
      member_id: 'mem-vel-101',
      member_name: 'Anand Krishnan',
      member_phone: '9840199001',
      item_type: 'membership',
      item_description: '3 Month Classic Fitness Membership',
      subtotal: 2117.80,
      cgst: 190.60,
      sgst: 190.60,
      grand_total: 2499.00,
      payment_method: 'upi',
      status: 'paid',
      gym_id: 'gym-vellore'
    },
    {
      id: 'inv-chn-1',
      invoice_number: 'INV-CHN-2026-001',
      member_id: 'mem-chn-201',
      member_name: 'Siddharth Roy',
      member_phone: '9840188001',
      item_type: 'membership',
      item_description: '12 Month Elite Annual Membership',
      subtotal: 7626.27,
      cgst: 686.36,
      sgst: 686.36,
      grand_total: 8999.00,
      payment_method: 'upi',
      status: 'paid',
      gym_id: 'gym-chennai'
    }
  ];

  for (const bi of branchInvoices) {
    const existing = await db.get('SELECT id FROM invoices WHERE id = ?', [bi.id]);
    if (!existing) {
      await db.run(
        `INSERT INTO invoices (id, invoice_number, member_id, member_name, member_phone, item_type, item_description, subtotal, cgst, sgst, grand_total, payment_method, status, gym_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [bi.id, bi.invoice_number, bi.member_id, bi.member_name, bi.member_phone, bi.item_type, bi.item_description, bi.subtotal, bi.cgst, bi.sgst, bi.grand_total, bi.payment_method, bi.status, bi.gym_id]
      );
    }
  }

  // Branch Expenses
  const branchExpenses = [
    {
      id: 'exp-vel-1',
      title: 'Vellore East Club Space Rent (Nov 2026)',
      category: 'Rent',
      amount: 32000.0,
      payment_method: 'bank_transfer',
      expense_date: '2026-11-01',
      vendor_name: 'Vellore Commercial Plaza',
      gym_id: 'gym-vellore'
    },
    {
      id: 'exp-chn-1',
      title: 'Anna Nagar Arena Space Lease (Nov 2026)',
      category: 'Rent',
      amount: 65000.0,
      payment_method: 'bank_transfer',
      expense_date: '2026-11-01',
      vendor_name: 'Anna Nagar Properties LLC',
      gym_id: 'gym-chennai'
    }
  ];

  for (const be of branchExpenses) {
    const existing = await db.get('SELECT id FROM expenses WHERE id = ?', [be.id]);
    if (!existing) {
      await db.run(
        `INSERT INTO expenses (id, title, category, amount, payment_method, expense_date, vendor_name, gym_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [be.id, be.title, be.category, be.amount, be.payment_method, be.expense_date, be.vendor_name, be.gym_id]
      );
    }
  }

  // 3c. Seed Live Floor Rush & Recent Check-in Activity (Active trainees within last 90 minutes)
  // Clean prior seeded branch checkins
  await db.run(`DELETE FROM checkins WHERE id LIKE 'chk-vel-%' OR id LIKE 'chk-chn-%' OR id LIKE 'chk-gud-%'`);

  // Gudiyatham check-ins (10 active -> Light / Moderate Floor Rush)
  const gudiyathamCheckins = [
    { id: 'chk-gud-1', member_id: 'mem-1001', member_code: 'EG-1001', member_name: 'Vigneshwaran K', checkin_type: 'qr_scan', verification_status: 'granted', points_awarded: 20, min_ago: 8 },
    { id: 'chk-gud-2', member_id: 'mem-1002', member_code: 'EG-1002', member_name: 'Aravind Swamy', checkin_type: 'qr_scan', verification_status: 're_entry', points_awarded: 0, min_ago: 16 },
    { id: 'chk-gud-3', member_id: 'mem-1003', member_code: 'EG-1003', member_name: 'Karthik Raja', checkin_type: 'qr_scan', verification_status: 'granted', points_awarded: 20, min_ago: 24 },
    { id: 'chk-gud-4', member_id: 'mem-1004', member_code: 'EG-1004', member_name: 'Suresh Kumar', checkin_type: 'qr_scan', verification_status: 'granted', points_awarded: 20, min_ago: 33 },
    { id: 'chk-gud-5', member_id: 'mem-1005', member_code: 'EG-1005', member_name: 'Mohan Babu', checkin_type: 'manual', manual_officer_name: 'Priya V (Front Desk)', verification_status: 'granted', points_awarded: 20, min_ago: 42 },
    { id: 'chk-gud-6', member_id: 'mem-1006', member_code: 'EG-1006', member_name: 'Rajesh Kannan', checkin_type: 'qr_scan', verification_status: 'granted', points_awarded: 20, min_ago: 51 },
    { id: 'chk-gud-7', member_id: 'mem-1007', member_code: 'EG-1007', member_name: 'Saravanan R', checkin_type: 'qr_scan', verification_status: 'grace_entry', points_awarded: 0, min_ago: 62 },
    { id: 'chk-gud-8', member_id: 'mem-1001', member_code: 'EG-1001', member_name: 'Vigneshwaran K', checkin_type: 'qr_scan', verification_status: 're_entry', points_awarded: 0, min_ago: 73 },
    { id: 'chk-gud-9', member_id: 'mem-1004', member_code: 'EG-1004', member_name: 'Suresh Kumar', checkin_type: 'qr_scan', verification_status: 'granted', points_awarded: 20, min_ago: 80 },
    { id: 'chk-gud-10', member_id: 'mem-1002', member_code: 'EG-1002', member_name: 'Aravind Swamy', checkin_type: 'qr_scan', verification_status: 'granted', points_awarded: 20, min_ago: 87 }
  ];

  for (const gc of gudiyathamCheckins) {
    await db.run(
      `INSERT INTO checkins (id, member_id, member_code, member_name, checkin_type, manual_officer_name, verification_status, points_awarded, checkin_time, gym_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-${gc.min_ago} minutes', 'localtime'), 'gym-gudiyatham')`,
      [gc.id, gc.member_id, gc.member_code, gc.member_name, gc.checkin_type, gc.manual_officer_name || null, gc.verification_status, gc.points_awarded]
    );
  }

  // Vellore check-ins (18 active -> Moderate Floor Rush)
  const velloreNames = [
    { id: 'mem-vel-101', code: 'HH-VEL-101', name: 'Anand Krishnan' },
    { id: 'mem-vel-102', code: 'HH-VEL-102', name: 'Deepa Sundaram' },
    { id: 'mem-vel-103', code: 'HH-VEL-103', name: 'Ganesh Moorthy' },
    { id: 'mem-vel-104', code: 'HH-VEL-104', name: 'Koushik V' },
    { id: 'mem-vel-105', code: 'HH-VEL-105', name: 'Shalini R' }
  ];
  for (let i = 1; i <= 18; i++) {
    const mem = velloreNames[(i - 1) % velloreNames.length];
    const minAgo = Math.floor(2 + (i * 4.5)); // spaced across last 85 minutes
    const isManual = i % 4 === 0;
    const status = i === 3 ? 'grace_entry' : i % 5 === 0 ? 're_entry' : 'granted';
    const pts = status === 'granted' ? 20 : 0;
    await db.run(
      `INSERT INTO checkins (id, member_id, member_code, member_name, checkin_type, manual_officer_name, verification_status, points_awarded, checkin_time, gym_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-${minAgo} minutes', 'localtime'), 'gym-vellore')`,
      [`chk-vel-${i}`, mem.id, mem.code, mem.name, isManual ? 'manual' : 'qr_scan', isManual ? 'Vellore Desk Admin' : null, status, pts]
    );
  }

  // Chennai check-ins (32 active -> Peak Rush)
  const chennaiNames = [
    { id: 'mem-chn-201', code: 'HH-CHN-201', name: 'Siddharth Roy' },
    { id: 'mem-chn-202', code: 'HH-CHN-202', name: 'Meera Nambiar' },
    { id: 'mem-chn-203', code: 'HH-CHN-203', name: 'Vikram Seth' },
    { id: 'mem-chn-204', code: 'HH-CHN-204', name: 'Divya Balaji' },
    { id: 'mem-chn-205', code: 'HH-CHN-205', name: 'Ashwin Kumar' }
  ];
  for (let i = 1; i <= 32; i++) {
    const mem = chennaiNames[(i - 1) % chennaiNames.length];
    const minAgo = Math.floor(1 + (i * 2.6)); // spaced across last 85 minutes
    const isManual = i % 6 === 0;
    const status = i === 5 ? 'grace_entry' : i % 4 === 0 ? 're_entry' : 'granted';
    const pts = status === 'granted' ? 20 : 0;
    await db.run(
      `INSERT INTO checkins (id, member_id, member_code, member_name, checkin_type, manual_officer_name, verification_status, points_awarded, checkin_time, gym_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-${minAgo} minutes', 'localtime'), 'gym-chennai')`,
      [`chk-chn-${i}`, mem.id, mem.code, mem.name, isManual ? 'manual' : 'qr_scan', isManual ? 'Anna Nagar Desk Officer' : null, status, pts]
    );
  }

  // 4. Gym Notices
  const existingNotices = await db.get('SELECT COUNT(*) as count FROM gym_notices');
  if (!existingNotices || existingNotices.count === 0) {
    const notices = [
      {
        id: 'notice-1',
        title: 'Sunday Operational Timings Notice',
        category: 'Facility Timing',
        badge: 'Official Schedule',
        content: 'Gym operates from 6:00 AM to 12:00 PM every Sunday. Evening sessions remain closed for deep sanitization and heavy machine maintenance.',
        published_date: '2026-11-01'
      },
      {
        id: 'notice-2',
        title: 'Gudiyatham Elite Strength Championship 2026',
        category: 'Event',
        badge: 'Cash Prize ₹25,000',
        content: 'Annual Bench Press and Deadlift Championship on Dec 15th! Register with Coach Murugan at the reception counter before Nov 30th.',
        published_date: '2026-11-02'
      },
      {
        id: 'notice-3',
        title: 'Complimentary Body Composition & InBody Testing',
        category: 'Member Perk',
        badge: 'Free for Annual Members',
        content: 'Free monthly visceral fat and muscle mass scanning every 1st and 3rd Saturday at the trainer assessment desk.',
        published_date: '2026-11-03'
      }
    ];

    for (const n of notices) {
      await db.run(
        `INSERT INTO gym_notices (id, title, category, badge, content, published_date, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [n.id, n.title, n.category, n.badge, n.content, n.published_date]
      );
    }
  }

  // 5. Workout Routine & Exercises for Vigneshwaran (mem-1001)
  const existingRoutine = await db.get('SELECT id FROM workout_routines WHERE member_id = ?', ['mem-1001']);
  if (!existingRoutine) {
    const routineId = 'routine-mem-1001-chest';
    await db.run(
      `INSERT INTO workout_routines (id, member_id, day_name, routine_title, assigned_by_trainer, estimated_duration_min, target_muscle_groups)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [routineId, 'mem-1001', 'Today (Push Day)', 'Chest & Triceps Hypertrophy', 'Coach Murugan S', 55, 'Pectorals, Anterior Delts, Triceps']
    );

    const exercises = [
      { id: 'ex-1', name: 'Incline Dumbbell Bench Press', category: 'Upper Chest', sets: 4, reps: '8-10 reps', rest: 75, pr: '34kg x 8 reps', order: 1 },
      { id: 'ex-2', name: 'Flat Barbell Bench Press', category: 'Mid Chest', sets: 4, reps: '6-8 reps', rest: 90, pr: '85kg x 6 reps', order: 2 },
      { id: 'ex-3', name: 'Standing High-to-Low Cable Flyes', category: 'Lower Chest', sets: 3, reps: '12-15 reps', rest: 60, pr: '22kg x 12 reps', order: 3 },
      { id: 'ex-4', name: 'Triceps Overhead Cable Rope Extension', category: 'Triceps Long Head', sets: 3, reps: '12-15 reps', rest: 60, pr: '25kg x 10 reps', order: 4 },
      { id: 'ex-5', name: 'Weighted Triceps Parallel Dips', category: 'Triceps / Chest', sets: 3, reps: '8-10 reps', rest: 75, pr: 'BW + 15kg', order: 5 }
    ];

    for (const ex of exercises) {
      await db.run(
        `INSERT INTO workout_exercises (id, routine_id, exercise_name, category, target_sets, target_reps, rest_seconds, previous_pr, order_idx)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ex.id, routineId, ex.name, ex.category, ex.sets, ex.reps, ex.rest, ex.pr, ex.order]
      );
    }

    // Seed some prior workout logs
    await db.run(
      `INSERT INTO workout_logs (id, member_id, exercise_name, set_number, weight_kg, reps, is_pr, logged_at)
       VALUES ('log-1', 'mem-1001', 'Incline Dumbbell Bench Press', 1, 30.0, 10, 0, datetime('now', '-2 days'))`
    );
    await db.run(
      `INSERT INTO workout_logs (id, member_id, exercise_name, set_number, weight_kg, reps, is_pr, logged_at)
       VALUES ('log-2', 'mem-1001', 'Incline Dumbbell Bench Press', 2, 34.0, 8, 1, datetime('now', '-2 days'))`
    );
  }

  // 6. Diet Plan & Meals for Vigneshwaran (mem-1001)
  const existingDiet = await db.get('SELECT id FROM diet_plans WHERE member_id = ?', ['mem-1001']);
  if (!existingDiet) {
    const dietId = 'diet-mem-1001';
    await db.run(
      `INSERT INTO diet_plans (id, member_id, daily_calories, protein_grams, carbs_grams, fats_grams, water_liters, diet_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [dietId, 'mem-1001', 2400, 160, 260, 65, 3.5, 'High-Protein Muscle Gain (Gudiyatham Special)']
    );

    const meals = [
      { id: 'meal-1', name: 'Breakfast Kickstart', time: '08:00 AM', food: '4 Egg Whites + 2 Whole Boiled Eggs + Rolled Oats Porridge with Walnuts', cal: 480, p: 34, c: 52, f: 14, eaten: 1, order: 1 },
      { id: 'meal-2', name: 'Mid-Morning Fuel', time: '11:30 AM', food: 'Sprouted Green Gram (Moong Sundal) + Handful Roasted Peanuts', cal: 280, p: 16, c: 32, f: 8, eaten: 1, order: 2 },
      { id: 'meal-3', name: 'Power Lunch', time: '01:30 PM', food: '1.5 cups Brown Rice / 3 Wheat Chapatis + Grilled Chicken Breast (180g) or Soya Curry + Low-Fat Curd', cal: 680, p: 48, c: 75, f: 18, eaten: 0, order: 3 },
      { id: 'meal-4', name: 'Pre-Workout Energizer', time: '05:00 PM', food: '2 Small Bananas + 1 cup Black Coffee (Sugar-Free)', cal: 220, p: 4, c: 48, f: 1, eaten: 0, order: 4 },
      { id: 'meal-5', name: 'Post-Workout Anabolic Shake', time: '07:30 PM', food: '1 Scoop Gold Standard Whey Protein Isolate in 300ml cold water', cal: 130, p: 26, c: 3, f: 1, eaten: 0, order: 5 },
      { id: 'meal-6', name: 'Recovery Dinner', time: '09:30 PM', food: 'Pan-Seared Paneer (120g) / Grilled Fish + Steamed Broccoli, Carrots & Cucumber Salad', cal: 450, p: 32, c: 22, f: 21, eaten: 0, order: 6 }
    ];

    for (const m of meals) {
      await db.run(
        `INSERT INTO diet_meals (id, plan_id, meal_name, time_hint, food_items, calories, protein_grams, carbs_grams, fats_grams, is_eaten, order_idx)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [m.id, dietId, m.name, m.time, m.food, m.cal, m.p, m.c, m.f, m.eaten, m.order]
      );
    }
  }

  // 7. Device Binding for mem-1001
  const existingBinding = await db.get('SELECT id FROM member_device_bindings WHERE member_id = ?', ['mem-1001']);
  if (!existingBinding) {
    await db.run(
      `INSERT INTO member_device_bindings (id, member_id, device_fingerprint, device_name, is_trusted)
       VALUES (?, ?, ?, ?, ?)`,
      ['dev-1001', 'mem-1001', 'fingerprint-pwa-iphone-safari', 'iPhone 15 Pro • Mobile PWA', 1]
    );
  }

  // 8. Gym Operating Expenses (Owner P&L Engine)
  const existingExpenses = await db.get('SELECT COUNT(*) as count FROM expenses');
  if (!existingExpenses || existingExpenses.count === 0) {
    const expenses = [
      { id: 'exp-1', title: 'Monthly Facility Floor Rent (2,800 sq ft)', category: 'Rent', amount: 35000.0, payment_method: 'bank_transfer', payment_ref: 'NEFT-RENT-001', expense_date: '2026-11-01', vendor_name: 'Gudiyatham Real Estate Properties', notes: 'Main commercial gym space monthly lease payment', logged_by: 'Karthik Raja (Owner)' },
      { id: 'exp-2', title: 'TNEB Electricity Bill (AC Units + Treadmills)', category: 'Electricity (TNEB)', amount: 14250.0, payment_method: 'upi', payment_ref: 'UPI-TNEB-8921', expense_date: '2026-11-02', vendor_name: 'Tamil Nadu Electricity Board (TNEB)', notes: 'Commercial tariff for heavy load fitness equipment', logged_by: 'Venkatesh Rao (Manager)' },
      { id: 'exp-3', title: 'Floor Coaches & Head Trainer Salaries', category: 'Trainer Salaries', amount: 32000.0, payment_method: 'bank_transfer', payment_ref: 'SAL-OCT-2026', expense_date: '2026-11-01', vendor_name: 'Murugan S & Rajesh K', notes: 'Monthly base pay for 2 floor coaches', logged_by: 'Karthik Raja (Owner)' },
      { id: 'exp-4', title: 'Cable Crossover & Pulley Maintenance AMC', category: 'Equipment Maintenance', amount: 3400.0, payment_method: 'upi', payment_ref: 'UPI-AMC-4410', expense_date: '2026-10-28', vendor_name: 'Apex Fitness Equipment Care', notes: 'Steel aircraft cable replacement & bearing lubrication', logged_by: 'Venkatesh Rao (Manager)' },
      { id: 'exp-5', title: 'Gold Standard Whey & BCAA Stock Restock', category: 'Supplements Stock', amount: 18500.0, payment_method: 'upi', payment_ref: 'UPI-SUPP-7729', expense_date: '2026-10-25', vendor_name: 'MuscleBlaze & Optimum Nutrition Dist.', notes: '6 tubs isolate, 12 pre-workouts, 24 protein bars', logged_by: 'Karthik Raja (Owner)' },
      { id: 'exp-6', title: 'Commercial Sanitation, Disinfectants & Towels', category: 'Cleaning & Sanitation', amount: 2400.0, payment_method: 'cash', payment_ref: 'CASH-VOUCHER-12', expense_date: '2026-10-29', vendor_name: 'Local Gudiyatham Hygiene Mart', notes: 'Gym wipe rolls, floor phenyle, and fresh locker towels', logged_by: 'Priya V (Front Desk)' },
      { id: 'exp-7', title: 'Airtel Fiber Broadband & Drinking RO Water Cans', category: 'Internet & Utilities', amount: 1799.0, payment_method: 'upi', payment_ref: 'UPI-AIRTEL-55', expense_date: '2026-11-02', vendor_name: 'Airtel Broadband & Bisleri RO Plant', notes: '300 Mbps unlimited fiber + 25 mineral water cans', logged_by: 'Priya V (Front Desk)' }
    ];

    for (const exp of expenses) {
      await db.run(
        `INSERT INTO expenses (id, title, category, amount, payment_method, payment_ref, expense_date, vendor_name, notes, logged_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [exp.id, exp.title, exp.category, exp.amount, exp.payment_method, exp.payment_ref, exp.expense_date, exp.vendor_name, exp.notes, exp.logged_by]
      );
    }
  }

  // 9. Sync Member PT Session Balances, PINs & Medical Limitation Flags
  const memberPtUpdates = [
    { id: 'mem-1001', pt_total: 10, pt_rem: 8, pin: '4821', flags: 'L4-L5 Lumbar Disc Sensitivity (Avoid direct heavy spinal compression)', trainer: 'staff-trainer-1' },
    { id: 'mem-1002', pt_total: 10, pt_rem: 5, pin: '2914', flags: 'Right Knee Chondromalacia (Limit deep knee flexion > 90°)', trainer: 'staff-trainer-2' },
    { id: 'mem-1003', pt_total: 10, pt_rem: 10, pin: '6732', flags: 'None (Full medical clearance for progressive hypertrophy)', trainer: 'staff-trainer-1' },
    { id: 'mem-1004', pt_total: 0, pt_rem: 0, pin: '8391', flags: 'Right Shoulder Impingement (Avoid heavy behind-the-neck presses)', trainer: 'staff-trainer-2' },
    { id: 'mem-1005', pt_total: 10, pt_rem: 2, pin: '5180', flags: 'Stage-1 Hypertension (Avoid Valsalva breath-holding; monitor recovery HR)', trainer: 'staff-trainer-1' }
  ];

  for (const m of memberPtUpdates) {
    await db.run(
      `UPDATE members 
       SET pt_sessions_total = ?, pt_sessions_remaining = ?, pt_session_pin = ?, medical_flags = ?, assigned_trainer_id = ?
       WHERE id = ?`,
      [m.pt_total, m.pt_rem, m.pin, m.flags, m.trainer, m.id]
    );
  }

  // Ensure sample absentee for testing: Kavitha Ramesh last seen 5 days ago
  await db.run("UPDATE checkins SET checkin_time = datetime('now', '-5 days') WHERE member_id = 'mem-1003'");
  // Also remove any floor checkin today for mem-1003
  await db.run("DELETE FROM floor_checkins WHERE member_id = 'mem-1003'");

  // 10. PT Sessions Seed (Prior Completed Sessions for Earnings & History Ledger)
  const existingPtSessions = await db.get('SELECT COUNT(*) as count FROM pt_sessions');
  if (!existingPtSessions || existingPtSessions.count === 0) {
    const ptSessions = [
      {
        id: 'pt-sess-1',
        trainer_id: 'staff-trainer-1',
        trainer_name: 'Coach Murugan S',
        member_id: 'mem-1001',
        member_name: 'Vigneshwaran K',
        session_number: 1,
        verification_code: '4821',
        focus_area: 'Barbell Bench Press Technique & Scapular Retraction',
        notes: 'Client had mild anterior shoulder tilt. Adjusted grip width and queued scapular depression. Hit 75kg clean.',
        commission_earned: 50.0,
        status: 'verified',
        session_date: '2026-10-28',
        completed_at: '2026-10-28 07:15:00'
      },
      {
        id: 'pt-sess-2',
        trainer_id: 'staff-trainer-1',
        trainer_name: 'Coach Murugan S',
        member_id: 'mem-1001',
        member_name: 'Vigneshwaran K',
        session_number: 2,
        verification_code: '4821',
        focus_area: 'Incline Dumbbell Press & Overhead Triceps Cable Extension',
        notes: 'Good chest activation on 30-degree incline. Progression to 34kg DBs achieved.',
        commission_earned: 50.0,
        status: 'verified',
        session_date: '2026-11-01',
        completed_at: '2026-11-01 07:30:00'
      },
      {
        id: 'pt-sess-3',
        trainer_id: 'staff-trainer-1',
        trainer_name: 'Coach Murugan S',
        member_id: 'mem-1005',
        member_name: 'Mohan Babu',
        session_number: 8,
        verification_code: '5180',
        focus_area: 'Cardiovascular Conditioning & Controlled Core Stability',
        notes: 'Monitored heart rate under 135 bpm throughout. BP remained stable at 124/82 post-workout.',
        commission_earned: 50.0,
        status: 'verified',
        session_date: '2026-11-02',
        completed_at: '2026-11-02 08:00:00'
      },
      {
        id: 'pt-sess-4',
        trainer_id: 'staff-trainer-2',
        trainer_name: 'Coach Dinesh Kumar',
        member_id: 'mem-1002',
        member_name: 'Aravind Swamy',
        session_number: 5,
        verification_code: '2914',
        focus_area: 'Hamstring & Glute Dominant Lower Body Split',
        notes: 'Kept knee angle under 90 deg due to chondromalacia. Bulgarian split squats felt completely pain-free.',
        commission_earned: 45.0,
        status: 'verified',
        session_date: '2026-11-02',
        completed_at: '2026-11-02 18:30:00'
      }
    ];

    for (const pt of ptSessions) {
      await db.run(
        `INSERT INTO pt_sessions (id, trainer_id, trainer_name, member_id, member_name, session_number, verification_code, focus_area, notes, commission_earned, status, session_date, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [pt.id, pt.trainer_id, pt.trainer_name, pt.member_id, pt.member_name, pt.session_number, pt.verification_code, pt.focus_area, pt.notes, pt.commission_earned, pt.status, pt.session_date, pt.completed_at]
      );
    }
  }

  // 11. Floor Coaching Check-ins (Today's floor presence)
  const todayDateStr = new Date().toISOString().split('T')[0];
  const existingFloor = await db.get('SELECT COUNT(*) as count FROM floor_checkins WHERE checkin_date = ?', [todayDateStr]);
  if (!existingFloor || existingFloor.count === 0) {
    const existingId = await db.get('SELECT id FROM floor_checkins WHERE id = ?', ['floor-check-1']);
    const checkinId = existingId ? `floor-check-${todayDateStr}` : 'floor-check-1';
    await db.run(
      `INSERT OR REPLACE INTO floor_checkins (id, trainer_id, member_id, checkin_date, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [checkinId, 'staff-trainer-1', 'mem-1001', todayDateStr, 'Warm-up reviewed; posture corrected on shoulder warm-up']
    );
  }

  // 12. Master Workout Templates
  const existingWkTemplates = await db.get('SELECT COUNT(*) as count FROM workout_templates');
  if (!existingWkTemplates || existingWkTemplates.count === 0) {
    const wkTemplates = [
      {
        id: 'wt-hypertrophy-4day',
        title: '4-Day Progressive Hypertrophy Split',
        category: 'Muscle Building & Hypertrophy',
        difficulty: 'Intermediate',
        target_days: 4,
        description: 'Elite 4-day Upper/Lower / Push-Pull-Legs hybrid tailored for maximum muscle volume with safe joint mechanics.',
        exercises_json: JSON.stringify([
          { name: 'Incline Dumbbell Bench Press', category: 'Chest', target_sets: 4, target_reps: '8-10 reps', rest_seconds: 75, form_cues: 'Retract scapula, slow 3s eccentric, full stretch at chest' },
          { name: 'Flat Barbell Bench Press', category: 'Chest', target_sets: 4, target_reps: '6-8 reps', rest_seconds: 90, form_cues: 'Drive feet into floor, bar touches lower sternum' },
          { name: 'Chest-Supported T-Bar Row', category: 'Back', target_sets: 4, target_reps: '10-12 reps', rest_seconds: 75, form_cues: 'Zero lumbar momentum; squeeze shoulder blades together' },
          { name: 'Lat Pulldown (Neutral Grip)', category: 'Lats', target_sets: 4, target_reps: '10-12 reps', rest_seconds: 60, form_cues: 'Pull elbows into front pockets, avoid swinging torso' },
          { name: 'Dumbbell Romanian Deadlift', category: 'Hamstrings & Glutes', target_sets: 3, target_reps: '10-12 reps', rest_seconds: 90, form_cues: 'Hinge hips backward, keep spine neutral, soft knees' },
          { name: 'Overhead Cable Triceps Rope Pushaway', category: 'Triceps', target_sets: 3, target_reps: '12-15 reps', rest_seconds: 60, form_cues: 'Flare ropes at peak contraction, keep upper arms locked' }
        ])
      },
      {
        id: 'wt-fatloss-circuit',
        title: 'Metabolic Fat Loss & Conditioning Circuit',
        category: 'Fat Loss & Conditioning',
        difficulty: 'All Levels',
        target_days: 3,
        description: 'High-intensity interval conditioning designed to maximize post-exercise oxygen consumption (EPOC) and caloric burn.',
        exercises_json: JSON.stringify([
          { name: 'Kettlebell Russian Swings (16kg/20kg)', category: 'Full Body Power', target_sets: 4, target_reps: '20 reps', rest_seconds: 45, form_cues: 'Violent hip snap, do not squat the kettlebell' },
          { name: 'Dumbbell Thrusters (Squat to Overhead Press)', category: 'Full Body', target_sets: 4, target_reps: '12-15 reps', rest_seconds: 60, form_cues: 'Use leg drive out of the hole to pop dumbbells overhead' },
          { name: 'Battle Rope Alternating Waves', category: 'Cardiovascular', target_sets: 4, target_reps: '30 seconds', rest_seconds: 45, form_cues: 'Quarter squat stance, tight core, explosive arm cadence' },
          { name: 'Plyometric Box Step-Ups', category: 'Lower Body', target_sets: 3, target_reps: '15 reps/leg', rest_seconds: 45, form_cues: 'Control downward step, do not bounce off bottom foot' },
          { name: 'Forearm Core Plank Hold', category: 'Core Stability', target_sets: 3, target_reps: '45-60 seconds', rest_seconds: 45, form_cues: 'Squeeze glutes and abs, posterior pelvic tilt' }
        ])
      },
      {
        id: 'wt-strength-foundation',
        title: 'Beginner Strength Foundation (Big 4)',
        category: 'Strength Foundation',
        difficulty: 'Beginner',
        target_days: 3,
        description: 'Mastery of primary compound lifts: Squat, Bench, Deadlift, Overhead Press with strict form and progressive overload.',
        exercises_json: JSON.stringify([
          { name: 'Barbell Back Squat', category: 'Quads & Glutes', target_sets: 3, target_reps: '5-6 reps', rest_seconds: 120, form_cues: 'Knees track over toes, break parallel, braced Valsalva core' },
          { name: 'Barbell Flat Bench Press', category: 'Chest', target_sets: 3, target_reps: '5-6 reps', rest_seconds: 120, form_cues: 'Stable 5-point contact, arched upper back, controlled cadence' },
          { name: 'Conventional Barbell Deadlift', category: 'Posterior Chain', target_sets: 2, target_reps: '5 reps', rest_seconds: 150, form_cues: 'Pull slack out of bar, drag bar along shins, neutral neck' },
          { name: 'Standing Overhead Military Press', category: 'Shoulders', target_sets: 3, target_reps: '6-8 reps', rest_seconds: 90, form_cues: 'Squeeze glutes tight to prevent lumbar hyperextension' },
          { name: 'Seated Cable Lat Row', category: 'Upper Back', target_sets: 3, target_reps: '8-10 reps', rest_seconds: 75, form_cues: 'Drive elbows back, pause for 1 second at full squeeze' }
        ])
      },
      {
        id: 'wt-lowback-friendly',
        title: 'Joint-Friendly / Low-Back Rehabilitation Split',
        category: 'Rehab & Joint Longevity',
        difficulty: 'All Levels',
        target_days: 3,
        description: 'Specially engineered for members with lumbar disc sensitivities or knee discomfort. Zero spinal axial compression.',
        exercises_json: JSON.stringify([
          { name: 'Bird-Dog Dynamic Core Stabilization', category: 'Core & Spinal Endurance', target_sets: 3, target_reps: '10 reps/side', rest_seconds: 45, form_cues: 'Do not rotate hips; hold 2 seconds at full extension' },
          { name: 'Supine Glute Bridges with Resistance Band', category: 'Glutes & Pelvic Control', target_sets: 3, target_reps: '15 reps', rest_seconds: 45, form_cues: 'Drive through heels, squeeze glutes at apex, avoid arching lower back' },
          { name: 'Chest-Supported Dumbbell Row (Prone Incline)', category: 'Mid Back', target_sets: 3, target_reps: '10-12 reps', rest_seconds: 60, form_cues: 'Chest stays pinned to pad, completely eliminating spinal loading' },
          { name: 'Machine Leg Press (Feet Placed High on Plate)', category: 'Legs (Lumbar Safe)', target_sets: 3, target_reps: '12-15 reps', rest_seconds: 75, form_cues: 'Keep pelvis glued to seat; stop before lower back rounds' },
          { name: 'Standing Cable Pallof Anti-Rotation Press', category: 'Rotational Core Stability', target_sets: 3, target_reps: '12 reps/side', rest_seconds: 45, form_cues: 'Resist rotational twist, breathe rhythmically through diaphragm' }
        ])
      }
    ];

    for (const wt of wkTemplates) {
      await db.run(
        `INSERT INTO workout_templates (id, title, category, difficulty, target_days, description, exercises_json, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [wt.id, wt.title, wt.category, wt.difficulty, wt.target_days, wt.description, wt.exercises_json]
      );
    }
  }

  // 13. Master Nutrition Templates
  const existingDtTemplates = await db.get('SELECT COUNT(*) as count FROM diet_templates');
  if (!existingDtTemplates || existingDtTemplates.count === 0) {
    const dtTemplates = [
      {
        id: 'dt-south-indian-hypertrophy',
        title: 'High-Protein South Indian Muscle Builder',
        diet_type: 'High-Protein Muscle Gain',
        calories: 2400,
        protein: 160,
        carbs: 260,
        fats: 65,
        description: 'Optimized South Indian meal timing with high biological value proteins (eggs, chicken, curd, sundal, whey) and clean complex carbs.',
        meals_json: JSON.stringify([
          { name: 'Pre-Workout Kickstart', time: '06:30 AM', food: '4 Boiled Egg Whites + 1 Small Elaichi Banana + Black Coffee', cal: 220, p: 16, c: 28, f: 2 },
          { name: 'Power Breakfast', time: '09:00 AM', food: '3 Steamed Idlis + Lentil Sambar + 1 Scoop Gold Standard Whey Protein', cal: 480, p: 34, c: 56, f: 8 },
          { name: 'Muscle Fuel Lunch', time: '01:30 PM', food: '1.5 cups Ponni Brown Rice + 180g Grilled Chicken Breast + Spinach Keerai Kootu + Low-fat Curd', cal: 720, p: 52, c: 78, f: 18 },
          { name: 'Evening Sundal Snack', time: '05:30 PM', food: '150g Boiled Chickpea (Sundal) with mustard temper + 10 soaked almonds', cal: 310, p: 14, c: 38, f: 10 },
          { name: 'Dinner Recovery', time: '08:30 PM', food: '3 Whole Wheat Phulkas + 3-Egg Bhurji + Cucumber & Tomato Salad', cal: 520, p: 34, c: 52, f: 16 },
          { name: 'Bedtime Sustained Protein', time: '10:30 PM', food: '200ml Warm Skimmed Milk with pinch of Turmeric & Badam', cal: 150, p: 10, c: 12, f: 5 }
        ])
      },
      {
        id: 'dt-fat-shred',
        title: 'Metabolic Fat Shredding Clean Nutrition',
        diet_type: 'Fat Loss & Caloric Deficit',
        calories: 1800,
        protein: 145,
        carbs: 160,
        fats: 45,
        description: 'Moderate carb, high protein deficit designed to preserve lean muscle mass while accelerating visceral and stubborn fat loss.',
        meals_json: JSON.stringify([
          { name: 'Morning Fasted Hydration', time: '07:00 AM', food: 'Warm Lemon Water + 5 Soaked Almonds + 1 cup Green Tea', cal: 90, p: 3, c: 4, f: 6 },
          { name: 'Lean Protein Breakfast', time: '09:00 AM', food: '5 Boiled Egg Whites (1 yolk) + 1 Multigrain Toast + Mint Chutney', cal: 310, p: 26, c: 22, f: 8 },
          { name: 'Shred Lunch', time: '01:30 PM', food: '1 cup Brown Rice / 2 Chapatis + 160g Grilled Fish or Chicken Tikka + Steamed Beans Poriyal', cal: 580, p: 46, c: 54, f: 12 },
          { name: 'Pre-Workout Energy', time: '05:30 PM', food: '1 Apple / Green Pear + 1 cup Black Coffee (Sugar-Free)', cal: 95, p: 1, c: 24, f: 0 },
          { name: 'Post-Workout Shake', time: '07:30 PM', food: '1 Scoop Whey Protein Isolate in chilled water', cal: 120, p: 25, c: 2, f: 1 },
          { name: 'Light Fiber Dinner', time: '09:00 PM', food: 'Big Bowl Clear Chicken or Sprouted Moong Soup + 100g Grilled Paneer Salad', cal: 420, p: 32, c: 20, f: 16 }
        ])
      },
      {
        id: 'dt-tamil-veg',
        title: 'Pure Vegetarian High-Protein Tamil Diet',
        diet_type: 'Pure Vegetarian Muscle Building',
        calories: 2150,
        protein: 135,
        carbs: 240,
        fats: 58,
        description: '100% vegetarian high-protein blueprint tailored for Tamil dietary habits using paneer, soya chunks, roasted chana, lentils, and whey.',
        meals_json: JSON.stringify([
          { name: 'Breakfast', time: '08:30 AM', food: '2 Oats & Rava Idlis + Moong Dal Chutney + 1 Scoop Plant / Whey Protein', cal: 440, p: 32, c: 50, f: 9 },
          { name: 'Mid-Day Protein Sip', time: '11:30 AM', food: 'Roasted Chana Sattu Drink (30g powder) + Sprouted Green Gram Sundal', cal: 320, p: 18, c: 42, f: 6 },
          { name: 'High Protein Veg Lunch', time: '01:30 PM', food: '1 cup Matta / Brown Rice + 60g Soya Chunks Curry (rich in leucine) + 100g Fresh Curd + Keerai', cal: 680, p: 44, c: 80, f: 14 },
          { name: 'Evening Pre-Lift', time: '05:30 PM', food: '2 Peanut Butter Rice Cakes or 2 Bananas + Filter Coffee (no sugar)', cal: 240, p: 6, c: 42, f: 5 },
          { name: 'Night Dinner', time: '09:00 PM', food: '3 Multigrain Phulkas + 150g Low-fat Paneer Bhurji with Capsicum + Mixed Salad', cal: 470, p: 35, c: 40, f: 18 }
        ])
      }
    ];

    for (const dt of dtTemplates) {
      await db.run(
        `INSERT INTO diet_templates (id, title, diet_type, calories, protein, carbs, fats, description, meals_json, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [dt.id, dt.title, dt.diet_type, dt.calories, dt.protein, dt.carbs, dt.fats, dt.description, dt.meals_json]
      );
    }
  }

  console.log('✅ Staff, Roles, Plans & Settings synced successfully!');
  console.log('✅ App 2 Workouts, Diet, Notices & Device Bindings seeded successfully!');
  console.log('✅ Gym Owner Operating Expenses & Net P&L engine seeded successfully!');
  console.log('✅ App 3 Trainer Roster, Anti-Fraud PT Sessions, Earnings & Templates seeded successfully!');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}
