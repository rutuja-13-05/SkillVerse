const Session = require('../models/session');
const User = require('../models/user');
const Notification = require('../models/Notification');

const generateRoomId = () => Math.random().toString(36).substring(2, 10);

// @desc    Create session request (status = pending until partner accepts)
// @route   POST /api/sessions
const createSession = async (req, res) => {
  try {
    const { skill, date, time, duration, notes, partnerId, level } = req.body;

    // If no partner → upcoming directly. If partner exists → pending until accepted
    const status = partnerId ? 'pending' : 'upcoming';

    const session = await Session.create({
      creator: req.user.id,
      partner: partnerId || null,
      skill,
      date,
      time,
      duration: duration || 60,
      notes: notes || '',
      roomId: generateRoomId(),
      status,
      level: level || 'Beginner',
    });

    // Notify partner with full session details so they can accept/reject
    if (partnerId) {
      const creator = await User.findById(req.user.id).select('name');
      await Notification.create({
        userId: partnerId,
        type: 'Session Request',
        content: `${creator.name} sent you a session request for "${skill}"`,
        link: '/mysessions',
        read: false,
        sessionId: session._id,
        sessionDetails: {
          skill,
          date: date || '',
          time: time || '',
          duration: duration || 60,
          level: level || 'Beginner',
          notes: notes || '',
          senderName: creator.name,
          senderId: req.user.id,
        },
      });
    }

    res.status(201).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Accept session request
// @route   PUT /api/sessions/:id/accept
const acceptSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('creator', 'name');
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.status = 'upcoming';
    await session.save();

    // Notify creator their request was accepted
    await Notification.create({
      userId: session.creator._id,
      type: 'Session Accepted',
      content: `${req.user.name} accepted your "${session.skill}" session request! It's now scheduled for ${session.date} at ${session.time}.`,
      link: '/mysessions',
      read: false,
    });

    res.json({ success: true, message: 'Session accepted!', session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Reject session request
// @route   PUT /api/sessions/:id/reject
const rejectSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('creator', 'name');
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.status = 'cancelled';
    await session.save();

    // Notify creator their request was rejected
    await Notification.create({
      userId: session.creator._id,
      type: 'Session Rejected',
      content: `${req.user.name} declined your "${session.skill}" session request.`,
      link: '/mysessions',
      read: false,
    });

    res.json({ success: true, message: 'Session rejected.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get my sessions
// @route   GET /api/sessions
const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ creator: req.user.id }, { partner: req.user.id }],
      status: { $ne: 'cancelled' },
    })
      .populate('creator', 'name email')
      .populate('partner', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Cancel session
// @route   PUT /api/sessions/:id/cancel
const cancelSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('creator', 'name');
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.status = 'cancelled';
    await session.save();

    const otherUserId =
      session.creator._id.toString() === req.user.id
        ? session.partner
        : session.creator._id;

    if (otherUserId) {
      await Notification.create({
        userId: otherUserId,
        type: 'Session Cancelled',
        content: `The "${session.skill}" session has been cancelled.`,
        link: '/mysessions',
        read: false,
      });
    }

    res.json({ success: true, message: 'Session cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Complete session + give XP
// @route   PUT /api/sessions/:id/complete
const completeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.status = 'completed';
    await session.save();

    await User.findByIdAndUpdate(session.creator, { $inc: { xp: 50, sessionsCompleted: 1 } });
    if (session.partner) {
      await User.findByIdAndUpdate(session.partner, { $inc: { xp: 50, sessionsCompleted: 1 } });
      await Notification.create({
        userId: session.partner,
        type: 'Session Completed',
        content: `Your "${session.skill}" session is complete! You earned +50 XP. Rate your partner now.`,
        link: '/feedback',
        read: false,
      });
    }

    res.json({ success: true, message: 'Session completed!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createSession, acceptSession, rejectSession, getMySessions, cancelSession, completeSession };