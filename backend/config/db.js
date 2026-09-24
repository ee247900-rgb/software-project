const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let dbType = 'mysql'; // 'mysql' or 'sqlite'
let pool = null;
let sqliteDb = null;

// Helper to run query regardless of dbType
async function query(sql, params = []) {
  if (dbType === 'mysql') {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      console.error('MySQL Query Error:', err.message, '\nSQL:', sql);
      throw err;
    }
  } else {
    // SQLite query adapter
    return new Promise((resolve, reject) => {
      // Normalize MySQL syntax to SQLite if needed
      let sqliteSql = sql
        .replace(/AUTO_INCREMENT/gi, 'AUTOINCREMENT')
        .replace(/ENGINE=InnoDB/gi, '')
        .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/gi, 'DATETIME DEFAULT CURRENT_TIMESTAMP');

      const isSelect = sqliteSql.trim().toUpperCase().startsWith('SELECT');
      const isInsert = sqliteSql.trim().toUpperCase().startsWith('INSERT');
      
      if (isSelect) {
        sqliteDb.all(sqliteSql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        sqliteDb.run(sqliteSql, params, function (err) {
          if (err) reject(err);
          else {
            if (isInsert) {
              resolve({ insertId: this.lastID, affectedRows: this.changes });
            } else {
              resolve({ affectedRows: this.changes });
            }
          }
        });
      }
    });
  }
}

async function initDB() {
  const passwordsToTry = [process.env.DB_PASSWORD || 'root', '', 'root', 'password', '123456', 'mysql'];
  let mysqlConnected = false;

  for (const pass of passwordsToTry) {
    try {
      // First connect without DB selected to ensure DB exists
      const tempConn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: pass
      });

      await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'staff_schedule_db'}\`;`);
      await tempConn.end();

      // Create main pool
      pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: pass,
        database: process.env.DB_NAME || 'staff_schedule_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      // Test pool connection
      const [testRes] = await pool.query('SELECT 1');
      mysqlConnected = true;
      dbType = 'mysql';
      console.log(`✅ MySQL connected successfully to database "${process.env.DB_NAME || 'staff_schedule_db'}" with user "${process.env.DB_USER || 'root'}"`);
      break;
    } catch (err) {
      // Continue trying password
    }
  }

  if (!mysqlConnected) {
    console.warn('⚠️ Could not connect to local MySQL with tested credentials. Falling back to SQLite for seamless execution.');
    dbType = 'sqlite';
    const dbPath = path.join(__dirname, '..', 'staff_schedule.sqlite');
    sqliteDb = new sqlite3.Database(dbPath);
  }

  // Execute Table Schemas
  await createTables();
  await seedInitialData();
}

async function createTables() {
  if (dbType === 'mysql') {
    await query(`
      CREATE TABLE IF NOT EXISTS ADMIN (
        admin_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS STAFF (
        staff_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        designation VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS SHIFT (
        shift_id INT AUTO_INCREMENT PRIMARY KEY,
        shift_type VARCHAR(50) NOT NULL,
        start_time TIME NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS STAFF_SCHEDULE (
        schedule_id INT AUTO_INCREMENT PRIMARY KEY,
        staff_id INT NOT NULL,
        shift_id INT NOT NULL,
        date DATE NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Assigned',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (staff_id) REFERENCES STAFF(staff_id) ON DELETE CASCADE,
        FOREIGN KEY (shift_id) REFERENCES SHIFT(shift_id) ON DELETE CASCADE,
        UNIQUE KEY unique_staff_shift_date (staff_id, date)
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS LEAVE_REQUEST (
        leave_id INT AUTO_INCREMENT PRIMARY KEY,
        staff_id INT NOT NULL,
        from_date DATE NOT NULL,
        to_date DATE NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (staff_id) REFERENCES STAFF(staff_id) ON DELETE CASCADE
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS ATTENDANCE (
        attend_id INT AUTO_INCREMENT PRIMARY KEY,
        staff_id INT NOT NULL,
        date DATE NOT NULL,
        check_in TIME DEFAULT NULL,
        check_out TIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (staff_id) REFERENCES STAFF(staff_id) ON DELETE CASCADE,
        UNIQUE KEY unique_staff_attendance_date (staff_id, date)
      );
    `);
  } else {
    // SQLite Table Creations
    await query(`
      CREATE TABLE IF NOT EXISTS ADMIN (
        admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS STAFF (
        staff_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        designation TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS SHIFT (
        shift_id INTEGER PRIMARY KEY AUTOINCREMENT,
        shift_type TEXT NOT NULL,
        start_time TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS STAFF_SCHEDULE (
        schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_id INTEGER NOT NULL,
        shift_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Assigned',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(staff_id, date)
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS LEAVE_REQUEST (
        leave_id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_id INTEGER NOT NULL,
        from_date TEXT NOT NULL,
        to_date TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS ATTENDANCE (
        attend_id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        check_in TEXT DEFAULT NULL,
        check_out TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(staff_id, date)
      );
    `);
  }
}

