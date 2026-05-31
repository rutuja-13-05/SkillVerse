# 🌐 Skillverse - Complete Setup & Integration Guide

## 📁 New Files to Add to Your Project

### Frontend Files (copy to `frontend/src/pages/`)
| File | Description |
|------|-------------|
| `DashboardV2.tsx` | Improved dashboard with XP, leaderboard, quick actions |
| `ChatV2.tsx` | Chat with contact list sidebar |
| `Gamification.tsx` | Quiz game with XP, streaks, categories |
| `FeedbackRating.tsx` | Post-session rating & review |

### Update `App.tsx`
Replace your current `App.tsx` with the new one to add routes for:
- `/gamification` → Quiz Game
- `/feedback` → Rate your partner

---

## 🔧 Backend Changes Needed

### Step 1: Update `models/user.js`

```js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // ✅ ADD THESE NEW FIELDS:
  skillsToTeach: [String],
  skillsToLearn: [String],
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  avgRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  sessionsCompleted: { type: Number, default: 0 },
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
});
```

### Step 2: Add to `controllers/userController.js`

```js
// Rate another user
const rateUser = async (req, res) => {
  try {
    const { rateeId, rating, tags, comment, skill } = req.body;
    const raterId = req.user.id;

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

    res.json({ success: true, message: 'Rating submitted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({})
      .select('name xp avgRating level')
      .sort({ xp: -1 })
      .limit(10);
    res.json(users.map(u => ({
      name: u.name,
      xp: u.xp || 0,
      rating: u.avgRating || 0,
      level: u.level || 1
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get connections (users to chat with)
const getConnections = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('name email _id').limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { ..., rateUser, getLeaderboard, getConnections };
```

### Step 3: Add to `routes/userRoutes.js`

```js
const { rateUser, getLeaderboard, getConnections } = require('../controllers/userController');

router.post('/rate', protect, rateUser);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/connections', protect, getConnections);
```

---

## 🎮 Gamification Flow

1. User visits `/gamification`
2. Chooses a quiz category
3. Answers 8 timed questions (15 sec each)
4. Earns XP based on speed + streaks
5. XP is saved to their profile via `/api/users/xp` (you can add this later)
6. Leaderboard updates on Dashboard

---

## ⭐ Rating Flow

After a session ends in `VideoCall.tsx`, redirect to `/feedback`:

```js
// In VideoCall.tsx, replace the navigate in videoConferenceLeft:
jitsiApiRef.current.addListener('videoConferenceLeft', () => {
  navigate('/feedback', {
    state: {
      partnerName: 'Partner Name',  // pass actual partner name
      partnerId: 'partner-id',       // pass actual partner ID
      skill: 'Python'                // pass skill topic
    }
  });
});
```

---

## 📱 Complete Feature List

| Feature | Status | Location |
|---------|--------|----------|
| Home Page | ✅ Done | `/` |
| Register / Login | ✅ Done | `/register`, `/login` |
| Dashboard with XP | ✅ Done | `/dashboard` |
| AI Matchmaking | ✅ Done | `/match` |
| Browse Skills | ✅ Done | `/skills` |
| Chat with Contacts | ✅ Done | `/chat` |
| Video Call (Jitsi) | ✅ Done | `/call/:roomId` |
| Notes | ✅ Done | `/notes` |
| My Sessions | ✅ Done | `/mysessions` |
| User Profile | ✅ Done | `/profile` |
| Quiz Gamification | ✅ New | `/gamification` |
| Feedback & Rating | ✅ New | `/feedback` |
| Leaderboard | ✅ New | In Dashboard |
| Notifications | ✅ Done | Bell icon |

---

## 🚀 Running the Project

```bash
# Backend
cd backend  (or root folder with server.js)
npm install
node server.js

# Frontend
cd frontend
npm install
npm run dev
```

> Make sure MongoDB is running and your `.env` has `MONGO_URI` and `JWT_SECRET`
