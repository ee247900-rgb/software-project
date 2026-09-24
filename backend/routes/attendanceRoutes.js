const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyAdmin, verifyToken, verifyStaffOrAdmin } = require('../middleware/auth');

router.post('/check-in', verifyToken, attendanceController.checkIn);
router.post('/check-out', verifyToken, attendanceController.checkOut);
router.get('/today', verifyToken, attendanceController.getTodayStatus);
router.get('/my', verifyToken, attendanceController.getMyAttendance);
router.get('/', verifyAdmin, attendanceController.getAllAttendance);

module.exports = router;
