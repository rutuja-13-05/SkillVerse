// matchRoutes.js
const express = require('express');
const router = express.Router();
const { findMatches } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.post('/find', protect, findMatches);

module.exports = router;
