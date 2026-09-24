const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { verifyAdmin, verifyStaffOrAdmin } = require('../middleware/auth');

router.get('/', verifyStaffOrAdmin, staffController.getAllStaff);
router.get('/:id', verifyStaffOrAdmin, staffController.getStaffById);
router.post('/', verifyAdmin, staffController.addStaff);
router.put('/:id', verifyAdmin, staffController.updateStaff);
router.delete('/:id', verifyAdmin, staffController.deleteStaff);

module.exports = router;
