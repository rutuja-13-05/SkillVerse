import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  FaBell, FaComments, FaCalendar, FaCheckCircle,
  FaTimes, FaTrash, FaCheck, FaClock, FaStar,
} from 'react-icons/fa';
import socket from '../socket/socket';

interface SessionDetails {
  skill: string;
  date: string;
  time: string;
  duration: number;
  level: string;
  notes: string;
  senderName: string;
  senderId: string;
}

interface Notification {
  _id: string;
  type: string;
  content: string;
  link: string;
  read: boolean;
  createdAt: string;
  sessionId?: string;
  sessionDetails?: SessionDetails;
}

const typeIcon = (type: string) => {
  if (type === 'New Message') return <FaComments className="text-indigo-400" />;
  if (type === 'Session Request') return <FaCalendar className="text-orange-400" />;
  if (type === 'Session Accepted') return <FaCheckCircle className="text-green-400" />;
  if (type === 'Session Completed') return <FaStar className="text-yellow-400" />;
  if (type === 'Session Cancelled' || type === 'Session Rejected') return <FaTimes className="text-red-400" />;
  if (type === 'Note Shared') return <span className="text-base">📝</span>;
  return <FaBell className="text-slate-400" />;
};

const typeBg = (type: string) => {
  if (type === 'New Message') return 'bg-indigo-500/15';
  if (type === 'Session Request') return 'bg-orange-500/15';
  if (type === 'Session Accepted') return 'bg-green-500/15';
  if (type === 'Session Completed') return 'bg-yellow-500/15';
  if (type === 'Session Cancelled' || type === 'Session Rejected') return 'bg-red-500/15';
  return 'bg-white/5';
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('token') || '';
  const userId = localStorage.getItem('userId') || '';

  // Load from DB on mount
  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:5000/api/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setNotifications(data); })
      .catch(() => {});
  }, [token]);

  // Real-time socket
  useEffect(() => {
    if (!userId) return;
    socket.emit('user-connected', userId);
    socket.on('new-notification', (notif: Omit<Notification, '_id' | 'read' | 'createdAt'>) => {
      const n: Notification = {
        _id: Date.now().toString(),
        ...notif,
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [n, ...prev]);
    });
    return () => { socket.off('new-notification'); };
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSelectedNotif(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch('http://localhost:5000/api/notifications/read-all', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  };

  const clearAll = async () => {
    setNotifications([]);
    setOpen(false);
    setSelectedNotif(null);
    await fetch('http://localhost:5000/api/notifications', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  };

  const handleNotifClick = (notif: Notification) => {
    markRead(notif._id);
    // If session request → show detail popup
    if (notif.type === 'Session Request' && notif.sessionId) {
      setSelectedNotif(notif);
    } else {
      // For other types → navigate
      setOpen(false);
      navigate(notif.link);
    }
  };

  const handleAccept = async () => {
    if (!selectedNotif?.sessionId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/sessions/${selectedNotif.sessionId}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // Remove this notification from list
        setNotifications((prev) => prev.filter((n) => n._id !== selectedNotif._id));
        setSelectedNotif(null);
        setOpen(false);
        navigate('/mysessions');
      }
    } catch { /* ignore */ }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!selectedNotif?.sessionId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/sessions/${selectedNotif.sessionId}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n._id !== selectedNotif._id));
        setSelectedNotif(null);
      }
    } catch { /* ignore */ }
    setActionLoading(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setOpen(!open);
          setSelectedNotif(null);
          if (!open && unreadCount > 0) markAllRead();
        }}
        className="relative text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Main Panel */}
      {open && !selectedNotif && (
        <div className="fixed md:absolute right-2 md:right-0 top-20 md:top-12 w-[92vw] md:w-96 bg-[#141830] border border-white/10 rounded-2xl shadow-2xl z-[9999] overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/8 flex justify-between items-center bg-[#1a1f3e]">
            <div className="flex items-center gap-2">
              <FaBell className="text-indigo-400" />
              <h3 className="text-white font-bold">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button onClick={clearAll} title="Clear all" className="text-slate-400 hover:text-red-400 transition-colors p-1">
              <FaTrash className="text-sm" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-4xl mb-3">🔔</p>
                <p className="text-white font-semibold text-sm">All caught up!</p>
                <p className="text-slate-500 text-xs mt-1">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotifClick(n)}
                  className={`flex gap-3 px-4 py-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-all ${!n.read ? 'bg-white/3' : ''}`}
                >
                  {/* Icon circle */}
                  <div className={`w-9 h-9 rounded-full ${typeBg(n.type)} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    {typeIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white text-sm font-semibold leading-snug">{n.content}</p>
                      {!n.read && <span className="w-2 h-2 bg-indigo-400 rounded-full flex-shrink-0 mt-1.5" />}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-bold uppercase tracking-wide ${
                        n.type === 'Session Request' ? 'text-orange-400' :
                        n.type === 'Session Accepted' ? 'text-green-400' :
                        n.type === 'New Message' ? 'text-indigo-400' :
                        n.type === 'Session Completed' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {n.type}
                      </span>
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-slate-500 text-xs">{timeAgo(n.createdAt)}</span>
                    </div>
                    {/* For session requests show a hint */}
                    {n.type === 'Session Request' && n.sessionId && (
                      <p className="text-indigo-400 text-xs mt-1 font-medium">
                        👆 Tap to view details & accept / reject
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-white/8 text-center">
              <button onClick={clearAll} className="text-slate-400 hover:text-white text-xs transition-colors">
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Session Request Detail Popup */}
      {open && selectedNotif && selectedNotif.sessionDetails && (
        <div className="fixed md:absolute right-2 md:right-0 top-20 md:top-12 w-[92vw] md:w-96 bg-[#141830] border border-orange-500/30 rounded-2xl shadow-2xl z-[9999] overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-orange-600/20 to-amber-600/20 border-b border-orange-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaCalendar className="text-orange-400" />
              <h3 className="text-white font-bold">Session Request</h3>
            </div>
            <button
              onClick={() => setSelectedNotif(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Sender */}
          <div className="px-5 pt-5 pb-3 flex items-center gap-3 border-b border-white/8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
              {selectedNotif.sessionDetails.senderName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-bold">{selectedNotif.sessionDetails.senderName}</p>
              <p className="text-slate-400 text-sm">wants to learn / teach with you</p>
            </div>
          </div>

          {/* Session Details */}
          <div className="px-5 py-4 space-y-3">
            <div className="bg-white/5 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Skill</span>
                <span className="text-white font-bold text-sm bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full">
                  {selectedNotif.sessionDetails.skill}
                </span>
              </div>

              {selectedNotif.sessionDetails.date && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm flex items-center gap-1.5">
                    <FaCalendar className="text-xs" /> Date
                  </span>
                  <span className="text-white text-sm font-medium">
                    {selectedNotif.sessionDetails.date}
                  </span>
                </div>
              )}

              {selectedNotif.sessionDetails.time && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm flex items-center gap-1.5">
                    <FaClock className="text-xs" /> Time
                  </span>
                  <span className="text-white text-sm font-medium">
                    {selectedNotif.sessionDetails.time}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Duration</span>
                <span className="text-white text-sm font-medium">
                  {selectedNotif.sessionDetails.duration} minutes
                </span>
              </div>

              {selectedNotif.sessionDetails.level && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Level</span>
                  <span className="text-white text-sm font-medium">
                    {selectedNotif.sessionDetails.level}
                  </span>
                </div>
              )}
            </div>

            {selectedNotif.sessionDetails.notes && (
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-slate-400 text-xs mb-1">Notes from sender</p>
                <p className="text-white text-sm leading-relaxed">
                  {selectedNotif.sessionDetails.notes}
                </p>
              </div>
            )}
          </div>

          {/* Accept / Reject Buttons */}
          <div className="px-5 pb-5 flex gap-3">
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="flex-1 py-3 bg-red-500/15 text-red-400 border border-red-500/30 rounded-xl font-bold hover:bg-red-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              <FaTimes /> Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={actionLoading}
              className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              <FaCheck /> {actionLoading ? 'Accepting...' : 'Accept'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;