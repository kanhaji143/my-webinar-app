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
  HelpCircle,
  BarChart2,
  Disc,
  Play,
  Square,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { useWebinarStore, WebinarStatus } from '@/lib/webinarStore';

interface HostPageProps {
  params: Promise<{ id: string }>;
}

function WebinarHostContent({ params }: HostPageProps) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const { t } = useLanguage();
  const { getWebinar, updateWebinarStatus } = useWebinarStore();

  const webinar = getWebinar(sessionId);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState<'chat' | 'participants' | 'polls' | 'qa' | 'recording'>('chat');
  const [transitionError, setTransitionError] = useState<string | null>(null);

  const [messages, setMessages] = useState([
    { sender: 'Audience member #104', text: 'Audio is coming through loud and clear!', time: '12:01' },
    { sender: 'Audience member #218', text: 'Excited for the live demo section.', time: '12:02' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Fallbacks
  const status: WebinarStatus = webinar?.status || 'SCHEDULED';
  const title = webinar?.title || sessionId.replace(/-/g, ' ').toUpperCase();
  const hostName = webinar?.hostName || 'Dr. Vikram Malhotra';
  const duration = webinar?.duration || 60;
  const timezone = webinar?.timezone || 'IST (UTC+5:30)';
  const registrations = webinar?.registrations || [];
  const actualParticipantCount = Math.max(registrations.length, status === 'LIVE' ? 142 : 12);

  const handleStartBroadcast = () => {
    setTransitionError(null);
    const res = updateWebinarStatus(sessionId, 'LIVE');
    if (!res.success) {
      setTransitionError(res.error || 'Failed to start broadcast.');
    }
  };

  const handleEndBroadcast = () => {
    setTransitionError(null);
    const res = updateWebinarStatus(sessionId, 'ENDED');
    if (!res.success) {
      setTransitionError(res.error || 'Failed to end broadcast.');
    }
  };

  const handlePublishDraft = () => {
    setTransitionError(null);
    const res = updateWebinarStatus(sessionId, 'SCHEDULED');
    if (!res.success) {
      setTransitionError(res.error || 'Failed to publish draft.');
    }
  };

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
          <Badge
            variant={
              status === 'LIVE'
                ? 'destructive'
                : status === 'SCHEDULED'
                ? 'primary'
                : status === 'DRAFT'
                ? 'outline'
                : 'default'
            }
            size="sm"
            className={`gap-1 ${status === 'LIVE' ? 'animate-pulse' : ''}`}
            data-testid="host-status-badge"
          >
            <Radio className="w-3 h-3" />
            {status === 'LIVE'
              ? 'LIVE BROADCAST [DEMO]'
              : status === 'SCHEDULED'
              ? 'STANDBY / SCHEDULED'
              : status === 'DRAFT'
              ? 'DRAFT MODE'
              : 'BROADCAST ENDED'}
          </Badge>

          <div className="flex flex-col">
            <h1 className="text-base font-bold text-white tracking-tight" data-testid="host-room-title">
              {title}
            </h1>
            <span className="text-[11px] text-slate-400 font-mono">
              ID: {sessionId} • Presenter: {hostName} • {duration}m ({timezone})
            </span>
          </div>

          <Badge variant="primary" size="sm" className="hidden sm:inline-flex">
            {t.roleHost}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" size="sm" className="hidden sm:inline-flex" data-testid="badge-participant-count">
            <Users className="w-3 h-3 mr-1 text-indigo-400" />
            {actualParticipantCount} Attendees (Local State)
          </Badge>

          <Link href="/dashboard">
            <Button variant="outline" size="sm" data-testid="btn-exit-studio">
              Exit Studio
            </Button>
          </Link>
        </div>
      </div>

      {/* Transition Error Alert */}
      {transitionError && (
        <div
          className="bg-rose-950/80 border-b border-rose-800 text-rose-200 text-xs px-4 py-2 flex items-center justify-between gap-2"
          data-testid="lifecycle-error-alert"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{transitionError}</span>
          </div>
          <button
            onClick={() => setTransitionError(null)}
            className="text-slate-400 hover:text-white text-xs px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Studio Body: Stage + Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Stage Area */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 bg-slate-950/90 justify-between gap-4">
          <div className="relative flex-1 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden min-h-[340px] sm:min-h-[420px] shadow-2xl">
            {/* Stage Backdrop / Presenter View */}
            <div className="text-center p-6 space-y-3 z-10">
              <div
                className={`w-24 h-24 rounded-full border-2 flex items-center justify-center mx-auto text-white shadow-xl ${
                  status === 'LIVE'
                    ? 'bg-linear-to-tr from-rose-700 to-indigo-600 border-rose-400/40 shadow-rose-900/30'
                    : 'bg-linear-to-tr from-indigo-700 to-indigo-500 border-indigo-400/40 shadow-indigo-600/20'
                }`}
              >
                <Radio className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  {status === 'LIVE'
                    ? 'Main Presenter Stage (LIVE [DEMO])'
                    : status === 'SCHEDULED'
                    ? 'Presenter Studio (Standby / Preview Mode)'
                    : status === 'DRAFT'
                    ? 'Draft Preview Stage'
                    : 'Broadcast Session Concluded'}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  {isVideoOff
                    ? 'Camera is currently turned off.'
                    : status === 'LIVE'
                    ? 'Presenter video stream actively transmitting to audience stage [DEMO].'
                    : 'Hardware preview active. Click "Go Live" below to open stage to viewers.'}
                </p>
              </div>

              <div className="inline-flex items-center gap-2">
                <Badge variant={status === 'LIVE' ? 'destructive' : 'warning'} size="sm">
                  {status === 'LIVE' ? '● BROADCASTING [DEMO]' : '[DEMO STAGE] Local Hardware Loopback'}
                </Badge>
              </div>
            </div>

            {/* Overlaid Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
              <span className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-xs font-semibold text-white border border-slate-800">
                {t.roleHost}: {hostName}
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
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl max-w-2xl mx-auto w-full"
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

            {/* Lifecycle State Controls */}
            {status === 'DRAFT' && (
              <Button
                variant="primary"
                size="md"
                onClick={handlePublishDraft}
                className="gap-1.5"
                data-testid="btn-host-publish"
              >
                <span>Publish Draft</span>
              </Button>
            )}

            {status === 'SCHEDULED' && (
              <Button
                variant="primary"
                size="md"
                onClick={handleStartBroadcast}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 border-emerald-500/30"
                data-testid="btn-toggle-broadcast"
              >
                <Play className="w-4 h-4" />
                <span>Go Live (Start Broadcast) [DEMO]</span>
              </Button>
            )}

            {status === 'LIVE' && (
              <Button
                variant="danger"
                size="md"
                onClick={handleEndBroadcast}
                className="gap-1.5"
                data-testid="btn-toggle-broadcast"
              >
                <Square className="w-4 h-4" />
                <span>End Broadcast</span>
              </Button>
            )}

            {status === 'ENDED' && (
              <span className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold">
                Broadcast Concluded
              </span>
            )}
          </div>
        </div>

        {/* Right Sidebar: Chat / Participants / Polls / Q&A / Recording Tabs */}
        <div className="w-full lg:w-84 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/60 flex flex-col h-80 lg:h-auto">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-slate-800 overflow-x-auto text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setActiveSideTab('chat')}
              className={`px-3 py-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${
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
              className={`px-3 py-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${
                activeSideTab === 'participants'
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
              data-testid="tab-host-participants"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Attendees ({actualParticipantCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSideTab('qa')}
              className={`px-3 py-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${
                activeSideTab === 'qa'
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
              data-testid="tab-host-qa"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Q&A</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSideTab('polls')}
              className={`px-3 py-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${
                activeSideTab === 'polls'
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
              data-testid="tab-host-polls"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Polls</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSideTab('recording')}
              className={`px-3 py-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${
                activeSideTab === 'recording'
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
              data-testid="tab-host-recording"
            >
              <Disc className="w-3.5 h-3.5" />
              <span>Record</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeSideTab === 'chat' && (
            <div className="flex-1 flex flex-col justify-between p-3 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs" data-testid="chat-message-list">
                <div className="p-2 rounded bg-amber-950/40 border border-amber-800/30 text-amber-300 text-[11px]">
                  <strong>[DEMO CHAT]:</strong> Messages are simulated locally without third-party sockets.
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
          )}

          {activeSideTab === 'participants' && (
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs" data-testid="participants-list">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                    H
                  </div>
                  <div>
                    <p className="font-medium text-white">{hostName} (Host)</p>
                    <p className="text-[10px] text-indigo-400">Broadcaster</p>
                  </div>
                </div>
                <Badge variant="primary" size="sm">HOST</Badge>
              </div>

              {registrations.length > 0 ? (
                registrations.map((reg, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-950/50 border border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300">
                        {reg.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-300">{reg.name}</p>
                        <p className="text-[10px] text-slate-500">{reg.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400">Registered</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No registered attendees yet in local store.
                </div>
              )}
            </div>
          )}

          {activeSideTab === 'qa' && (
            <div className="flex-1 p-4 text-center space-y-3" data-testid="panel-qa-placeholder">
              <HelpCircle className="w-8 h-8 text-indigo-400 mx-auto" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Moderated Q&A [DEMO]</h4>
              <p className="text-xs text-slate-400">
                Viewer questions will appear here with upvote counts for live answer management (Phase 3).
              </p>
              <Badge variant="outline" size="sm">Coming in Phase 3</Badge>
            </div>
          )}

          {activeSideTab === 'polls' && (
            <div className="flex-1 p-4 text-center space-y-3" data-testid="panel-polls-placeholder">
              <BarChart2 className="w-8 h-8 text-teal-400 mx-auto" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Audience Polls [DEMO]</h4>
              <p className="text-xs text-slate-400">
                Launch interactive polls and collect immediate response statistics (Phase 3).
              </p>
              <Badge variant="outline" size="sm">Coming in Phase 3</Badge>
            </div>
          )}

          {activeSideTab === 'recording' && (
            <div className="flex-1 p-4 text-center space-y-3" data-testid="panel-recording-placeholder">
              <Disc className="w-8 h-8 text-rose-400 mx-auto" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cloud Recording [DEMO]</h4>
              <p className="text-xs text-slate-400">
                Automated session recording and cloud archive delivery (Scheduled for Phase 7).
              </p>
              <Badge variant="outline" size="sm">Scheduled for Phase 7</Badge>
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
