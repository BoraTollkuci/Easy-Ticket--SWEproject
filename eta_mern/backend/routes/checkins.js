const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getCheckInLogs } = require('../controllers/checkInController');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'busman'));

router.get('/', getCheckInLogs);

module.exports = router;
