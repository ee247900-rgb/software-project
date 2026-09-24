const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

// Login handler for Admin & Staff
exports.login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const loginIdentifier = (email || username || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: 'Please provide email/username and password.' });
    }

    // 1. Check ADMIN table
    const admins = await query('SELECT * FROM ADMIN WHERE email = ?', [loginIdentifier]);
    if (admins.length > 0) {
      const admin = admins[0];
      const isMatch = await bcrypt.compare(password, admin.password);
      if (isMatch) {
        const token = jwt.sign(
          { id: admin.admin_id, email: admin.email, name: admin.name, role: 'admin' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        return res.json({
          message: 'Login successful',
          token,
          user: {
            id: admin.admin_id,
            name: admin.name,
            email: admin.email,
            role: 'admin'
          }
        });
      }
    }

    // 2. Check STAFF table
    const staffMembers = await query('SELECT * FROM STAFF WHERE email = ?', [loginIdentifier]);
    if (staffMembers.length > 0) {
      const staff = staffMembers[0];
      const isMatch = await bcrypt.compare(password, staff.password);
      if (isMatch) {
        const token = jwt.sign(
          {
            id: staff.staff_id,
            email: staff.email,
            name: staff.name,
            role: 'staff',
            department: staff.department,
            designation: staff.designation
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        return res.json({
          message: 'Login successful',
          token,
          user: {
            id: staff.staff_id,
            name: staff.name,
            email: staff.email,
            department: staff.department,
            designation: staff.designation,
            phone: staff.phone,
            role: 'staff'
          }
        });
      }
    }

    // Invalid credentials message as required by specs
    return res.status(401).json({ error: 'Invalid username or password' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login authentication.' });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    if (role === 'admin') {
      const admins = await query('SELECT admin_id as id, name, email, created_at FROM ADMIN WHERE admin_id = ?', [id]);
      if (admins.length === 0) return res.status(404).json({ error: 'User not found.' });
      return res.json({ ...admins[0], role: 'admin' });
    } else {
      const staff = await query('SELECT staff_id as id, name, department, designation, phone, email, created_at FROM STAFF WHERE staff_id = ?', [id]);
      if (staff.length === 0) return res.status(404).json({ error: 'User not found.' });
      return res.json({ ...staff[0], role: 'staff' });
    }
  } catch (err) {
    console.error('Profile fetch error:', err);
    return res.status(500).json({ error: 'Server error fetching user profile.' });
  }
};
