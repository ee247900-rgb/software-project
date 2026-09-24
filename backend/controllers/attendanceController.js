const { query } = require('../config/db');

// Get formatted current time HH:MM:SS
const getCurrentTimeString = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

// Staff Check-In
exports.checkIn = async (req, res) => {
  try {
    const staff_id = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const timeStr = getCurrentTimeString();

    // Check if record exists for today
    const existing = await query('SELECT * FROM ATTENDANCE WHERE staff_id = ? AND date = ?', [staff_id, today]);
    
    if (existing.length > 0) {
      if (existing[0].check_in) {
        return res.status(400).json({ error: 'You have already checked in today.' });
      }
      await query('UPDATE ATTENDANCE SET check_in = ? WHERE attend_id = ?', [timeStr, existing[0].attend_id]);
    } else {
      await query('INSERT INTO ATTENDANCE (staff_id, date, check_in) VALUES (?, ?, ?)', [staff_id, today, timeStr]);
    }

    res.json({ message: 'Checked in successfully.', check_in: timeStr });
  } catch (err) {
    console.error('Check-in error:', err);
    res.status(500).json({ error: 'Failed to record check-in.' });
  }
};

// Staff Check-Out
exports.checkOut = async (req, res) => {
  try {
    const staff_id = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const timeStr = getCurrentTimeString();

    const existing = await query('SELECT * FROM ATTENDANCE WHERE staff_id = ? AND date = ?', [staff_id, today]);

    if (existing.length === 0 || !existing[0].check_in) {
      return res.status(400).json({ error: 'You must check in before checking out.' });
    }

    if (existing[0].check_out) {
      return res.status(400).json({ error: 'You have already checked out today.' });
    }

    await query('UPDATE ATTENDANCE SET check_out = ? WHERE attend_id = ?', [timeStr, existing[0].attend_id]);

    res.json({ message: 'Checked out successfully.', check_out: timeStr });
  } catch (err) {
    console.error('Check-out error:', err);
    res.status(500).json({ error: 'Failed to record check-out.' });
  }
};

// Staff Today's Status
exports.getTodayStatus = async (req, res) => {
  try {
    const staff_id = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const records = await query('SELECT * FROM ATTENDANCE WHERE staff_id = ? AND date = ?', [staff_id, today]);
    if (records.length === 0) {
      return res.json({ date: today, check_in: null, check_out: null, status: 'Not Checked In' });
    }

    const rec = records[0];
    let status = 'Not Checked In';
    if (rec.check_in && !rec.check_out) status = 'Checked In';
    if (rec.check_in && rec.check_out) status = 'Completed';

    res.json({ ...rec, status });
  } catch (err) {
    console.error('Error fetching today status:', err);
    res.status(500).json({ error: 'Failed to fetch attendance status.' });
  }
};

// Staff View Their Own Attendance Log
exports.getMyAttendance = async (req, res) => {
  try {
    const staff_id = req.user.id;
    const records = await query(
      'SELECT attend_id, date, check_in, check_out, created_at FROM ATTENDANCE WHERE staff_id = ? ORDER BY date DESC',
      [staff_id]
    );

    const formatted = records.map(r => ({
      ...r,
      status: r.check_out ? 'Present (Completed)' : (r.check_in ? 'Present (In Progress)' : 'Absent')
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching staff attendance:', err);
    res.status(500).json({ error: 'Failed to fetch attendance records.' });
  }
};

// Admin View All Attendance Records
exports.getAllAttendance = async (req, res) => {
  try {
    const { date, staff_id, from_date, to_date } = req.query;

    let sql = `
      SELECT 
        a.attend_id,
        a.staff_id,
        s.name as staff_name,
        s.department,
        s.designation,
        a.date,
        a.check_in,
        a.check_out,
        a.created_at
      FROM ATTENDANCE a
      JOIN STAFF s ON a.staff_id = s.staff_id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      sql += ' AND a.date = ?';
      params.push(date);
    }
    if (staff_id) {
      sql += ' AND a.staff_id = ?';
      params.push(staff_id);
    }
    if (from_date && to_date) {
      sql += ' AND a.date BETWEEN ? AND ?';
      params.push(from_date, to_date);
    }

    sql += ' ORDER BY a.date DESC, a.check_in DESC';

    const records = await query(sql, params);

    const formatted = records.map(r => ({
      ...r,
      status: r.check_out ? 'Present (Completed)' : (r.check_in ? 'Present (Checked In)' : 'Absent')
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching attendance records:', err);
    res.status(500).json({ error: 'Failed to fetch attendance.' });
  }
};
