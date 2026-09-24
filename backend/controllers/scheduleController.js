const { query } = require('../config/db');

// Assign Shift to Staff
exports.assignShift = async (req, res) => {
  try {
    const { staff_id, shift_id, date, status } = req.body;

    if (!staff_id || !shift_id || !date) {
      return res.status(400).json({ error: 'Please select staff, shift, and date.' });
    }

    // Check if staff exists
    const staff = await query('SELECT staff_id FROM STAFF WHERE staff_id = ?', [staff_id]);
    if (staff.length === 0) {
      return res.status(404).json({ error: 'Selected staff member does not exist.' });
    }

    // Check if shift exists
    const shift = await query('SELECT shift_id FROM SHIFT WHERE shift_id = ?', [shift_id]);
    if (shift.length === 0) {
      return res.status(404).json({ error: 'Selected shift does not exist.' });
    }

    // Conflict check: check if staff already has a shift assigned on this date
    const existing = await query('SELECT schedule_id FROM STAFF_SCHEDULE WHERE staff_id = ? AND date = ?', [staff_id, date]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Duplicate shift assignment error: Staff member already has a shift scheduled on this date.' });
    }

    const scheduleStatus = status || 'Assigned';
    const result = await query(
      'INSERT INTO STAFF_SCHEDULE (staff_id, shift_id, date, status) VALUES (?, ?, ?, ?)',
      [staff_id, shift_id, date, scheduleStatus]
    );

    res.status(201).json({
      message: 'Shift assigned successfully',
      schedule_id: result.insertId
    });
  } catch (err) {
    console.error('Error assigning shift:', err);
    res.status(500).json({ error: 'Failed to assign shift.' });
  }
};

// Get Schedules (with filters for Admin)
exports.getSchedules = async (req, res) => {
  try {
    const { staff_id, department, date, shift_id, status } = req.query;

    let sql = `
      SELECT 
        sc.schedule_id,
        sc.staff_id,
        st.name as staff_name,
        st.department,
        st.designation,
        st.email as staff_email,
        sc.shift_id,
        sh.shift_type,
        sh.start_time,
        sc.date,
        sc.status,
        sc.created_at
      FROM STAFF_SCHEDULE sc
      JOIN STAFF st ON sc.staff_id = st.staff_id
      JOIN SHIFT sh ON sc.shift_id = sh.shift_id
      WHERE 1=1
    `;
    const params = [];

    if (staff_id) {
      sql += ' AND sc.staff_id = ?';
      params.push(staff_id);
    }
    if (department) {
      sql += ' AND st.department = ?';
      params.push(department);
    }
    if (date) {
      sql += ' AND sc.date = ?';
      params.push(date);
    }
    if (shift_id) {
      sql += ' AND sc.shift_id = ?';
      params.push(shift_id);
    }
    if (status) {
      sql += ' AND sc.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY sc.date DESC, sh.start_time ASC';

    const schedules = await query(sql, params);
    res.json(schedules);
  } catch (err) {
    console.error('Error fetching schedules:', err);
    res.status(500).json({ error: 'Failed to fetch schedules.' });
  }
};

// Staff view their own assigned schedule
exports.getMySchedule = async (req, res) => {
  try {
    const staff_id = req.user.id;

    const sql = `
      SELECT 
        sc.schedule_id,
        sc.shift_id,
        sh.shift_type,
        sh.start_time,
        sc.date,
        sc.status,
        sc.created_at
      FROM STAFF_SCHEDULE sc
      JOIN SHIFT sh ON sc.shift_id = sh.shift_id
      WHERE sc.staff_id = ?
      ORDER BY sc.date DESC, sh.start_time ASC
    `;

    const schedules = await query(sql, [staff_id]);
    res.json(schedules);
  } catch (err) {
    console.error('Error fetching staff schedule:', err);
    res.status(500).json({ error: 'Failed to fetch schedule.' });
  }
};

// Update schedule status / shift
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { shift_id, date, status } = req.body;

    const existing = await query('SELECT schedule_id FROM STAFF_SCHEDULE WHERE schedule_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Schedule record not found.' });
    }

    let sql = 'UPDATE STAFF_SCHEDULE SET ';
    const updates = [];
    const params = [];

    if (shift_id) {
      updates.push('shift_id = ?');
      params.push(shift_id);
    }
    if (date) {
      updates.push('date = ?');
      params.push(date);
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields provided to update.' });
    }

    sql += updates.join(', ') + ' WHERE schedule_id = ?';
    params.push(id);

    await query(sql, params);
    res.json({ message: 'Schedule updated successfully.' });
  } catch (err) {
    console.error('Error updating schedule:', err);
    res.status(500).json({ error: 'Failed to update schedule.' });
  }
};

// Delete schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM STAFF_SCHEDULE WHERE schedule_id = ?', [id]);
    res.json({ message: 'Schedule assignment deleted successfully.' });
  } catch (err) {
    console.error('Error deleting schedule:', err);
    res.status(500).json({ error: 'Failed to delete schedule.' });
  }
};
