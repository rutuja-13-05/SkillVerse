const express = require('express');
const router = express.Router();
const Resource = require('../models/resource');
const { protect } = require('../middleware/authMiddleware');

// GET /api/resources — get all resources (optionally filter by skill)
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.query.skill ? { skill: new RegExp(req.query.skill, 'i') } : {};
    const resources = await Resource.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, resources });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/resources — add a new resource
router.post('/', protect, async (req, res) => {
  try {
    const { skill, title, description, type, url, content } = req.body;
    if (!skill || !title) return res.status(400).json({ message: 'Skill and title are required' });
    const resource = await Resource.create({
      uploadedBy: req.user.id,
      uploaderName: req.user.name,
      skill, title, description, type, url, content,
    });
    res.status(201).json({ success: true, resource });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/resources/:id/like — toggle like
router.put('/:id/like', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    const liked = resource.likes.map(String).includes(req.user.id);
    if (liked) {
      resource.likes = resource.likes.filter(id => id.toString() !== req.user.id);
    } else {
      resource.likes.push(req.user.id);
    }
    await resource.save();
    res.json({ success: true, likes: resource.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/resources/:id — delete (owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (resource.uploadedBy.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/resources/skills — get all unique skill tags
router.get('/skills', protect, async (req, res) => {
  try {
    const skills = await Resource.distinct('skill');
    res.json({ success: true, skills });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;