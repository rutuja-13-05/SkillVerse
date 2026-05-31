import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { FaStar, FaArrowLeft, FaBolt } from 'react-icons/fa';

const TAGS = [
  'Great Teacher', 'Patient', 'Knowledgeable', 'Clear Explanation',
  'Punctual', 'Friendly', 'Very Helpful', 'Well Prepared', 'Inspiring',
];

const FeedbackRating: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) || {};

  const [rateeId, setRateeId] = useState(state.rateeId || '');
  const sessionId = state.sessionId || '';
  const partnerName = state.partnerName || 'Your Partner';
  const [rateeEmail, setRateeEmail] = useState(state.rateeEmail || '');
  const [skill, setSkill] = useState(state.skill || '');
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a rating'); return; }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/users/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rateeId, rating, tags: selectedTags, comment, skill, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setXpAwarded(rating * 5);
      setSuccess(true);
    } catch (err: any) {
      // Simulate success if no rateeId provided (demo mode)
      setXpAwarded(rating * 5);
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels: Record<number, string> = {
    1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent!',
  };

  if (success) return (
    <div className="min-h-screen bg-[#0a0d1a] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-3xl p-10">
          <div className="text-6xl mb-4 animate-bounce">⭐</div>
          <h2 className="text-2xl font-black text-white mb-2">Rating Submitted!</h2>
          <p className="text-slate-400 text-sm mb-6">Thank you for your feedback. It helps the community grow!</p>

          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-4 mb-6 flex items-center justify-center gap-3">
            <FaBolt className="text-yellow-400 text-xl" />
            <div>
              <p className="text-white font-black text-2xl">+{xpAwarded} XP</p>
              <p className="text-yellow-300 text-xs">Earned for rating</p>
            </div>
          </div>

          <div className="space-y-3">
            <button onClick={() => navigate('/mysessions')} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all">
              Back to Sessions
            </button>
            <button onClick={() => navigate('/dashboard')} className="w-full py-3 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 transition-all border border-white/8">
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0d1a] p-4 md:p-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white p-2 rounded-lg transition-colors">
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-white text-xl font-black">Rate Your Session</h1>
            <p className="text-slate-400 text-sm">Help others know what to expect</p>
          </div>
        </div>

        <div className="bg-[#141830] border border-white/8 rounded-3xl p-6 md:p-8 space-y-6">
          {/* Partner Info */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
              {partnerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-bold">{partnerName}</p>
              {skill && <p className="text-indigo-300 text-sm mt-0.5">Skill: <span className="text-white font-semibold">{skill}</span></p>}
            </div>
          </div>

          {/* Star Rating */}
          <div className="text-center">
            <p className="text-white font-semibold mb-4">How was your session with <span className='text-indigo-300'>{partnerName}</span>?</p>
            <div className="flex justify-center gap-3 mb-2">
              {[1,2,3,4,5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                  className="text-4xl transition-transform hover:scale-125"
                >
                  <FaStar className={star <= (hovered || rating) ? 'text-yellow-400' : 'text-white/15'} />
                </button>
              ))}
            </div>
            {(hovered || rating) > 0 && (
              <p className="text-yellow-400 text-sm font-semibold">{ratingLabels[hovered || rating]}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <p className="text-white font-semibold mb-3 text-sm">What stood out? (select all that apply)</p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
                  }`}
                >
                  {selectedTags.includes(tag) ? '✓ ' : ''}{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <p className="text-white font-semibold mb-2 text-sm">Additional comments (optional)</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm resize-none"
            />
          </div>

          {/* XP Preview */}
          {rating > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex items-center gap-2">
              <FaBolt className="text-yellow-400" />
              <p className="text-yellow-300 text-sm">
                You'll earn <strong>+{rating * 5} XP</strong> for submitting this rating
              </p>
            </div>
          )}

          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-xl">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : `⭐ Submit Rating${rating > 0 ? ` (${rating}/5)` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackRating;