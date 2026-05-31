import React from 'react';

const HexLogo: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hexGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366f1"/>
        <stop offset="100%" stopColor="#a78bfa"/>
      </linearGradient>
      <filter id="hexGlow">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>
    {/* Outer glow hex */}
    <path d="M22 1L41 11.5V32.5L22 43L3 32.5V11.5L22 1Z" fill="url(#hexGrad)" opacity="0.15"/>
    {/* Main hex */}
    <path d="M22 4L38 13V31L22 40L6 31V13L22 4Z" fill="url(#hexGrad)"/>
    {/* Inner border shine */}
    <path d="M22 4L38 13V31L22 40L6 31V13L22 4Z" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
    {/* Top shine */}
    <path d="M22 4L38 13H6L22 4Z" fill="rgba(255,255,255,0.12)"/>
    {/* S letter */}
    <text x="22" y="29" textAnchor="middle" fontSize="21" fontWeight="900" fontFamily="Georgia, 'Times New Roman', serif" fill="white" letterSpacing="-0.5">S</text>
  </svg>
);

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#060918] text-white overflow-hidden relative">

      {/* Animated bg orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-[20%] right-[-5%] w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[10%] left-[30%] w-72 h-72 bg-violet-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div style={{ filter: 'drop-shadow(0 0 10px rgba(99,102,241,0.7))' }}>
            <HexLogo size={40} />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
            Skillverse
          </span>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 text-center px-6 pt-16 pb-16 max-w-4xl mx-auto">

        {/* Big logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Glow rings behind logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-indigo-600/10 blur-2xl" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-purple-600/15 blur-xl" />
            </div>
            <div style={{ filter: 'drop-shadow(0 0 24px rgba(99,102,241,0.8)) drop-shadow(0 0 48px rgba(139,92,246,0.4))' }}>
              <HexLogo size={110} />
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm px-4 py-2 rounded-full mb-6">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
          AI-Powered Skill Exchange Platform
        </div>

        <h1 className="text-6xl md:text-7xl font-black leading-tight mb-6">
          Learn. Teach.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
            Grow Together
          </span>
        </h1>

        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Connect with real people who teach what you want to learn. Live sessions, smart matching, chat, notes — everything in one place.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => (window.location.hash = '#/register')}
            className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-bold text-lg hover:scale-105 hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all"
          >
            Start Learning Free →
          </button>
          <button
            onClick={() => (window.location.hash = '#/login')}
            className="px-10 py-4 border border-white/15 rounded-2xl font-bold text-lg hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all"
          >
            Login
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-center text-3xl font-black mb-12 text-white">
          Everything you need to <span className="text-indigo-400">master new skills</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { emoji: '🤖', title: 'AI Matchmaking', desc: 'Smart algorithm pairs you with the perfect skill partner based on your goals' },
            { emoji: '🎥', title: 'Live Sessions', desc: 'Video call directly in the app. No extra tools needed.' },
            { emoji: '💬', title: 'Real-time Chat', desc: 'Message your partners, share notes, and plan sessions together' },
            { emoji: '🎮', title: 'Gamification', desc: 'Earn XP, level up, and climb the leaderboard as you learn' },
            { emoji: '📝', title: 'Notes System', desc: 'Save your notes and share them with your learning partners' },
            { emoji: '⭐', title: 'Rating System', desc: 'Rate sessions and build your reputation in the community' },
            { emoji: '🏆', title: 'Leaderboard', desc: 'Compete with others and show off your expertise' },
            { emoji: '🔔', title: 'Notifications', desc: 'Never miss a session with real-time alerts' },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/8 rounded-2xl p-6 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all hover:-translate-y-1">
              <div className="text-4xl mb-3">{f.emoji}</div>
              <h3 className="text-white font-bold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 text-center pb-20 px-6">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-3xl p-12">
          <div className="flex justify-center mb-5">
            <div style={{ filter: 'drop-shadow(0 0 16px rgba(99,102,241,0.7))' }}>
              <HexLogo size={56} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Ready to start your journey?</h2>
          <p className="text-slate-400 mb-8">Join thousands of learners and teachers on Skillverse today.</p>
          <button
            onClick={() => (window.location.hash = '#/register')}
            className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-bold text-lg hover:scale-105 transition-all"
          >
            Create Free Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;