const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT id, name, email, timezone, created_at FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create({ name, email, password, timezone = 'UTC' }) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, timezone) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, timezone]
    );

    return {
      id: result.insertId,
      name,
      email,
      timezone
    };
  }

  static async comparePassword(candidatePassword, hash) {
    return bcrypt.compare(candidatePassword, hash);
  }

  static async updateProfile(id, { name, timezone }) {
    await db.query(
      'UPDATE users SET name = ?, timezone = ? WHERE id = ?',
      [name, timezone, id]
    );
    return this.findById(id);
  }
}

module.exports = User;
