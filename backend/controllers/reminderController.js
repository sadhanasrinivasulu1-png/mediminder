const Reminder = require('../models/Reminder');
const { generateReminders } = require('../jobs/reminderScheduler');

exports.getTodayReminders = async (req, res, next) => {
  try {
    const { date } = req.query;
    // Ensure today's reminders are generated first
    await generateReminders(req.user.id);

    const reminders = await Reminder.getToday(req.user.id, date);
    res.status(200).json({
      success: true,
      reminders
    });
  } catch (error) {
    next(error);
  }
};

exports.getUpcomingReminders = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const reminders = await Reminder.getUpcoming(req.user.id, limit);
    res.status(200).json({
      success: true,
      reminders
    });
  } catch (error) {
    next(error);
  }
};

exports.updateReminderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['taken', 'skipped', 'missed', 'scheduled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (taken, skipped, missed, or scheduled).'
      });
    }

    const updated = await Reminder.updateStatus(id, req.user.id, status);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found or unauthorized.'
      });
    }

    res.status(200).json({
      success: true,
      message: `Reminder marked as ${status}.`,
      reminder: updated
    });
  } catch (error) {
    next(error);
  }
};

exports.getReminderHistory = async (req, res, next) => {
  try {
    const { status, startDate, endDate, limit } = req.query;
    const history = await Reminder.getHistory(req.user.id, {
      status,
      startDate,
      endDate,
      limit: parseInt(limit, 10) || 100
    });

    res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    // Refresh today's reminders in advance
    await generateReminders(req.user.id);
    const stats = await Reminder.getDashboardStats(req.user.id);

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

exports.triggerGenerateReminders = async (req, res, next) => {
  try {
    await generateReminders(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Reminders successfully generated from active schedules.'
    });
  } catch (error) {
    next(error);
  }
};
