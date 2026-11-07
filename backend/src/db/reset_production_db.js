import { getDb } from './database.js';
import { seedDatabase } from './seed.js';

export async function resetToFreshProduction() {
  const db = await getDb();
  console.log('🧹 Purging all mock and seeded operational data for fresh production slate...');

  await db.run('PRAGMA foreign_keys = OFF;');

  const tablesToClear = [
    'gyms',
    'members',
    'checkins',
    'leads',
    'invoices',
    'saas_invoices',
    'expenses',
    'lockers',
    'pos_products',
    'pos_sales',
    'workout_routines',
    'workout_exercises',
    'workout_logs',
    'diet_plans',
    'diet_meals',
    'member_device_bindings',
    'pt_sessions',
    'floor_checkins',
    'gym_notices',
    'cash_drawer_reconciliations',
    'platform_audit_logs',
    'platform_broadcasts',
    'platform_support_tickets',
    'platform_kiosk_heartbeats'
  ];

  for (const table of tablesToClear) {
    try {
      await db.run(`DELETE FROM ${table}`);
      console.log(`   - Cleared ${table}`);
    } catch (e) {
      console.warn(`   - Note: table ${table} skipped or not present: ${e.message}`);
    }
  }

  // Clear all non-system staff (remove mock trainers, receptionists, demo gym owners)
  await db.run(`DELETE FROM staff WHERE role NOT IN ('super_admin', 'platform_admin')`);
  console.log('   - Cleared all non-platform demo staff accounts');

  await db.run('PRAGMA foreign_keys = ON;');

  // Now seed the clean production foundation
  await seedDatabase();

  // Run SQLite VACUUM to reclaim space and optimize fresh production DB
  try {
    await db.run('VACUUM;');
    console.log('   - Database VACUUM complete.');
  } catch (e) { }

  console.log('✨ Database successfully reset to fresh, production-ready state!');
}

if (process.argv[1] && process.argv[1].endsWith('reset_production_db.js')) {
  resetToFreshProduction()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Reset error:', err);
      process.exit(1);
    });
}

