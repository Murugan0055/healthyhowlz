import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.DATABASE_PATH ? path.resolve(process.env.DATABASE_PATH) : path.resolve(__dirname, '../../elite_gym.db');

let dbInstance = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable WAL mode and foreign keys for performance and data integrity
  await dbInstance.run('PRAGMA journal_mode = WAL;');
  await dbInstance.run('PRAGMA foreign_keys = ON;');

  await initSchema(dbInstance);
  return dbInstance;
}

async function initSchema(db) {
  await db.exec(`
    -- SaaS Gyms (Tenants)
    CREATE TABLE IF NOT EXISTS gyms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      owner_id TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      city TEXT NOT NULL DEFAULT 'Gudiyatham',
      state TEXT DEFAULT 'Tamil Nadu',
      pincode TEXT,
      gstin TEXT,
      status TEXT NOT NULL DEFAULT 'active', -- 'active', 'trial', 'suspended'
      subscription_tier TEXT NOT NULL DEFAULT 'pro_growth', -- 'starter', 'pro_growth', 'enterprise'
      monthly_fee REAL NOT NULL DEFAULT 2499.0,
      billing_cycle TEXT DEFAULT 'monthly',
      valid_until DATE,
      kiosk_pin TEXT DEFAULT '1234',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Staff & Officers
    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'front_desk', -- 'owner', 'front_desk', 'trainer'
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      password_hash TEXT,
      security_pin TEXT NOT NULL DEFAULT '1234',
      commission_rate REAL DEFAULT 5.0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Membership Plans
    CREATE TABLE IF NOT EXISTS membership_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      duration_months INTEGER NOT NULL,
      duration_days INTEGER NOT NULL,
      base_price REAL NOT NULL,
      gst_rate REAL DEFAULT 18.0,
      total_price REAL NOT NULL,
      is_off_peak INTEGER DEFAULT 0,
      off_peak_start TEXT DEFAULT '11:00',
      off_peak_end TEXT DEFAULT '16:00',
      pt_sessions_included INTEGER DEFAULT 0,
      max_freeze_days INTEGER DEFAULT 30,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Lockers
    CREATE TABLE IF NOT EXISTS lockers (
      id TEXT PRIMARY KEY,
      locker_number TEXT UNIQUE NOT NULL,
      zone TEXT NOT NULL DEFAULT 'Main Floor', -- 'Men Floor', 'Women Floor', 'VIP'
      status TEXT NOT NULL DEFAULT 'available', -- 'available', 'occupied', 'maintenance', 'expiring_soon'
      assigned_member_id TEXT,
      assigned_member_name TEXT,
      assigned_date DATE,
      expiry_date DATE,
      monthly_rent REAL DEFAULT 500.0
    );

    -- Members
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      member_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      photo_url TEXT,
      gender TEXT DEFAULT 'Male',
      dob DATE,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      fitness_goals TEXT DEFAULT 'Muscle Gain & Strength',
      medical_flags TEXT,
      plan_id TEXT,
      plan_name TEXT,
      start_date DATE NOT NULL,
      expiry_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'active', -- 'active', 'grace', 'expired', 'frozen'
      grace_days_allowed INTEGER DEFAULT 2,
      loyalty_points INTEGER DEFAULT 0,
      is_frozen INTEGER DEFAULT 0,
      freeze_start_date DATE,
      freeze_total_days_used INTEGER DEFAULT 0,
      assigned_trainer_id TEXT,
      assigned_locker_id TEXT,
      totp_secret TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_id) REFERENCES membership_plans(id),
      FOREIGN KEY (assigned_trainer_id) REFERENCES staff(id)
    );

    -- Attendance Check-ins
    CREATE TABLE IF NOT EXISTS checkins (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      member_code TEXT,
      member_name TEXT NOT NULL,
      photo_url TEXT,
      checkin_type TEXT NOT NULL DEFAULT 'qr_scan', -- 'qr_scan', 'manual'
      manual_checkin_by TEXT, -- staff ID who authorized
      manual_officer_name TEXT,
      points_awarded INTEGER DEFAULT 20,
      verification_status TEXT NOT NULL, -- 'granted', 're_entry', 'grace_entry', 'denied'
      denial_reason TEXT,
      checkin_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id)
    );

    -- Leads & Sales CRM
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      goal TEXT DEFAULT 'Fat Loss',
      budget REAL DEFAULT 3000,
      stage TEXT NOT NULL DEFAULT 'new_inquiry', -- 'new_inquiry', 'call_scheduled', 'trial_booked', 'trial_attended', 'price_negotiation', 'closed_won', 'closed_lost'
      trial_date DATE,
      trial_pass_code TEXT,
      assigned_staff_id TEXT,
      assigned_staff_name TEXT,
      source TEXT DEFAULT 'Walk-in',
      notes TEXT,
      lost_reason TEXT,
      last_contacted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_staff_id) REFERENCES staff(id)
    );

    -- Invoices & Billing
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      member_id TEXT,
      member_name TEXT NOT NULL,
      member_phone TEXT NOT NULL,
      item_type TEXT NOT NULL DEFAULT 'membership', -- 'membership', 'pos_retail', 'pt_package', 'locker_rental'
      item_description TEXT NOT NULL,
      subtotal REAL NOT NULL,
      cgst REAL NOT NULL,
      sgst REAL NOT NULL,
      discount_amount REAL DEFAULT 0,
      loyalty_points_redeemed INTEGER DEFAULT 0,
      loyalty_discount_value REAL DEFAULT 0,
      grand_total REAL NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'upi', -- 'upi', 'cash', 'card', 'net_banking'
      payment_ref TEXT,
      status TEXT NOT NULL DEFAULT 'paid', -- 'paid', 'pending', 'refunded'
      b2b_gstin TEXT,
      b2b_company_name TEXT,
      collected_by_staff_id TEXT,
      collected_by_staff_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- EOD Cash-in-Drawer Reconciliations
    CREATE TABLE IF NOT EXISTS cash_drawer_reconciliations (
      id TEXT PRIMARY KEY,
      reconciliation_date DATE NOT NULL,
      staff_id TEXT NOT NULL,
      staff_name TEXT NOT NULL,
      system_cash_expected REAL NOT NULL,
      physical_cash_counted REAL NOT NULL,
      discrepancy REAL NOT NULL,
      status TEXT NOT NULL, -- 'balanced', 'shortage', 'surplus'
      notes TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Retail POS Catalog
    CREATE TABLE IF NOT EXISTS pos_products (
      id TEXT PRIMARY KEY,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL, -- 'shakes', 'beverages', 'supplements', 'apparel', 'accessories'
      price REAL NOT NULL,
      cost_price REAL NOT NULL,
      stock_quantity INTEGER NOT NULL DEFAULT 50,
      image_emoji TEXT DEFAULT '🥤',
      is_active INTEGER DEFAULT 1
    );

    -- POS Sales Transactions
    CREATE TABLE IF NOT EXISTS pos_sales (
      id TEXT PRIMARY KEY,
      invoice_id TEXT,
      items_json TEXT NOT NULL,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'upi',
      staff_id TEXT,
      staff_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Gym System Settings
    CREATE TABLE IF NOT EXISTS gym_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- Member Device Session Bindings (Single-Device Anti-Sharing Protection)
    CREATE TABLE IF NOT EXISTS member_device_bindings (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      device_fingerprint TEXT NOT NULL,
      device_name TEXT NOT NULL,
      is_trusted INTEGER DEFAULT 1,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      bound_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id)
    );

    -- Workout Routines (Assigned Splits)
    CREATE TABLE IF NOT EXISTS workout_routines (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      day_name TEXT NOT NULL, -- 'Monday', 'Tuesday', 'Wednesday', etc.
      routine_title TEXT NOT NULL,
      assigned_by_trainer TEXT DEFAULT 'Coach Murugan S',
      estimated_duration_min INTEGER DEFAULT 60,
      target_muscle_groups TEXT DEFAULT 'Full Body',
      FOREIGN KEY (member_id) REFERENCES members(id)
    );

    -- Workout Routine Exercises
    CREATE TABLE IF NOT EXISTS workout_exercises (
      id TEXT PRIMARY KEY,
      routine_id TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      category TEXT DEFAULT 'Strength',
      target_sets INTEGER DEFAULT 4,
      target_reps TEXT DEFAULT '8-12 reps',
      rest_seconds INTEGER DEFAULT 60,
      previous_pr TEXT DEFAULT 'None',
      order_idx INTEGER DEFAULT 1,
      FOREIGN KEY (routine_id) REFERENCES workout_routines(id)
    );

    -- Member In-Gym Workout Log & PR History
    CREATE TABLE IF NOT EXISTS workout_logs (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      set_number INTEGER NOT NULL,
      weight_kg REAL NOT NULL,
      reps INTEGER NOT NULL,
      is_pr INTEGER DEFAULT 0,
      logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id)
    );

    -- Nutrition & Diet Plans
    CREATE TABLE IF NOT EXISTS diet_plans (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      daily_calories INTEGER DEFAULT 2400,
      protein_grams INTEGER DEFAULT 160,
      carbs_grams INTEGER DEFAULT 260,
      fats_grams INTEGER DEFAULT 65,
      water_liters REAL DEFAULT 3.5,
      diet_type TEXT DEFAULT 'High-Protein Muscle Building',
      FOREIGN KEY (member_id) REFERENCES members(id)
    );

    -- Diet Meals & Macro Trackers
    CREATE TABLE IF NOT EXISTS diet_meals (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL,
      meal_name TEXT NOT NULL,
      time_hint TEXT,
      food_items TEXT NOT NULL,
      calories INTEGER NOT NULL,
      protein_grams INTEGER NOT NULL,
      carbs_grams INTEGER NOT NULL,
      fats_grams INTEGER NOT NULL,
      is_eaten INTEGER DEFAULT 0,
      order_idx INTEGER DEFAULT 1,
      FOREIGN KEY (plan_id) REFERENCES diet_plans(id)
    );

    -- Gym Notice Board Announcements
    CREATE TABLE IF NOT EXISTS gym_notices (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT DEFAULT 'Announcement',
      badge TEXT DEFAULT 'Official Notice',
      content TEXT NOT NULL,
      published_date DATE NOT NULL,
      is_active INTEGER DEFAULT 1
    );

    -- Expenses Tracking (Gym Owner Profit & Loss Engine)
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL, -- 'Rent', 'Electricity (TNEB)', 'Trainer Salaries', 'Equipment Maintenance', 'Cleaning & Sanitation', 'Supplements Stock', 'Marketing & Ads', 'Internet & Utilities', 'Other'
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'upi', -- 'cash', 'upi', 'bank_transfer', 'cheque'
      payment_ref TEXT,
      expense_date DATE NOT NULL,
      vendor_name TEXT,
      notes TEXT,
      logged_by TEXT DEFAULT 'Karthik Raja (Owner)',
      receipt_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- PT Sessions Tracking & Anti-Fraud Punch-In
    CREATE TABLE IF NOT EXISTS pt_sessions (
      id TEXT PRIMARY KEY,
      trainer_id TEXT NOT NULL,
      trainer_name TEXT NOT NULL,
      member_id TEXT NOT NULL,
      member_name TEXT NOT NULL,
      session_number INTEGER NOT NULL,
      verification_code TEXT NOT NULL,
      focus_area TEXT NOT NULL,
      notes TEXT,
      commission_earned REAL NOT NULL DEFAULT 50.0,
      status TEXT NOT NULL DEFAULT 'verified',
      session_date DATE NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trainer_id) REFERENCES staff(id),
      FOREIGN KEY (member_id) REFERENCES members(id)
    );

    -- Floor Coaching Check-ins (Trainer In-Gym Floor Presence)
    CREATE TABLE IF NOT EXISTS floor_checkins (
      id TEXT PRIMARY KEY,
      trainer_id TEXT NOT NULL,
      member_id TEXT NOT NULL,
      checkin_date DATE NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trainer_id) REFERENCES staff(id),
      FOREIGN KEY (member_id) REFERENCES members(id)
    );

    -- Workout Program Master Templates
    CREATE TABLE IF NOT EXISTS workout_templates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty TEXT DEFAULT 'Intermediate',
      target_days INTEGER DEFAULT 4,
      description TEXT,
      exercises_json TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    );

    -- Nutrition Master Templates
    CREATE TABLE IF NOT EXISTS diet_templates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      diet_type TEXT NOT NULL,
      calories INTEGER NOT NULL,
      protein INTEGER NOT NULL,
      carbs INTEGER NOT NULL,
      fats INTEGER NOT NULL,
      description TEXT,
      meals_json TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    );

    -- Platform Admin Audit Logs (Impersonation, Credential Reset, Status Change, Broadcasts)
    CREATE TABLE IF NOT EXISTS platform_audit_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      action TEXT NOT NULL,
      target_gym_id TEXT,
      target_user_id TEXT,
      details_json TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Global Platform Broadcasts (HQ Announcements to all gyms)
    CREATE TABLE IF NOT EXISTS platform_broadcasts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'critical'
      is_active INTEGER NOT NULL DEFAULT 1,
      target_audience TEXT NOT NULL DEFAULT 'all', -- 'all', 'owners', 'trainers'
      created_by TEXT NOT NULL DEFAULT 'healthyhowlz_admin',
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Phase 2: SaaS Subscriptions & B2B GST Invoices for Gym Tenants
    CREATE TABLE IF NOT EXISTS saas_invoices (
      id TEXT PRIMARY KEY,
      gym_id TEXT NOT NULL,
      gym_name TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      invoice_number TEXT UNIQUE NOT NULL,
      amount_base REAL NOT NULL,
      gst_rate REAL DEFAULT 18.0,
      gst_amount REAL NOT NULL,
      total_amount REAL NOT NULL,
      payment_mode TEXT NOT NULL DEFAULT 'upi', -- 'upi', 'neft', 'cash', 'cheque'
      reference_number TEXT,
      billing_period_start DATE NOT NULL,
      billing_period_end DATE NOT NULL,
      duration_months INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'paid', -- 'paid', 'pending', 'waived'
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (gym_id) REFERENCES gyms(id)
    );

    -- Phase 3: In-App Support Tickets & Floor Dispute Resolution
    CREATE TABLE IF NOT EXISTS platform_support_tickets (
      id TEXT PRIMARY KEY,
      ticket_number TEXT UNIQUE NOT NULL,
      gym_id TEXT NOT NULL,
      gym_name TEXT NOT NULL,
      requester_id TEXT NOT NULL,
      requester_name TEXT NOT NULL,
      requester_role TEXT NOT NULL DEFAULT 'owner',
      category TEXT NOT NULL DEFAULT 'technical', -- 'technical', 'billing', 'hardware', 'dispute'
      priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'resolved'
      assigned_to TEXT DEFAULT 'HealthyHowlz HQ Admin',
      resolution_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (gym_id) REFERENCES gyms(id)
    );

    -- Phase 3: Kiosk & Hardware Heartbeat Telemetry
    CREATE TABLE IF NOT EXISTS platform_kiosk_heartbeats (
      id TEXT PRIMARY KEY,
      gym_id TEXT UNIQUE NOT NULL,
      device_name TEXT DEFAULT 'Front Desk iPad/Tablet',
      ip_address TEXT,
      camera_status TEXT DEFAULT 'active', -- 'active', 'idle', 'offline', 'permission_denied'
      offline_queue_count INTEGER DEFAULT 0,
      last_ping_ms INTEGER DEFAULT 24,
      status TEXT DEFAULT 'online', -- 'online', 'unstable', 'offline'
      last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (gym_id) REFERENCES gyms(id)
    );
  `);

  // Ensure newer columns exist on existing tables
  await ensureColumn(db, 'gyms', 'valid_until', "DATE DEFAULT (date('now', '+30 days'))");
  await ensureColumn(db, 'gyms', 'grace_period_days', 'INTEGER DEFAULT 5');
  await ensureColumn(db, 'staff', 'base_salary', 'REAL DEFAULT 15000.0');
  await ensureColumn(db, 'members', 'pt_sessions_total', 'INTEGER DEFAULT 0');
  await ensureColumn(db, 'members', 'pt_sessions_remaining', 'INTEGER DEFAULT 0');
  await ensureColumn(db, 'members', 'pt_session_pin', "TEXT DEFAULT '4821'");

  // Multi-tenant SaaS columns (gym_id)
  await ensureColumn(db, 'staff', 'gym_id', "TEXT DEFAULT 'gym-gudiyatham'");
  await ensureColumn(db, 'members', 'gym_id', "TEXT DEFAULT 'gym-gudiyatham'");
  await ensureColumn(db, 'membership_plans', 'gym_id', "TEXT DEFAULT 'gym-gudiyatham'");
  await ensureColumn(db, 'lockers', 'gym_id', "TEXT DEFAULT 'gym-gudiyatham'");
  await ensureColumn(db, 'checkins', 'gym_id', "TEXT DEFAULT 'gym-gudiyatham'");
  await ensureColumn(db, 'leads', 'gym_id', "TEXT DEFAULT 'gym-gudiyatham'");
  await ensureColumn(db, 'invoices', 'gym_id', "TEXT DEFAULT 'gym-gudiyatham'");
  await ensureColumn(db, 'expenses', 'gym_id', "TEXT DEFAULT 'gym-gudiyatham'");
  await ensureColumn(db, 'pos_products', 'gym_id', "TEXT DEFAULT 'gym-gudiyatham'");
  await ensureColumn(db, 'pos_sales', 'gym_id', "TEXT DEFAULT 'gym-gudiyatham'");
  await ensureColumn(db, 'workout_routines', 'gym_id', "TEXT DEFAULT 'gym-gudiyatham'");
  await ensureColumn(db, 'diet_plans', 'gym_id', "TEXT DEFAULT 'gym-gudiyatham'");
  await ensureColumn(db, 'pt_sessions', 'gym_id', "TEXT DEFAULT 'gym-gudiyatham'");
  await ensureColumn(db, 'floor_checkins', 'gym_id', "TEXT DEFAULT 'gym-gudiyatham'");
  await ensureColumn(db, 'gym_notices', 'gym_id', "TEXT DEFAULT 'gym-gudiyatham'");
  await ensureColumn(db, 'cash_drawer_reconciliations', 'gym_id', "TEXT DEFAULT 'gym-gudiyatham'");
}

async function ensureColumn(db, table, column, definition) {
  try {
    const cols = await db.all(`PRAGMA table_info(${table})`);
    if (!cols.some(c => c.name === column)) {
      await db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
  } catch (err) {
    // Column might already exist or PRAGMA error
  }
}

