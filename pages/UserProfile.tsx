import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { FaArrowLeft, FaStar, FaTimes } from 'react-icons/fa';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [teach, setTeach] = useState<string[]>([]);
  const [learn, setLearn] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [newTeach, setNewTeach] = useState('');
  const [newLearn, setNewLearn] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    fetch('http://localhost:5000/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) {
          setUserName(data.user.name || '');
          setEmail(data.user.email || '');
          setXp(data.user.xp || 0);
          setLevel(data.user.level || 1);
          setAvgRating(data.user.avgRating || 0);
          setRatingCount(data.user.ratingCount || 0);
          setSessionsCompleted(data.user.sessionsCompleted || 0);
          setTeach(data.user.skillsToTeach || []);
          setLearn(data.user.skillsToLearn || []);
          setBio(data.user.bio || '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  // Auto-adds whatever is typed in the input box before saving
  const getFinalTeachList = () => {
    const list = [...teach];
    const val = newTeach.trim();
    if (val && !list.map((s) => s.toLowerCase()).includes(val.toLowerCase())) {
      list.push(val);
    }
    return list;
  };

  const getFinalLearnList = () => {
    const list = [...learn];
    const val = newLearn.trim();
    if (val && !list.map((s) => s.toLowerCase()).includes(val.toLowerCase())) {
      list.push(val);
    }
    return list;
  };

  const saveProfile = async () => {
    // Auto-include anything still typed in the input boxes
    const finalTeach = getFinalTeachList();
    const finalLearn = getFinalLearnList();

    // Update state too so UI reflects it
    setTeach(finalTeach);
    setLearn(finalLearn);
    setNewTeach('');
    setNewLearn('');

    try {
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skillsToTeach: finalTeach,
          skillsToLearn: finalLearn,
          bio: bio,
          name: userName,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('✅ Profile updated successfully!');
        setEditMode(false);
        setTimeout(() => setMsg(''), 3000);
      } else {
        setMsg('❌ ' + (data.message || 'Update failed'));
      }
    } catch {
      setMsg('❌ Network error. Try again.');
    }
  };

  const addTeachSkill = () => {
    const val = newTeach.trim();
    if (val && !teach.map((s) => s.toLowerCase()).includes(val.toLowerCase())) {
      setTeach((prev) => [...prev, val]);
    }
    setNewTeach('');
  };

  const addLearnSkill = () => {
    const val = newLearn.trim();
    if (val && !learn.map((s) => s.toLowerCase()).includes(val.toLowerCase())) {
      setLearn((prev) => [...prev, val]);
    }
    setNewLearn('');
  };

  const removeTeach = (skill: string) => setTeach((prev) => prev.filter((s) => s !== skill));
  const removeLearn = (skill: string) => setLearn((prev) => prev.filter((s) => s !== skill));

  const levelEmoji = (lvl: number) =>
    lvl >= 10 ? '💎' : lvl >= 5 ? '🥇' : lvl >= 3 ? '🥈' : '🥉';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0d1a] flex items-center justify-center">
        <p className="text-white text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0d1a] p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-slate-400 hover:text-white transition-colors p-2"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-white text-xl font-bold">My Profile</h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-5">
        {/* Profile Card */}
        <div className="bg-[#141830] border border-white/8 rounded-3xl p-8 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-black text-4xl shadow-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-0 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {levelEmoji(level)} Lv{level}
            </div>
          </div>

          <h2 className="text-2xl font-black text-white">{userName}</h2>
          <p className="text-slate-400 text-sm mt-1">{email}</p>

          {bio.length > 0 && (
            <p className="text-slate-300 text-sm mt-3 max-w-xs mx-auto leading-relaxed">{bio}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            <div className="bg-white/5 rounded-2xl py-3">
              <p className="text-yellow-400 font-black text-xl">{xp}</p>
              <p className="text-slate-500 text-xs mt-0.5">XP</p>
            </div>
            <div className="bg-white/5 rounded-2xl py-3">
              <p className="text-indigo-400 font-black text-xl">{level}</p>
              <p className="text-slate-500 text-xs mt-0.5">Level</p>
            </div>
            <div className="bg-white/5 rounded-2xl py-3">
              <p className="text-green-400 font-black text-xl">{sessionsCompleted}</p>
              <p className="text-slate-500 text-xs mt-0.5">Sessions</p>
            </div>
            <div className="bg-white/5 rounded-2xl py-3">
              <p className="text-pink-400 font-black text-xl">
                {avgRating > 0 ? avgRating.toFixed(1) : '—'}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">Rating</p>
            </div>
          </div>

          {avgRating > 0 && (
            <div className="flex items-center justify-center gap-1 mt-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <FaStar
                  key={s}
                  className={s <= Math.round(avgRating) ? 'text-yellow-400' : 'text-white/10'}
                />
              ))}
              <span className="text-slate-400 text-sm ml-2">({ratingCount} reviews)</span>
            </div>
          )}

          {msg.length > 0 && (
            <p className="text-center text-sm mt-4 font-medium text-green-400">{msg}</p>
          )}

          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="mt-5 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold text-sm"
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {/* View Mode Skills */}
        {!editMode && (
          <>
            <div className="bg-[#141830] border border-white/8 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-3">🛠 Skills I Can Teach</h3>
              {teach.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {teach.map((s) => (
                    <span
                      key={s}
                      className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No skills added yet. Click Edit Profile to add.</p>
              )}
            </div>

            <div className="bg-[#141830] border border-white/8 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-3">📚 Skills I Want to Learn</h3>
              {learn.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {learn.map((s) => (
                    <span
                      key={s}
                      className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No skills added yet. Click Edit Profile to add.</p>
              )}
            </div>
          </>
        )}

        {/* Edit Mode */}
        {editMode && (
          <div className="bg-[#141830] border border-white/8 rounded-2xl p-6 space-y-6">

            {/* Bio */}
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 resize-none text-sm"
              />
            </div>

            {/* Teach Skills */}
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1">
                🛠 Skills I Can Teach
              </label>
              <p className="text-slate-500 text-xs mb-2">
                Type a skill and press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white">Enter</kbd> or <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white">+</kbd> to add it. Or just type and click Save — it will be added automatically!
              </p>
              <div className="flex gap-2 mb-3">
                <input
                  value={newTeach}
                  onChange={(e) => setNewTeach(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTeachSkill();
                    }
                  }}
                  placeholder="e.g. Python, React, Java..."
                  className="flex-1 bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 text-sm"
                />
                <button
                  onClick={addTeachSkill}
                  className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 text-sm font-bold"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-8">
                {teach.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-full text-sm"
                  >
                    {s}
                    <button onClick={() => removeTeach(s)} className="hover:text-red-400 transition-colors ml-1">
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                ))}
                {/* Preview of what's currently typed */}
                {newTeach.trim().length > 0 && !teach.map((s) => s.toLowerCase()).includes(newTeach.trim().toLowerCase()) && (
                  <span className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 border-dashed px-3 py-1.5 rounded-full text-sm opacity-70">
                    {newTeach.trim()} (will be added on Save)
                  </span>
                )}
              </div>
            </div>

            {/* Learn Skills */}
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1">
                📚 Skills I Want to Learn
              </label>
              <p className="text-slate-500 text-xs mb-2">
                Type a skill and press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white">Enter</kbd> or <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white">+</kbd> to add it. Or just type and click Save — it will be added automatically!
              </p>
              <div className="flex gap-2 mb-3">
                <input
                  value={newLearn}
                  onChange={(e) => setNewLearn(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addLearnSkill();
                    }
                  }}
                  placeholder="e.g. Design, Guitar, Spanish..."
                  className="flex-1 bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-3 py-2.5 outline-none focus:border-cyan-500 text-sm"
                />
                <button
                  onClick={addLearnSkill}
                  className="bg-cyan-600 text-white px-4 py-2.5 rounded-xl hover:bg-cyan-700 text-sm font-bold"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-8">
                {learn.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-full text-sm"
                  >
                    {s}
                    <button onClick={() => removeLearn(s)} className="hover:text-red-400 transition-colors ml-1">
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                ))}
                {/* Preview of what's currently typed */}
                {newLearn.trim().length > 0 && !learn.map((s) => s.toLowerCase()).includes(newLearn.trim().toLowerCase()) && (
                  <span className="flex items-center gap-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 border-dashed px-3 py-1.5 rounded-full text-sm opacity-70">
                    {newLearn.trim()} (will be added on Save)
                  </span>
                )}
              </div>
            </div>

            {/* Save / Cancel */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={saveProfile}
                className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm"
              >
                💾 Save Changes
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setNewTeach('');
                  setNewLearn('');
                }}
                className="flex-1 py-3.5 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 transition-all text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;