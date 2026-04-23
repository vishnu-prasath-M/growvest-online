const Settings = require('../models/Settings');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get all settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.find().sort({ key: 1 });
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

// Get specific setting
exports.getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOne({ key });
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    res.status(200).json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching setting', error: error.message });
  }
};

// Update setting
exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const setting = await Settings.findOneAndUpdate(
      { key },
      {
        value,
        updatedAt: new Date(),
        updatedBy: req.user ? req.user.id : null
      },
      { new: true, upsert: true }
    );

    res.status(200).json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Error updating setting', error: error.message });
  }
};

// Update admin password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Find admin user (assuming first user is admin)
    const admin = await User.findOne().sort({ createdAt: 1 });
    if (!admin) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating password', error: error.message });
  }
};

// Initialize default settings
exports.initializeSettings = async () => {
  try {
    const defaultSettings = [
      {
        key: 'upiId',
        value: 'q751029321@ybl',
        description: 'Admin UPI ID for payments'
      }
    ];

    for (const setting of defaultSettings) {
      const exists = await Settings.findOne({ key: setting.key });
      if (!exists) {
        await Settings.create(setting);
      }
    }
  } catch (error) {
    console.error('Error initializing settings:', error);
  }
};
