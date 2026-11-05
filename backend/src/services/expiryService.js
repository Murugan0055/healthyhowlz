import { getDb } from '../db/database.js';

export async function getExpiryAlertQueue() {
  const db = await getDb();

  // Query members with days remaining <= 7 and >= -2 (active or grace)
  const query = `
    SELECT m.*, p.name as plan_title, p.total_price as plan_price,
           CAST(julianday(m.expiry_date) - julianday('now', 'localtime') AS INT) as days_left
    FROM members m
    LEFT JOIN membership_plans p ON m.plan_id = p.id
    WHERE m.status IN ('active', 'grace')
      AND CAST(julianday(m.expiry_date) - julianday('now', 'localtime') AS INT) BETWEEN -2 AND 7
    ORDER BY days_left ASC
  `;

  const members = await db.all(query);

  const tier1EarlyBird = []; // 7 to 4 days
  const tier2Urgent = [];    // 3 to 1 days
  const tier3FinalNotice = []; // 0 to -2 days (due/grace)

  for (const mem of members) {
    const days = mem.days_left;
    const cleanPhone = (mem.phone || '').replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const upiLink = `upi://pay?pa=elitegymgudiyatham@okaxis&pn=Elite%20Fitness%20Center&am=${mem.plan_price || 6500}&cu=INR`;

    let tier = 'tier-1';
    let alertTitle = '7-Day Early Bird Alert';
    let messageText = '';

    if (days >= 4) {
      tier = 'tier-1';
      alertTitle = '7-Day Early Bird Alert';
      messageText = encodeURIComponent(
        `⭐ *Elite Fitness Gudiyatham — Early Bird Renewal Reminder*\n\n` +
        `Hello ${mem.name},\n` +
        `Your membership (${mem.plan_name || mem.plan_title}) is due for renewal in *${days} days* on ${mem.expiry_date}.\n\n` +
        `🎁 *Early Bird Loyalty Bonus:*\n` +
        `Renew before your expiry to lock in your current rate AND receive *200 bonus loyalty credits* added to your wallet!\n\n` +
        `Tap below or visit front desk to renew today.`
      );
    } else if (days >= 1) {
      tier = 'tier-2';
      alertTitle = '3-Day Urgent Renewal Reminder';
      messageText = encodeURIComponent(
        `⚠️ *Elite Fitness Gudiyatham — Urgent Renewal Notice*\n\n` +
        `Hello ${mem.name},\n` +
        `Your gym access expires in *${days} days* (${mem.expiry_date})!\n\n` +
        `To avoid workout interruption and maintain your streak, renew directly via UPI:\n` +
        `👉 UPI ID: *elitegymgudiyatham@okaxis*\n` +
        `Amount: ₹${mem.plan_price || 6500}\n\n` +
        `Or tap here to pay: ${upiLink}\n` +
        `Please share transaction screenshot with us to instantly extend your access.`
      );
    } else {
      tier = 'tier-3';
      alertTitle = days === 0 ? 'Day of Expiry Notice' : 'Overdue Grace Period Notice';
      messageText = encodeURIComponent(
        `🚨 *Elite Fitness Gudiyatham — Action Required: Membership Expired*\n\n` +
        `Hello ${mem.name},\n` +
        `Your membership expired on ${mem.expiry_date}.\n` +
        `Your current 2-day grace window is active. Please renew today to prevent entry block at the reception scanner.\n\n` +
        `👉 Quick UPI Pay: ${upiLink}\n` +
        `Our team is ready to assist you at the front desk.`
      );
    }

    const payload = {
      ...mem,
      tier,
      alertTitle,
      days_left: days,
      whatsappLink: `https://wa.me/${phoneWithCountry}?text=${messageText}`
    };

    if (tier === 'tier-1') tier1EarlyBird.push(payload);
    else if (tier === 'tier-2') tier2Urgent.push(payload);
    else tier3FinalNotice.push(payload);
  }

  return {
    tier1EarlyBird,
    tier2Urgent,
    tier3FinalNotice,
    totalCount: members.length
  };
}

export async function freezeMembership(memberId, freezeDays = 15, reason = 'Personal/Medical Travel') {
  const db = await getDb();
  const member = await db.get('SELECT * FROM members WHERE id = ?', [memberId]);

  if (!member) {
    throw new Error('Member not found');
  }

  if (member.is_frozen === 1) {
    throw new Error('Member plan is already currently frozen.');
  }

  const maxAllowedFreeze = 30;
  const currentUsed = member.freeze_total_days_used || 0;
  if (currentUsed + freezeDays > maxAllowedFreeze) {
    throw new Error(`Exceeds maximum yearly freeze quota of ${maxAllowedFreeze} days. You have only ${maxAllowedFreeze - currentUsed} days remaining.`);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  await db.run(
    `UPDATE members 
     SET status = 'frozen', is_frozen = 1, freeze_start_date = ?, freeze_total_days_used = ? 
     WHERE id = ?`,
    [todayStr, currentUsed + freezeDays, memberId]
  );

  return {
    success: true,
    memberId,
    status: 'frozen',
    freezeStartDate: todayStr,
    freezeDaysAdded: freezeDays,
    totalFreezeUsed: currentUsed + freezeDays,
    remainingAllowed: maxAllowedFreeze - (currentUsed + freezeDays)
  };
}

export async function unfreezeMembership(memberId) {
  const db = await getDb();
  const member = await db.get('SELECT * FROM members WHERE id = ?', [memberId]);

  if (!member) {
    throw new Error('Member not found');
  }

  if (member.is_frozen !== 1) {
    throw new Error('Member plan is not currently frozen.');
  }

  // Calculate days frozen
  const freezeStart = member.freeze_start_date ? new Date(member.freeze_start_date) : new Date();
  const now = new Date();
  const daysFrozen = Math.max(1, Math.round((now.getTime() - freezeStart.getTime()) / (1000 * 3600 * 24)));

  // Shift expiry date forward by daysFrozen
  const currentExpiry = new Date(member.expiry_date);
  currentExpiry.setDate(currentExpiry.getDate() + daysFrozen);
  const newExpiryStr = currentExpiry.toISOString().split('T')[0];

  await db.run(
    `UPDATE members 
     SET status = 'active', is_frozen = 0, freeze_start_date = NULL, expiry_date = ? 
     WHERE id = ?`,
    [newExpiryStr, memberId]
  );

  return {
    success: true,
    memberId,
    status: 'active',
    daysFrozenPushed: daysFrozen,
    newExpiryDate: newExpiryStr
  };
}

