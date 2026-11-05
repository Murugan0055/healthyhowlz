import { getDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

export async function verifyQrToken(tokenString, targetGymId = null) {
  const db = await getDb();
  let memberIdentifier = tokenString?.trim();

  // Support JSON payload if dynamic rotating QR was used
  if (tokenString.startsWith('{') && tokenString.endsWith('}')) {
    try {
      const parsed = JSON.parse(tokenString);
      memberIdentifier = parsed.code || parsed.memberId || parsed.id || memberIdentifier;
    } catch (e) {
      // fallback to plain string
    }
  }

  // Lookup member (scoped by gym if provided)
  let lookupQuery = `SELECT m.*, p.name as plan_title 
     FROM members m 
     LEFT JOIN membership_plans p ON m.plan_id = p.id 
     WHERE (m.id = ? OR m.member_code = ? OR m.phone = ?)`;
  const lookupParams = [memberIdentifier, memberIdentifier, memberIdentifier];

  if (targetGymId && targetGymId !== 'all') {
    lookupQuery += ` AND m.gym_id = ?`;
    lookupParams.push(targetGymId);
  }

  let member = await db.get(lookupQuery, lookupParams);

  // If not found in target gym, try global lookup as fallback
  if (!member && targetGymId) {
    member = await db.get(
      `SELECT m.*, p.name as plan_title 
       FROM members m 
       LEFT JOIN membership_plans p ON m.plan_id = p.id 
       WHERE m.id = ? OR m.member_code = ? OR m.phone = ?`,
      [memberIdentifier, memberIdentifier, memberIdentifier]
    );
  }

  if (!member) {
    return {
      status: 'denied',
      color: 'red',
      badge: 'NOT_FOUND',
      title: 'Member Not Found',
      message: 'Unrecognized QR pass. Please scan a registered member pass or use manual check-in.',
      alertSound: 'error_buzzer',
      member: null
    };
  }

  return processMemberCheckin(db, member, 'qr_scan', null, null, null, targetGymId);
}

export async function verifyManualCheckin({ query, officerPin, staffId, gymId = null }) {
  const db = await getDb();

  // 1. Verify Officer PIN
  let officer = null;
  if (staffId) {
    officer = await db.get('SELECT * FROM staff WHERE id = ? AND security_pin = ? AND is_active = 1', [staffId, officerPin]);
  }
  if (!officer) {
    // Check against any staff or settings
    officer = await db.get('SELECT * FROM staff WHERE security_pin = ? AND is_active = 1', [officerPin]);
  }
  if (!officer) {
    const masterPinSetting = await db.get("SELECT value FROM gym_settings WHERE key = 'officer_master_pin'");
    if (masterPinSetting && masterPinSetting.value === officerPin) {
      officer = { id: 'master-override', name: 'Duty Officer (Master PIN)', role: 'front_desk' };
    }
  }

  if (!officer) {
    return {
      success: false,
      error: 'INVALID_PIN',
      message: 'Invalid 4-digit Officer Security PIN. Manual check-in authorization denied.'
    };
  }

  // 2. Lookup member by query (name, phone, code). If query is empty/cleared, return all members.
  const cleanQuery = (query || '').trim();
  let membersQuery = `
    SELECT m.*, p.name as plan_title 
    FROM members m 
    LEFT JOIN membership_plans p ON m.plan_id = p.id
    WHERE 1=1
  `;
  const params = [];

  if (gymId && gymId !== 'all') {
    membersQuery += ` AND m.gym_id = ?`;
    params.push(gymId);
  }

  if (cleanQuery) {
    membersQuery += ` AND (m.member_code LIKE ? OR m.name LIKE ? OR m.phone LIKE ?)`;
    params.push(`%${cleanQuery}%`, `%${cleanQuery}%`, `%${cleanQuery}%`);
  }

  membersQuery += ` ORDER BY m.name ASC LIMIT 50`;
  const members = await db.all(membersQuery, params);

  return {
    success: true,
    officer: { id: officer.id, name: officer.name, role: officer.role },
    members
  };
}

export async function confirmManualCheckin({ memberId, officerId, officerName, notes, gymId = null }) {
  const db = await getDb();
  const member = await db.get(
    `SELECT m.*, p.name as plan_title 
     FROM members m 
     LEFT JOIN membership_plans p ON m.plan_id = p.id 
     WHERE m.id = ?`,
    [memberId]
  );

  if (!member) {
    return {
      status: 'denied',
      color: 'red',
      badge: 'NOT_FOUND',
      title: 'Member Not Found',
      message: 'Member record does not exist.',
      alertSound: 'error_buzzer'
    };
  }

  return processMemberCheckin(db, member, 'manual', officerId, officerName, notes, gymId);
}

async function processMemberCheckin(db, member, checkinType, officerId = null, officerName = null, notes = null, targetGymId = null) {
  const gymId = targetGymId || member.gym_id || 'gym-gudiyatham';
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const expiryDate = new Date(member.expiry_date);
  const diffTime = expiryDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Check Settings
  const graceSetting = await db.get("SELECT value FROM gym_settings WHERE key = 'grace_period_days'");
  const graceDaysAllowed = graceSetting ? parseInt(graceSetting.value, 10) : 2;

  const pointsSetting = await db.get("SELECT value FROM gym_settings WHERE key = 'daily_attendance_points'");
  const dailyPoints = pointsSetting ? parseInt(pointsSetting.value, 10) : 20;

  // 1. Account Frozen Check
  if (member.is_frozen === 1 || member.status === 'frozen') {
    const checkinId = uuidv4();
    await db.run(
      `INSERT INTO checkins (id, member_id, member_code, member_name, photo_url, checkin_type, manual_checkin_by, manual_officer_name, points_awarded, verification_status, denial_reason, checkin_time, gym_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), ?)`,
      [checkinId, member.id, member.member_code, member.name, member.photo_url, checkinType, officerId, officerName, 0, 'denied', 'Account Frozen', gymId]
    );

    return {
      status: 'denied',
      color: 'red',
      badge: 'ACCOUNT_FROZEN',
      title: 'Access Blocked — Membership Frozen',
      message: `Account is currently frozen since ${member.freeze_start_date || 'recently'}. Please unfreeze from Admin dashboard to resume workouts.`,
      alertSound: 'error_buzzer',
      member: {
        id: member.id,
        code: member.member_code,
        name: member.name,
        photo_url: member.photo_url,
        plan_name: member.plan_name || member.plan_title,
        status: 'frozen',
        daysRemaining: 0,
        loyalty_points: member.loyalty_points,
        phone: member.phone,
        gym_id: gymId
      }
    };
  }

  // 2. Overdue / Expired Check
  if (daysRemaining < 0) {
    const daysOverdue = Math.abs(daysRemaining);

    if (daysOverdue <= graceDaysAllowed) {
      // Within Grace Period!
      // Check if already checked in today
      const alreadyCheckedIn = await db.get(
        `SELECT * FROM checkins 
         WHERE member_id = ? AND date(checkin_time) = date('now', 'localtime') AND verification_status IN ('granted', 'grace_entry', 're_entry')`,
        [member.id]
      );

      const checkinId = uuidv4();
      await db.run(
        `INSERT INTO checkins (id, member_id, member_code, member_name, photo_url, checkin_type, manual_checkin_by, manual_officer_name, points_awarded, verification_status, denial_reason, checkin_time, gym_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), ?)`,
        [checkinId, member.id, member.member_code, member.name, member.photo_url, checkinType, officerId, officerName, 0, 'grace_entry', `Grace Entry (${daysOverdue} day overdue)`, gymId]
      );

      return {
        status: 'grace_entry',
        color: 'yellow',
        badge: 'GRACE_PERIOD',
        title: 'Floor Entry Permitted (Grace Window)',
        message: `Plan expired ${daysOverdue} day ago. Permitted under ${graceDaysAllowed}-day grace window. Remind member to settle dues today.`,
        alertSound: 'warning_beep',
        pointsAwarded: 0,
        member: {
          id: member.id,
          code: member.member_code,
          name: member.name,
          photo_url: member.photo_url,
          plan_name: member.plan_name || member.plan_title,
          status: 'grace',
          daysRemaining: -daysOverdue,
          loyalty_points: member.loyalty_points,
          phone: member.phone,
          gym_id: gymId
        }
      };
    } else {
      // Blocked / Red Screen
      const checkinId = uuidv4();
      await db.run(
        `INSERT INTO checkins (id, member_id, member_code, member_name, photo_url, checkin_type, manual_checkin_by, manual_officer_name, points_awarded, verification_status, denial_reason, checkin_time, gym_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), ?)`,
        [checkinId, member.id, member.member_code, member.name, member.photo_url, checkinType, officerId, officerName, 0, 'denied', `Membership Expired (${daysOverdue} days ago)`, gymId]
      );

      return {
        status: 'denied',
        color: 'red',
        badge: 'EXPIRED',
        title: 'Access Blocked — Plan Expired',
        message: `Membership expired ${daysOverdue} days ago on ${member.expiry_date}. Please collect renewal dues to reactivate.`,
        alertSound: 'error_buzzer',
        canRenew: true,
        member: {
          id: member.id,
          code: member.member_code,
          name: member.name,
          photo_url: member.photo_url,
          plan_name: member.plan_name || member.plan_title,
          status: 'expired',
          daysRemaining: -daysOverdue,
          loyalty_points: member.loyalty_points,
          phone: member.phone,
          gym_id: gymId
        }
      };
    }
  }

  // 3. Active Membership: Check if already checked in today (Re-entry vs First Entry)
  const existingToday = await db.get(
    `SELECT * FROM checkins 
     WHERE member_id = ? AND date(checkin_time) = date('now', 'localtime') AND verification_status IN ('granted', 're_entry')`,
    [member.id]
  );

  if (existingToday) {
    // Re-entry permitted (0 points credited, Blue Screen)
    const checkinId = uuidv4();
    await db.run(
      `INSERT INTO checkins (id, member_id, member_code, member_name, photo_url, checkin_type, manual_checkin_by, manual_officer_name, points_awarded, verification_status, checkin_time, gym_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), ?)`,
      [checkinId, member.id, member.member_code, member.name, member.photo_url, checkinType, officerId, officerName, 0, 're_entry', gymId]
    );

    return {
      status: 're_entry',
      color: 'blue',
      badge: 'RE_ENTRY',
      title: 'Already Logged Today — Re-Entry Granted',
      message: 'Attendance already counted for today. 0 points credited.',
      alertSound: 'info_tone',
      pointsAwarded: 0,
      member: {
        id: member.id,
        code: member.member_code,
        name: member.name,
        photo_url: member.photo_url,
        plan_name: member.plan_name || member.plan_title,
        status: 'active',
        daysRemaining,
        loyalty_points: member.loyalty_points,
        phone: member.phone,
        gym_id: gymId
      }
    };
  }

  // 4. Valid Active First Check-in (+20 Points, Green Screen)
  const newPoints = (member.loyalty_points || 0) + dailyPoints;
  await db.run('UPDATE members SET loyalty_points = ? WHERE id = ?', [newPoints, member.id]);

  const checkinId = uuidv4();
  await db.run(
    `INSERT INTO checkins (id, member_id, member_code, member_name, photo_url, checkin_type, manual_checkin_by, manual_officer_name, points_awarded, verification_status, checkin_time, gym_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), ?)`,
    [checkinId, member.id, member.member_code, member.name, member.photo_url, checkinType, officerId, officerName, dailyPoints, 'granted', gymId]
  );

  return {
    status: 'granted',
    color: 'green',
    badge: 'SUCCESS',
    title: `+${dailyPoints} Loyalty Points Credited!`,
    message: `Welcome to Elite Gym! Valid ${member.plan_name || member.plan_title}.`,
    alertSound: 'success_chime',
    pointsAwarded: dailyPoints,
    member: {
      id: member.id,
      code: member.member_code,
      name: member.name,
      photo_url: member.photo_url,
      plan_name: member.plan_name || member.plan_title,
      status: 'active',
      daysRemaining,
      loyalty_points: newPoints,
      phone: member.phone,
      gym_id: gymId
    }
  };
}

export async function getFloorRushMeter(gymId) {
  const db = await getDb();
  const filterGym = gymId && gymId !== 'all';
  const gymClause = filterGym ? ' AND gym_id = ?' : '';
  const gymParams = filterGym ? [gymId] : [];

  // Count checkins in the last 90 minutes
  const row = await db.get(
    `SELECT COUNT(*) as active_now 
     FROM checkins 
     WHERE checkin_time >= datetime('now', '-90 minutes', 'localtime') 
       AND verification_status IN ('granted', 're_entry', 'grace_entry')${gymClause}`,
    gymParams
  );

  const count = row ? row.active_now : 0;
  let level = 'Light';
  let badgeColor = 'emerald';
  let capacityPercent = Math.min(Math.round((count / 50) * 100), 100);

  if (count >= 30) {
    level = 'Peak Rush';
    badgeColor = 'rose';
  } else if (count >= 15) {
    level = 'Moderate';
    badgeColor = 'amber';
  }

  return {
    count,
    level,
    badgeColor,
    capacityPercent,
    maxRecommendedCapacity: 50,
    timestamp: new Date().toISOString()
  };
}

export async function getRecentCheckins(limit = 15, gymId) {
  const db = await getDb();
  const filterGym = gymId && gymId !== 'all';
  const query = filterGym
    ? `SELECT * FROM checkins WHERE gym_id = ? ORDER BY checkin_time DESC LIMIT ?`
    : `SELECT * FROM checkins ORDER BY checkin_time DESC LIMIT ?`;
  const params = filterGym ? [gymId, limit] : [limit];
  return await db.all(query, params);
}

