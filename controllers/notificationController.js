const Notification = require('../models/Notification');

// @desc  Get all notifications for logged in user
// @route GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Mark all notifications as read
// @route PUT /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Mark one notification as read
// @route PUT /api/notifications/:id/read
const markOneRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Create a notification (called internally from other routes)
// @route POST /api/notifications
const createNotification = async (req, res) => {
  try {
    const { userId, type, content, link } = req.body;
    const notification = await Notification.create({ userId, type, content, link });
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Delete all notifications for user
// @route DELETE /api/notifications
const clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getNotifications,
  markAllRead,
  markOneRead,
  createNotification,
  clearNotifications,
};