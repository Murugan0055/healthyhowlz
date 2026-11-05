import { getDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

export async function getKanbanLeads() {
  const db = await getDb();
  const leads = await db.all('SELECT * FROM leads ORDER BY created_at DESC');

  const now = Date.now();
  const processedLeads = leads.map((lead) => {
    const lastContactTime = lead.last_contacted_at ? new Date(lead.last_contacted_at).getTime() : new Date(lead.created_at).getTime();
    const hoursSinceContact = (now - lastContactTime) / (1000 * 3600);

    let urgency = 'green';
    let urgencyLabel = '< 2h fresh';
    if (hoursSinceContact > 24) {
      urgency = 'red';
      urgencyLabel = '> 24h Overdue!';
    } else if (hoursSinceContact >= 2) {
      urgency = 'amber';
      urgencyLabel = '2-24h pending';
    }

    // Format WhatsApp prefilled links
    const cleanPhone = (lead.phone || '').replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const trialPassMessage = encodeURIComponent(
      `🏋️ *Elite Fitness Center Gudiyatham — 1-Day VIP Guest Pass*\n\n` +
      `Hello ${lead.name}!\n` +
      `Your complimentary 1-Day Trial Pass is ready!\n\n` +
      `🎟️ *Pass Code:* ${lead.trial_pass_code || 'ELITE-GUEST-2026'}\n` +
      `🎯 *Your Fitness Goal:* ${lead.goal || 'General Fitness'}\n` +
      `📍 *Location:* Katpadi Main Road, Near New Bus Stand, Gudiyatham.\n\n` +
      `Show this pass at reception to begin your workout. We look forward to welcoming you!`
    );

    const waLink = `https://wa.me/${phoneWithCountry}?text=${trialPassMessage}`;

    return {
      ...lead,
      urgency,
      urgencyLabel,
      hoursSinceContact: Math.round(hoursSinceContact * 10) / 10,
      whatsappLink: waLink
    };
  });

  const stages = [
    { id: 'new_inquiry', label: 'New Inquiry', icon: 'Sparkles' },
    { id: 'call_scheduled', label: 'Call Scheduled', icon: 'PhoneCall' },
    { id: 'trial_booked', label: 'Free Trial Booked', icon: 'Calendar' },
    { id: 'trial_attended', label: 'Trial Attended', icon: 'CheckCircle' },
    { id: 'price_negotiation', label: 'Price Negotiation', icon: 'TrendingUp' },
    { id: 'closed_won', label: 'Closed Won 🎉', icon: 'Award' },
    { id: 'closed_lost', label: 'Closed Lost', icon: 'XCircle' }
  ];

  const columns = stages.map((st) => ({
    ...st,
    items: processedLeads.filter((l) => l.stage === st.id)
  }));

  return { columns, allLeads: processedLeads };
}

export async function createLead(leadData) {
  const db = await getDb();
  const id = uuidv4();
  const passCode = `VIP-${Math.floor(1000 + Math.random() * 9000)}`;

  // Lookup staff name if staffId provided
  let staffName = leadData.assigned_staff_name;
  if (leadData.assigned_staff_id && !staffName) {
    const staff = await db.get('SELECT name FROM staff WHERE id = ?', [leadData.assigned_staff_id]);
    if (staff) staffName = staff.name;
  }

  await db.run(
    `INSERT INTO leads (id, name, phone, goal, budget, stage, trial_date, trial_pass_code, assigned_staff_id, assigned_staff_name, source, notes, created_at, last_contacted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))`,
    [
      id,
      leadData.name,
      leadData.phone,
      leadData.goal || 'General Fitness',
      leadData.budget || 5000,
      leadData.stage || 'new_inquiry',
      leadData.trial_date || null,
      passCode,
      leadData.assigned_staff_id || null,
      staffName || null,
      leadData.source || 'Walk-in',
      leadData.notes || ''
    ]
  );

  return { id, passCode, ...leadData };
}

export async function updateLeadStage(leadId, newStage, notes = null, lostReason = null) {
  const db = await getDb();
  if (lostReason) {
    await db.run(
      `UPDATE leads SET stage = ?, lost_reason = ?, notes = COALESCE(?, notes), last_contacted_at = datetime('now', 'localtime') WHERE id = ?`,
      [newStage, lostReason, notes, leadId]
    );
  } else {
    await db.run(
      `UPDATE leads SET stage = ?, notes = COALESCE(?, notes), last_contacted_at = datetime('now', 'localtime') WHERE id = ?`,
      [newStage, notes, leadId]
    );
  }

  return { success: true, leadId, stage: newStage };
}

export async function getWinBackCampaigns(daysWindow = 30) {
  const db = await getDb();
  // Filter leads who attended trial or were lost in the specified day window
  const query = `
    SELECT * FROM leads 
    WHERE (stage = 'closed_lost' OR stage = 'trial_attended')
      AND created_at <= datetime('now', '-${daysWindow} days', 'localtime')
    ORDER BY created_at DESC
  `;

  const candidates = await db.all(query);

  return candidates.map((lead) => {
    const cleanPhone = (lead.phone || '').replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const winBackMsg = encodeURIComponent(
      `🔥 *Elite Fitness Gudiyatham — Exclusive Win-Back Offer!*\n\n` +
      `Hey ${lead.name}!\n` +
      `We remember you visited us for a workout trial. We're launching an exclusive weekend comeback offer:\n\n` +
      `🎁 *Offer Highlights:*\n` +
      `• *500 Bonus Renewal Credits (Value ₹500)* credited to your account\n` +
      `• *Zero Joining Fee* (Save ₹1,500)\n` +
      `• 1 Complimentary Nutrition Assessment\n\n` +
      `Reply "COMEBACK" or drop by the reception this weekend to claim!`
    );

    return {
      ...lead,
      promoMessage: winBackMsg,
      whatsappLink: `https://wa.me/${phoneWithCountry}?text=${winBackMsg}`
    };
  });
}

export async function getStaffSalesPerformance() {
  const db = await getDb();
  const staffList = await db.all('SELECT id, name, role, commission_rate FROM staff WHERE is_active = 1');

  const performance = [];

  for (const s of staffList) {
    const totalAssigned = await db.get(
      'SELECT COUNT(*) as count FROM leads WHERE assigned_staff_id = ?',
      [s.id]
    );
    const closedWon = await db.get(
      "SELECT COUNT(*) as count FROM leads WHERE assigned_staff_id = ? AND stage = 'closed_won'",
      [s.id]
    );

    // Sum revenue collected by this staff
    const revRow = await db.get(
      'SELECT SUM(grand_total) as total_rev FROM invoices WHERE collected_by_staff_id = ?',
      [s.id]
    );

    const totalRev = revRow?.total_rev || 0;
    const assignedCount = totalAssigned?.count || 0;
    const wonCount = closedWon?.count || 0;
    const conversionRate = assignedCount > 0 ? Math.round((wonCount / assignedCount) * 100) : 0;
    const commissionEarned = Math.round((totalRev * (s.commission_rate || 5.0)) / 100);

    performance.push({
      staffId: s.id,
      staffName: s.name,
      role: s.role,
      commissionRate: s.commission_rate,
      totalLeads: assignedCount,
      closedWon: wonCount,
      conversionRate,
      revenueCollected: totalRev,
      commissionEarned
    });
  }

  return performance;
}

