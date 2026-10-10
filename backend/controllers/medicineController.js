const Medicine = require('../models/Medicine');
const { generateReminders } = require('../jobs/reminderScheduler');

exports.createMedicine = async (req, res, next) => {
  try {
    const { medicine_name, dosage, instructions, start_date, end_date, frequency, reminder_times } = req.body;

    if (!medicine_name || !dosage || !start_date) {
      return res.status(400).json({
        success: false,
        message: 'Medicine name, dosage, and start date are required.'
      });
    }

    const newMed = await Medicine.create({
      userId: req.user.id,
      medicine_name,
      dosage,
      instructions,
      start_date,
      end_date,
      frequency: frequency || 'daily',
      reminder_times: reminder_times || []
    });

    // Generate upcoming reminders for today immediately
    await generateReminders(req.user.id);

    res.status(201).json({
      success: true,
      message: 'Medicine schedule added successfully.',
      medicine: newMed
    });
  } catch (error) {
    next(error);
  }
};

exports.getMedicines = async (req, res, next) => {
  try {
    const medicines = await Medicine.findByUserId(req.user.id);
    res.status(200).json({
      success: true,
      medicines
    });
  } catch (error) {
    next(error);
  }
};

exports.getMedicineById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const medicine = await Medicine.findById(id, req.user.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine schedule not found.'
      });
    }

    res.status(200).json({
      success: true,
      medicine
    });
  } catch (error) {
    next(error);
  }
};

exports.updateMedicine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { medicine_name, dosage, instructions, start_date, end_date, frequency, reminder_times } = req.body;

    const updated = await Medicine.update(id, req.user.id, {
      medicine_name,
      dosage,
      instructions,
      start_date,
      end_date,
      frequency,
      reminder_times
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found or unauthorized.'
      });
    }

    // Refresh today's reminders
    await generateReminders(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Medicine schedule updated successfully.',
      medicine: updated
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteMedicine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Medicine.delete(id, req.user.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found or unauthorized.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Medicine schedule deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
