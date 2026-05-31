import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { FaSearch, FaStar, FaComments, FaCalendar, FaArrowLeft, FaTimes } from 'react-icons/fa';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  skillsToTeach: string[];
  skillsToLearn: string[];
  avgRating: number;
  xp: number;
  level: number;
  bio: string;
}

const BrowseSkills: React.FC = () => {
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token') || '';

  // Get all users who teach something
  useEffect(() => {
    fetch('http://localhost:5000/api/users/connections', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Only show users who have at least one skill to teach
          const teachers = data.filter(
            (u: Teacher) => u.skillsToTeach && u.skillsToTeach.length > 0
          );
          setAllUsers(teachers);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  // Collect all unique skills (case-insensitive dedup, display with proper casing)
  const allSkills = Array.from(
    allUsers.flatMap((u) => u.skillsToTeach).reduce((map, skill) => {
      const key = skill.toLowerCase();
      if (!map.has(key)) {
        // Capitalize first letter for display
        map.set(key, skill.charAt(0).toUpperCase() + skill.slice(1));
      }
      return map;
    }, new Map<string, string>()).values()
  ).sort();

  // Filter skills based on search
  const filteredSkills = allSkills.filter((s) =>
    s.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get teachers for a selected skill
  const teachersForSkill = selectedSkill
    ? allUsers.filter((u) =>
        u.skillsToTeach.some(
          (s) => s.toLowerCase() === selectedSkill.toLowerCase()
        )
      )
    : [];

  const levelEmoji = (lvl: number) =>
    lvl >= 10 ? '💎' : lvl >= 5 ? '🥇' : lvl >= 3 ? '🥈' : '🥉';

  return (
    <div className="min-h-screen bg-[#0a0d1a] p-4 md:p-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600/80 to-indigo-700/80 border border-blue-500/30 rounded-3xl p-6 md:p-8 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-200 hover:text-white transition-colors"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-white">Browse Skills</h1>
        </div>
        <p className="text-blue-200 text-sm ml-7">
          Find real people who can teach you what you want to learn
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-[#141830] border border-white/8 rounded-xl px-4 py-3 mb-6">
        <FaSearch className="text-slate-500 flex-shrink-0" />
        <input
          placeholder="Search a skill (e.g. Python, Guitar, Design...)"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSelectedSkill('');
          }}
          className="bg-transparent text-white placeholder-slate-500 outline-none flex-1 text-sm"
        />
        {searchTerm.length > 0 && (
          <button
            onClick={() => { setSearchTerm(''); setSelectedSkill(''); }}
            className="text-slate-500 hover:text-white"
          >
            <FaTimes className="text-xs" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-slate-400">Loading skills...</p>
        </div>
      ) : allUsers.length === 0 ? (
        /* No teachers at all */
        <div className="bg-[#141830] border border-white/8 rounded-2xl p-16 text-center">
          <p className="text-5xl mb-4">👥</p>
          <p className="text-white font-semibold text-lg mb-2">No teachers yet</p>
          <p className="text-slate-400 text-sm mb-6">
            Be the first! Go to your Profile and add skills you can teach.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium"
          >
            Add My Skills
          </button>
        </div>
      ) : selectedSkill ? (
        /* Teachers for selected skill */
        <div>
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => setSelectedSkill('')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h2 className="text-white font-bold text-lg">
                Teachers for{' '}
                <span className="text-indigo-400">"{selectedSkill}"</span>
              </h2>
              <p className="text-slate-400 text-xs">
                {teachersForSkill.length} teacher{teachersForSkill.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>

          {teachersForSkill.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No teachers for this skill yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teachersForSkill.map((teacher) => (
                <div
                  key={teacher._id}
                  className="bg-[#141830] border border-white/8 rounded-2xl p-6 hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-black text-2xl">
                        {teacher.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-[#0a0d1a] rounded-full px-1 text-xs">
                        {levelEmoji(teacher.level || 1)}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-bold text-lg">{teacher.name}</h3>
                        {teacher.avgRating > 0 && (
                          <span className="flex items-center gap-1 text-yellow-400 text-sm">
                            <FaStar className="text-xs" />
                            {teacher.avgRating.toFixed(1)}
                          </span>
                        )}
                        <span className="text-slate-500 text-xs">
                          {teacher.xp || 0} XP
                        </span>
                      </div>

                      {teacher.bio && teacher.bio.length > 0 && (
                        <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                          {teacher.bio}
                        </p>
                      )}

                      {/* All skills they teach */}
                      <div className="mt-3">
                        <p className="text-slate-500 text-xs mb-1.5">Also teaches:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {teacher.skillsToTeach.map((s) => (
                            <span
                              key={s}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                s.toLowerCase() === selectedSkill.toLowerCase()
                                  ? 'bg-indigo-500/30 text-indigo-300 border-indigo-500/50'
                                  : 'bg-white/5 text-slate-400 border-white/10'
                              }`}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Wants to learn */}
                      {teacher.skillsToLearn && teacher.skillsToLearn.length > 0 && (
                        <div className="mt-2">
                          <p className="text-slate-500 text-xs mb-1.5">Wants to learn:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {teacher.skillsToLearn.map((s) => (
                              <span
                                key={s}
                                className="px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() =>
                        navigate(`/chat/${teacher._id}`, {
                          state: { partnerName: teacher.name },
                        })
                      }
                      className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all"
                    >
                      <FaComments /> Message
                    </button>
                    <button
                      onClick={() =>
                        navigate('/session/create', {
                          state: {
                            partnerName: teacher.name,
                            partnerId: teacher._id,
                            skill: selectedSkill,
                          },
                        })
                      }
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all"
                    >
                      <FaCalendar /> Book Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Skills Grid */
        <div>
          <p className="text-slate-400 text-sm mb-4">
            {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''} available — click any to see teachers
          </p>

          {filteredSkills.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-white font-semibold mb-1">No skills found</p>
              <p className="text-slate-400 text-sm">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredSkills.map((skill) => {
                const count = allUsers.filter((u) =>
                  u.skillsToTeach.some(
                    (s) => s.toLowerCase() === skill.toLowerCase()
                  )
                ).length;

                return (
                  <button
                    key={skill}
                    onClick={() => setSelectedSkill(skill)}
                    className="bg-[#141830] border border-white/8 rounded-2xl p-4 text-left hover:border-indigo-500/40 hover:bg-indigo-500/5 hover:-translate-y-0.5 transition-all group"
                  >
                    <p className="text-white font-semibold text-sm group-hover:text-indigo-300 transition-colors">
                      {skill}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      {count} teacher{count !== 1 ? 's' : ''}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrowseSkills;