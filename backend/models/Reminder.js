const db = require('../config/db');

class Reminder {
  // Generate reminder entry for a scheduled slot (prevents duplicate via UNIQUE key)
  static async createIfNotExist({ medicine_id, user_id, scheduled_at, status = 'scheduled' }) {
    const formattedDate = new Date(scheduled_at).toISOString().slice(0, 19).replace('T', ' ');
    const [result] = await db.query(
      'INSERT IGNORE INTO reminders (medicine_id, user_id, scheduled_at, status) VALUES (?, ?, ?, ?)',
      [medicine_id, user_id, formattedDate, status]
    );
    return result;
  }

  // Get today's reminders for a user
  static async getToday(userId, clientDateStr = null) {
    const targetDate = clientDateStr || new Date().toISOString().split('T')[0];
    const [rows] = await db.query(
      `SELECT r.*, m.medicine_name, m.dosage, m.instructions, m.frequency 
       FROM reminders r 
       JOIN medicines m ON r.medicine_id = m.id 
       WHERE r.user_id = ? AND DATE(r.scheduled_at) = ? 
       ORDER BY r.scheduled_at ASC`,
      [userId, targetDate]
    );
    return rows;
  }

  // Get upcoming reminders (scheduled and in the future)
  static async getUpcoming(userId, limit = 10) {
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const [rows] = await db.query(
      `SELECT r.*, m.medicine_name, m.dosage, m.instructions 
       FROM reminders r 
       JOIN medicines m ON r.medicine_id = m.id 
       WHERE r.user_id = ? AND r.scheduled_at >= ? AND r.status = 'scheduled' 
       ORDER BY r.scheduled_at ASC 
       LIMIT ?`,
      [userId, nowStr, limit]
    );
    return rows;
  }

  // Update status (taken / skipped)
  static async updateStatus(id, userId, status) {
    if (!['taken', 'skipped', 'missed', 'scheduled'].includes(status)) {
      throw new Error('Invalid status. Must be taken, skipped, missed, or scheduled.');
    }

    const [result] = await db.query(
      `UPDATE reminders 
       SET status = ?, action_at = NOW() 
       WHERE id = ? AND user_id = ?`,
      [status, id, userId]
    );

    if (result.affectedRows === 0) return null;

    const [rows] = await db.query(
      `SELECT r.*, m.medicine_name, m.dosage, m.instructions 
       FROM reminders r 
       JOIN medicines m ON r.medicine_id = m.id 
       WHERE r.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  // Retrieve user medication reminder history
  static async getHistory(userId, { status, startDate, endDate, limit = 100 }) {
    let sql = `
      SELECT r.*, m.medicine_name, m.dosage, m.instructions 
      FROM reminders r 
      JOIN medicines m ON r.medicine_id = m.id 
      WHERE r.user_id = ?
    `;
    const params = [userId];

    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }
    if (startDate) {
      sql += ' AND DATE(r.scheduled_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND DATE(r.scheduled_at) <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY r.scheduled_at DESC LIMIT ?';
    params.push(limit);

    const [rows] = await db.query(sql, params);
    return rows;
  }

  // Get aggregated dashboard metrics
  static async getDashboardStats(userId) {
    const todayStr = new Date().toISOString().split('T')[0];
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [medRows] = await db.query('SELECT COUNT(*) as total FROM medicines WHERE user_id = ?', [userId]);
    const totalMedicines = medRows[0]?.total || 0;

    const [todayRows] = await db.query(
      'SELECT COUNT(*) as total FROM reminders WHERE user_id = ? AND DATE(scheduled_at) = ?',
      [userId, todayStr]
    );
    const todayReminders = todayRows[0]?.total || 0;

    const [upcomingRows] = await db.query(
      'SELECT COUNT(*) as total FROM reminders WHERE user_id = ? AND scheduled_at >= ? AND status = "scheduled"',
      [userId, nowStr]
    );
    const upcomingReminders = upcomingRows[0]?.total || 0;

    const [takenRows] = await db.query(
      'SELECT COUNT(*) as total FROM reminders WHERE user_id = ? AND status = "taken"',
      [userId]
    );
    const takenReminders = takenRows[0]?.total || 0;

    const [missedRows] = await db.query(
      'SELECT COUNT(*) as total FROM reminders WHERE user_id = ? AND status IN ("skipped", "missed")',
      [userId]
    );
    const skippedMissedReminders = missedRows[0]?.total || 0;

    return {
      totalMedicines: Number(totalMedicines),
      todayReminders: Number(todayReminders),
      upcomingReminders: Number(upcomingReminders),
      takenReminders: Number(takenReminders),
      skippedMissedReminders: Number(skippedMissedReminders)
    };
  }

  // Auto-mark overdue reminders as missed (after 60 minutes)
  static async markOverdueAsMissed() {
    const [result] = await db.query(
      `UPDATE reminders 
       SET status = 'missed' 
       WHERE status = 'scheduled' 
       AND scheduled_at < NOW() - INTERVAL 60 MINUTE`
    );
    return result.affectedRows;
  }
}

module.exports = Reminder;
