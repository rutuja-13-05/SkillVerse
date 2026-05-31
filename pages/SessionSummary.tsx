import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { FaArrowLeft, FaBook, FaChalkboardTeacher, FaUserGraduate, FaCheckCircle, FaStar } from 'react-icons/fa';

const SessionSummary: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { sessionId?: string; skill?: string; partnerId?: string; partnerName?: string } | null;

  const token = localStorage.getItem('token') || '';
  const [role, setRole] = useState<'teacher' | 'student'>('teacher');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [mySummaries, setMySummaries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');

  // Teacher fields
  const [topicsCovered, setTopicsCovered] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [homework, setHomework] = useState('');
  const [nextSessionPlan, setNextSessionPlan] = useState('');
  const [studentPerformance, setStudentPerformance] = useState(0);

  // Student fields
  const [whatILearned, setWhatILearned] = useState('');
  const [doubtsRemaining, setDoubtsRemaining] = useState('');
  const [practiceGoal, setPracticeGoal] = useState('');

  useEffect(() => {
    // Check if already submitted for this session
    if (state?.sessionId) {
      fetch(`http://localhost:5000/api/summary/check/${state.sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(d => { if (d.submitted) setAlreadySubmitted(true); })
        .catch(() => {});
    }

    // Load history
    fetch('http://localhost:5000/api/summary/my', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setMySummaries(d.summaries); })
      .catch(() => {});
  }, [token, state?.sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        sessionId: state?.sessionId || 'manual',
        role,
        skill: state?.skill || 'General',
        partnerId: state?.partnerId,
        partnerName: state?.partnerName || 'Partner',
        topicsCovered,
        keyPoints: keyPoints.split('\n').filter(k => k.trim()),
        homework,
        nextSessionPlan,
        studentPerformance: role === 'teacher' ? studentPerformance : null,
        whatILearned,
        doubtsRemaining,
        practiceGoal,
      };

      const res = await fetch('http://localhost:5000/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        // Reload history
        fetch('http://localhost:5000/api/summary/my', {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json()).then(d => { if (d.success) setMySummaries(d.summaries); });
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0d1a] text-white">
      {/* Header */}
      <div className="bg-[#141830] border-b border-white/8 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate('/mysessions')} className="text-slate-400 hover:text-white transition-colors">
          <FaArrowLeft />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FaBook className="text-sm" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base">Session Summary</h1>
            <p className="text-slate-400 text-xs">{state?.skill || 'General'} • {state?.partnerName || 'Partner'}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="ml-auto flex gap-2">
          {['submit', 'history'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              {tab === 'submit' ? '✍️ Write' : '📋 History'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ── SUBMIT TAB ── */}
        {activeTab === 'submit' && (
          <>
            {submitted || alreadySubmitted ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-5">
                  <FaCheckCircle className="text-green-400 text-4xl" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Summary Submitted! ✅</h2>
                <p className="text-slate-400 mb-6">Your session summary has been saved to your learning journal.</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setActiveTab('history')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all">
                    View History
                  </button>
                  <button onClick={() => navigate('/mysessions')} className="px-6 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-all">
                    Back to Sessions
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role picker */}
                <div>
                  <p className="text-slate-300 text-sm font-semibold mb-3">I was the:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: 'teacher', icon: <FaChalkboardTeacher />, label: 'Teacher', desc: 'I taught this session' },
                      { val: 'student', icon: <FaUserGraduate />, label: 'Student', desc: 'I was learning' },
                    ].map(r => (
                      <button type="button" key={r.val} onClick={() => setRole(r.val as any)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${role === r.val ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/8 bg-white/3 hover:border-white/20'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-indigo-400">{r.icon}</span>
                          <span className="text-white font-bold text-sm">{r.label}</span>
                        </div>
                        <p className="text-slate-400 text-xs">{r.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Teacher fields */}
                {role === 'teacher' && (
                  <div className="space-y-4">
                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
                      <h3 className="text-indigo-300 font-bold text-sm flex items-center gap-2">
                        <FaChalkboardTeacher /> Teacher's Notes
                      </h3>

                      <div>
                        <label className="text-slate-300 text-sm font-medium block mb-2">📖 Topics Covered <span className="text-red-400">*</span></label>
                        <textarea value={topicsCovered} onChange={e => setTopicsCovered(e.target.value)} required rows={3}
                          placeholder="What topics did you teach today? e.g. Variables, Loops, Functions in Python"
                          className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm resize-none" />
                      </div>

                      <div>
                        <label className="text-slate-300 text-sm font-medium block mb-2">🔑 Key Points (one per line)</label>
                        <textarea value={keyPoints} onChange={e => setKeyPoints(e.target.value)} rows={4}
                          placeholder={"Lists start with index 0\nUse range() for loops\nIndentation is important in Python"}
                          className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm resize-none font-mono" />
                      </div>

                      <div>
                        <label className="text-slate-300 text-sm font-medium block mb-2">📝 Homework / Practice Task</label>
                        <textarea value={homework} onChange={e => setHomework(e.target.value)} rows={2}
                          placeholder="e.g. Write a program to print first 10 Fibonacci numbers"
                          className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm resize-none" />
                      </div>

                      <div>
                        <label className="text-slate-300 text-sm font-medium block mb-2">🗓️ Next Session Plan</label>
                        <textarea value={nextSessionPlan} onChange={e => setNextSessionPlan(e.target.value)} rows={2}
                          placeholder="e.g. Next session we will cover Functions and File handling"
                          className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm resize-none" />
                      </div>

                      <div>
                        <label className="text-slate-300 text-sm font-medium block mb-3">⭐ Student Performance</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(s => (
                            <button type="button" key={s} onClick={() => setStudentPerformance(s)}
                              className={`w-10 h-10 rounded-xl text-lg transition-all ${studentPerformance >= s ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-slate-500 hover:text-yellow-400'}`}>
                              ★
                            </button>
                          ))}
                          {studentPerformance > 0 && (
                            <span className="text-slate-400 text-sm self-center ml-2">
                              {['', 'Needs Work', 'Fair', 'Good', 'Very Good', 'Excellent'][studentPerformance]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Student fields */}
                {role === 'student' && (
                  <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-5 space-y-4">
                    <h3 className="text-purple-300 font-bold text-sm flex items-center gap-2">
                      <FaUserGraduate /> Student's Learning Journal
                    </h3>

                    <div>
                      <label className="text-slate-300 text-sm font-medium block mb-2">💡 What I Learned Today <span className="text-red-400">*</span></label>
                      <textarea value={whatILearned} onChange={e => setWhatILearned(e.target.value)} required rows={4}
                        placeholder="Describe what you learned in your own words..."
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-sm resize-none" />
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm font-medium block mb-2">❓ Doubts / Questions Remaining</label>
                      <textarea value={doubtsRemaining} onChange={e => setDoubtsRemaining(e.target.value)} rows={3}
                        placeholder="Any concepts you're still confused about? Write them here so you can ask next time"
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-sm resize-none" />
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm font-medium block mb-2">🎯 My Practice Goal Before Next Session</label>
                      <textarea value={practiceGoal} onChange={e => setPracticeGoal(e.target.value)} rows={2}
                        placeholder="What will you practice on your own? e.g. I will solve 5 Python exercises"
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-sm resize-none" />
                    </div>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 text-base">
                  {loading ? 'Saving...' : '💾 Save Session Summary'}
                </button>
              </form>
            )}
          </>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {mySummaries.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">📋</p>
                <p className="text-white font-semibold mb-2">No summaries yet</p>
                <p className="text-slate-400 text-sm">Complete a session and submit a summary to see it here</p>
              </div>
            ) : (
              mySummaries.map((s, i) => (
                <div key={i} className="bg-[#141830] border border-white/8 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${s.role === 'teacher' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-purple-500/20 text-purple-300'}`}>
                        {s.role === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
                      </span>
                      <span className="bg-white/5 px-2.5 py-1 rounded-lg text-xs text-slate-300">{s.skill}</span>
                    </div>
                    <span className="text-slate-500 text-xs">{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>

                  {s.partnerName && <p className="text-slate-400 text-xs">With: <span className="text-white font-medium">{s.partnerName}</span></p>}

                  {s.topicsCovered && (
                    <div>
                      <p className="text-slate-400 text-xs font-semibold mb-1">📖 Topics Covered</p>
                      <p className="text-white text-sm">{s.topicsCovered}</p>
                    </div>
                  )}

                  {s.keyPoints?.length > 0 && (
                    <div>
                      <p className="text-slate-400 text-xs font-semibold mb-1">🔑 Key Points</p>
                      <ul className="space-y-0.5">
                        {s.keyPoints.map((kp: string, ki: number) => (
                          <li key={ki} className="text-white text-sm flex items-start gap-2">
                            <span className="text-indigo-400 mt-0.5">•</span>{kp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {s.homework && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                      <p className="text-yellow-400 text-xs font-semibold mb-1">📝 Homework</p>
                      <p className="text-white text-sm">{s.homework}</p>
                    </div>
                  )}

                  {s.whatILearned && (
                    <div>
                      <p className="text-slate-400 text-xs font-semibold mb-1">💡 What I Learned</p>
                      <p className="text-white text-sm">{s.whatILearned}</p>
                    </div>
                  )}

                  {s.doubtsRemaining && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <p className="text-red-400 text-xs font-semibold mb-1">❓ Doubts Remaining</p>
                      <p className="text-white text-sm">{s.doubtsRemaining}</p>
                    </div>
                  )}

                  {s.practiceGoal && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                      <p className="text-green-400 text-xs font-semibold mb-1">🎯 Practice Goal</p>
                      <p className="text-white text-sm">{s.practiceGoal}</p>
                    </div>
                  )}

                  {s.studentPerformance > 0 && (
                    <div className="flex items-center gap-2">
                      <p className="text-slate-400 text-xs font-semibold">Student Performance:</p>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(star => (
                          <span key={star} className={star <= s.studentPerformance ? 'text-yellow-400' : 'text-slate-600'}>★</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionSummary;