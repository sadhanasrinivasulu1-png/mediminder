const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const config = require('./env');

let pool = null;
let isUsingMySQL = false;
let fileDb = null;
const fallbackDataDir = path.resolve(__dirname, '../../data');
const fallbackDataFile = path.join(fallbackDataDir, 'mediminder_store.json');

// Ensure data folder exists
if (!fs.existsSync(fallbackDataDir)) {
  fs.mkdirSync(fallbackDataDir, { recursive: true });
}

// Load or initialize file-based fallback store
function getFileDb() {
  if (!fileDb) {
    if (fs.existsSync(fallbackDataFile)) {
      try {
        fileDb = JSON.parse(fs.readFileSync(fallbackDataFile, 'utf8'));
      } catch (e) {
        fileDb = null;
      }
    }
    if (!fileDb) {
      fileDb = {
        users: [
          {
            id: 1,
            name: 'Sarah Connor',
            email: 'sarah@example.com',
            // bcrypt hash for "Password123!"
            password_hash: '$2a$10$peRbKDR8pQtMPa.kf0xWUu9dtp3urplxSTZKsMz3w0Gb57rlBm2Ty',
            timezone: 'UTC',
            created_at: new Date().toISOString()
          }
        ],
        medicines: [
          {
            id: 1,
            user_id: 1,
            medicine_name: 'Amoxicillin',
            dosage: '500mg',
            instructions: 'Take with full glass of water after food',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            frequency: 'daily',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            user_id: 1,
            medicine_name: 'Vitamin D3',
            dosage: '2000 IU',
            instructions: 'Take in the morning with breakfast',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
            frequency: 'daily',
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            user_id: 1,
            medicine_name: 'Lisinopril',
            dosage: '10mg',
            instructions: 'Blood pressure regulation. Do not skip.',
            start_date: new Date().toISOString().split('T')[0],
            end_date: null,
            frequency: 'daily',
            created_at: new Date().toISOString()
          }
        ],
        medicine_reminder_times: [
          { id: 1, medicine_id: 1, reminder_time: '08:00:00', day_of_week: null },
          { id: 2, medicine_id: 1, reminder_time: '20:00:00', day_of_week: null },
          { id: 3, medicine_id: 2, reminder_time: '09:00:00', day_of_week: null },
          { id: 4, medicine_id: 3, reminder_time: '08:30:00', day_of_week: null }
        ],
        reminders: []
      };
      saveFileDb();
    }
  }
  return fileDb;
}

function saveFileDb() {
  if (fileDb) {
    fs.writeFileSync(fallbackDataFile, JSON.stringify(fileDb, null, 2), 'utf8');
  }
}

// Initialize Database connection
async function initDb() {
  try {
    console.log(`[DB] Attempting MySQL connection to ${config.DB_HOST}:${config.DB_PORT}...`);
    
    // First test connection without database to create if not exists
    const rootConn = await mysql.createConnection({
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      connectTimeout: 3000
    });
    
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${config.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();

    // Create pooled connection to target DB
    pool = mysql.createPool({
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: '+00:00'
    });

    // Test connection
    const [test] = await pool.query('SELECT 1 + 1 AS solution');
    isUsingMySQL = true;
    console.log('[DB] Successfully connected to MySQL database:', config.DB_NAME);

    // Run schema creation
    await runMySQLMigrations();
    return true;
  } catch (err) {
    console.warn(`[DB] MySQL connection notice: ${err.message}`);
    if (config.USE_SQLITE_FALLBACK) {
      console.log('[DB] Falling back to high-fidelity embedded file database for seamless operation.');
      isUsingMySQL = false;
      getFileDb();
      return true;
    }
    throw err;
  }
}

async function runMySQLMigrations() {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      \`name\` VARCHAR(100) NOT NULL,
      \`email\` VARCHAR(150) NOT NULL UNIQUE,
      \`password_hash\` VARCHAR(255) NOT NULL,
      \`timezone\` VARCHAR(64) NOT NULL DEFAULT 'UTC',
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX \`idx_users_email\` (\`email\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const medicinesTable = `
    CREATE TABLE IF NOT EXISTS \`medicines\` (
      \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      \`user_id\` INT UNSIGNED NOT NULL,
      \`medicine_name\` VARCHAR(150) NOT NULL,
      \`dosage\` VARCHAR(100) NOT NULL,
      \`instructions\` TEXT NULL,
      \`start_date\` DATE NOT NULL,
      \`end_date\` DATE NULL,
      \`frequency\` ENUM('daily', 'specific_days') NOT NULL DEFAULT 'daily',
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
      INDEX \`idx_medicines_user_id\` (\`user_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const timesTable = `
    CREATE TABLE IF NOT EXISTS \`medicine_reminder_times\` (
      \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      \`medicine_id\` INT UNSIGNED NOT NULL,
      \`reminder_time\` TIME NOT NULL,
      \`day_of_week\` TINYINT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (\`medicine_id\`) REFERENCES \`medicines\`(\`id\`) ON DELETE CASCADE,
      INDEX \`idx_reminder_times_medicine\` (\`medicine_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const remindersTable = `
    CREATE TABLE IF NOT EXISTS \`reminders\` (
      \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      \`medicine_id\` INT UNSIGNED NOT NULL,
      \`user_id\` INT UNSIGNED NOT NULL,
      \`scheduled_at\` DATETIME NOT NULL,
      \`status\` ENUM('scheduled', 'taken', 'skipped', 'missed') NOT NULL DEFAULT 'scheduled',
      \`action_at\` DATETIME NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (\`medicine_id\`) REFERENCES \`medicines\`(\`id\`) ON DELETE CASCADE,
      FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
      UNIQUE KEY \`uniq_med_user_scheduled\` (\`user_id\`, \`medicine_id\`, \`scheduled_at\`),
      INDEX \`idx_reminders_user_status\` (\`user_id\`, \`status\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  await pool.query(usersTable);
  await pool.query(medicinesTable);
  await pool.query(timesTable);
  await pool.query(remindersTable);

  // Seed sample user if not exists
  const [users] = await pool.query('SELECT id FROM users LIMIT 1');
  if (users.length === 0) {
    const seedUser = `
      INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password_hash\`, \`timezone\`) VALUES
      (1, 'Sarah Connor', 'sarah@example.com', '$2a$10$wT8KzWvEvyfMhF1YJj7yCe30wD3pW4HlU2K/u5s97rWlYy2VlmFje', 'UTC');
    `;
    await pool.query(seedUser);
    console.log('[DB] Seeded default test user: sarah@example.com (Password: Password123!)');
  }
}

