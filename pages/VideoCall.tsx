import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { FaArrowLeft, FaStar } from 'react-icons/fa';

const VideoCall: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const userName = localStorage.getItem('name') || 'User';

  const roomName = `skillverse${roomId}`;
  const iframeSrc = `https://meet.jit.si/${roomName}#userInfo.displayName="${encodeURIComponent(userName)}"&config.prejoinPageEnabled=false&config.enableWelcomePage=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.disableModeratorIndicator=true&config.enableUserRolesBasedOnToken=false&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.MOBILE_APP_PROMO=false`;

  return (
    <div className="h-screen bg-[#0a0d1a] flex flex-col">
      {/* Top Bar */}
      <div className="bg-[#141830] border-b border-white/8 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/mysessions')}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg"
          >
            <FaArrowLeft />
          </button>
          <div>
            <p className="text-white font-bold text-sm">Live Session</p>
            <p className="text-slate-400 text-xs">Room: {roomId}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-green-400 text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live
          </span>
          <button
            onClick={() => navigate('/feedback', { state: { roomId } })}
            className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-yellow-500/30 transition-all"
          >
            <FaStar className="text-xs" /> Rate Session
          </button>
        </div>
      </div>

      {/* Direct iframe — no API, no moderator issue */}
      <iframe
        src={iframeSrc}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        className="flex-1 w-full border-0"
        title="Skillverse Video Call"
      />
    </div>
  );
};

export default VideoCall;