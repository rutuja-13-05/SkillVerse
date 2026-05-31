const express = require('express');
const router = express.Router();
const SessionSummary = require('../models/sessionSummary');
const { protect } = require('../middleware/authMiddleware');

// POST /api/summary — submit a session summary
router.post('/', protect, async (req, res) => {
  try {
    const { sessionId, role, skill, partnerId, partnerName,
            topicsCovered, keyPoints, homework, nextSessionPlan, studentPerformance,
            whatILearned, doubtsRemaining, practiceGoal } = req.body;

    // sessionId may be 'manual' if not coming from a real session — store as null
    const mongoose = require('mongoose');
    const validSessionId = sessionId && mongoose.Types.ObjectId.isValid(sessionId) ? sessionId : null;
    const summary = await SessionSummary.create({
      sessionId: validSessionId, submittedBy: req.user.id, role, skill,
      partnerId, partnerName,
      topicsCovered, keyPoints, homework, nextSessionPlan, studentPerformance,
      whatILearned, doubtsRemaining, practiceGoal,
    });
    res.status(201).json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/summary/my — get all my summaries (as teacher or student)
router.get('/my', protect, async (req, res) => {
  try {
    const summaries = await SessionSummary.find({ submittedBy: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ success: true, summaries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/summary/session/:sessionId — get summaries for a specific session
router.get('/session/:sessionId', protect, async (req, res) => {
  try {
    const summaries = await SessionSummary.find({ sessionId: req.params.sessionId })
      .populate('submittedBy', 'name');
    res.json({ success: true, summaries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/summary/check/:sessionId — check if current user already submitted
router.get('/check/:sessionId', protect, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.sessionId)) {
      return res.json({ submitted: false });
    }
    const existing = await SessionSummary.findOne({
      sessionId: req.params.sessionId,
      submittedBy: req.user.id,
    });
    res.json({ submitted: !!existing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;