const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAllRead,
  markOneRead,
  createNotification,
  clearNotifications,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.post('/', protect, createNotification);
router.put('/read-all', protect, markAllRead);
router.put('/:id/read', protect, markOneRead);
router.delete('/', protect, clearNotifications);

module.exports = router;