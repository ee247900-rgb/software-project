const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'staff_scheduling_secret_key_2026_super_secure';

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No authorization token provided.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Invalid token format.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// Admin only middleware
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ error: 'Access denied. Admin authorization required.' });
    }
  });
};

// Staff only or Admin middleware
const verifyStaffOrAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
      next();
    } else {
      return res.status(403).json({ error: 'Access denied. Unauthorized role.' });
    }
  });
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyStaffOrAdmin,
  JWT_SECRET
};
