import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router";
import { FaPaperPlane, FaArrowLeft, FaSearch, FaCircle } from "react-icons/fa";
import socket from "../socket/socket";

interface Message {
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
}

const ChatV2: React.FC = () => {
  const { partnerId } = useParams<{ partnerId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const partnerName =
    (location.state as any)?.partnerName ||
    localStorage.getItem(`chat_name_${partnerId}`) ||
    "Partner";

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [showSidebar, setShowSidebar] = useState(!partnerId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = localStorage.getItem("userId") || "";
  const currentUserName = localStorage.getItem("name") || "User";

  // Fetch contacts
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/users/connections", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setContacts(data);
      })
      .catch(() => {
        // Fallback demo contacts
        setContacts([
          { _id: "demo1", name: "Alice Johnson", email: "alice@demo.com" },
          { _id: "demo2", name: "Bob Smith", email: "bob@demo.com" },
        ]);
      });
  }, []);

  useEffect(() => {
    if (currentUserId) socket.emit("user-connected", currentUserId);
  }, [currentUserId]);

  const openChat = (contact: Contact) => {
    setActiveContact(contact);
    setAllMessages([]);
    setShowSidebar(false);
    localStorage.setItem(`chat_name_${contact._id}`, contact.name);

    const id = [currentUserId, contact._id].sort().join("-");
    setChatId(id);
    socket.emit("join-chat", { chatId: id });

    socket.off("receive-message");
    socket.on("receive-message", (data: Message) => {
      if (data.chatId === id) {
        setAllMessages(prev => [...prev, data]);
      }
    });

    socket.off("user-typing");
    socket.on("user-typing", (data: any) => {
      if (data.userId === contact._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 1500);
      }
    });
  };

  useEffect(() => {
    if (partnerId && contacts.length > 0) {
      const found = contacts.find(c => c._id === partnerId);
      if (found) openChat(found);
    }
  }, [partnerId, contacts]);

  useEffect(() => {
    return () => {
      socket.off("receive-message");
      socket.off("user-typing");
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

    socket.emit("send-message", msgData);
    setAllMessages(prev => [...prev, msgData]);
    setMessage("");
  };

  const handleTyping = () => {
    if (chatId) socket.emit("typing", { chatId, userId: currentUserId });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <div className={`${showSidebar ? "flex" : "hidden md:flex"} flex-col w-full md:w-80 bg-slate-800 border-r border-slate-700`}>
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-bold">Messages</h2>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <FaArrowLeft />
            </button>
          </div>
          <div className="flex items-center gap-2 bg-slate-700/50 rounded-xl px-3 py-2">
            <FaSearch className="text-slate-400 text-sm" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search contacts..."
              className="bg-transparent text-white text-sm placeholder-slate-400 outline-none flex-1"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              <p className="text-4xl mb-2">💬</p>
              <p className="text-sm">No contacts yet</p>
              <p className="text-xs mt-1">Complete matchmaking to find partners</p>
              <button
                onClick={() => navigate("/match")}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition-all"
              >
                Find Match
              </button>
            </div>
          ) : (
            filteredContacts.map(contact => (
              <button
                key={contact._id}
                onClick={() => openChat(contact)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-slate-700/50 transition-colors text-left ${
                  activeContact?._id === contact._id ? "bg-slate-700/70 border-l-4 border-indigo-500" : ""
                }`}
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <FaCircle className="absolute bottom-0 right-0 text-green-400 text-xs" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{contact.name}</p>
                  <p className="text-slate-400 text-xs truncate">{contact.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${!showSidebar || window.innerWidth >= 768 ? "flex" : "hidden"} flex-1 flex-col`}>
        {activeContact ? (
          <>
            {/* Chat Header */}
            <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(true)}
                className="md:hidden text-slate-400 hover:text-white mr-2"
              >
                <FaArrowLeft />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                {activeContact.name.charAt(0)}
              </div>
              <div>
                <p className="text-white font-semibold">{activeContact.name}</p>
                <p className="text-green-400 text-xs flex items-center gap-1">
                  <FaCircle className="text-[8px]" /> Online
                </p>
              </div>
              <button
                onClick={() => navigate(`/session/create`, { state: { partnerName: activeContact.name, partnerId: activeContact._id } })}
                className="ml-auto px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-all"
              >
                📅 Schedule
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-900">
              {allMessages.length === 0 && (
                <div className="text-center text-slate-500 mt-10">
                  <p className="text-3xl mb-2">👋</p>
                  <p>Say hi to {activeContact.name}!</p>
                </div>
              )}
              {allMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[65%] px-4 py-3 rounded-2xl ${
                      msg.senderId === currentUserId
                        ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm"
                        : "bg-slate-700 text-white rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${msg.senderId === currentUserId ? "text-white/60" : "text-slate-400"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-sm pl-2">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                  {activeContact.name} is typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 bg-slate-800 border-t border-slate-700 flex gap-3">
              <input
                value={message}
                onChange={e => { setMessage(e.target.value); handleTyping(); }}
                placeholder="Type a message..."
                className="flex-1 bg-slate-700 text-white placeholder-slate-400 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <button
                type="submit"
                className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all"
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-900 text-center">
            <div>
              <p className="text-6xl mb-4">💬</p>
              <h3 className="text-white text-xl font-semibold mb-2">Select a conversation</h3>
              <p className="text-slate-400 text-sm">Choose a contact from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatV2;
