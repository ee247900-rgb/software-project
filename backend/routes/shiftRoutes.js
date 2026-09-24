const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const { verifyAdmin, verifyStaffOrAdmin } = require('../middleware/auth');

router.get('/', verifyStaffOrAdmin, shiftController.getAllShifts);
router.post('/', verifyAdmin, shiftController.createShift);
router.put('/:id', verifyAdmin, shiftController.updateShift);
router.delete('/:id', verifyAdmin, shiftController.deleteShift);

module.exports = router;
