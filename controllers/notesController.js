const Note = require('../models/notes');
const Notification = require('../models/Notification');
const User = require('../models/user');

// @desc    Get my notes + notes shared with me
// @route   GET /api/notes
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      $or: [{ owner: req.user.id }, { sharedWith: req.user.id }],
    })
      .populate('owner', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, notes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create note
// @route   POST /api/notes
const createNote = async (req, res) => {
  try {
    const { title, content, skill, color } = req.body;
    const note = await Note.create({
      owner: req.user.id,
      title: title || 'Untitled Note',
      content,
      skill: skill || '',
      color: color || '#6366f1',
    });
    const populated = await note.populate('owner', 'name');
    res.status(201).json({ success: true, note: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.owner.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    await note.deleteOne();
    res.json({ success: true, message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Share note with a user + notify them
// @route   POST /api/notes/:id/share
const shareNote = async (req, res) => {
  try {
    const { userId } = req.body;
    const note = await Note.findById(req.params.id).populate('owner', 'name');
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (!note.sharedWith.map(String).includes(userId)) {
      note.sharedWith.push(userId);
      await note.save();
    }

    // Notify the recipient
    await Notification.create({
      userId,
      type: 'Note Shared',
      content: `${note.owner.name} shared a note "${note.title}" with you!`,
      link: '/notes',
      read: false,
    });

    res.json({ success: true, message: 'Note shared!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getNotes, createNote, deleteNote, shareNote };