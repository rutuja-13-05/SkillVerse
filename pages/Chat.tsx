import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router';
import { FaPaperPlane, FaArrowLeft, FaSearch, FaCircle, FaVideo, FaTrash } from 'react-icons/fa';
import socket from '../socket/socket';

interface Message {
  _id?: string;
  chatId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  message: string;
  timestamp: Date;
}

interface Contact {
  _id: string;
  name: string;
  email: string;
  skillsToTeach?: string[];
  avgRating?: number;
}

const Chat: React.FC = () => {
  const { partnerId } = useParams<{ partnerId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [hoveredMsg, setHoveredMsg] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = localStorage.getItem('userId') || '';
  const currentUserName = localStorage.getItem('name') || 'User';
  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    fetch('http://localhost:5000/api/users/connections', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setContacts(data); })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (currentUserId) socket.emit('user-connected', currentUserId);
  }, [currentUserId]);

  const openChat = (contact: Contact) => {
    setActiveContact(contact);
    setAllMessages([]);
    socket.off('receive-message');
    socket.off('user-typing');

    const id = [currentUserId, contact._id].sort().join('-');
    setChatId(id);
    socket.emit('join-chat', { chatId: id });

    fetch(`http://localhost:5000/api/chat/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setAllMessages(data); })
      .catch(() => {});

    socket.on('receive-message', (data: Message) => {
      if (data.chatId === id) setAllMessages((prev) => [...prev, data]);
    });

    socket.on('user-typing', (data: { userId: string }) => {
      if (data.userId === contact._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 1500);
      }
    });
  };

  useEffect(() => {
    if (partnerId && contacts.length > 0) {
      const found = contacts.find((c) => c._id === partnerId);
      if (found) {
        openChat(found);
      } else {
        const name = (location.state as { partnerName?: string })?.partnerName || 'Partner';
        openChat({ _id: partnerId, name, email: '' });
      }
    }
  }, [partnerId, contacts]);

  useEffect(() => {
    return () => {
      socket.off('receive-message');
      socket.off('user-typing');
    };
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeContact) return;

    const msgData: Message = {
      chatId,
      senderId: currentUserId,
      senderName: currentUserName,
      receiverId: activeContact._id,
      message,
      timestamp: new Date(),
    };

    socket.emit('send-message', msgData);
    setAllMessages((prev) => [...prev, msgData]);

    fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ chatId, receiverId: activeContact._id, message }),
    })
      .then((r) => r.json())
      .then((saved) => {
        // Update local message with real _id from DB so delete works
        if (saved._id) {
          setAllMessages((prev) =>
            prev.map((m, i) =>
              i === prev.length - 1 && !m._id ? { ...m, _id: saved._id } : m
            )
          );
        }
      })
      .catch(() => {});

    setMessage('');
  };

  const deleteMessage = async (msg: Message, index: number) => {
    // Optimistic delete from UI first
    setAllMessages((prev) => prev.filter((_, i) => i !== index));

    if (msg._id) {
      setDeletingId(msg._id);
      try {
        await fetch(`http://localhost:5000/api/chat/${msg._id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
      setDeletingId(null);
    }
  };

  const handleTyping = () => {
    if (chatId) socket.emit('typing', { chatId, userId: currentUserId });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen bg-[#0a0d1a] flex overflow-hidden">

      {/* Sidebar */}
      <div className={`${activeContact ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 bg-[#141830] border-r border-white/8`}>
        <div className="p-5 border-b border-white/8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg font-bold">Messages</h2>
            <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors">
              <FaArrowLeft />
            </button>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
            <FaSearch className="text-slate-500 text-sm flex-shrink-0" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contacts..."
              className="bg-transparent text-white text-sm placeholder-slate-500 outline-none flex-1 min-w-0"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <p className="text-white font-semibold text-sm mb-1">Chat Locked</p>
              <p className="text-slate-400 text-xs mb-2 leading-relaxed">
                You can only chat with users who have <span className="text-indigo-400 font-semibold">accepted your session request</span>
              </p>
              <p className="text-slate-500 text-xs mb-5 leading-relaxed">
                Book a session → Partner accepts → Chat unlocks automatically ✅
              </p>
              <button onClick={() => navigate('/skills')} className="w-full px-4 py-2.5 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition-all mb-2">
                🔍 Browse Skills
              </button>
              <button onClick={() => navigate('/match')} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-slate-300 text-sm rounded-xl hover:bg-white/10 transition-all">
                🤖 Find AI Match
              </button>
            </div>
          ) : (
            filtered.map((contact) => (
              <button
                key={contact._id}
                onClick={() => openChat(contact)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors text-left ${activeContact?._id === contact._id ? 'bg-indigo-600/10 border-l-2 border-indigo-500' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <FaCircle className="absolute bottom-0 right-0 text-green-400 text-[8px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{contact.name}</p>
                  <p className="text-slate-500 text-xs truncate">
                    {contact.skillsToTeach?.slice(0, 2).join(', ') || contact.email}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${activeContact ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>
        {activeContact ? (
          <>
            {/* Header */}
            <div className="bg-[#141830] border-b border-white/8 p-4 flex items-center gap-3">
              <button onClick={() => setActiveContact(null)} className="md:hidden text-slate-400 hover:text-white mr-1">
                <FaArrowLeft />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {activeContact.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{activeContact.name}</p>
                <p className="text-green-400 text-xs flex items-center gap-1">
                  <FaCircle className="text-[7px]" /> Online
                </p>
              </div>
              <button
                onClick={() => navigate('/session/create', { state: { partnerName: activeContact.name, partnerId: activeContact._id } })}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-all flex-shrink-0"
              >
                <FaVideo /> Schedule
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#0a0d1a]">
              {allMessages.length === 0 && (
                <div className="text-center text-slate-500 mt-16">
                  <p className="text-4xl mb-3">👋</p>
                  <p className="font-medium">Start a conversation with {activeContact.name}</p>
                </div>
              )}

              {allMessages.map((msg, i) => {
                const isMe = msg.senderId === currentUserId;
                const isHovered = hoveredMsg === i;

                return (
                  <div
                    key={i}
                    className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                    onMouseEnter={() => setHoveredMsg(i)}
                    onMouseLeave={() => setHoveredMsg(null)}
                  >
                    {/* Delete button — left side for my messages */}
                    {isMe && (
                      <button
                        onClick={() => deleteMessage(msg, i)}
                        className={`flex-shrink-0 w-7 h-7 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/40 hover:text-red-300 flex items-center justify-center transition-all duration-200 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                        title="Delete message"
                      >
                        <FaTrash className="text-[9px]" />
                      </button>
                    )}

                    {/* Message bubble */}
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMe
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm'
                      : 'bg-[#1e2340] text-white border border-white/5 rounded-bl-sm'
                    }`}>
                      <p className="leading-relaxed break-words">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-white/50' : 'text-slate-500'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs pl-1">
                  <span className="flex gap-1">
                    {[0, 150, 300].map((d) => (
                      <span key={d} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </span>
                  {activeContact.name} is typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 bg-[#141830] border-t border-white/8 flex gap-3">
              <input
                value={message}
                onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
                placeholder="Type a message..."
                className="flex-1 bg-white/5 border border-white/8 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm min-w-0"
              />
              <button type="submit" className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all flex-shrink-0">
                <FaPaperPlane className="text-sm" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#0a0d1a] text-center">
            <div>
              <p className="text-5xl mb-4">💬</p>
              <h3 className="text-white text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-slate-500 text-sm">Choose a contact from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;