async function seedInitialData() {
  try {
    // Check if Admin exists
    const admins = await query('SELECT * FROM ADMIN WHERE email = ?', ['admin@system.com']);
    if (admins.length === 0) {
      const hashedAdminPass = await bcrypt.hash('admin123', 10);
      await query('INSERT INTO ADMIN (name, email, password) VALUES (?, ?, ?)', [
        'System Administrator',
        'admin@system.com',
        hashedAdminPass
      ]);
      console.log('🌱 Seeded default Admin account: admin@system.com / admin123');
    }

    // Check if Staff exists
    const staff = await query('SELECT * FROM STAFF');
    if (staff.length === 0) {
      const hashedStaffPass = await bcrypt.hash('staff123', 10);
      
      const res1 = await query(
        'INSERT INTO STAFF (name, department, designation, phone, email, password) VALUES (?, ?, ?, ?, ?, ?)',
        ['John Doe', 'Engineering', 'Senior Developer', '+1-555-0192', 'john@company.com', hashedStaffPass]
      );
      
      const res2 = await query(
        'INSERT INTO STAFF (name, department, designation, phone, email, password) VALUES (?, ?, ?, ?, ?, ?)',
        ['Jane Smith', 'Customer Support', 'Support Lead', '+1-555-0144', 'jane@company.com', hashedStaffPass]
      );

      const res3 = await query(
        'INSERT INTO STAFF (name, department, designation, phone, email, password) VALUES (?, ?, ?, ?, ?, ?)',
        ['Robert Johnson', 'Operations', 'Shift Supervisor', '+1-555-0188', 'robert@company.com', hashedStaffPass]
      );

      const res4 = await query(
        'INSERT INTO STAFF (name, department, designation, phone, email, password) VALUES (?, ?, ?, ?, ?, ?)',
        ['Emily Davis', 'Human Resources', 'HR Specialist', '+1-555-0177', 'emily@company.com', hashedStaffPass]
      );

      console.log('🌱 Seeded 4 default Staff members (password: staff123)');

      // Seed sample shifts
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      await query('INSERT INTO SHIFT (shift_type, start_time, date) VALUES (?, ?, ?)', ['Morning', '08:00:00', today]);
      await query('INSERT INTO SHIFT (shift_type, start_time, date) VALUES (?, ?, ?)', ['Afternoon', '14:00:00', today]);
      await query('INSERT INTO SHIFT (shift_type, start_time, date) VALUES (?, ?, ?)', ['Evening', '18:00:00', today]);
      await query('INSERT INTO SHIFT (shift_type, start_time, date) VALUES (?, ?, ?)', ['Night', '22:00:00', tomorrow]);

      // Get shifts
      const shifts = await query('SELECT * FROM SHIFT');
      if (shifts.length >= 3) {
        await query('INSERT INTO STAFF_SCHEDULE (staff_id, shift_id, date, status) VALUES (?, ?, ?, ?)', [1, shifts[0].shift_id, today, 'Assigned']);
        await query('INSERT INTO STAFF_SCHEDULE (staff_id, shift_id, date, status) VALUES (?, ?, ?, ?)', [2, shifts[1].shift_id, today, 'Assigned']);
        await query('INSERT INTO STAFF_SCHEDULE (staff_id, shift_id, date, status) VALUES (?, ?, ?, ?)', [3, shifts[2].shift_id, today, 'Assigned']);
      }

      // Seed sample Leave Request
      await query('INSERT INTO LEAVE_REQUEST (staff_id, from_date, to_date, reason, status) VALUES (?, ?, ?, ?, ?)', [
        2,
        tomorrow,
        new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        'Medical Leave for dental procedure',
        'Pending'
      ]);

      // Seed sample Attendance
      await query('INSERT INTO ATTENDANCE (staff_id, date, check_in, check_out) VALUES (?, ?, ?, ?)', [
        1,
        today,
        '08:05:12',
        '16:02:45'
      ]);

      console.log('🌱 Seeded initial Shifts, Schedules, Leave Requests, and Attendance records.');
    }
  } catch (err) {
    console.error('Error seeding data:', err);
  }
}

module.exports = {
  query,
  initDB,
  getDbType: () => dbType
};
