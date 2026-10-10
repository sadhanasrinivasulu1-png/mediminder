const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const authenticateToken = require('../middleware/auth');

// All reminder routes require authentication
router.use(authenticateToken);

router.get('/today', reminderController.getTodayReminders);
router.get('/upcoming', reminderController.getUpcomingReminders);
router.patch('/:id/status', reminderController.updateReminderStatus);
router.get('/history', reminderController.getReminderHistory);
router.get('/stats', reminderController.getDashboardStats);
router.post('/generate', reminderController.triggerGenerateReminders);

module.exports = router;
