const { query } = require('../config/db');

// Admin Dashboard Summary Metrics
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Total Staff
    const totalStaffRes = await query('SELECT COUNT(*) as count FROM STAFF');
    const totalStaff = totalStaffRes[0].count;

    // 2. Total Shifts
    const totalShiftsRes = await query('SELECT COUNT(*) as count FROM SHIFT');
    const totalShifts = totalShiftsRes[0].count;

    // 3. Today's Scheduled Staff
    const todayScheduledRes = await query('SELECT COUNT(*) as count FROM STAFF_SCHEDULE WHERE date = ?', [today]);
    const todayScheduled = todayScheduledRes[0].count;

    // 4. Pending Leave Requests
    const pendingLeaveRes = await query('SELECT COUNT(*) as count FROM LEAVE_REQUEST WHERE status = ?', ['Pending']);
    const pendingLeave = pendingLeaveRes[0].count;

    // 5. Today's Attendance
    const todayAttendanceRes = await query('SELECT COUNT(*) as count FROM ATTENDANCE WHERE date = ? AND check_in IS NOT NULL', [today]);
    const todayAttendance = todayAttendanceRes[0].count;

    // Quick Activity List for Dashboard
    const recentSchedules = await query(`
      SELECT sc.schedule_id, st.name as staff_name, sh.shift_type, sh.start_time, sc.date, sc.status
      FROM STAFF_SCHEDULE sc
      JOIN STAFF st ON sc.staff_id = st.staff_id
      JOIN SHIFT sh ON sc.shift_id = sh.shift_id
      WHERE sc.date >= ?
      ORDER BY sc.date ASC LIMIT 5
    `, [today]);

    const recentLeaves = await query(`
      SELECT l.leave_id, st.name as staff_name, l.from_date, l.to_date, l.reason, l.status
      FROM LEAVE_REQUEST l
      JOIN STAFF st ON l.staff_id = st.staff_id
      ORDER BY l.created_at DESC LIMIT 5
    `);

    res.json({
      totalStaff,
      totalShifts,
      todayScheduled,
      pendingLeave,
      todayAttendance,
      recentSchedules,
      recentLeaves
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics.' });
  }
};

// Generate Comprehensive Reports
exports.generateReport = async (req, res) => {
  try {
    const { report_type, from_date, to_date } = req.query;

    if (!report_type) {
      return res.status(400).json({ error: 'Report type is required.' });
    }

    let reportData = [];

    switch (report_type) {
      case 'Staff Report':
      case 'staff':
        reportData = await query(
          'SELECT staff_id, name, department, designation, phone, email, created_at FROM STAFF ORDER BY department, name'
        );
        break;

      case 'Shift Report':
      case 'shift':
        if (from_date && to_date) {
          reportData = await query(
            'SELECT shift_id, shift_type, start_time, date, created_at FROM SHIFT WHERE date BETWEEN ? AND ? ORDER BY date DESC, start_time ASC',
            [from_date, to_date]
          );
        } else {
          reportData = await query(
            'SELECT shift_id, shift_type, start_time, date, created_at FROM SHIFT ORDER BY date DESC, start_time ASC'
          );
        }
        break;

      case 'Schedule Report':
      case 'schedule':
        if (from_date && to_date) {
          reportData = await query(
            `SELECT sc.schedule_id, st.name as staff_name, st.department, sh.shift_type, sh.start_time, sc.date, sc.status
             FROM STAFF_SCHEDULE sc
             JOIN STAFF st ON sc.staff_id = st.staff_id
             JOIN SHIFT sh ON sc.shift_id = sh.shift_id
             WHERE sc.date BETWEEN ? AND ?
             ORDER BY sc.date DESC`,
            [from_date, to_date]
          );
        } else {
          reportData = await query(
            `SELECT sc.schedule_id, st.name as staff_name, st.department, sh.shift_type, sh.start_time, sc.date, sc.status
             FROM STAFF_SCHEDULE sc
             JOIN STAFF st ON sc.staff_id = st.staff_id
             JOIN SHIFT sh ON sc.shift_id = sh.shift_id
             ORDER BY sc.date DESC`
          );
        }
        break;

      case 'Leave Report':
      case 'leave':
        if (from_date && to_date) {
          reportData = await query(
            `SELECT l.leave_id, st.name as staff_name, st.department, l.from_date, l.to_date, l.reason, l.status, l.created_at
             FROM LEAVE_REQUEST l
             JOIN STAFF st ON l.staff_id = st.staff_id
             WHERE l.from_date >= ? AND l.to_date <= ?
             ORDER BY l.created_at DESC`,
            [from_date, to_date]
          );
        } else {
          reportData = await query(
            `SELECT l.leave_id, st.name as staff_name, st.department, l.from_date, l.to_date, l.reason, l.status, l.created_at
             FROM LEAVE_REQUEST l
             JOIN STAFF st ON l.staff_id = st.staff_id
             ORDER BY l.created_at DESC`
          );
        }
        break;

      case 'Attendance Report':
      case 'attendance':
        if (from_date && to_date) {
          reportData = await query(
            `SELECT a.attend_id, st.name as staff_name, st.department, a.date, a.check_in, a.check_out
             FROM ATTENDANCE a
             JOIN STAFF st ON a.staff_id = st.staff_id
             WHERE a.date BETWEEN ? AND ?
             ORDER BY a.date DESC`,
            [from_date, to_date]
          );
        } else {
          reportData = await query(
            `SELECT a.attend_id, st.name as staff_name, st.department, a.date, a.check_in, a.check_out
             FROM ATTENDANCE a
             JOIN STAFF st ON a.staff_id = st.staff_id
             ORDER BY a.date DESC`
          );
        }
        break;

      default:
        return res.status(400).json({ error: 'Invalid report type selected.' });
    }

    res.json({
      report_type,
      from_date: from_date || null,
      to_date: to_date || null,
      total_records: reportData.length,
      data: reportData
    });
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: 'Failed to generate report.' });
  }
};
