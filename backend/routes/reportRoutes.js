const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/stats', verifyAdmin, reportController.getDashboardStats);
router.get('/generate', verifyAdmin, reportController.generateReport);

module.exports = router;
