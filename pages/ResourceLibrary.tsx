import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FaArrowLeft, FaHeart, FaTrash, FaPlus, FaSearch, FaYoutube, FaLink, FaCode, FaBook, FaTimes } from 'react-icons/fa';

const typeConfig: any = {
  video:     { icon: <FaYoutube />,  label: 'Video',    color: 'red',    bg: 'bg-red-500/10 border-red-500/20 text-red-400' },
  article:   { icon: <FaLink />,     label: 'Article',  color: 'blue',   bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  practice:  { icon: <FaCode />,     label: 'Practice', color: 'green',  bg: 'bg-green-500/10 border-green-500/20 text-green-400' },
  reference: { icon: <FaBook />,     label: 'Reference',color: 'purple', bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
};

const ResourceLibrary: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const userId = localStorage.getItem('userId') || '';

  const [resources, setResources] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [filterSkill, setFilterSkill] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  // Add form
  const [title, setTitle] = useState('');
  const [skill, setSkill] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'video'|'article'|'practice'|'reference'>('article');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchResources = (skillFilter = '') => {
    setLoading(true);
    const q = skillFilter ? `?skill=${encodeURIComponent(skillFilter)}` : '';
    fetch(`http://localhost:5000/api/resources${q}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setResources(d.resources); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResources();
    fetch('http://localhost:5000/api/resources/skills', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setSkills(d.skills); })
      .catch(() => {});
  }, [token]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch('http://localhost:5000/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, skill, description, type, url, content }),
      });
      const data = await res.json();
      if (data.success) {
        setResources(prev => [data.resource, ...prev]);
        if (!skills.includes(skill)) setSkills(prev => [...prev, skill]);
        setShowAdd(false);
        setTitle(''); setSkill(''); setDescription(''); setUrl(''); setContent(''); setType('article');
      }
    } catch {}
    setAdding(false);
  };

  const handleLike = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/resources/${id}/like`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setResources(prev => prev.map(r => {
        if (r._id !== id) return r;
        const liked = r.likes?.includes(userId);
        return { ...r, likes: liked ? r.likes.filter((l: string) => l !== userId) : [...(r.likes || []), userId] };
      }));
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/resources/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setResources(prev => prev.filter(r => r._id !== id));
    } catch {}
  };

  const filtered = resources.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.skill.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0d1a] text-white">
      {/* Header */}
      <div className="bg-[#141830] border-b border-white/8 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white transition-colors">
            <FaArrowLeft />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-lg">
              📚
            </div>
            <div>
              <h1 className="text-white font-bold text-base">Resource Library</h1>
              <p className="text-slate-400 text-xs">Community-shared learning materials</p>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:scale-105 transition-all">
            <FaPlus className="text-xs" /> Add Resource
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center gap-2 flex-1 bg-white/5 border border-white/8 rounded-xl px-4 py-3">
            <FaSearch className="text-slate-500 text-sm flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="bg-transparent text-white text-sm placeholder-slate-500 outline-none flex-1" />
          </div>
          <select value={filterSkill} onChange={e => { setFilterSkill(e.target.value); fetchResources(e.target.value); }}
            className="bg-white/5 border border-white/8 text-white rounded-xl px-4 py-3 outline-none text-sm">
            <option value="">All Skills</option>
            {skills.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Type filter pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {Object.entries(typeConfig).map(([t, cfg]: any) => (
            <span key={t} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${cfg.bg} cursor-default`}>
              {cfg.icon} {cfg.label}
            </span>
          ))}
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading resources...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📚</p>
            <p className="text-white font-semibold mb-2">No resources yet</p>
            <p className="text-slate-400 text-sm mb-6">Be the first to share a learning resource!</p>
            <button onClick={() => setShowAdd(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all">
              + Add First Resource
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((r) => {
              const cfg = typeConfig[r.type] || typeConfig.article;
              const isLiked = r.likes?.includes(userId);
              const isOwner = r.uploadedBy === userId || r.uploadedBy?._id === userId;

              return (
                <div key={r._id} className="bg-[#141830] border border-white/8 rounded-2xl p-5 hover:border-indigo-500/30 transition-all flex flex-col gap-3">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.bg}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                      <span className="px-2.5 py-1 bg-white/5 border border-white/8 rounded-lg text-xs text-slate-300">
                        {r.skill}
                      </span>
                    </div>
                    {isOwner && (
                      <button onClick={() => handleDelete(r._id)}
                        className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0">
                        <FaTrash className="text-xs" />
                      </button>
                    )}
                  </div>

                  {/* Title & desc */}
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">{r.title}</h3>
                    {r.description && <p className="text-slate-400 text-xs leading-relaxed">{r.description}</p>}
                  </div>

                  {/* Content (for practice problems) */}
                  {r.content && (
                    <div className="bg-white/3 border border-white/5 rounded-xl p-3">
                      <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">{r.content}</p>
                    </div>
                  )}

                  {/* URL */}
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-xs transition-colors group">
                      <FaLink className="text-[10px]" />
                      <span className="truncate group-hover:underline">{r.url}</span>
                    </a>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <p className="text-slate-500 text-xs">By <span className="text-slate-400">{r.uploaderName || 'User'}</span></p>
                    <button onClick={() => handleLike(r._id)}
                      className={`flex items-center gap-1.5 text-xs transition-all ${isLiked ? 'text-red-400' : 'text-slate-500 hover:text-red-400'}`}>
                      <FaHeart className={isLiked ? 'animate-pulse' : ''} />
                      <span>{r.likes?.length || 0}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Resource Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#141830] border border-white/10 rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-lg">Add Resource</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white"><FaTimes /></button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(typeConfig).map(([t, cfg]: any) => (
                    <button type="button" key={t} onClick={() => setType(t as any)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${type === t ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-white/8 bg-white/3 text-slate-400 hover:border-white/20'}`}>
                      {cfg.icon} {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">Title <span className="text-red-400">*</span></label>
                <input value={title} onChange={e => setTitle(e.target.value)} required
                  placeholder="e.g. Python for Beginners - Full Tutorial"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm" />
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">Skill Tag <span className="text-red-400">*</span></label>
                <input value={skill} onChange={e => setSkill(e.target.value)} required
                  placeholder="e.g. Python, Guitar, Cooking"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm" />
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                  placeholder="Brief description of this resource..."
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm resize-none" />
              </div>

              {(type === 'video' || type === 'article' || type === 'reference') && (
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-2">URL / Link</label>
                  <input value={url} onChange={e => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm" />
                </div>
              )}

              {type === 'practice' && (
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-2">Practice Problem / Content</label>
                  <textarea value={content} onChange={e => setContent(e.target.value)} rows={4}
                    placeholder="Write the practice problem or exercise here..."
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm resize-none font-mono" />
                </div>
              )}

              <button type="submit" disabled={adding}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50">
                {adding ? 'Adding...' : '+ Add Resource'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceLibrary;