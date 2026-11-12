'use client';

import React, { useState, use, Suspense } from 'react';
import Link from 'next/link';
import {
  Volume2,
  VolumeX,
  Hand,
  MessageSquare,
  HelpCircle,
  Radio,
  Users,
  Send,
  LogOut,
  Clock,
  User,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { useWebinarStore, WebinarStatus } from '@/lib/webinarStore';

interface ViewerPageProps {
  params: Promise<{ id: string }>;
}

function WebinarViewerContent({ params }: ViewerPageProps) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const { t } = useLanguage();
  const { getWebinar } = useWebinarStore();

  const webinar = getWebinar(sessionId);

  const [isMuted, setIsMuted] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'qa'>('chat');

  // Dynamic fallback
  const status: WebinarStatus = webinar?.status || 'SCHEDULED';
  const title = webinar?.title || sessionId.replace(/-/g, ' ').toUpperCase();
  const hostName = webinar?.hostName || 'Dr. Vikram Malhotra';
  const attendeeCount = webinar?.registrations?.length ?? 142;

  const [chatMessages, setChatMessages] = useState([
    { sender: 'Host Studio', text: 'Welcome everyone! We will commence our architecture demo now.', isHost: true },
    { sender: 'Attendee Sarah', text: 'Great slide deck. Audio is crystal clear.', isHost: false },
  ]);
  const [chatInput, setChatInput] = useState('');

  const [qaQuestions, setQaQuestions] = useState([
    { question: 'Will the recording and test report be available afterwards?', upvotes: 14 },
    { question: 'Does the architecture support mobile browsers?', upvotes: 8 },
  ]);
  const [qaInput, setQaInput] = useState('');

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: 'You (Viewer)', text: chatInput.trim(), isHost: false },
    ]);
    setChatInput('');
  };

  const handleSendQa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaInput.trim()) return;
    setQaQuestions((prev) => [
      ...prev,
      { question: qaInput.trim(), upvotes: 1 },
    ]);
    setQaInput('');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-[calc(100vh-8rem)]">
      {/* Viewer Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Badge
            variant={
              status === 'LIVE'
                ? 'destructive'
                : status === 'SCHEDULED'
                ? 'primary'
                : 'default'
            }
            size="sm"
            className={`gap-1 ${status === 'LIVE' ? 'animate-pulse' : ''}`}
            data-testid="viewer-status-badge"
          >
            <Radio className="w-3 h-3" />
            {status === 'LIVE'
              ? t.statusLive
              : status === 'SCHEDULED'
              ? t.statusScheduled
              : t.statusEnded}
          </Badge>

          <div className="flex flex-col">
            <h1 className="text-base font-bold text-white tracking-tight" data-testid="viewer-room-title">
              {title}
            </h1>
            <span className="text-[11px] text-slate-400 font-mono">
              ID: {sessionId} • Host: {hostName}
            </span>
          </div>

          <Badge variant="secondary" size="sm">
            {t.roleViewer}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" size="sm" className="hidden sm:inline-flex" data-testid="viewer-attendee-count">
            <Users className="w-3 h-3 mr-1 text-teal-400" />
            {attendeeCount} Watching [Demo]
          </Badge>

          <Link href="/dashboard">
            <Button variant="danger" size="sm" className="gap-1" data-testid="btn-leave-viewer">
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.leaveRoom}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Stage Viewport */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 bg-slate-950/90 justify-between gap-4">
          <div className="relative flex-1 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden min-h-[340px] sm:min-h-[420px] shadow-2xl">
            {/* Status-dependent stage rendering */}
            {status === 'SCHEDULED' && (
              <div className="text-center p-6 space-y-4 z-10 max-w-md mx-auto" data-testid="viewer-stage-scheduled">
                <div className="w-16 h-16 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto shadow-lg">
                  <Clock className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{t.waitingForHost}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {t.waitingForHostSubtitle}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-center gap-2">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Presenter: <strong className="text-white">{hostName}</strong></span>
                </div>
                <Badge variant="primary" size="sm">
                  Stage Standby • Connects automatically when Live
                </Badge>
              </div>
            )}

            {status === 'LIVE' && (
              <div className="text-center p-6 space-y-3 z-10" data-testid="viewer-stage-live">
                <div className="w-20 h-20 rounded-full bg-linear-to-tr from-rose-600 to-indigo-600 border border-rose-400/40 flex items-center justify-center mx-auto text-white shadow-xl animate-pulse">
                  <Radio className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{t.stageActive}</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Viewing high-definition stage presentation from {hostName}.
                  </p>
                </div>
                <Badge variant="destructive" size="sm">
                  ● LIVE BROADCAST RECEIVER [DEMO]
                </Badge>
              </div>
            )}

            {status === 'ENDED' && (
              <div className="text-center p-6 space-y-4 z-10 max-w-md mx-auto" data-testid="viewer-stage-ended">
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{t.sessionConcluded}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {t.sessionConcludedSubtitle}
                  </p>
                </div>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Return to Dashboard
                  </Button>
                </Link>
              </div>
            )}

            {/* Overlaid Badges */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-xs font-semibold text-white border border-slate-800">
                {hostName} • {status === 'LIVE' ? 'Broadcasting' : status === 'SCHEDULED' ? 'Standby' : 'Ended'}
              </span>
            </div>
          </div>

          {/* Viewer Floating Controls */}
          <div
            className="flex items-center justify-center gap-4 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl max-w-md mx-auto w-full"
            data-testid="viewer-controls"
          >
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-xl transition-all ${
                isMuted
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              data-testid="btn-viewer-audio"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => setHandRaised(!handRaised)}
              className={`px-4 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 transition-all ${
                handRaised
                  ? 'bg-amber-600 text-white hover:bg-amber-500'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              data-testid="btn-raise-hand"
            >
              <Hand className="w-4 h-4" />
              <span>{handRaised ? 'Hand Raised' : 'Raise Hand'}</span>
            </button>

            <Link href="/dashboard">
              <button
                type="button"
                className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
                title={t.leaveRoom}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>

        {/* Right Sidebar: Chat & Q&A */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/60 flex flex-col h-72 lg:h-auto">
          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'chat'
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
              data-testid="tab-viewer-chat"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t.chat}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('qa')}
              className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'qa'
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
              data-testid="tab-viewer-qa"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t.qa}</span>
            </button>
          </div>

          {/* Tab Views */}
          {activeTab === 'chat' ? (
            <div className="flex-1 flex flex-col justify-between p-3 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs" data-testid="viewer-chat-list">
                <div className="p-2 rounded bg-amber-950/40 border border-amber-800/30 text-amber-300 text-[11px]">
                  <strong>[AUDIENCE CHAT]:</strong> Participations are simulated in demo mode.
                </div>
                {chatMessages.map((m, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                    <p className="text-[10px] font-semibold text-indigo-400 mb-0.5">{m.sender}</p>
                    <p className="text-slate-200">{m.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Send a comment..."
                  className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  data-testid="input-viewer-chat"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                  data-testid="btn-viewer-send-chat"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between p-3 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs" data-testid="viewer-qa-list">
                {qaQuestions.map((q, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                    <p className="text-slate-200 font-medium">{q.question}</p>
                    <span className="text-[10px] text-teal-400 font-mono">▲ {q.upvotes} Upvotes</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendQa} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={qaInput}
                  onChange={(e) => setQaInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  data-testid="input-viewer-qa"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                  data-testid="btn-viewer-send-qa"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WebinarViewerPage({ params }: ViewerPageProps) {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-slate-400">Loading viewer stage...</div>}>
      <WebinarViewerContent params={params} />
    </Suspense>
  );
}
