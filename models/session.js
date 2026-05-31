const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    partner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    skill: { type: String, required: true },
    date: { type: String },
    time: { type: String },
    duration: { type: Number, default: 60 },
    notes: { type: String, default: '' },
    roomId: { type: String },
    status: {
      type: String,
      enum: ['upcoming', 'pending', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    level: { type: String, default: 'Beginner' },
    ratedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);