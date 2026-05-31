const express = require('express');
const router = express.Router();
const Message = require('../models/chat');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// Get chat history
router.get('/:chatId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .sort({ createdAt: 1 })
      .limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save a message + create notification for receiver
router.post('/', protect, async (req, res) => {
  try {
    const { chatId, receiverId, message } = req.body;
    const senderName = req.user.name;

    const msg = await Message.create({
      chatId,
      senderId: req.user.id,
      senderName,
      receiverId,
      message,
    });

    await Notification.create({
      userId: receiverId,
      type: 'New Message',
      content: `${senderName} sent you a message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`,
      link: `/chat/${req.user.id}`,
      read: false,
    });

    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a message — only the sender can delete their own message
router.delete('/:messageId', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.senderId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });
    await Message.findByIdAndDelete(req.params.messageId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;