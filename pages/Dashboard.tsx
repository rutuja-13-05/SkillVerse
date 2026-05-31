import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import NotificationBell from '../components/NotificationBell';
import {
  FaRobot, FaSearch, FaCalendar, FaUser, FaSignOutAlt,
  FaStickyNote, FaComments, FaChevronRight,
  FaGamepad, FaStar, FaTrophy, FaBolt, FaMedal, FaBookOpen, FaClipboardList,
} from 'react-icons/fa';

interface Stats {
  xp: number;
  level: number;
  rating: number;
  sessionsCompleted: number;
}

interface LeaderEntry {
  name: string;
  xp: number;
  rating: number;
}

// ✅ Clean typed interface instead of raw session object
interface RateableSession {
  _id: string;
  skill: string;
  partnerName: string;
  partnerId: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('name') || 'User';
  const [stats, setStats] = useState<Stats>({ xp: 0, level: 1, rating: 0, sessionsCompleted: 0 });
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [rateableSessions, setRateableSessions] = useState<RateableSession[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // ── Profile stats ──────────────────────────────────────────────────────
    fetch('http://localhost:5000/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) {
          setStats({
            xp: data.user.xp || 0,
            level: data.user.level || 1,
            rating: data.user.avgRating || 0,
            sessionsCompleted: data.user.sessionsCompleted || 0,
          });
        }
      })
      .catch(() => {});

    // ── Sessions — resolve partner correctly ───────────────────────────────
    fetch('http://localhost:5000/api/sessions', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.sessions) return;

        const currentUserId = localStorage.getItem('userId') || '';

        const rateable: RateableSession[] = data.sessions
          .filter((s: any) =>
            s.status === 'completed' &&
            !(s.ratedBy || []).includes(currentUserId)
          )
          .slice(0, 3)
          .map((s: any) => {
            // ✅ THE FIX:
            // A session has two people: creator and partner.
            // The logged-in user is ONE of them.
            // The OTHER one is the person to display and rate.
            const creatorId   = s.creator?._id  ?? s.creator  ?? '';
            const iAmCreator  = creatorId === currentUserId;

            const otherPerson = iAmCreator ? s.partner : s.creator;

            return {
              _id:         s._id,
              skill:       s.skill,
              partnerName: otherPerson?.name ?? 'Partner',
              partnerId:   otherPerson?._id  ?? '',
            };
          });

        setRateableSessions(rateable);
      })
      .catch(() => {});

    // ── Leaderboard ────────────────────────────────────────────────────────
    fetch('http://localhost:5000/api/users/leaderboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setLeaderboard(data.slice(0, 5)); })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const xpProgress = Math.min(((stats.xp % 200) / 200) * 100, 100);

  const actions = [
    { icon: <FaRobot />,       title: 'AI Matchmaking',   desc: 'Find your perfect skill partner', route: '/match',        from: 'from-violet-600', to: 'to-purple-700' },
    { icon: <FaSearch />,      title: 'Browse Skills',    desc: 'Explore available skills',         route: '/skills',       from: 'from-blue-600',   to: 'to-cyan-600'   },
    { icon: <FaCalendar />,    title: 'My Sessions',      desc: 'View & manage your sessions',     route: '/mysessions',   from: 'from-emerald-600',to: 'to-teal-600'   },
    { icon: <FaComments />,    title: 'Chat',             desc: 'Message your skill partners',     route: '/chat',         from: 'from-sky-600',    to: 'to-indigo-600' },
    { icon: <FaStickyNote />,  title: 'Notes',            desc: 'Save & organize your notes',      route: '/notes',        from: 'from-amber-500',  to: 'to-orange-600' },
    { icon: <FaGamepad />,     title: 'Quiz Game',        desc: 'Test skills & earn XP',           route: '/gamification', from: 'from-pink-600',   to: 'to-rose-600'   },
    { icon: <FaClipboardList />,title:'Session Summary',  desc: 'Write & view session notes',      route: '/summary',      from: 'from-teal-500',   to: 'to-emerald-600'},
    { icon: <FaBookOpen />,    title: 'Resource Library', desc: 'Share & explore resources',       route: '/resources',    from: 'from-fuchsia-600',to: 'to-pink-600'   },
  ];

  const medalColor = (i: number) =>
    i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-500';

  return (
    <div className="min-h-screen bg-[#0a0d1a] p-4 md:p-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="relative bg-gradient-to-br from-[#141830] to-[#0d1020] border border-white/8 rounded-3xl p-6 md:p-8 mb-6 shadow-2xl">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 15% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(circle at 85% 20%, rgba(139,92,246,0.12) 0%, transparent 60%)' }}
        />
        <div className="relative flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <p className="text-slate-500 text-sm mb-1">Welcome back 👋</p>
            <h1 className="text-2xl md:text-3xl font-black text-white">{userName}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-sm font-semibold">
                ⚡ Level {stats.level}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-28 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
                <span className="text-slate-400 text-xs">{stats.xp} XP</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="text-center">
              <p className="text-yellow-400 font-bold flex items-center gap-1">
                <FaStar className="text-xs" />
                {stats.rating > 0 ? stats.rating.toFixed(1) : '—'}
              </p>
              <p className="text-slate-500 text-xs">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-green-400 font-bold">{stats.sessionsCompleted}</p>
              <p className="text-slate-500 text-xs">Sessions</p>
            </div>
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="bg-white/8 hover:bg-white/15 border border-white/8 text-white px-3 py-2 rounded-xl transition-all text-sm flex items-center gap-2"
            >
              <FaSignOutAlt />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Action Grid ──────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {actions.map((a) => (
              <a
                key={a.title}
                href={`#${a.route}`}
                className="group bg-[#141830]/80 border border-white/8 rounded-2xl p-5 hover:border-white/15 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4 no-underline"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.from} ${a.to} flex items-center justify-center text-white text-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{a.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5 truncate">{a.desc}</p>
                </div>
                <FaChevronRight className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 text-xs" />
              </a>
            ))}
          </div>
        </div>

        {/* ── Right Panel ──────────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Profile Quick Card */}
          <a
            href="#/profile"
            className="bg-[#141830]/80 border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all block no-underline"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold truncate">{userName}</p>
                <p className="text-indigo-400 text-xs">View Profile →</p>
              </div>
              <FaUser className="ml-auto text-slate-600 flex-shrink-0" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { v: stats.xp,                                      l: 'XP',       c: 'text-yellow-400' },
                { v: stats.sessionsCompleted,                        l: 'Sessions', c: 'text-green-400'  },
                { v: stats.rating > 0 ? stats.rating.toFixed(1) : '—', l: 'Rating', c: 'text-pink-400' },
              ].map((s) => (
                <div key={s.l} className="bg-white/5 rounded-xl py-2">
                  <p className={`${s.c} font-bold`}>{s.v}</p>
                  <p className="text-slate-500 text-xs">{s.l}</p>
                </div>
              ))}
            </div>
          </a>

          {/* ── Rate Your Partners (FIXED) ────────────────────────────────── */}
          {rateableSessions.length > 0 && (
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <FaStar className="text-yellow-400" />
                <h3 className="text-white font-bold text-sm">Rate Your Partners</h3>
                <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full font-bold">
                  {rateableSessions.length} pending
                </span>
              </div>
              <p className="text-slate-400 text-xs mb-3">
                You have completed sessions waiting for your rating!
              </p>
              <div className="space-y-2">
                {rateableSessions.map((s) => (
                  <div
                    key={s._id}
                    className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5"
                  >
                    <div>
                      <p className="text-white text-xs font-semibold">{s.skill}</p>
                      {/* ✅ Always shows the OTHER person's name, never the current user */}
                      <p className="text-slate-500 text-xs">with {s.partnerName}</p>
                    </div>
                    <button
                      onClick={() =>
                        navigate('/feedback', {
                          state: {
                            sessionId: s._id,
                            skill:     s.skill,
                            rateeId:   s.partnerId,
                            rateeName: s.partnerName,
                          },
                        })
                      }
                      className="flex items-center gap-1.5 bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-600 transition-all"
                    >
                      <FaStar className="text-xs" /> Rate Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div className="bg-[#141830]/80 border border-white/8 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaTrophy className="text-yellow-400" />
              <h3 className="text-white font-bold">Top Learners</h3>
            </div>
            <div className="space-y-3">
              {leaderboard.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-2">
                  Complete sessions to appear here!
                </p>
              ) : (
                leaderboard.map((u, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <FaMedal className={`${medalColor(i)} flex-shrink-0`} />
                    <p className="text-white text-sm font-medium flex-1 truncate">{u.name}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-yellow-400 text-xs flex items-center gap-0.5">
                        <FaBolt className="text-[9px]" />{u.xp}
                      </span>
                      <span className="text-slate-400 text-xs flex items-center gap-0.5">
                        <FaStar className="text-[9px] text-yellow-400" />{u.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;