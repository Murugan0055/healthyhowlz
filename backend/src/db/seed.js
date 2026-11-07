import { getDb } from './database.js';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  const db = await getDb();

  console.log('🌱 Syncing HealthyHowlz Production Database foundation...');
  await db.run('PRAGMA foreign_keys = OFF;');

  const hashedPw = await bcrypt.hash('admin123', 10);

  // 1. Root Platform Super Admin & Platform Admin
  const systemAdmins = [
    {
      id: 'staff-super-admin',
      name: 'Super Admin (Root System)',
      role: 'super_admin',
      phone: '9999999999',
      email: 'superadmin@healthyhowlz.com',
      password_hash: hashedPw,
      security_pin: '9999',
      commission_rate: 0.0,
      gym_id: null
    },
    {
      id: 'staff-platform-admin',
      name: 'HealthyHowlz HQ Admin',
      role: 'platform_admin',
      phone: '8888888888',
      email: 'hq@healthyhowlz.com',
      password_hash: hashedPw,
      security_pin: '8888',
      commission_rate: 0.0,
      gym_id: null
    }
  ];

  for (const s of systemAdmins) {
    const existing = await db.get('SELECT id FROM staff WHERE id = ?', [s.id]);
    if (!existing) {
      await db.run(
        `INSERT INTO staff (id, name, role, phone, email, password_hash, security_pin, commission_rate, base_salary, gym_id, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0.0, ?, 1)`,
        [s.id, s.name, s.role, s.phone, s.email, s.password_hash, s.security_pin, s.commission_rate, s.gym_id]
      );
    } else {
      await db.run(
        `UPDATE staff 
         SET name = ?, role = ?, phone = ?, email = ?, password_hash = ?, security_pin = ?, gym_id = NULL, is_active = 1
         WHERE id = ?`,
        [s.name, s.role, s.phone, s.email, s.password_hash, s.security_pin, s.id]
      );
    }
  }

  // 2. Official Platform Membership Plan Templates
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

  // 3. Platform Settings
  const defaultSettings = [
    ['platform_name', 'HealthyHowlz Fitness OS'],
    ['platform_version', '2.5.0-SaaS'],
    ['officer_master_pin', '1234'],
    ['grace_period_days', '2'],
    ['daily_attendance_points', '20'],
    ['points_per_rupee', '50'], // 50 points = 1 INR
    ['point_rupee_value', '0.02'], // 1 point = 0.02 INR
    ['max_loyalty_redemption_percent', '15.0']
  ];

  for (const [k, v] of defaultSettings) {
    const existing = await db.get('SELECT key FROM gym_settings WHERE key = ?', [k]);
    if (!existing) {
      await db.run('INSERT INTO gym_settings (key, value) VALUES (?, ?)', [k, v]);
    } else {
      await db.run('UPDATE gym_settings SET value = ? WHERE key = ?', [v, k]);
    }
  }

  // 4. Workout Program Master Templates (Standard Program Library)
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

  // 5. Nutrition Master Templates (Standard Program Library)
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

  await db.run('PRAGMA foreign_keys = ON;');
  console.log('✅ HealthyHowlz Production Database foundation synchronized (Clean Production Slate).');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().catch((err) => {
    console.error('Seed error:', err.stack || err);
    process.exit(1);
  });
}
