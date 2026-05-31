import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import NotificationBell from "../components/NotificationBell";
import {
  FaRobot, FaSearch, FaCalendar, FaUser, FaSignOutAlt,
  FaStickyNote, FaComments, FaChevronRight, FaVideo,
  FaGamepad, FaStar, FaTrophy, FaMedal, FaBolt
} from "react-icons/fa";

interface UserStats {
  xp: number;
  level: number;
  rating: number;
  ratingCount: number;
  sessionsCompleted: number;
}

const DashboardV2: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("name") || "User";
  const [stats, setStats] = useState<UserStats>({ xp: 0, level: 1, rating: 0, ratingCount: 0, sessionsCompleted: 0 });
  const [leaderboard, setLeaderboard] = useState<Array<{ name: string; xp: number; rating: number }>>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/api/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.user) {
          setStats({
            xp: data.user.xp || 0,
            level: data.user.level || 1,
            rating: data.user.avgRating || 0,
            ratingCount: data.user.ratingCount || 0,
            sessionsCompleted: data.user.sessionsCompleted || 0,
          });
        }
      })
      .catch(() => {});

    fetch("http://localhost:5000/api/users/leaderboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setLeaderboard(data.slice(0, 5));
      })
      .catch(() => {
        setLeaderboard([
          { name: "Alice", xp: 850, rating: 4.9 },
          { name: "Bob", xp: 720, rating: 4.7 },
          { name: "Carol", xp: 610, rating: 4.8 },
        ]);
      });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const xpToNextLevel = stats.level * 200;
  const xpProgress = Math.min((stats.xp % 200) / 200 * 100, 100);

  const mainActions = [
    { id: 1, icon: <FaRobot />, title: "AI Matchmaking", description: "Find your perfect skill partner", route: "/match", gradient: "from-violet-600 to-purple-600", glow: "rgba(139,92,246,0.4)" },
    { id: 2, icon: <FaSearch />, title: "Browse Skills", description: "Explore 200+ available skills", route: "/skills", gradient: "from-blue-600 to-cyan-600", glow: "rgba(37,99,235,0.4)" },
    { id: 3, icon: <FaCalendar />, title: "My Sessions", description: "View & manage your sessions", route: "/mysessions", gradient: "from-emerald-600 to-teal-600", glow: "rgba(16,185,129,0.4)" },
    { id: 4, icon: <FaComments />, title: "Chat", description: "Message your skill partners", route: "/chat", gradient: "from-sky-600 to-indigo-600", glow: "rgba(14,165,233,0.4)" },
    { id: 5, icon: <FaStickyNote />, title: "Notes", description: "Save and organize your notes", route: "/notes", gradient: "from-amber-500 to-orange-600", glow: "rgba(245,158,11,0.4)" },
    { id: 6, icon: <FaGamepad />, title: "Quiz Game", description: "Test skills & earn XP", route: "/gamification", gradient: "from-pink-600 to-rose-600", glow: "rgba(236,72,153,0.4)" },
  ];

  const levelEmoji = stats.level >= 10 ? "💎" : stats.level >= 5 ? "🥇" : stats.level >= 3 ? "🥈" : "🥉";

  return (
    <div className="min-h-screen bg-[#0d0f1a] p-6">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#1a1f3e] to-[#0f172a] border border-white/10 text-white p-8 rounded-3xl shadow-2xl mb-8">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(99,102,241,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.3) 0%, transparent 50%)"
        }} />

        <div className="relative flex justify-between items-start">
          <div>
            <p className="text-slate-400 text-sm mb-1">Welcome back 👋</p>
            <h1 className="text-3xl font-extrabold">{userName}</h1>

            {/* Level + XP Bar */}
            <div className="mt-3 flex items-center gap-3">
              <span className="bg-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-sm font-semibold border border-indigo-500/30">
                {levelEmoji} Level {stats.level}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400">{stats.xp} XP</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="flex items-center gap-1 text-yellow-400">
                <FaStar className="text-sm" />
                <span className="font-bold">{stats.rating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-slate-500">Rating</p>
            </div>
            <div className="text-center">
              <div className="text-white font-bold">{stats.sessionsCompleted}</div>
              <p className="text-xs text-slate-500">Sessions</p>
            </div>

            <NotificationBell />

            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2 rounded-xl transition-all text-sm font-medium flex items-center gap-2"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-white font-bold text-lg mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mainActions.map(action => (
              <div
                key={action.id}
                onClick={() => navigate(action.route)}
                className="group bg-[#1a1f3e]/80 border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-white/20 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4"
                style={{ boxShadow: `0 0 0 0 ${action.glow}` }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 12px 40px ${action.glow}`)}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white text-xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold">{action.title}</h3>
                  <p className="text-slate-400 text-xs mt-0.5">{action.description}</p>
                </div>
                <FaChevronRight className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>

          {/* Create Session CTA */}
          <div
            onClick={() => navigate("/session/create")}
            className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 cursor-pointer hover:opacity-90 hover:-translate-y-0.5 transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white text-xl">
              <FaVideo />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold">Create a Session</h3>
              <p className="text-indigo-200 text-sm">Schedule a live learning session with your partner</p>
            </div>
            <div className="bg-white text-indigo-600 font-bold px-4 py-2 rounded-xl text-sm">
              Create
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-5">
          {/* Profile Card */}
          <div
            onClick={() => navigate("/profile")}
            className="bg-[#1a1f3e]/80 border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold">{userName}</p>
                <p className="text-slate-400 text-xs">View Profile →</p>
              </div>
              <FaUser className="ml-auto text-slate-500" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/5 rounded-xl p-2">
                <p className="text-yellow-400 font-bold text-lg">{stats.xp}</p>
                <p className="text-slate-500 text-xs">XP</p>
              </div>
              <div className="bg-white/5 rounded-xl p-2">
                <p className="text-green-400 font-bold text-lg">{stats.sessionsCompleted}</p>
                <p className="text-slate-500 text-xs">Sessions</p>
              </div>
              <div className="bg-white/5 rounded-xl p-2">
                <p className="text-pink-400 font-bold text-lg">{stats.rating > 0 ? stats.rating.toFixed(1) : "—"}</p>
                <p className="text-slate-500 text-xs">Rating</p>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-[#1a1f3e]/80 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaTrophy className="text-yellow-400" />
              <h3 className="text-white font-bold">Leaderboard</h3>
            </div>
            <div className="space-y-2.5">
              {leaderboard.map((user, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? "bg-yellow-500 text-white" :
                    idx === 1 ? "bg-slate-400 text-white" :
                    idx === 2 ? "bg-amber-700 text-white" :
                    "bg-white/10 text-slate-400"
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{user.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-xs flex items-center gap-1">
                      <FaBolt className="text-[10px]" />{user.xp}
                    </span>
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <FaStar className="text-[10px] text-yellow-400" />{user.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-2">Complete sessions to appear here!</p>
              )}
            </div>
          </div>

          {/* Quick Play Quiz */}
          <div
            onClick={() => navigate("/gamification")}
            className="bg-gradient-to-br from-pink-600/30 to-purple-600/30 border border-pink-500/30 rounded-2xl p-5 cursor-pointer hover:border-pink-500/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎮</span>
              <div>
                <p className="text-white font-bold">Daily Quiz</p>
                <p className="text-pink-300 text-xs">Earn XP • Improve skills • Climb ranks</p>
              </div>
              <FaChevronRight className="ml-auto text-pink-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardV2;