// Database query wrapper providing identical interface
async function query(sql, params = []) {
  if (isUsingMySQL && pool) {
    const [rows, fields] = await pool.query(sql, params);
    return [rows, fields];
  }

  // Fallback engine handling standard CRUD operations
  return executeFallbackQuery(sql, params);
}

function executeFallbackQuery(sql, params) {
  const db = getFileDb();
  const trimmed = sql.trim();

  // 1. SELECT * FROM users WHERE email = ?
  if (/^SELECT\s+.*?\s+FROM\s+users\s+WHERE\s+email\s*=/i.test(trimmed)) {
    const email = params[0];
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return [user ? [user] : []];
  }

  // 2. SELECT id, name, email, timezone FROM users WHERE id = ?
  if (/^SELECT\s+.*?\s+FROM\s+users\s+WHERE\s+id\s*=/i.test(trimmed)) {
    const id = Number(params[0]);
    const user = db.users.find(u => u.id === id);
    if (!user) return [[]];
    const { password_hash, ...safeUser } = user;
    return [[safeUser]];
  }

  // 3. INSERT INTO users
  if (/^INSERT\s+INTO\s+users/i.test(trimmed)) {
    const newId = db.users.length ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
    const [name, email, password_hash, timezone] = params;
    const newUser = {
      id: newId,
      name,
      email,
      password_hash,
      timezone: timezone || 'UTC',
      created_at: new Date().toISOString()
    };
    db.users.push(newUser);
    saveFileDb();
    return [{ insertId: newId, affectedRows: 1 }];
  }

  // 4. SELECT COUNT(*) as total FROM medicines WHERE user_id = ?
  if (/^SELECT\s+COUNT\(\*\)\s+as\s+total\s+FROM\s+medicines\s+WHERE\s+user_id\s*=/i.test(trimmed)) {
    const userId = Number(params[0]);
    const count = db.medicines.filter(m => m.user_id === userId).length;
    return [[{ total: count }]];
  }

  // 4b. SELECT * FROM medicines WHERE user_id = ?
  if (/^SELECT\s+.*?\s+FROM\s+medicines\s+WHERE\s+user_id\s*=/i.test(trimmed)) {
    const userId = Number(params[0]);
    const list = db.medicines.filter(m => m.user_id === userId);
    return [list];
  }

  // 5. SELECT * FROM medicines WHERE id = ? AND user_id = ?
  if (/^SELECT\s+.*?\s+FROM\s+medicines\s+WHERE\s+id\s*=\s*\?\s*AND\s+user_id\s*=/i.test(trimmed)) {
    const id = Number(params[0]);
    const userId = Number(params[1]);
    const med = db.medicines.find(m => m.id === id && m.user_id === userId);
    return [med ? [med] : []];
  }

  // 6. INSERT INTO medicines
  if (/^INSERT\s+INTO\s+medicines/i.test(trimmed)) {
    const newId = db.medicines.length ? Math.max(...db.medicines.map(m => m.id)) + 1 : 1;
    const [user_id, medicine_name, dosage, instructions, start_date, end_date, frequency] = params;
    const newMed = {
      id: newId,
      user_id: Number(user_id),
      medicine_name,
      dosage,
      instructions: instructions || null,
      start_date,
      end_date: end_date || null,
      frequency: frequency || 'daily',
      created_at: new Date().toISOString()
    };
    db.medicines.push(newMed);
    saveFileDb();
    return [{ insertId: newId, affectedRows: 1 }];
  }

  // 7. UPDATE medicines
  if (/^UPDATE\s+medicines\s+SET/i.test(trimmed)) {
    const [medicine_name, dosage, instructions, start_date, end_date, frequency, id, user_id] = params;
    const med = db.medicines.find(m => m.id === Number(id) && m.user_id === Number(user_id));
    if (med) {
      med.medicine_name = medicine_name;
      med.dosage = dosage;
      med.instructions = instructions;
      med.start_date = start_date;
      med.end_date = end_date;
      med.frequency = frequency;
      saveFileDb();
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // 8. DELETE FROM medicines WHERE id = ? AND user_id = ?
  if (/^DELETE\s+FROM\s+medicines\s+WHERE\s+id\s*=\s*\?\s*AND\s+user_id\s*=/i.test(trimmed)) {
    const id = Number(params[0]);
    const userId = Number(params[1]);
    const prevLen = db.medicines.length;
    db.medicines = db.medicines.filter(m => !(m.id === id && m.user_id === userId));
    // Cascade delete times and reminders
    db.medicine_reminder_times = db.medicine_reminder_times.filter(t => t.medicine_id !== id);
    db.reminders = db.reminders.filter(r => r.medicine_id !== id);
    saveFileDb();
    return [{ affectedRows: prevLen - db.medicines.length }];
  }

  // 9. Reminder times queries
  if (/^SELECT\s+.*?\s+FROM\s+medicine_reminder_times\s+WHERE\s+medicine_id\s*=/i.test(trimmed)) {
    const medId = Number(params[0]);
    const times = db.medicine_reminder_times.filter(t => t.medicine_id === medId);
    return [times];
  }

  if (/^INSERT\s+INTO\s+medicine_reminder_times/i.test(trimmed)) {
    const newId = db.medicine_reminder_times.length ? Math.max(...db.medicine_reminder_times.map(t => t.id)) + 1 : 1;
    const [medicine_id, reminder_time, day_of_week] = params;
    db.medicine_reminder_times.push({
      id: newId,
      medicine_id: Number(medicine_id),
      reminder_time,
      day_of_week: day_of_week !== undefined && day_of_week !== null ? Number(day_of_week) : null
    });
    saveFileDb();
    return [{ insertId: newId, affectedRows: 1 }];
  }

  if (/^DELETE\s+FROM\s+medicine_reminder_times\s+WHERE\s+medicine_id\s*=/i.test(trimmed)) {
    const medId = Number(params[0]);
    db.medicine_reminder_times = db.medicine_reminder_times.filter(t => t.medicine_id !== medId);
    saveFileDb();
    return [{ affectedRows: 1 }];
  }

  // 10. REMINDERS queries
  if (/^INSERT\s+IGNORE\s+INTO\s+reminders/i.test(trimmed) || /^INSERT\s+INTO\s+reminders/i.test(trimmed)) {
    const [medicine_id, user_id, scheduled_at, status] = params;
    const exists = db.reminders.some(
      r => r.medicine_id === Number(medicine_id) && 
           r.user_id === Number(user_id) && 
           new Date(r.scheduled_at).getTime() === new Date(scheduled_at).getTime()
    );
    if (exists) {
      return [{ insertId: 0, affectedRows: 0 }];
    }
    const newId = db.reminders.length ? Math.max(...db.reminders.map(r => r.id)) + 1 : 1;
    db.reminders.push({
      id: newId,
      medicine_id: Number(medicine_id),
      user_id: Number(user_id),
      scheduled_at,
      status: status || 'scheduled',
      action_at: null,
      created_at: new Date().toISOString()
    });
    saveFileDb();
    return [{ insertId: newId, affectedRows: 1 }];
  }

  if (/UPDATE\s+reminders\s+SET\s+status\s*=\s*\?,\s*action_at\s*=\s*NOW\(\)\s+WHERE\s+id\s*=\s*\?\s*AND\s+user_id\s*=/i.test(trimmed)) {
    const [status, id, user_id] = params;
    const reminder = db.reminders.find(r => r.id === Number(id) && r.user_id === Number(user_id));
    if (reminder) {
      reminder.status = status;
      reminder.action_at = new Date().toISOString();
      saveFileDb();
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // Update overdue reminders to missed
  if (/UPDATE\s+reminders\s+SET\s+status\s*=\s*'missed'/i.test(trimmed)) {
    const now = Date.now();
    let count = 0;
    db.reminders.forEach(r => {
      if (r.status === 'scheduled' && (now - new Date(r.scheduled_at).getTime() > 60 * 60 * 1000)) {
        r.status = 'missed';
        count++;
      }
    });
    if (count > 0) saveFileDb();
    return [{ affectedRows: count }];
  }

  // User list query
  if (/SELECT\s+.*?\s+FROM\s+users/i.test(trimmed)) {
    if (params.length > 0 && /WHERE\s+id\s*=/i.test(trimmed)) {
      const u = db.users.find(user => user.id === Number(params[0]));
      return [u ? [u] : []];
    }
    return [db.users.map(({ password_hash, ...rest }) => rest)];
  }

  // Medicines queries
  if (/SELECT\s+COUNT\(\*\)\s+as\s+total\s+FROM\s+medicines/i.test(trimmed)) {
    const userId = Number(params[0]);
    const count = db.medicines.filter(m => m.user_id === userId).length;
    return [[{ total: count }]];
  }

  if (/SELECT\s+m\.\*\s+FROM\s+medicines\s+m/i.test(trimmed)) {
    const userId = Number(params[0]);
    const list = db.medicines.filter(m => m.user_id === userId);
    return [list];
  }

  // Reminders COUNT stats queries
  if (/SELECT\s+COUNT\(\*\)\s+as\s+total\s+FROM\s+reminders/i.test(trimmed)) {
    const userId = Number(params[0]);
    let filtered = db.reminders.filter(r => r.user_id === userId);

    if (/DATE\(scheduled_at\)\s*=\s*\?/i.test(trimmed)) {
      const dateStr = params[1];
      filtered = filtered.filter(r => r.scheduled_at.startsWith(dateStr));
    } else if (/status\s*=\s*"scheduled"/i.test(trimmed)) {
      const now = new Date();
      filtered = filtered.filter(r => r.status === 'scheduled' && new Date(r.scheduled_at) >= now);
    } else if (/status\s*=\s*"taken"/i.test(trimmed)) {
      filtered = filtered.filter(r => r.status === 'taken');
    } else if (/status\s+IN\s+\("skipped",\s*"missed"\)/i.test(trimmed)) {
      filtered = filtered.filter(r => r.status === 'skipped' || r.status === 'missed');
    }

    return [[{ total: filtered.length }]];
  }

  // Due reminders join query for scheduler
  if (/SELECT\s+r\.id,\s*r\.scheduled_at.*?FROM\s+reminders\s+r\s+JOIN\s+medicines/i.test(trimmed)) {
    const now = new Date();
    const due = db.reminders
      .filter(r => r.status === 'scheduled' && new Date(r.scheduled_at) <= now)
      .map(r => {
        const med = db.medicines.find(m => m.id === r.medicine_id) || {};
        const user = db.users.find(u => u.id === r.user_id) || {};
        return {
          ...r,
          medicine_name: med.medicine_name || 'Unknown',
          dosage: med.dosage || '',
          instructions: med.instructions || '',
          user_name: user.name || 'User',
          user_email: user.email || ''
        };
      });
    return [due];
  }

  // Default join query for reminders
  if (/SELECT\s+.*?\s+FROM\s+reminders/i.test(trimmed)) {
    const userId = Number(params[0]);
    let results = db.reminders
      .filter(r => r.user_id === userId)
      .map(r => {
        const med = db.medicines.find(m => m.id === r.medicine_id) || {};
        return {
          ...r,
          medicine_name: med.medicine_name || 'Unknown',
          dosage: med.dosage || '',
          instructions: med.instructions || ''
        };
      });

    if (/DATE\(r\.scheduled_at\)\s*=\s*\?/i.test(trimmed)) {
      const targetDate = params[1] || new Date().toISOString().split('T')[0];
      results = results.filter(r => r.scheduled_at.startsWith(targetDate));
    } else if (/r\.scheduled_at\s*>=\s*\?\s*AND\s+r\.status\s*=\s*'scheduled'/i.test(trimmed)) {
      const nowStr = params[1];
      results = results.filter(r => r.scheduled_at >= nowStr && r.status === 'scheduled');
    }

    results.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    return [results];
  }

  // Default empty return
  return [[]];
}

module.exports = {
  initDb,
  query,
  isMySQL: () => isUsingMySQL,
  getPool: () => pool
};
