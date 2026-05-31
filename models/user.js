const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ratingSchema = new mongoose.Schema({
  raterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 },
  tags: [String],
  comment: String,
  skill: String,
  date: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '' },

    skillsToTeach: [{ type: String }],
    skillsToLearn: [{ type: String }],

    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    avgRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    sessionsCompleted: { type: Number, default: 0 },

    ratings: [ratingSchema],

    bio: { type: String, default: '' },
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
