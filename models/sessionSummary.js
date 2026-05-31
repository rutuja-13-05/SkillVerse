const mongoose = require('mongoose');

const sessionSummarySchema = new mongoose.Schema(
  {
    sessionId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: false, default: null },
    submittedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role:         { type: String, enum: ['teacher', 'student'], required: true },
    skill:        { type: String, required: true },
    partnerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    partnerName:  { type: String, default: '' },

    // Teacher fills
    topicsCovered:    { type: String, default: '' },
    keyPoints:        [{ type: String }],
    homework:         { type: String, default: '' },
    nextSessionPlan:  { type: String, default: '' },
    studentPerformance: { type: Number, min: 1, max: 5, default: null },

    // Student fills
    whatILearned:     { type: String, default: '' },
    doubtsRemaining:  { type: String, default: '' },
    practiceGoal:     { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SessionSummary', sessionSummarySchema);