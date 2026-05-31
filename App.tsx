import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './context/AuthContext';

import Home from "./pages/Home";
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardV2 from './pages/DashboardV2';
import ChatV2 from './pages/ChatV2';
import Notes from './pages/Notes';
import SessionBooking from './pages/SessionBooking';
import UserProfile from './pages/UserProfile';
import BrowseSkills from './pages/BrowseSkills';
import Matchmaking from './pages/Matchmaking';
import MySessions from './pages/MySessions';
import VideoCall from './pages/VideoCall';
import Gamification from './pages/Gamification';
import FeedbackRating from './pages/FeedbackRating';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<PrivateRoute><DashboardV2 /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><ChatV2 /></PrivateRoute>} />
          <Route path="/chat/:partnerId" element={<PrivateRoute><ChatV2 /></PrivateRoute>} />
          <Route path="/notes" element={<PrivateRoute><Notes /></PrivateRoute>} />
          <Route path="/match" element={<PrivateRoute><Matchmaking /></PrivateRoute>} />
          <Route path="/session/create" element={<PrivateRoute><SessionBooking /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          <Route path="/skills" element={<PrivateRoute><BrowseSkills /></PrivateRoute>} />
          <Route path="/mysessions" element={<PrivateRoute><MySessions /></PrivateRoute>} />
          <Route path="/call/:roomId" element={<PrivateRoute><VideoCall /></PrivateRoute>} />
          <Route path="/gamification" element={<PrivateRoute><Gamification /></PrivateRoute>} />
          <Route path="/feedback" element={<PrivateRoute><FeedbackRating /></PrivateRoute>} />

          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center min-h-screen p-12 text-center bg-[#0d0f1a]">
                <h1 className="text-5xl font-bold text-white mb-4">404</h1>
                <p className="mb-6 text-slate-400">This page doesn't exist.</p>
                <a href="#/" className="text-indigo-400 hover:underline">← Go Home</a>
              </div>
            }
          />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
