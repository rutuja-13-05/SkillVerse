const express = require('express');
const router = express.Router();
const {
  createSession,
  acceptSession,
  rejectSession,
  getMySessions,
  cancelSession,
  completeSession,
} = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createSession);
router.get('/', protect, getMySessions);
router.put('/:id/accept', protect, acceptSession);
router.put('/:id/reject', protect, rejectSession);
router.put('/:id/cancel', protect, cancelSession);
router.put('/:id/complete', protect, completeSession);

module.exports = router;