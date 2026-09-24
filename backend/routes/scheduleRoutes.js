const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { verifyAdmin, verifyStaffOrAdmin, verifyToken } = require('../middleware/auth');

router.get('/my', verifyToken, scheduleController.getMySchedule);
router.get('/', verifyStaffOrAdmin, scheduleController.getSchedules);
router.post('/', verifyAdmin, scheduleController.assignShift);
router.put('/:id', verifyAdmin, scheduleController.updateSchedule);
router.delete('/:id', verifyAdmin, scheduleController.deleteSchedule);

module.exports = router;
