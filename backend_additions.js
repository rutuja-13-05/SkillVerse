// ============================================================
// BACKEND ADDITIONS - Add these to your existing files
// ============================================================

// ── 1. ADD TO: models/user.js ──────────────────────────────
// Add these fields to your User schema:
/*
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  avgRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  sessionsCompleted: { type: Number, default: 0 },
  skillsToTeach: [String],
  skillsToLearn: [String],
  ratings: [
    {
      raterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: Number,
      tags: [String],
      comment: String,
      skill: String,
      date: { type: Date, default: Date.now }
    }
  ]
*/

// ── 2. ADD TO: controllers/userController.js ──────────────
const rateUser = async (req, res) => {
  try {
    const { rateeId, rating, tags, comment, skill } = req.body;
    const raterId = req.user.id;

    const User = require('../models/user');

    const ratee = await User.findById(rateeId);
    if (!ratee) return res.status(404).json({ message: 'User not found' });

    // Add rating
    ratee.ratings.push({ raterId, rating, tags, comment, skill });

    // Recalculate average
    const total = ratee.ratings.reduce((sum, r) => sum + r.rating, 0);
    ratee.avgRating = parseFloat((total / ratee.ratings.length).toFixed(2));
    ratee.ratingCount = ratee.ratings.length;

    // Give XP to rater
    const rater = await User.findById(raterId);
    if (rater) {
      rater.xp = (rater.xp || 0) + rating * 5;
      rater.level = Math.floor(rater.xp / 200) + 1;
      await rater.save();
    }

    // Give XP to ratee for being rated
    ratee.xp = (ratee.xp || 0) + 10;
    ratee.level = Math.floor(ratee.xp / 200) + 1;

    await ratee.save();

    res.json({ success: true, message: 'Rating submitted', newXP: rater?.xp });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const User = require('../models/user');
    const users = await User.find({})
      .select('name xp avgRating level')
      .sort({ xp: -1 })
      .limit(10);

    const leaderboard = users.map(u => ({
      name: u.name,
      xp: u.xp || 0,
      rating: u.avgRating || 0,
      level: u.level || 1,
    }));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getConnections = async (req, res) => {
  try {
    const User = require('../models/user');
    // Return all users except current user as connections
    // In production, you'd filter by actual matched users
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('name email _id')
      .limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── 3. ADD TO: routes/userRoutes.js ───────────────────────
/*
const { rateUser, getLeaderboard, getConnections } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/rate', protect, rateUser);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/connections', protect, getConnections);
*/

module.exports = { rateUser, getLeaderboard, getConnections };
