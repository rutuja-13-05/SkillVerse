const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true }, // 'New Message', 'Session Request', 'Session Accepted', 'Session Cancelled', 'Session Completed'
    content: { type: String, required: true },
    link: { type: String, default: '/dashboard' },
    read: { type: Boolean, default: false },

    // Extra data for session requests so receiver can accept/reject
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', default: null },
    sessionDetails: {
      skill: { type: String, default: '' },
      date: { type: String, default: '' },
      time: { type: String, default: '' },
      duration: { type: Number, default: 60 },
      level: { type: String, default: '' },
      notes: { type: String, default: '' },
      senderName: { type: String, default: '' },
      senderId: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);