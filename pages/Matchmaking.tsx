import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  FaRobot, FaArrowLeft, FaComments, FaCalendar,
  FaStar, FaBolt, FaCheck, FaTimes, FaBrain,
  FaSpinner, FaFire,
} from 'react-icons/fa';

interface Match {
  _id: string;
  name: string;
  email: string;
  skillsToTeach: string[];
  skillsToLearn: string[];
  avgRating?: number;
  xp?: number;
  bio?: string;
  matchScore?: number;
  matchReason?: string;
  mutualBenefit?: boolean;
  aiPowered?: boolean;
}

const scoreColor = (score: number) => {
  if (score >= 80) return { bar: 'bg-green-500', text: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' };
  if (score >= 60) return { bar: 'bg-indigo-500', text: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' };
  if (score >= 40) return { bar: 'bg-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' };
  return { bar: 'bg-slate-500', text: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/30' };
};

const scoreLabel = (score: number) => {
  if (score >= 85) return '🔥 Perfect Match';
  if (score >= 70) return '⭐ Great Match';
  if (score >= 50) return '👍 Good Match';
  return '🤝 Possible Match';
};

const Matchmaking: React.FC = () => {
  const navigate = useNavigate();
  const [mySkills, setMySkills] = useState('');
  const [learnSkills, setLearnSkills] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [aiThinking, setAiThinking] = useState('');
  const [isAIPowered, setIsAIPowered] = useState(false);

  // Auto-fill from user profile
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://localhost:5000/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          if (data.user.skillsToTeach?.length) setMySkills(data.user.skillsToTeach.join(', '));
          if (data.user.skillsToLearn?.length) setLearnSkills(data.user.skillsToLearn.join(', '));
        }
      })
      .catch(() => {});
  }, []);

  const thinkingMessages = [
    '🧠 Claude AI is analyzing skill profiles...',
    '🔍 Finding compatible learners and teachers...',
    '📊 Calculating match compatibility scores...',
    '✨ Generating personalized match explanations...',
    '🎯 Ranking your best matches...',
  ];

  const handleFindMatch = async () => {
    if (!mySkills.trim() || !learnSkills.trim()) {
      setError('Please fill in both fields');
      return;
    }
    setLoading(true);
    setError('');
    setMatches([]);
    setSearched(false);

    // Cycle through thinking messages
    let msgIdx = 0;
    setAiThinking(thinkingMessages[0]);
    const thinkingInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % thinkingMessages.length;
      setAiThinking(thinkingMessages[msgIdx]);
    }, 1200);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/match/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          mySkills: mySkills.split(',').map((s) => s.trim()).filter(Boolean),
          learnSkills: learnSkills.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Match failed');
      setMatches(data);
      setIsAIPowered(data.some((m: Match) => m.aiPowered));
      setSearched(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      clearInterval(thinkingInterval);
      setAiThinking('');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d1a] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white p-2 rounded-lg transition-colors">
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-white text-2xl font-black flex items-center gap-2">
              <FaRobot className="text-indigo-400" /> AI Matchmaking
            </h1>
            <p className="text-slate-400 text-sm">Powered by Claude AI — finds your ideal skill exchange partner</p>
          </div>
        </div>

        {/* AI Badge Banner */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-4 mb-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <FaBrain className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Claude AI Skill Analysis</p>
            <p className="text-slate-400 text-xs">
              Our AI understands skill relationships, analyzes compatibility, and explains exactly why each match is right for you
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-[#141830] border border-white/8 rounded-2xl p-6 mb-6">
          <div className="space-y-4">
            {/* Skills I teach */}
            <div>
              <label className="block text-white font-semibold text-sm mb-2">
                🛠 Skills I Can Teach
              </label>
              <input
                value={mySkills}
                onChange={(e) => setMySkills(e.target.value)}
                placeholder="e.g. Python, Guitar, Cooking, React"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm"
              />
              <p className="text-slate-600 text-xs mt-1">Separate multiple skills with commas</p>
            </div>

            {/* Skills I want to learn */}
            <div>
              <label className="block text-white font-semibold text-sm mb-2">
                📚 Skills I Want to Learn
              </label>
              <input
                value={learnSkills}
                onChange={(e) => setLearnSkills(e.target.value)}
                placeholder="e.g. Singing, JavaScript, Drawing, Yoga"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm"
              />
              <p className="text-slate-600 text-xs mt-1">Separate multiple skills with commas</p>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl">
                {error}
              </p>
            )}

            <button
              onClick={handleFindMatch}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-xl hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <><FaSpinner className="animate-spin" /> AI is thinking...</>
              ) : (
                <><FaRobot /> Find My AI Match</>
              )}
            </button>
          </div>
        </div>

        {/* AI Thinking Animation */}
        {loading && aiThinking && (
          <div className="bg-[#141830] border border-indigo-500/30 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
              <p className="text-indigo-300 text-sm font-medium">{aiThinking}</p>
            </div>
            <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* Results */}
        {searched && (
          <div>
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-black text-lg">
                  {matches.length > 0 ? `${matches.length} Match${matches.length > 1 ? 'es' : ''} Found` : 'No Matches Found'}
                </h2>
                {isAIPowered && matches.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <FaBrain className="text-indigo-400 text-xs" />
                    <span className="text-indigo-400 text-xs font-semibold">Ranked by Claude AI</span>
                  </div>
                )}
              </div>
              {matches.length > 0 && (
                <span className="text-slate-500 text-xs">Sorted by compatibility</span>
              )}
            </div>

            {matches.length === 0 ? (
              <div className="bg-[#141830] border border-white/8 rounded-2xl p-12 text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-white font-semibold mb-2">No matches found yet</p>
                <p className="text-slate-400 text-sm mb-5">
                  Not enough users with matching skills. Try broader skills or invite friends!
                </p>
                <button
                  onClick={() => navigate('/skills')}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all"
                >
                  Browse Skills
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match, idx) => {
                  const colors = scoreColor(match.matchScore || 0);
                  return (
                    <div
                      key={match._id}
                      className="bg-[#141830] border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {/* Rank + Avatar */}
                        <div className="flex-shrink-0 text-center">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-black text-2xl">
                              {match.name.charAt(0).toUpperCase()}
                            </div>
                            {idx === 0 && (
                              <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-black">
                                1
                              </div>
                            )}
                          </div>
                          <p className="text-slate-600 text-xs mt-1">#{idx + 1}</p>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <h3 className="text-white font-black text-lg leading-tight">{match.name}</h3>
                              <div className="flex items-center gap-3 mt-0.5">
                                {match.avgRating && match.avgRating > 0 && (
                                  <span className="flex items-center gap-1 text-yellow-400 text-xs">
                                    <FaStar className="text-[10px]" />{match.avgRating.toFixed(1)}
                                  </span>
                                )}
                                {match.xp && match.xp > 0 && (
                                  <span className="flex items-center gap-1 text-indigo-400 text-xs">
                                    <FaBolt className="text-[10px]" />{match.xp} XP
                                  </span>
                                )}
                                {match.mutualBenefit && (
                                  <span className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                                    <FaCheck className="text-[10px]" /> Mutual Exchange
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Match Score */}
                            {match.matchScore !== undefined && (
                              <div className={`px-3 py-1.5 rounded-xl border text-center flex-shrink-0 ${colors.bg}`}>
                                <p className={`text-lg font-black ${colors.text}`}>{match.matchScore}%</p>
                                <p className="text-slate-500 text-xs">match</p>
                              </div>
                            )}
                          </div>

                          {/* Score bar */}
                          {match.matchScore !== undefined && (
                            <div className="mt-3 mb-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-slate-500">{scoreLabel(match.matchScore)}</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-1000 ${colors.bar}`}
                                  style={{ width: `${match.matchScore}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* AI Explanation */}
                          {match.matchReason && (
                            <div className="bg-indigo-500/8 border border-indigo-500/20 rounded-xl p-3 mb-3 flex gap-2">
                              <FaBrain className="text-indigo-400 text-sm flex-shrink-0 mt-0.5" />
                              <p className="text-slate-300 text-sm leading-relaxed">{match.matchReason}</p>
                            </div>
                          )}

                          {/* Skills */}
                          <div className="flex flex-wrap gap-3 mb-4">
                            <div>
                              <p className="text-slate-500 text-xs mb-1.5">Teaches</p>
                              <div className="flex flex-wrap gap-1.5">
                                {match.skillsToTeach.slice(0, 4).map((s) => (
                                  <span key={s} className="px-2.5 py-1 bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 rounded-full text-xs font-medium">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {match.skillsToLearn?.length > 0 && (
                              <div>
                                <p className="text-slate-500 text-xs mb-1.5">Wants to Learn</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {match.skillsToLearn.slice(0, 4).map((s) => (
                                    <span key={s} className="px-2.5 py-1 bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 rounded-full text-xs font-medium">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/chat/${match._id}`, { state: { partnerName: match.name } })}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all"
                            >
                              <FaComments /> Message
                            </button>
                            <button
                              onClick={() => navigate('/session/create', {
                                state: { partnerName: match.name, partnerId: match._id },
                              })}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all"
                            >
                              <FaCalendar /> Book Session
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* AI Powered Footer */}
            {matches.length > 0 && (
              <div className="mt-5 text-center">
                {isAIPowered ? (
                  <p className="text-slate-600 text-xs flex items-center justify-center gap-1.5">
                    <FaBrain className="text-indigo-500" />
                    Match scores and explanations generated by Claude AI (Anthropic)
                  </p>
                ) : (
                  <p className="text-slate-600 text-xs">
                    Results ranked by skill compatibility score
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matchmaking;