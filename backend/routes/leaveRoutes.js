const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { verifyAdmin, verifyToken, verifyStaffOrAdmin } = require('../middleware/auth');

router.post('/', verifyToken, leaveController.applyLeave);
router.get('/my', verifyToken, leaveController.getMyLeaveRequests);
router.put('/:id/cancel', verifyToken, leaveController.cancelLeaveRequest);
router.get('/', verifyAdmin, leaveController.getAllLeaveRequests);
router.put('/:id/review', verifyAdmin, leaveController.reviewLeaveRequest);

module.exports = router;
