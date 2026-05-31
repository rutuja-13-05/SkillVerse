import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { FaArrowLeft } from 'react-icons/fa';

const SessionBooking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) || {};

  const [skill, setSkill] = useState(state.skill || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    setDate(tom.toISOString().split('T')[0]);
  }, []);

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ skill, date, time, duration, notes, level, partnerId: state.partnerId }),
      });
      const data = await res.json();
      if (data.success) {
        navigate('/mysessions');
      } else {
        alert('Failed to create session. Please try again.');
      }
    } catch {
      // Fallback: just navigate
      navigate('/mysessions');
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    { label: '6:00 AM',  value: '06:00' },
    { label: '7:00 AM',  value: '07:00' },
    { label: '8:00 AM',  value: '08:00' },
    { label: '9:00 AM',  value: '09:00' },
    { label: '10:00 AM', value: '10:00' },
    { label: '11:00 AM', value: '11:00' },
    { label: '12:00 PM', value: '12:00' },
    { label: '1:00 PM',  value: '13:00' },
    { label: '2:00 PM',  value: '14:00' },
    { label: '3:00 PM',  value: '15:00' },
    { label: '4:00 PM',  value: '16:00' },
    { label: '5:00 PM',  value: '17:00' },
    { label: '6:00 PM',  value: '18:00' },
    { label: '7:00 PM',  value: '19:00' },
    { label: '8:00 PM',  value: '20:00' },
    { label: '9:00 PM',  value: '21:00' },
    { label: '10:00 PM', value: '22:00' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0d1a] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white p-2 rounded-lg transition-colors">
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-white text-xl font-black">Create Session</h1>
            <p className="text-slate-400 text-sm">Schedule a live learning session</p>
          </div>
        </div>

        {state.partnerName && (
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-4 mb-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {state.partnerName.charAt(0)}
            </div>
            <div>
              <p className="text-indigo-300 text-sm font-medium">Scheduling with</p>
              <p className="text-white font-bold">{state.partnerName}</p>
            </div>
          </div>
        )}

        <div className="bg-[#141830] border border-white/8 rounded-3xl p-6 md:p-8">
          <form onSubmit={createSession} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">Skill / Topic *</label>
                <input
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  placeholder="e.g. React, Python, Guitar..."
                  required
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-[#0a0d1a] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm"
                >
                  {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">Time *</label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-[#0a0d1a] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm"
                >
                  {timeSlots.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium block mb-3">Duration</label>
              <div className="flex gap-3">
                {[30, 60, 90, 120].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm border transition-all ${duration === d ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}`}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium block mb-2">Notes / Goals</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What do you want to cover? Any specific topics or goals..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3.5 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 transition-all border border-white/8"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {loading ? 'Creating...' : '✨ Create Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SessionBooking;