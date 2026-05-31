import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { FaStar, FaCheck } from "react-icons/fa";

interface LocationState {
  partnerName?: string;
  partnerId?: string;
  skill?: string;
}

const FeedbackRating: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};

  const partnerName = state.partnerName || "Your Partner";
  const partnerId = state.partnerId || "";
  const skill = state.skill || "the session";

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const tagOptions = [
    "Great Teacher", "Very Patient", "Knowledgeable", "Clear Explanation",
    "On Time", "Engaging", "Well Prepared", "Helpful", "Friendly"
  ];

  const toggleTag = (tag: string) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) return alert("Please give a star rating first!");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/users/rate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rateeId: partnerId,
          rating,
          tags,
          comment,
          skill,
        }),
      });
    } catch (err) {
      console.error("Error submitting rating:", err);
    }

    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-teal-900 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.5)]">
          <FaCheck className="text-white text-4xl" />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-3">Thank You!</h2>
        <p className="text-emerald-300 mb-2">Your feedback has been submitted.</p>
        <p className="text-emerald-300 mb-8">
          You earned <strong className="text-yellow-400">+{rating * 5} XP</strong> for rating {partnerName}!
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-8 py-3 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 hover:scale-105 transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
            {partnerName.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-extrabold text-white">Rate Your Session</h2>
          <p className="text-slate-300 mt-1">How was your session with <strong className="text-indigo-300">{partnerName}</strong>?</p>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-3 mb-8">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-125"
            >
              <FaStar
                size={40}
                className={`transition-colors ${
                  star <= (hover || rating) ? "text-yellow-400" : "text-white/20"
                }`}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="text-center text-white font-semibold mb-6">
            {["", "😞 Poor", "😐 Fair", "🙂 Good", "😊 Great", "🌟 Excellent!"][rating]}
          </p>
        )}

        {/* Tags */}
        <div className="mb-6">
          <p className="text-slate-300 text-sm mb-3">What went well? (optional)</p>
          <div className="flex flex-wrap gap-2">
            {tagOptions.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  tags.includes(tag)
                    ? "bg-indigo-500 border-indigo-400 text-white"
                    : "border-white/20 text-white/70 hover:border-indigo-400 hover:text-white"
                }`}
              >
                {tags.includes(tag) ? "✓ " : ""}{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-8">
          <p className="text-slate-300 text-sm mb-2">Leave a comment (optional)</p>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
            className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-white placeholder-white/40 resize-none focus:outline-none focus:border-indigo-400"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl hover:scale-105 hover:shadow-[0_10px_30px_rgba(99,102,241,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Feedback ✨"}
        </button>

        <button
          onClick={() => navigate("/mysessions")}
          className="w-full mt-3 py-3 text-white/50 hover:text-white transition-colors text-sm"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

export default FeedbackRating;
