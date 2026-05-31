const express = require('express');
const router = express.Router();
const { getNotes, createNote, deleteNote, shareNote } = require('../controllers/notesController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getNotes);
router.post('/', protect, createNote);
router.delete('/:id', protect, deleteNote);
router.post('/:id/share', protect, shareNote);

module.exports = router;
