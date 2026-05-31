const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploaderName: { type: String, default: '' },
    skill:        { type: String, required: true },
    title:        { type: String, required: true },
    description:  { type: String, default: '' },
    type:         { type: String, enum: ['video', 'article', 'practice', 'reference'], default: 'article' },
    url:          { type: String, default: '' },
    content:      { type: String, default: '' }, // for practice problems / text content
    likes:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);