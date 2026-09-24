const { query } = require('../config/db');

// Staff Apply for Leave
exports.applyLeave = async (req, res) => {
  try {
    const staff_id = req.user.id;
    const { from_date, to_date, reason } = req.body;

    if (!from_date || !to_date || !reason) {
      return res.status(400).json({ error: 'Please provide From Date, To Date, and Reason for leave.' });
    }

    if (new Date(from_date) > new Date(to_date)) {
      return res.status(400).json({ error: 'Invalid date range: From Date cannot be after To Date.' });
    }

    const result = await query(
      'INSERT INTO LEAVE_REQUEST (staff_id, from_date, to_date, reason, status) VALUES (?, ?, ?, ?, ?)',
      [staff_id, from_date, to_date, reason.trim(), 'Pending']
    );

    res.status(201).json({
      message: 'Leave request submitted successfully.',
      leave_id: result.insertId
    });
  } catch (err) {
    console.error('Error applying for leave:', err);
    res.status(500).json({ error: 'Failed to submit leave request.' });
  }
};

// Staff View Their Own Leave Requests
exports.getMyLeaveRequests = async (req, res) => {
  try {
    const staff_id = req.user.id;
    const requests = await query(
      'SELECT leave_id, from_date, to_date, reason, status, created_at FROM LEAVE_REQUEST WHERE staff_id = ? ORDER BY created_at DESC',
      [staff_id]
    );
    res.json(requests);
  } catch (err) {
    console.error('Error fetching staff leave requests:', err);
    res.status(500).json({ error: 'Failed to fetch leave requests.' });
  }
};

// Staff Cancel Leave Request
exports.cancelLeaveRequest = async (req, res) => {
  try {
    const staff_id = req.user.id;
    const { id } = req.params;

    const request = await query('SELECT * FROM LEAVE_REQUEST WHERE leave_id = ? AND staff_id = ?', [id, staff_id]);
    if (request.length === 0) {
      return res.status(404).json({ error: 'Leave request not found.' });
    }

    if (request[0].status !== 'Pending') {
      return res.status(400).json({ error: 'Only pending leave requests can be cancelled.' });
    }

    await query('UPDATE LEAVE_REQUEST SET status = ? WHERE leave_id = ?', ['Cancelled', id]);
    res.json({ message: 'Leave request cancelled successfully.' });
  } catch (err) {
    console.error('Error cancelling leave request:', err);
    res.status(500).json({ error: 'Failed to cancel leave request.' });
  }
};

// Admin View All Leave Requests
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT 
        l.leave_id,
        l.staff_id,
        s.name as staff_name,
        s.department,
        s.designation,
        s.email as staff_email,
        l.from_date,
        l.to_date,
        l.reason,
        l.status,
        l.created_at
      FROM LEAVE_REQUEST l
      JOIN STAFF s ON l.staff_id = s.staff_id
    `;
    const params = [];

    if (status && status !== 'All') {
      sql += ' WHERE l.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY l.created_at DESC';

    const requests = await query(sql, params);
    res.json(requests);
  } catch (err) {
    console.error('Error fetching all leave requests:', err);
    res.status(500).json({ error: 'Failed to fetch leave requests.' });
  }
};

// Admin Review (Approve / Reject) Leave Request
exports.reviewLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Approved' or 'Rejected'

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be Approved or Rejected.' });
    }

    const request = await query('SELECT leave_id FROM LEAVE_REQUEST WHERE leave_id = ?', [id]);
    if (request.length === 0) {
      return res.status(404).json({ error: 'Leave request not found.' });
    }

    await query('UPDATE LEAVE_REQUEST SET status = ? WHERE leave_id = ?', [status, id]);
    res.json({ message: `Leave request has been ${status.toLowerCase()}.` });
  } catch (err) {
    console.error('Error reviewing leave request:', err);
    res.status(500).json({ error: 'Failed to update leave request.' });
  }
};
