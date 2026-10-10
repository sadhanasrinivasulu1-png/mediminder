const cron = require('node-cron');
const db = require('../config/db');
const config = require('../config/env');
const Reminder = require('../models/Reminder');
const { sendMedicineReminderEmail } = require('../services/notificationService');

// Map of already notified reminder IDs to avoid repeated emails within runtime
const notifiedReminderIds = new Set();

/**
 * Generate reminders for active medicines for a specific user or all users.
 */
async function generateReminders(targetUserId = null) {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentDayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon...

    let userSql = 'SELECT id, name, email, timezone FROM users';
    let userParams = [];
    if (targetUserId) {
      userSql += ' WHERE id = ?';
      userParams.push(targetUserId);
    }

    const [users] = await db.query(userSql, userParams);

    for (const user of users) {
      const [medicines] = await db.query(
        `SELECT m.* 
         FROM medicines m 
         WHERE m.user_id = ? 
           AND m.start_date <= ? 
           AND (m.end_date IS NULL OR m.end_date >= ?)`,
        [user.id, todayStr, todayStr]
      );

      for (const med of medicines) {
        const [times] = await db.query(
          'SELECT reminder_time, day_of_week FROM medicine_reminder_times WHERE medicine_id = ?',
          [med.id]
        );

        for (const t of times) {
          // Verify day of week if specific_days
          if (med.frequency === 'specific_days' && t.day_of_week !== null && t.day_of_week !== currentDayOfWeek) {
            continue; // Not scheduled for today
          }

          // Build scheduled datetime string: YYYY-MM-DD HH:mm:00
          const timeParts = t.reminder_time.slice(0, 8);
          const scheduledAtStr = `${todayStr} ${timeParts}`;

          await Reminder.createIfNotExist({
            medicine_id: med.id,
            user_id: user.id,
            scheduled_at: scheduledAtStr,
            status: 'scheduled'
          });
        }
      }
    }
  } catch (error) {
    console.error('[ReminderScheduler] Error generating reminders:', error);
  }
}

/**
 * Check for due reminders and trigger server-side email notifications.
 */
async function processDueReminders() {
  try {
    const now = new Date();
    const nowStr = now.toISOString().slice(0, 19).replace('T', ' ');
    const fiveMinutesAgoStr = new Date(now.getTime() - 5 * 60000).toISOString().slice(0, 19).replace('T', ' ');

    // Find scheduled reminders that are currently due
    const [dueReminders] = await db.query(
      `SELECT r.id, r.scheduled_at, r.user_id, r.medicine_id,
              m.medicine_name, m.dosage, m.instructions,
              u.name as user_name, u.email as user_email
       FROM reminders r
       JOIN medicines m ON r.medicine_id = m.id
       JOIN users u ON r.user_id = u.id
       WHERE r.status = 'scheduled'
         AND r.scheduled_at <= ?
         AND r.scheduled_at >= ?`,
      [nowStr, fiveMinutesAgoStr]
    );

    for (const item of dueReminders) {
      if (!notifiedReminderIds.has(item.id)) {
        notifiedReminderIds.add(item.id);

        const user = { name: item.user_name, email: item.user_email };
        const medicine = {
          medicine_name: item.medicine_name,
          dosage: item.dosage,
          instructions: item.instructions
        };

        await sendMedicineReminderEmail(user, item, medicine);
      }
    }

    // Auto-mark overdue reminders older than 60 mins as 'missed'
    const missedCount = await Reminder.markOverdueAsMissed();
    if (missedCount > 0) {
      console.log(`[ReminderScheduler] Marked ${missedCount} overdue reminder(s) as missed.`);
    }
  } catch (error) {
    console.error('[ReminderScheduler] Error processing due reminders:', error);
  }
}

/**
 * Initialize Node-Cron Scheduler
 */
function initScheduler() {
  console.log(`[ReminderScheduler] Starting node-cron scheduler: "${config.REMINDER_CRON_SCHEDULE}"`);

  // Run initial pass immediately on startup
  generateReminders().then(() => {
    processDueReminders();
  });

  // Schedule cron task
  cron.schedule(config.REMINDER_CRON_SCHEDULE, async () => {
    await generateReminders();
    await processDueReminders();
  });
}

module.exports = {
  initScheduler,
  generateReminders,
  processDueReminders
};
