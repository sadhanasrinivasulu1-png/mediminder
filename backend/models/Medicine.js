const db = require('../config/db');

class Medicine {
  static async findByUserId(userId) {
    const [medicines] = await db.query(
      'SELECT * FROM medicines WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // Fetch reminder times for each medicine
    for (const med of medicines) {
      const [times] = await db.query(
        'SELECT id, reminder_time, day_of_week FROM medicine_reminder_times WHERE medicine_id = ? ORDER BY reminder_time ASC',
        [med.id]
      );
      med.reminder_times = times;
    }

    return medicines;
  }

  static async findById(id, userId) {
    const [rows] = await db.query(
      'SELECT * FROM medicines WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (!rows || rows.length === 0) return null;

    const medicine = rows[0];
    const [times] = await db.query(
      'SELECT id, reminder_time, day_of_week FROM medicine_reminder_times WHERE medicine_id = ? ORDER BY reminder_time ASC',
      [medicine.id]
    );
    medicine.reminder_times = times;
    return medicine;
  }

  static async create({ userId, medicine_name, dosage, instructions, start_date, end_date, frequency, reminder_times }) {
    const [result] = await db.query(
      'INSERT INTO medicines (user_id, medicine_name, dosage, instructions, start_date, end_date, frequency) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, medicine_name, dosage, instructions || null, start_date, end_date || null, frequency || 'daily']
    );

    const medicineId = result.insertId;

    if (Array.isArray(reminder_times) && reminder_times.length > 0) {
      for (const t of reminder_times) {
        const timeVal = typeof t === 'string' ? t : t.reminder_time || t.time;
        const dayVal = typeof t === 'object' && t.day_of_week !== undefined ? t.day_of_week : null;
        if (timeVal) {
          // Normalize HH:mm to HH:mm:ss if needed
          const formattedTime = timeVal.length === 5 ? `${timeVal}:00` : timeVal;
          await db.query(
            'INSERT INTO medicine_reminder_times (medicine_id, reminder_time, day_of_week) VALUES (?, ?, ?)',
            [medicineId, formattedTime, dayVal]
          );
        }
      }
    }

    return this.findById(medicineId, userId);
  }

  static async update(id, userId, { medicine_name, dosage, instructions, start_date, end_date, frequency, reminder_times }) {
    // Verify ownership
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    await db.query(
      'UPDATE medicines SET medicine_name = ?, dosage = ?, instructions = ?, start_date = ?, end_date = ?, frequency = ? WHERE id = ? AND user_id = ?',
      [
        medicine_name || existing.medicine_name,
        dosage || existing.dosage,
        instructions !== undefined ? instructions : existing.instructions,
        start_date || existing.start_date,
        end_date !== undefined ? end_date : existing.end_date,
        frequency || existing.frequency,
        id,
        userId
      ]
    );

    if (Array.isArray(reminder_times)) {
      // Re-populate reminder times
      await db.query('DELETE FROM medicine_reminder_times WHERE medicine_id = ?', [id]);
      for (const t of reminder_times) {
        const timeVal = typeof t === 'string' ? t : t.reminder_time || t.time;
        const dayVal = typeof t === 'object' && t.day_of_week !== undefined ? t.day_of_week : null;
        if (timeVal) {
          const formattedTime = timeVal.length === 5 ? `${timeVal}:00` : timeVal;
          await db.query(
            'INSERT INTO medicine_reminder_times (medicine_id, reminder_time, day_of_week) VALUES (?, ?, ?)',
            [id, formattedTime, dayVal]
          );
        }
      }
    }

    return this.findById(id, userId);
  }

  static async delete(id, userId) {
    const [result] = await db.query(
      'DELETE FROM medicines WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Medicine;
