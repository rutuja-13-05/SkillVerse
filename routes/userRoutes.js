const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  rateUser,
  getLeaderboard,
  getConnections,
  addXP,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/rate', protect, rateUser);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/connections', protect, getConnections);
router.post('/xp', protect, addXP);

module.exports = router;
