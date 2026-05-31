const User = require('../models/user');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      userId: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({
      success: true,
      token: generateToken(user._id),
      userId: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update user profile
const updateProfile = async (req, res) => {
  try {
    const { skillsToTeach, skillsToLearn, bio, name } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (skillsToTeach !== undefined) user.skillsToTeach = skillsToTeach;
    if (skillsToLearn !== undefined) user.skillsToLearn = skillsToLearn;
    if (bio !== undefined) user.bio = bio;
    if (name !== undefined) user.name = name;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Rate a user after session
const rateUser = async (req, res) => {
  try {
    const { rateeId, rating, tags, comment, skill, sessionId } = req.body;
    const raterId = req.user.id;
    if (raterId === rateeId)
      return res.status(400).json({ message: 'Cannot rate yourself' });
    const ratee = await User.findById(rateeId);
    if (!ratee) return res.status(404).json({ message: 'User not found' });
    ratee.ratings.push({ raterId, rating, tags, comment, skill });
    const total = ratee.ratings.reduce((sum, r) => sum + r.rating, 0);
    ratee.avgRating = parseFloat((total / ratee.ratings.length).toFixed(2));
    ratee.ratingCount = ratee.ratings.length;
    ratee.xp = (ratee.xp || 0) + 10;
    ratee.level = Math.floor(ratee.xp / 200) + 1;
    await ratee.save();
    const rater = await User.findById(raterId);
    if (rater) {
      rater.xp = (rater.xp || 0) + rating * 5;
      rater.level = Math.floor(rater.xp / 200) + 1;
      await rater.save();
    }
    // Mark session as rated by this user so dashboard doesn't show it as pending
    if (sessionId) {
      const Session = require('../models/session');
      await Session.findByIdAndUpdate(sessionId, {
        $addToSet: { ratedBy: raterId }
      });
    }

    res.json({ success: true, message: 'Rating submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({})
      .select('name xp avgRating level')
      .sort({ xp: -1 })
      .limit(10);
    const leaderboard = users.map((u) => ({
      name: u.name,
      xp: u.xp || 0,
      rating: u.avgRating || 0,
      level: u.level || 1,
    }));
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get connections — ONLY users with accepted/completed sessions
// @route   GET /api/users/connections
const getConnections = async (req, res) => {
  try {
    const Session = require('../models/session');

    // Find sessions where current user is creator OR partner
    // with status upcoming (accepted) or completed
    const sessions = await Session.find({
      $or: [
        { creator: req.user.id },
        { partner: req.user.id }
      ],
      status: { $in: ['upcoming', 'completed'] }
    });

    // Get the OTHER person's ID from each session
    const connectedUserIds = [...new Set(
      sessions
        .map(s =>
          s.creator.toString() === req.user.id
            ? s.partner?.toString()
            : s.creator.toString()
        )
        .filter(Boolean)
    )];

    if (connectedUserIds.length === 0) {
      return res.json([]);
    }

    const users = await User.find({ _id: { $in: connectedUserIds } })
      .select('name email _id skillsToTeach skillsToLearn avgRating');

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Add XP from quiz
const addXP = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.xp = (user.xp || 0) + amount;
    user.level = Math.floor(user.xp / 200) + 1;
    await user.save();
    res.json({ success: true, xp: user.xp, level: user.level });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  rateUser,
  getLeaderboard,
  getConnections,
  addXP,
};