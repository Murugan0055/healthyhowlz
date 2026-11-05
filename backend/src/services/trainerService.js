import { getDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

export const trainerService = {
  // Get all active trainers
  async getTrainers() {
    const db = await getDb();
    return db.all(
      `SELECT id, name, role, phone, email, security_pin, commission_rate, base_salary
       FROM staff
       WHERE role = 'trainer' AND is_active = 1
       ORDER BY name ASC`
    );
  },

  // Authenticate trainer by phone & PIN
  async loginTrainer(phone, securityPin) {
    const db = await getDb();
    const trainer = await db.get(
      `SELECT id, name, role, phone, email, security_pin, commission_rate, base_salary
       FROM staff
       WHERE phone = ? AND is_active = 1`,
      [phone]
    );

    if (!trainer) {
      throw new Error('Trainer with this phone number not found.');
    }

    if (trainer.security_pin !== securityPin) {
      throw new Error('Invalid Security PIN. Please try again.');
    }

    return trainer;
  },

  // Get Trainer Profile & Quick Summary
  async getTrainerProfile(trainerId) {
    const db = await getDb();
    const trainer = await db.get(
      `SELECT id, name, role, phone, email, commission_rate, base_salary
       FROM staff
       WHERE id = ?`,
      [trainerId]
    );

    if (!trainer) {
      throw new Error('Trainer profile not found.');
    }

    const assignedCount = await db.get(
      `SELECT COUNT(*) as count FROM members WHERE assigned_trainer_id = ?`,
      [trainerId]
    );

    const ptClientsCount = await db.get(
      `SELECT COUNT(*) as count FROM members WHERE assigned_trainer_id = ? AND pt_sessions_remaining > 0`,
      [trainerId]
    );

    const todayDate = new Date().toISOString().split('T')[0];
    const todayFloorCount = await db.get(
      `SELECT COUNT(*) as count FROM floor_checkins WHERE trainer_id = ? AND checkin_date = ?`,
      [trainerId, todayDate]
    );

    return {
      ...trainer,
      assignedClientsCount: assignedCount?.count || 0,
      activePtClientsCount: ptClientsCount?.count || 0,
      todayFloorCheckinsCount: todayFloorCount?.count || 0
    };
  },

  // Get Assigned Client Roster with Attendance & Medical Flags
  async getTrainerRoster(trainerId) {
    const db = await getDb();
    const trainer = await db.get(`SELECT name FROM staff WHERE id = ?`, [trainerId]);
    const trainerName = trainer ? trainer.name : 'Your Coach';

    const members = await db.all(
      `SELECT 
        m.id, m.member_code, m.name, m.phone, m.email, m.photo_url, m.gender,
        m.fitness_goals, m.medical_flags, m.plan_name, m.status,
        m.pt_sessions_total, m.pt_sessions_remaining, m.pt_session_pin,
        m.start_date, m.expiry_date, m.loyalty_points
       FROM members m
       WHERE m.assigned_trainer_id = ?
       ORDER BY m.name ASC`,
      [trainerId]
    );

    const todayDate = new Date().toISOString().split('T')[0];

    // Enrich each member with attendance and absentee calculation
    const enriched = await Promise.all(
      members.map(async (m) => {
        // Today's floor checkin by this trainer
        const floorToday = await db.get(
          `SELECT id, created_at, notes FROM floor_checkins 
           WHERE member_id = ? AND checkin_date = ?`,
          [m.id, todayDate]
        );

        // General last checkin
        const lastCheckin = await db.get(
          `SELECT checkin_time, checkin_type FROM checkins 
           WHERE member_id = ? 
           ORDER BY checkin_time DESC LIMIT 1`,
          [m.id]
        );

        let daysAbsent = 0;
        let lastSeenDateStr = null;

        if (lastCheckin && lastCheckin.checkin_time) {
          lastSeenDateStr = lastCheckin.checkin_time;
          const checkinTime = new Date(lastCheckin.checkin_time).getTime();
          const now = Date.now();
          daysAbsent = Math.max(0, Math.floor((now - checkinTime) / (1000 * 60 * 60 * 24)));
        } else {
          // If never checked in, calculate from start date or fallback
          const startTime = new Date(m.start_date || '2026-10-25').getTime();
          daysAbsent = Math.max(1, Math.floor((Date.now() - startTime) / (1000 * 60 * 60 * 24)));
        }

        const isAbsentAlert = daysAbsent >= 4;

        // WhatsApp personalized nudge link
        const cleanPhone = m.phone.replace(/[^0-9]/g, '');
        const phoneWithCountry = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
        const whatsappMessage = `Hi ${m.name}! Coach ${trainerName} here from Elite Fitness Club, Gudiyatham. We noticed you haven't been in for the last ${daysAbsent} days! Your fitness and health goals are our top priority—let's hit a great workout tomorrow. Do you need any routine adjustments or timing flexibility? Let me know! 💪🏋️`;
        const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(whatsappMessage)}`;

        return {
          ...m,
          checkedInFloorToday: !!floorToday,
          floorNotes: floorToday?.notes || null,
          lastSeen: lastSeenDateStr,
          daysAbsent,
          isAbsentAlert,
          whatsappUrl
        };
      })
    );

    return enriched;
  },

  // 1-Tap Floor Coaching Check-in
  async markFloorAttendance(trainerId, memberId, notes = '') {
    const db = await getDb();
    const todayDate = new Date().toISOString().split('T')[0];

    const trainer = await db.get(`SELECT name FROM staff WHERE id = ?`, [trainerId]);
    const member = await db.get(`SELECT id, name, member_code FROM members WHERE id = ?`, [memberId]);

    if (!member) throw new Error('Member not found.');

    // Check if already checked in on floor today
    const existing = await db.get(
      `SELECT id FROM floor_checkins WHERE member_id = ? AND checkin_date = ?`,
      [memberId, todayDate]
    );

    if (existing) {
      await db.run(
        `UPDATE floor_checkins SET notes = ? WHERE id = ?`,
        [notes || 'Floor coaching supervised', existing.id]
      );
      return {
        success: true,
        alreadyCheckedIn: true,
        message: `${member.name} was already marked on floor today. Notes updated.`
      };
    }

    const checkinId = `floor-${uuidv4().substring(0, 8)}`;
    await db.run(
      `INSERT INTO floor_checkins (id, trainer_id, member_id, checkin_date, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [checkinId, trainerId, memberId, todayDate, notes || 'Floor coaching workout guided']
    );

    // Also record in central checkins table so kiosk and logs see the member's activity
    const centralCheckinId = `chk-${uuidv4().substring(0, 8)}`;
    await db.run(
      `INSERT INTO checkins (id, member_id, member_code, member_name, checkin_type, manual_checkin_by, manual_officer_name, points_awarded, verification_status, denial_reason)
       VALUES (?, ?, ?, ?, 'floor_coaching', ?, ?, 10, 'granted', 'Floor Coach 1-Tap Attendance')`,
      [centralCheckinId, member.id, member.member_code, member.name, trainerId, trainer?.name || 'Floor Coach']
    );

    return {
      success: true,
      message: `Floor coaching attendance confirmed for ${member.name}! +10 points recorded.`
    };
  },

  // Anti-Fraud Personal Training (PT) Punch-In
  async verifyPtSession({ trainerId, memberId, verificationCode, focusArea, notes }) {
    const db = await getDb();

    const trainer = await db.get(
      `SELECT id, name, commission_rate FROM staff WHERE id = ?`,
      [trainerId]
    );
    if (!trainer) throw new Error('Trainer not found.');

    const member = await db.get(
      `SELECT id, name, member_code, pt_sessions_total, pt_sessions_remaining, pt_session_pin, loyalty_points
       FROM members WHERE id = ?`,
      [memberId]
    );
    if (!member) throw new Error('Member not found.');

    if (!member.pt_sessions_remaining || member.pt_sessions_remaining <= 0) {
      throw new Error(`${member.name} has 0 PT sessions remaining in their balance. Please have them renew their PT package.`);
    }

    // Verify 4-digit client code
    const enteredCode = String(verificationCode).trim();
    const actualCode = String(member.pt_session_pin || '4821').trim();

    if (enteredCode !== actualCode) {
      throw new Error(`Invalid Client 4-Digit Sign-Off Code. Client must read the PIN displayed in their Member App.`);
    }

    const sessionNumber = (member.pt_sessions_total - member.pt_sessions_remaining) + 1;
    const newRemaining = member.pt_sessions_remaining - 1;
    const todayDate = new Date().toISOString().split('T')[0];

    // Standard PT commission (e.g. 20% on ₹250 session = ₹50)
    const commissionEarned = 50.0;

    const sessionId = `pt-sess-${uuidv4().substring(0, 8)}`;
    await db.run(
      `INSERT INTO pt_sessions (id, trainer_id, trainer_name, member_id, member_name, session_number, verification_code, focus_area, notes, commission_earned, status, session_date, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified', ?, CURRENT_TIMESTAMP)`,
      [sessionId, trainer.id, trainer.name, member.id, member.name, sessionNumber, enteredCode, focusArea || 'Hypertrophy & Form Correction', notes || '', commissionEarned, todayDate]
    );

    // Deduct 1 session and award 20 loyalty points
    await db.run(
      `UPDATE members 
       SET pt_sessions_remaining = ?, loyalty_points = COALESCE(loyalty_points, 0) + 20
       WHERE id = ?`,
      [newRemaining, member.id]
    );

    return {
      success: true,
      sessionId,
      sessionNumber,
      totalSessions: member.pt_sessions_total,
      remainingSessions: newRemaining,
      commissionEarned,
      memberName: member.name,
      trainerName: trainer.name,
      completedAt: new Date().toISOString(),
      message: `Session ${sessionNumber} of ${member.pt_sessions_total} verified! ₹${commissionEarned} commission credited to ${trainer.name}.`
    };
  },

  // Trainer Earnings & Commission Dashboard
  async getTrainerEarnings(trainerId, monthYear = null) {
    const db = await getDb();

    const trainer = await db.get(
      `SELECT id, name, role, commission_rate, base_salary FROM staff WHERE id = ?`,
      [trainerId]
    );
    if (!trainer) throw new Error('Trainer not found.');

    const currentMonth = monthYear || new Date().toISOString().substring(0, 7); // 'YYYY-MM'

    // Completed sessions for this trainer in selected month
    const sessions = await db.all(
      `SELECT id, member_id, member_name, session_number, focus_area, notes, commission_earned, status, session_date, completed_at
       FROM pt_sessions
       WHERE trainer_id = ? AND strftime('%Y-%m', session_date) = ?
       ORDER BY completed_at DESC`,
      [trainerId, currentMonth]
    );

    const totalSessions = sessions.length;
    const totalCommissions = sessions.reduce((sum, s) => sum + (Number(s.commission_earned) || 0), 0);
    const baseSalary = Number(trainer.base_salary) || 15000;
    const estimatedPayout = baseSalary + totalCommissions;

    return {
      trainerId: trainer.id,
      trainerName: trainer.name,
      month: currentMonth,
      baseSalary,
      commissionRate: trainer.commission_rate || 20,
      totalSessions,
      totalCommissions,
      estimatedPayout,
      monthlyTarget: 25,
      sessions
    };
  },

  // Master Workout & Diet Templates
  async getTemplates() {
    const db = await getDb();

    const workoutTemplates = await db.all(
      `SELECT id, title, category, difficulty, target_days, description, exercises_json
       FROM workout_templates
       WHERE is_active = 1`
    );

    const dietTemplates = await db.all(
      `SELECT id, title, diet_type, calories, protein, carbs, fats, description, meals_json
       FROM diet_templates
       WHERE is_active = 1`
    );

    return {
      workoutTemplates: workoutTemplates.map(t => ({
        ...t,
        exercises: JSON.parse(t.exercises_json || '[]')
      })),
      dietTemplates: dietTemplates.map(t => ({
        ...t,
        meals: JSON.parse(t.meals_json || '[]')
      }))
    };
  },

  // Clone Workout Template to Client
  async cloneWorkoutTemplate({ trainerId, memberId, templateId, customNotes }) {
    const db = await getDb();

    const template = await db.get(
      `SELECT * FROM workout_templates WHERE id = ?`,
      [templateId]
    );
    if (!template) throw new Error('Workout template not found.');

    const member = await db.get(`SELECT name FROM members WHERE id = ?`, [memberId]);
    if (!member) throw new Error('Member not found.');

    const trainer = await db.get(`SELECT name FROM staff WHERE id = ?`, [trainerId]);
    const trainerName = trainer ? trainer.name : 'Floor Coach';

    // Remove existing routines for this member or replace
    const routineId = `routine-${uuidv4().substring(0, 8)}`;
    await db.run(
      `INSERT INTO workout_routines (id, member_id, day_name, routine_title, assigned_by_trainer, estimated_duration_min, target_muscle_groups)
       VALUES (?, ?, 'Daily Program', ?, ?, 60, ?)`,
      [routineId, memberId, template.title, trainerName, template.category]
    );

    const exercises = JSON.parse(template.exercises_json || '[]');
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      const exId = `ex-${uuidv4().substring(0, 8)}`;
      await db.run(
        `INSERT INTO workout_exercises (id, routine_id, exercise_name, category, target_sets, target_reps, rest_seconds, previous_pr, order_idx)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [exId, routineId, ex.name, ex.category, ex.target_sets || 4, ex.target_reps || '8-12 reps', ex.rest_seconds || 60, ex.form_cues || 'Coaching cue assigned', i + 1]
      );
    }

    return {
      success: true,
      message: `Workout template "${template.title}" cloned and assigned to ${member.name} successfully!`
    };
  },

  // Clone Diet Template to Client
  async cloneDietTemplate({ trainerId, memberId, templateId, customNotes }) {
    const db = await getDb();

    const template = await db.get(
      `SELECT * FROM diet_templates WHERE id = ?`,
      [templateId]
    );
    if (!template) throw new Error('Diet template not found.');

    const member = await db.get(`SELECT name FROM members WHERE id = ?`, [memberId]);
    if (!member) throw new Error('Member not found.');

    // Check or replace diet plan
    let dietPlan = await db.get(`SELECT id FROM diet_plans WHERE member_id = ?`, [memberId]);
    let planId;

    if (dietPlan) {
      planId = dietPlan.id;
      await db.run(
        `UPDATE diet_plans 
         SET daily_calories = ?, protein_grams = ?, carbs_grams = ?, fats_grams = ?, diet_type = ?
         WHERE id = ?`,
        [template.calories, template.protein, template.carbs, template.fats, template.title, planId]
      );
      // Delete old meals
      await db.run(`DELETE FROM diet_meals WHERE plan_id = ?`, [planId]);
    } else {
      planId = `diet-${uuidv4().substring(0, 8)}`;
      await db.run(
        `INSERT INTO diet_plans (id, member_id, daily_calories, protein_grams, carbs_grams, fats_grams, water_liters, diet_type)
         VALUES (?, ?, ?, ?, ?, ?, 3.5, ?)`,
        [planId, memberId, template.calories, template.protein, template.carbs, template.fats, template.title]
      );
    }

    const meals = JSON.parse(template.meals_json || '[]');
    for (let i = 0; i < meals.length; i++) {
      const m = meals[i];
      const mealId = `meal-${uuidv4().substring(0, 8)}`;
      await db.run(
        `INSERT INTO diet_meals (id, plan_id, meal_name, time_hint, food_items, calories, protein_grams, carbs_grams, fats_grams, is_eaten, order_idx)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        [mealId, planId, m.name, m.time, m.food, m.cal, m.p, m.c, m.f, i + 1]
      );
    }

    return {
      success: true,
      message: `Diet blueprint "${template.title}" (${template.calories} kcal) assigned to ${member.name}!`
    };
  },

  // Get Member's Currently Active Routine & Diet
  async getMemberActiveProgram(memberId) {
    const db = await getDb();
    const routine = await db.get(
      `SELECT * FROM workout_routines WHERE member_id = ? ORDER BY id DESC LIMIT 1`,
      [memberId]
    );

    let exercises = [];
    if (routine) {
      exercises = await db.all(
        `SELECT * FROM workout_exercises WHERE routine_id = ? ORDER BY order_idx ASC`,
        [routine.id]
      );
    }

    const diet = await db.get(
      `SELECT * FROM diet_plans WHERE member_id = ? ORDER BY id DESC LIMIT 1`,
      [memberId]
    );

    let meals = [];
    if (diet) {
      meals = await db.all(
        `SELECT * FROM diet_meals WHERE plan_id = ? ORDER BY order_idx ASC`,
        [diet.id]
      );
    }

    return {
      routine: routine ? { ...routine, exercises } : null,
      diet: diet ? { ...diet, meals } : null
    };
  },

  // Save Customized or From-Scratch Workout Program for Client
  async saveCustomWorkoutProgram({ trainerId, memberId, programTitle, splitCategory, targetDays, estimatedDuration = 60, coachingNotes, exercises = [] }) {
    const db = await getDb();

    const member = await db.get(`SELECT id, name FROM members WHERE id = ?`, [memberId]);
    if (!member) throw new Error('Member not found.');

    const trainer = await db.get(`SELECT id, name FROM staff WHERE id = ?`, [trainerId]);
    const trainerName = trainer ? trainer.name : 'Floor Coach';

    // Remove prior routines for this member
    await db.run(`DELETE FROM workout_routines WHERE member_id = ?`, [memberId]);

    const routineId = `routine-${uuidv4().substring(0, 8)}`;
    await db.run(
      `INSERT INTO workout_routines (id, member_id, day_name, routine_title, assigned_by_trainer, estimated_duration_min, target_muscle_groups)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        routineId,
        memberId,
        targetDays ? `${targetDays} Days / Week Split` : 'Custom Assigned Program',
        programTitle || 'Custom Workout Program',
        trainerName,
        Number(estimatedDuration) || 60,
        splitCategory || 'Custom Muscle Focus'
      ]
    );

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      const exId = `ex-${uuidv4().substring(0, 8)}`;
      await db.run(
        `INSERT INTO workout_exercises (id, routine_id, exercise_name, category, target_sets, target_reps, rest_seconds, previous_pr, order_idx)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          exId,
          routineId,
          ex.name || `Exercise ${i + 1}`,
          ex.category || splitCategory || 'General',
          Number(ex.target_sets || ex.sets) || 4,
          ex.target_reps || ex.reps || '8-12 reps',
          Number(ex.rest_seconds || ex.rest) || 60,
          ex.form_cues || ex.cues || coachingNotes || 'Strict form',
          i + 1
        ]
      );
    }

    return {
      success: true,
      routineId,
      message: `Workout program "${programTitle}" (${exercises.length} exercises) saved & assigned to ${member.name} successfully!`
    };
  },

  // Save Customized or From-Scratch Diet Blueprint for Client
  async saveCustomDietPlan({ trainerId, memberId, dietTitle, calories = 2200, protein = 150, carbs = 220, fats = 60, meals = [] }) {
    const db = await getDb();

    const member = await db.get(`SELECT id, name FROM members WHERE id = ?`, [memberId]);
    if (!member) throw new Error('Member not found.');

    let dietPlan = await db.get(`SELECT id FROM diet_plans WHERE member_id = ?`, [memberId]);
    let planId;

    if (dietPlan) {
      planId = dietPlan.id;
      await db.run(
        `UPDATE diet_plans 
         SET daily_calories = ?, protein_grams = ?, carbs_grams = ?, fats_grams = ?, diet_type = ?
         WHERE id = ?`,
        [calories, protein, carbs, fats, dietTitle || 'Custom Nutrition Blueprint', planId]
      );
      await db.run(`DELETE FROM diet_meals WHERE plan_id = ?`, [planId]);
    } else {
      planId = `diet-${uuidv4().substring(0, 8)}`;
      await db.run(
        `INSERT INTO diet_plans (id, member_id, daily_calories, protein_grams, carbs_grams, fats_grams, water_liters, diet_type)
         VALUES (?, ?, ?, ?, ?, ?, 3.5, ?)`,
        [planId, memberId, calories, protein, carbs, fats, dietTitle || 'Custom Nutrition Blueprint']
      );
    }

    for (let i = 0; i < meals.length; i++) {
      const m = meals[i];
      const mealId = `meal-${uuidv4().substring(0, 8)}`;
      await db.run(
        `INSERT INTO diet_meals (id, plan_id, meal_name, time_hint, food_items, calories, protein_grams, carbs_grams, fats_grams, is_eaten, order_idx)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        [
          mealId,
          planId,
          m.name || `Meal ${i + 1}`,
          m.time || 'Schedule',
          m.food || 'Nutritious meal items',
          Number(m.cal) || 300,
          Number(m.p) || 20,
          Number(m.c) || 30,
          Number(m.f) || 10,
          i + 1
        ]
      );
    }

    return {
      success: true,
      planId,
      message: `Diet blueprint "${dietTitle}" (${calories} kcal, ${meals.length} meals) assigned to ${member.name}!`
    };
  },

  // Assign a Client to Trainer's Roster
  async assignClientToTrainer({ trainerId, memberId }) {
    const db = await getDb();

    const member = await db.get(`SELECT id, name FROM members WHERE id = ?`, [memberId]);
    if (!member) throw new Error('Member not found.');

    const trainer = await db.get(`SELECT id, name FROM staff WHERE id = ?`, [trainerId]);
    if (!trainer) throw new Error('Trainer not found.');

    await db.run(`UPDATE members SET assigned_trainer_id = ? WHERE id = ?`, [trainerId, memberId]);

    return {
      success: true,
      message: `${member.name} assigned to Coach ${trainer.name}'s roster successfully!`
    };
  },

  // Get All Members for Assignment Dialog
  async getAllMembersForAssignment() {
    const db = await getDb();
    return db.all(
      `SELECT m.id, m.member_code, m.name, m.phone, m.photo_url, m.status, m.plan_name,
              m.fitness_goals, m.medical_flags, m.assigned_trainer_id, s.name as trainer_name
       FROM members m
       LEFT JOIN staff s ON m.assigned_trainer_id = s.id
       ORDER BY m.name ASC`
    );
  }
};
