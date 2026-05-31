import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FaArrowLeft, FaPlus, FaTrash, FaTimes, FaShare, FaCheck, FaSearch } from 'react-icons/fa';

interface Note {
  _id: string;
  title: string;
  content: string;
  skill?: string;
  color: string;
  createdAt?: string;
  owner?: { _id: string; name: string } | string;
  sharedWith?: string[];
}

interface Contact {
  _id: string;
  name: string;
  email: string;
  skillsToTeach?: string[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const Notes: React.FC = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [sharingNote, setSharingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [skill, setSkill] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [searchContacts, setSearchContacts] = useState('');
  const [sharedMap, setSharedMap] = useState<Record<string, string[]>>({});
  const [shareMsg, setShareMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mine' | 'received'>('mine');

  const token = localStorage.getItem('token') || '';
  const myId = localStorage.getItem('userId') || '';

  useEffect(() => {
    // Load notes
    fetch('http://localhost:5000/api/notes', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.notes) setNotes(data.notes);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Load contacts
    fetch('http://localhost:5000/api/users/connections', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setContacts(data); })
      .catch(() => {});
  }, [token]);

  // Determine if a note belongs to me
  const isMyNote = (note: Note) => {
    if (!note.owner) return true;
    if (typeof note.owner === 'string') return note.owner === myId;
    return note.owner._id === myId;
  };

  const getOwnerName = (note: Note) => {
    if (typeof note.owner === 'object' && note.owner?.name) return note.owner.name;
    return 'Someone';
  };

  const myNotes = notes.filter(isMyNote);
  const receivedNotes = notes.filter((n) => !isMyNote(n));
  const displayNotes = activeTab === 'mine' ? myNotes : receivedNotes;

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      const res = await fetch('http://localhost:5000/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: title || 'Untitled Note', content, skill, color }),
      });
      const data = await res.json();
      if (data.note) setNotes((prev) => [data.note, ...prev]);
    } catch { /* ignore */ }
    setTitle(''); setContent(''); setSkill(''); setColor(COLORS[0]);
    setShowForm(false);
  };

  const deleteNote = async (id: string) => {
    if (!window.confirm('Delete this note?')) return;
    await fetch(`http://localhost:5000/api/notes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
    setNotes((prev) => prev.filter((n) => n._id !== id));
    if (sharingNote?._id === id) setSharingNote(null);
  };

  const sendShare = async (userId: string, userName: string) => {
    if (!sharingNote) return;
    const alreadyDone = (sharedMap[sharingNote._id] || []).includes(userId);
    if (alreadyDone) return;

    try {
      await fetch(`http://localhost:5000/api/notes/${sharingNote._id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId }),
      });
      setSharedMap((prev) => ({
        ...prev,
        [sharingNote._id]: [...(prev[sharingNote._id] || []), userId],
      }));
      setShareMsg(`Shared with ${userName}! ✅`);
      setTimeout(() => setShareMsg(''), 3000);
    } catch { /* ignore */ }
  };

  const alreadySharedWith = (noteId: string, userId: string) =>
    (sharedMap[noteId] || []).includes(userId);

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchContacts.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0d1a] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white p-2 rounded-lg transition-colors">
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-white text-xl font-black">📝 My Notes</h1>
              <p className="text-slate-400 text-sm">{notes.length} total note{notes.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(true); setSharingNote(null); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-all font-semibold text-sm"
          >
            <FaPlus /> New Note
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('mine')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${activeTab === 'mine' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#141830] border-white/8 text-slate-400 hover:text-white'}`}
          >
            📝 My Notes
            <span className="ml-2 bg-white/15 text-white text-xs px-2 py-0.5 rounded-full">{myNotes.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${activeTab === 'received' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#141830] border-white/8 text-slate-400 hover:text-white'}`}
          >
            📨 Received Notes
            <span className="ml-2 bg-white/15 text-white text-xs px-2 py-0.5 rounded-full">{receivedNotes.length}</span>
          </button>
        </div>

        <div className={`grid gap-6 ${sharingNote ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Left: Notes */}
          <div>
            {/* New Note Form */}
            {showForm && (
              <div className="bg-[#141830] border border-indigo-500/40 rounded-2xl p-6 mb-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold text-base">✏️ Create New Note</h3>
                  <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><FaTimes /></button>
                </div>
                <form onSubmit={addNote} className="space-y-3">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note title (e.g. Python Tips)"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm"
                  />
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your note here..."
                    required
                    rows={5}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm resize-none"
                  />
                  <input
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    placeholder="Skill tag (e.g. Guitar, React, Cooking)"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm"
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm">Pick color:</span>
                    <div className="flex gap-2">
                      {COLORS.map((c) => (
                        <button key={c} type="button" onClick={() => setColor(c)}
                          className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white/60' : 'hover:scale-110'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all text-sm">
                      💾 Save Note
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className="px-5 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notes List */}
            {loading ? (
              <p className="text-slate-400 text-center py-10">Loading notes...</p>
            ) : displayNotes.length === 0 ? (
              <div className="text-center py-16 bg-[#141830] border border-white/8 rounded-2xl">
                <p className="text-5xl mb-4">{activeTab === 'mine' ? '📝' : '📨'}</p>
                <p className="text-white font-semibold mb-2">
                  {activeTab === 'mine' ? 'No notes yet' : 'No received notes yet'}
                </p>
                <p className="text-slate-400 text-sm mb-5">
                  {activeTab === 'mine'
                    ? 'Create your first note and share it with your learning partners!'
                    : 'When someone shares a note with you, it will appear here'}
                </p>
                {activeTab === 'mine' && (
                  <button onClick={() => setShowForm(true)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium text-sm">
                    + Create Note
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {displayNotes.map((note) => (
                  <div
                    key={note._id}
                    className={`bg-[#141830] rounded-2xl p-5 transition-all border-l-4 ${sharingNote?._id === note._id ? 'border border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.15)]' : 'border border-white/8 hover:border-white/15'}`}
                    style={{ borderLeftColor: note.color }}
                  >
                    {/* Note Header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-base truncate">{note.title}</h3>
                        {!isMyNote(note) && (
                          <p className="text-indigo-400 text-xs mt-0.5">
                            📨 Shared by <span className="font-semibold">{getOwnerName(note)}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {note.skill && (
                          <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: `${note.color}25`, color: note.color }}>
                            {note.skill}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Note Content */}
                    <p className="text-slate-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                      {note.content.length > 200 ? note.content.slice(0, 200) + '...' : note.content}
                    </p>

                    {note.createdAt && (
                      <p className="text-slate-600 text-xs mb-4">{new Date(note.createdAt).toLocaleDateString()}</p>
                    )}

                    {/* Action Buttons — always visible */}
                    {isMyNote(note) && (
                      <div className="flex gap-2 pt-3 border-t border-white/8">
                        <button
                          onClick={() => {
                            setSharingNote(sharingNote?._id === note._id ? null : note);
                            setShowForm(false);
                            setShareMsg('');
                            setSearchContacts('');
                          }}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                            sharingNote?._id === note._id
                              ? 'bg-indigo-600 text-white border-indigo-500'
                              : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/25'
                          }`}
                        >
                          <FaShare className="text-xs" />
                          {sharingNote?._id === note._id ? 'Sharing...' : 'Share this Note'}
                        </button>
                        <button
                          onClick={() => deleteNote(note._id)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm hover:bg-red-500/20 transition-all"
                        >
                          <FaTrash className="text-xs" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Share Panel */}
          {sharingNote && (
            <div className="bg-[#141830] border border-indigo-500/40 rounded-2xl p-6 h-fit sticky top-4">
              {/* Panel Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <FaShare className="text-white text-xs" />
                  </div>
                  <h3 className="text-white font-bold">Share Note</h3>
                </div>
                <button onClick={() => { setSharingNote(null); setShareMsg(''); }} className="text-slate-400 hover:text-white transition-colors">
                  <FaTimes />
                </button>
              </div>

              {/* Which note */}
              <div className="bg-white/5 rounded-xl px-4 py-3 mb-4 border-l-4" style={{ borderLeftColor: sharingNote.color }}>
                <p className="text-white text-sm font-semibold">{sharingNote.title}</p>
                <p className="text-slate-400 text-xs mt-0.5 truncate">{sharingNote.content.slice(0, 60)}...</p>
              </div>

              {/* Success message */}
              {shareMsg && (
                <div className="bg-green-500/15 border border-green-500/30 text-green-400 text-sm px-4 py-2.5 rounded-xl mb-4 flex items-center gap-2">
                  <FaCheck /> {shareMsg}
                </div>
              )}

              <p className="text-slate-400 text-sm mb-3 font-medium">👥 Select who to share with:</p>

              {/* Search */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 mb-3">
                <FaSearch className="text-slate-500 text-sm flex-shrink-0" />
                <input
                  value={searchContacts}
                  onChange={(e) => setSearchContacts(e.target.value)}
                  placeholder="Search by name..."
                  className="bg-transparent text-white placeholder-slate-500 outline-none flex-1 text-sm"
                />
              </div>

              {/* User list */}
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">👥</p>
                  <p className="text-slate-400 text-sm">No users found</p>
                  <p className="text-slate-500 text-xs mt-1">Use matchmaking to connect with users first</p>
                  <button onClick={() => navigate('/match')} className="mt-3 px-4 py-2 bg-indigo-600 text-white text-xs rounded-xl hover:bg-indigo-700 transition-all">
                    Go to Matchmaking
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredContacts.map((c) => {
                    const sent = alreadySharedWith(sharingNote._id, c._id);
                    return (
                      <div key={c._id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/8 transition-all">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{c.name}</p>
                            <p className="text-slate-500 text-xs truncate">
                              {c.skillsToTeach?.slice(0, 2).join(', ') || c.email}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => sendShare(c._id, c.name)}
                          disabled={sent}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ml-2 ${
                            sent
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                          }`}
                        >
                          {sent ? <><FaCheck className="text-xs" /> Sent!</> : <><FaShare className="text-xs" /> Send</>}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;