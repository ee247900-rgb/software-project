const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

// Get all staff or search staff
exports.getAllStaff = async (req, res) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT staff_id, name, department, designation, phone, email, created_at FROM STAFF';
    let params = [];

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      sql += ' WHERE name LIKE ? OR department LIKE ? OR designation LIKE ? OR email LIKE ? OR phone LIKE ?';
      params = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];
    }

    sql += ' ORDER BY staff_id DESC';
    const staffList = await query(sql, params);
    res.json(staffList);
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({ error: 'Failed to fetch staff members.' });
  }
};

// Get single staff by ID
exports.getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await query('SELECT staff_id, name, department, designation, phone, email, created_at FROM STAFF WHERE staff_id = ?', [id]);
    if (staff.length === 0) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }
    res.json(staff[0]);
  } catch (err) {
    console.error('Error fetching staff by ID:', err);
    res.status(500).json({ error: 'Failed to fetch staff details.' });
  }
};

// Add new staff
exports.addStaff = async (req, res) => {
  try {
    const { name, department, designation, phone, email, password } = req.body;

    if (!name || !department || !designation || !phone || !email) {
      return res.status(400).json({ error: 'Please provide all required fields (Name, Department, Designation, Phone, Email).' });
    }

    // Check duplicate email
    const existing = await query('SELECT staff_id FROM STAFF WHERE email = ?', [email.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Duplicate staff error: Staff with this email address already exists.' });
    }

    const defaultPass = password && password.trim() ? password.trim() : 'staff123';
    const hashedPassword = await bcrypt.hash(defaultPass, 10);

    const result = await query(
      'INSERT INTO STAFF (name, department, designation, phone, email, password) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), department.trim(), designation.trim(), phone.trim(), email.trim(), hashedPassword]
    );

    res.status(201).json({
      message: 'Staff member added successfully',
      staff_id: result.insertId
    });
  } catch (err) {
    console.error('Error adding staff:', err);
    res.status(500).json({ error: 'Failed to add staff member.' });
  }
};

// Update staff
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, designation, phone, email, password } = req.body;

    if (!name || !department || !designation || !phone || !email) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    // Check existing staff
    const existing = await query('SELECT staff_id FROM STAFF WHERE staff_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }

    // Check duplicate email for other staff
    const emailCheck = await query('SELECT staff_id FROM STAFF WHERE email = ? AND staff_id != ?', [email.trim(), id]);
    if (emailCheck.length > 0) {
      return res.status(400).json({ error: 'Duplicate staff email: Another staff member already uses this email.' });
    }

    if (password && password.trim()) {
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      await query(
        'UPDATE STAFF SET name = ?, department = ?, designation = ?, phone = ?, email = ?, password = ? WHERE staff_id = ?',
        [name.trim(), department.trim(), designation.trim(), phone.trim(), email.trim(), hashedPassword, id]
      );
    } else {
      await query(
        'UPDATE STAFF SET name = ?, department = ?, designation = ?, phone = ?, email = ? WHERE staff_id = ?',
        [name.trim(), department.trim(), designation.trim(), phone.trim(), email.trim(), id]
      );
    }

    res.json({ message: 'Staff member updated successfully.' });
  } catch (err) {
    console.error('Error updating staff:', err);
    res.status(500).json({ error: 'Failed to update staff member.' });
  }
};

// Delete staff
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await query('SELECT staff_id FROM STAFF WHERE staff_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }

    await query('DELETE FROM STAFF WHERE staff_id = ?', [id]);
    res.json({ message: 'Staff member deleted successfully.' });
  } catch (err) {
    console.error('Error deleting staff:', err);
    res.status(500).json({ error: 'Failed to delete staff member.' });
  }
};
