import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FaCalendar, FaClock, FaPlay, FaComments, FaTimes, FaCheckCircle, FaHourglassHalf, FaPlus, FaSearch, FaChevronDown, FaArrowLeft } from 'react-icons/fa';

interface Session {
  _id: string;
  skill: string;
  duration: number;
  status: 'upcoming' | 'pending' | 'completed' | 'cancelled';
  roomId: string;
  description?: string;
  level?: string;
  date?: string;
  time?: string;
  creator?: { _id: string; name: string; email?: string };
  partner?: { _id: string; name: string; email?: string };
  ratedBy?: string[];
}

const statusConfig = {
  upcoming: { label: 'Upcoming', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <FaCalendar /> },
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: <FaHourglassHalf /> },
  completed: { label: 'Completed', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', icon: <FaCheckCircle /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <FaTimes /> },
};

const MySessions: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratePrompt, setRatePrompt] = useState<{id:string; skill:string; partnerId:string; partnerName:string} | null>(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:5000/api/sessions', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.sessions) setSessions(data.sessions);
        setLoading(false);
      })
      .catch(() => {
        // Demo data fallback
        setSessions([
          { _id: '1', skill: 'React', duration: 60, status: 'upcoming', roomId: 'react-101', level: 'Intermediate', date: 'Tomorrow', time: '4:00 PM' },
          { _id: '2', skill: 'Python', duration: 90, status: 'pending', roomId: 'py-201', level: 'Beginner', date: 'Next Week', time: '2:00 PM' },
        ]);
        setLoading(false);
      });
  }, [token]);

  const cancelSession = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/sessions/${id}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions((prev) => prev.map((s) => s._id === id ? { ...s, status: 'cancelled' } : s));
    } catch {
      setSessions((prev) => prev.filter((s) => s._id !== id));
    }
  };

  const completeSession = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/sessions/${id}/complete`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions((prev) => prev.map((s) => s._id === id ? { ...s, status: 'completed' } : s));
      // Show rate prompt immediately after completing
      const session = sessions.find((s) => s._id === id);
      if (session) {
        const myId = localStorage.getItem('userId') || '';
        const partner = session.creator?._id === myId ? session.partner : session.creator;
        if (partner) {
          setRatePrompt({ id, skill: session.skill, partnerId: partner._id, partnerName: partner.name });
        }
      }
    } catch {}
  };

  const filtered = sessions.filter((s) => {
    const matchSearch = s.skill.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filter === 'all' || s.status === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return (
    <div className="min-h-screen bg-[#0a0d1a] flex items-center justify-center">
      <p className="text-white text-lg">Loading sessions...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0d1a] p-4 md:p-8">
      {/* ── Rate Partner Popup — fires immediately after session is marked Complete ── */}
      {ratePrompt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#141830] border border-yellow-500/40 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_60px_rgba(234,179,8,0.15)]">

            {/* Confetti emoji header */}
            <div className="text-6xl mb-3">🎉</div>
            <h2 className="text-white text-2xl font-black mb-1">Session Complete!</h2>
            <p className="text-slate-400 text-sm mb-5">
              You and <span className="text-white font-bold">{ratePrompt.partnerName}</span> both earned{' '}
              <span className="text-yellow-400 font-bold">+50 XP</span>
            </p>

            {/* Session info box */}
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-black text-2xl mx-auto mb-3">
                {ratePrompt.partnerName.charAt(0).toUpperCase()}
              </div>
              <p className="text-white font-bold text-base">{ratePrompt.partnerName}</p>
              <p className="text-slate-400 text-xs mt-0.5">Skill: <span className="text-indigo-300 font-semibold">{ratePrompt.skill}</span></p>
            </div>

            {/* Stars preview */}
            <div className="flex justify-center gap-2 mb-4">
              {[1,2,3,4,5].map((s) => (
                <span key={s} className="text-2xl">⭐</span>
              ))}
            </div>

            <p className="text-slate-400 text-xs mb-6">
              Share your feedback — it takes only 10 seconds and helps the community!
            </p>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  navigate('/feedback', {
                    state: {
                      rateeId: ratePrompt.partnerId,
                      partnerName: ratePrompt.partnerName,
                      skill: ratePrompt.skill,
                      sessionId: ratePrompt.id,
                    },
                  });
                  setRatePrompt(null);
                }}
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black rounded-2xl hover:opacity-90 hover:scale-[1.02] transition-all text-base shadow-lg"
              >
                ⭐ Rate {ratePrompt.partnerName} Now
              </button>
              <button
                onClick={() => {
                  navigate('/summary', {
                    state: {
                      sessionId: ratePrompt.id,
                      skill: ratePrompt.skill,
                      partnerId: ratePrompt.partnerId,
                      partnerName: ratePrompt.partnerName,
                    },
                  });
                  setRatePrompt(null);
                }}
                className="w-full py-3 bg-teal-500/20 border border-teal-500/30 text-teal-300 font-semibold rounded-2xl hover:bg-teal-500/30 transition-all text-sm"
              >
                📝 Write Session Summary
              </button>
              <button
                onClick={() => setRatePrompt(null)}
                className="w-full py-2.5 text-slate-500 hover:text-white text-sm transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600/80 to-purple-700/80 border border-indigo-500/30 rounded-3xl p-6 md:p-8 mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all flex-shrink-0">
            <FaArrowLeft className="text-white text-sm" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-1">My Sessions</h1>
            <p className="text-indigo-200 text-sm">Track and manage your learning sessions</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/session/create')}
          className="flex items-center gap-2 bg-white text-indigo-700 font-bold px-4 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all text-sm flex-shrink-0"
        >
          <FaPlus /> Create
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 bg-[#141830] border border-white/8 rounded-xl px-4 py-3 flex-1">
          <FaSearch className="text-slate-500 flex-shrink-0" />
          <input
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-white placeholder-slate-500 outline-none flex-1 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'upcoming', 'pending', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${filter === f ? 'bg-indigo-600 text-white' : 'bg-[#141830] text-slate-400 border border-white/8 hover:border-white/20'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-[#141830] border border-white/8 rounded-2xl p-12 text-center">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-white font-semibold mb-2">No sessions found</p>
            <p className="text-slate-500 text-sm mb-4">Create your first session to get started</p>
            <button onClick={() => navigate('/session/create')} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium">
              Create Session
            </button>
          </div>
        ) : (
          filtered.map((session) => {
            const cfg = statusConfig[session.status] || statusConfig.pending;
            const open = expanded === session._id;

            return (
              <div key={session._id} className="bg-[#141830] border border-white/8 rounded-2xl overflow-hidden hover:border-white/12 transition-all">
                <div
                  className="p-5 flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpanded(open ? null : session._id)}
                >
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 flex-shrink-0 ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold truncate">{session.skill}</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {session.level && <span className="mr-2">{session.level}</span>}
                      {session.date && <span>{session.date} {session.time}</span>}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 text-sm flex-shrink-0">
                    <FaClock className="text-xs" /> {session.duration}m
                  </div>

                  <FaChevronDown className={`text-slate-500 text-sm transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
                </div>

                {open && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-4">
                    {session.creator && (
                      <p className="text-slate-400 text-sm mb-3">
                        Host: <span className="text-white">{session.creator.name}</span>
                        {session.partner && <> · Partner: <span className="text-white">{session.partner.name}</span></>}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {session.status === 'upcoming' || session.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => navigate(`/call/${session.roomId}`)}
                            className="flex-1 min-w-0 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
                          >
                            <FaPlay /> Join Session
                          </button>
                          <button
                            onClick={() => navigate('/chat')}
                            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all"
                          >
                            <FaComments />
                          </button>
                          <button
                            onClick={() => completeSession(session._id)}
                            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all"
                          >
                            <FaCheckCircle />
                          </button>
                          <button
                            onClick={() => cancelSession(session._id)}
                            className="flex items-center justify-center gap-2 bg-red-600/20 text-red-400 border border-red-500/30 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-600/30 transition-all"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : session.status === 'completed' ? (
                        <div className="flex flex-wrap gap-2 w-full">
                          <button
                            onClick={() => { const currentUserId = localStorage.getItem('userId'); const partner = session.creator?._id === currentUserId ? session.partner : session.creator; navigate('/feedback', { state: { skill: session.skill, rateeId: partner?._id, partnerName: partner?.name, sessionId: session._id } }); }}
                            className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-yellow-500/30 transition-all"
                          >
                            ⭐ Rate Partner
                          </button>
                          <button
                            onClick={() => navigate('/summary', { state: { sessionId: session._id, skill: session.skill, partnerName: session.partner?.name || session.creator?.name } })}
                            className="flex items-center gap-2 bg-teal-500/20 text-teal-400 border border-teal-500/30 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-teal-500/30 transition-all"
                          >
                            📝 Summary
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MySessions;