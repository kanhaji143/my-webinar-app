'use client';

import React, { useState, use, Suspense } from 'react';
import Link from 'next/link';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  Users,
  MessageSquare,
  Radio,
  Send,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';

interface HostPageProps {
  params: Promise<{ id: string }>;
}

function WebinarHostContent({ params }: HostPageProps) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const { t } = useLanguage();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(true);
  const [activeSideTab, setActiveSideTab] = useState<'chat' | 'participants'>('chat');

  const [messages, setMessages] = useState([
    { sender: 'Audience member #104', text: 'Audio is coming through loud and clear!', time: '12:01' },
    { sender: 'Audience member #218', text: 'Excited for the live demo section.', time: '12:02' },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        sender: 'Host (You)',
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatInput('');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-[calc(100vh-8rem)]">
      {/* Studio Header Bar */}
      <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Badge variant="destructive" size="sm" className="gap-1 animate-pulse">
            <Radio className="w-3 h-3" />
            {isBroadcasting ? 'BROADCASTING (DEMO)' : 'OFF-AIR'}
          </Badge>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight" data-testid="host-room-title">
              {t.hostRoomTitle}
            </h1>
            <span className="text-xs font-mono text-slate-400">({sessionId})</span>
          </div>
          <Badge variant="primary" size="sm">
            {t.roleHost}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" size="sm" className="hidden sm:inline-flex">
            <Users className="w-3 h-3 mr-1 text-indigo-400" />
            142 Attendees
          </Badge>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Exit Studio
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Studio Body: Stage + Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Stage Area */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 bg-slate-950/90 justify-between gap-4">
          <div className="relative flex-1 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden min-h-[340px] sm:min-h-[420px] shadow-2xl">
            {/* Stage Backdrop / Presenter View */}
            <div className="text-center p-6 space-y-3 z-10">
              <div className="w-24 h-24 rounded-full bg-linear-to-tr from-indigo-700 to-indigo-500 border-2 border-indigo-400/40 flex items-center justify-center mx-auto text-white shadow-xl shadow-indigo-600/20">
                <Radio className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Main Presenter Stage</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  {isVideoOff ? 'Camera is currently turned off.' : 'Presenter video feed preview active.'}
                </p>
              </div>
              <Badge variant="warning" size="sm">
                Local Hardware Loopback / Simulated Stage
              </Badge>
            </div>

            {/* Overlaid Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
              <span className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-xs font-semibold text-white border border-slate-800">
                {t.roleHost}: Presenter 1
              </span>
              {isMuted && (
                <span className="px-2 py-1 rounded-md bg-rose-950/80 text-rose-300 text-xs font-semibold border border-rose-800">
                  MUTED
                </span>
              )}
            </div>
          </div>

          {/* Bottom Floating Control Bar */}
          <div
            className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl max-w-xl mx-auto w-full"
            data-testid="host-controls"
          >
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-xl transition-all ${
                isMuted
                  ? 'bg-rose-600 text-white hover:bg-rose-500'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={isMuted ? t.unmute : t.mute}
              data-testid="btn-toggle-mic"
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-3 rounded-xl transition-all ${
                isVideoOff
                  ? 'bg-rose-600 text-white hover:bg-rose-500'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={isVideoOff ? t.cameraOn : t.cameraOff}
              data-testid="btn-toggle-camera"
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`p-3 rounded-xl transition-all ${
                isScreenSharing
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={t.shareScreen}
              data-testid="btn-toggle-share"
            >
              <ScreenShare className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setIsBroadcasting(!isBroadcasting)}
              className={`px-4 py-3 rounded-xl font-semibold text-xs transition-all ${
                isBroadcasting
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
              data-testid="btn-toggle-broadcast"
            >
              {isBroadcasting ? t.endWebinar : 'Go Live'}
            </button>
          </div>
        </div>

        {/* Right Sidebar: Chat / Participants */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/60 flex flex-col h-72 lg:h-auto">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              type="button"
              onClick={() => setActiveSideTab('chat')}
              className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeSideTab === 'chat'
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
              data-testid="tab-host-chat"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t.chat}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSideTab('participants')}
              className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeSideTab === 'participants'
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
              data-testid="tab-host-participants"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t.participants} (142)</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeSideTab === 'chat' ? (
            <div className="flex-1 flex flex-col justify-between p-3 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs" data-testid="chat-message-list">
                <div className="p-2 rounded bg-amber-950/40 border border-amber-800/30 text-amber-300 text-[11px]">
                  <strong>DEMO CHAT:</strong> Messages are simulated locally without third-party sockets.
                </div>
                {messages.map((m, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-semibold text-indigo-300">{m.sender}</span>
                      <span>{m.time}</span>
                    </div>
                    <p className="text-slate-200">{m.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Send broadcast message..."
                  className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  data-testid="input-host-chat"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                  data-testid="btn-host-send-chat"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs" data-testid="participants-list">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                    H
                  </div>
                  <div>
                    <p className="font-medium text-white">Host (You)</p>
                    <p className="text-[10px] text-indigo-400">Broadcaster</p>
                  </div>
                </div>
                <Badge variant="primary" size="sm">HOST</Badge>
              </div>

              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-950/50 border border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300">
                      U{i}
                    </div>
                    <p className="font-medium text-slate-300">Audience Member #{100 + i}</p>
                  </div>
                  <span className="text-[10px] text-slate-500">Viewer</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WebinarHostPage({ params }: HostPageProps) {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-slate-400">Loading host studio...</div>}>
      <WebinarHostContent params={params} />
    </Suspense>
  );
}
