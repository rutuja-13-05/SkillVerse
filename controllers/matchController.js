const User = require('../models/user');
const https = require('https');

// ─── Helper: call Claude API ──────────────────────────────────────────────────
const callClaude = (prompt) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const text = parsed?.content?.[0]?.text || '';
          resolve(text);
        } catch {
          resolve('');
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(body);
    req.end();
  });
};

// ─── Helper: escape special regex characters ─────────────────────────────────
const escapeRegex = (str) => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

// ─── Helper: rule-based pre-filter (fast DB query) ───────────────────────────
const preFilterUsers = async (currentUserId, mySkills, learnSkills) => {
  return await User.find({
    _id: { $ne: currentUserId },
    $or: [
      { skillsToTeach: { $in: learnSkills.map((s) => new RegExp(escapeRegex(s), 'i')) } },
      { skillsToLearn: { $in: mySkills.map((s) => new RegExp(escapeRegex(s), 'i')) } },
    ],
  }).select('-password -ratings').limit(20);
};

// ─── Main Controller ──────────────────────────────────────────────────────────
const findMatches = async (req, res) => {
  try {
    const { mySkills, learnSkills } = req.body;
    const currentUserId = req.user.id;
    const currentUser = await User.findById(currentUserId).select('name bio skillsToTeach skillsToLearn');

    if (!mySkills?.length || !learnSkills?.length) {
      return res.status(400).json({ message: 'Please provide both skill sets' });
    }

    // Step 1: Pre-filter candidates from DB
    const candidates = await preFilterUsers(currentUserId, mySkills, learnSkills);

    if (candidates.length === 0) {
      return res.json([]);
    }

    // Step 2: Build candidate summaries for Claude
    const candidateSummaries = candidates.map((u, i) => ({
      index: i,
      name: u.name,
      teaches: u.skillsToTeach,
      wants_to_learn: u.skillsToLearn,
      bio: u.bio || '',
      xp: u.xp || 0,
      rating: u.avgRating || 0,
    }));

    // Step 3: Ask Claude to analyze and rank the matches
    const prompt = `You are a skill-matching AI for a peer-to-peer learning platform called Skillverse.

CURRENT USER:
- Name: ${currentUser.name}
- Can teach: ${mySkills.join(', ')}
- Wants to learn: ${learnSkills.join(', ')}
- Bio: ${currentUser.bio || 'Not provided'}

CANDIDATE USERS:
${JSON.stringify(candidateSummaries, null, 2)}

YOUR TASK:
Analyze each candidate and determine how well they match with the current user.
A great match means:
1. The candidate teaches what the current user wants to learn (most important)
2. The candidate wants to learn what the current user can teach (mutual benefit)
3. Consider skill relatedness — e.g. "JavaScript" and "JS" are the same, "React" relates to "JavaScript"
4. Consider bio compatibility if available

Return a JSON array of the TOP 5 best matches (or fewer if less than 5 candidates), sorted by match quality.
Each object must have:
- "index": the candidate's index number from above
- "matchScore": a percentage from 0-100 representing match quality
- "matchReason": a friendly 1-2 sentence explanation of WHY they are a good match (mention specific skills)
- "mutualBenefit": true/false — whether both users benefit from the match

IMPORTANT: Return ONLY valid JSON array, no explanation text outside the array. Example format:
[{"index": 0, "matchScore": 92, "matchReason": "...", "mutualBenefit": true}]`;

    let aiResults = [];
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey && apiKey !== 'your_api_key_here') {
      try {
        const aiResponse = await callClaude(prompt);
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          aiResults = JSON.parse(jsonMatch[0]);
        }
      } catch (aiErr) {
        console.log('Claude API error, falling back to rule-based:', aiErr.message);
      }
    }

    // Step 4: If Claude worked, merge AI scores with user data
    if (aiResults.length > 0) {
      const finalMatches = aiResults
        .filter((r) => r.index >= 0 && r.index < candidates.length)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5)
        .map((r) => ({
          ...candidates[r.index].toObject(),
          matchScore: r.matchScore,
          matchReason: r.matchReason,
          mutualBenefit: r.mutualBenefit,
          aiPowered: true,
        }));

      return res.json(finalMatches);
    }

    // Step 5: Fallback — rule-based scoring if no API key or Claude failed
    const scored = candidates.map((user) => {
      let score = 0;
      learnSkills.forEach((skill) => {
        if (user.skillsToTeach.some((t) => t.toLowerCase().includes(skill.toLowerCase()))) score += 30;
      });
      mySkills.forEach((skill) => {
        if (user.skillsToLearn.some((l) => l.toLowerCase().includes(skill.toLowerCase()))) score += 20;
      });

      const teaches = user.skillsToTeach.filter((t) =>
        learnSkills.some((s) => t.toLowerCase().includes(s.toLowerCase()))
      );
      const learns = user.skillsToLearn.filter((l) =>
        mySkills.some((s) => l.toLowerCase().includes(s.toLowerCase()))
      );

      let reason = '';
      if (teaches.length && learns.length)
        reason = `${user.name} can teach you ${teaches.join(', ')} and wants to learn ${learns.join(', ')} from you — a mutual skill exchange!`;
      else if (teaches.length)
        reason = `${user.name} can teach you ${teaches.join(', ')}.`;
      else if (learns.length)
        reason = `${user.name} wants to learn ${learns.join(', ')} which you can teach.`;

      return {
        ...user.toObject(),
        matchScore: Math.min(score, 100),
        matchReason: reason,
        mutualBenefit: teaches.length > 0 && learns.length > 0,
        aiPowered: false,
      };
    });

    const fallbackResults = scored
      .filter((m) => m.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);

    res.json(fallbackResults);
  } catch (err) {
    console.error('Match error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { findMatches };