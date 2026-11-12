'use client';

import React, { useState, use, Suspense } from 'react';
import Link from 'next/link';
import {
  Volume2,
  VolumeX,
  Hand,
  MessageSquare,
  HelpCircle,
  BarChart2,
  Radio,
  Users,
  Send,
  LogOut,
  Clock,
  AlertCircle,
  CheckCircle,
  ThumbsUp,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { useWebinarStore, WebinarStatus } from '@/lib/webinarStore';
import { useInteractiveStore } from '@/lib/interactiveStore';

interface ViewerPageProps {
  params: Promise<{ id: string }>;
}

function WebinarViewerContent({ params }: ViewerPageProps) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const { t } = useLanguage();
  const { getWebinar } = useWebinarStore();

  const webinar = getWebinar(sessionId);

  // Connect to interactive store for shared local chat, polls, Q&A
  const {
    messages,
    polls,
    questions,
    simulatedParticipants,
    addChatMessage,
    voteInPoll,
    askQuestion,
    upvoteQuestion,
  } = useInteractiveStore(sessionId);

  const [isMuted, setIsMuted] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'qa' | 'polls'>('chat');

  // Input states
  const [chatInput, setChatInput] = useState('');
  const [qaInput, setQaInput] = useState('');

  // Dynamic fallback
  const status: WebinarStatus = webinar?.status || 'SCHEDULED';
  const title = webinar?.title || sessionId.replace(/-/g, ' ').toUpperCase();
  const hostName = webinar?.hostName || 'Dr. Vikram Malhotra';
  const registrations = webinar?.registrations || [];
  const totalAttendeeCount = registrations.length + simulatedParticipants.length;

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    addChatMessage('You (Viewer)', 'viewer', chatInput.trim());
    setChatInput('');
  };

  const handleSendQa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaInput.trim()) return;
    askQuestion('Viewer', qaInput.trim());
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
            {totalAttendeeCount} Watching [Demo]
          </Badge>

          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-1.5" data-testid="btn-leave-viewer">
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Auditorium Body: Stage + Audience Tabs */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Live Stage Viewing Area */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 bg-slate-950/90 justify-between gap-4">
          <div className="relative flex-1 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden min-h-[340px] sm:min-h-[420px] shadow-2xl">
            {status === 'LIVE' ? (
              /* Live Broadcast Stream Receiver [DEMO] */
              <div className="text-center p-6 space-y-4 z-10" data-testid="viewer-stage-live">
                <div className="w-24 h-24 rounded-full bg-linear-to-tr from-rose-700 to-indigo-600 border-2 border-rose-400/40 flex items-center justify-center mx-auto text-white shadow-2xl shadow-rose-900/40 animate-pulse">
                  <Radio className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">Live Stream Broadcast</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    Presenter: <strong className="text-slate-200">{hostName}</strong> is presenting live on stage.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2">
                  <Badge variant="destructive" size="sm" className="gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE BROADCAST [DEMO STREAM]
                  </Badge>
                  <Badge variant="outline" size="sm" className="text-emerald-400 border-emerald-800">
                    HD 1080p
                  </Badge>
                </div>
              </div>
            ) : status === 'SCHEDULED' ? (
              /* Standby Mode */
              <div className="text-center p-6 space-y-4 max-w-md mx-auto z-10" data-testid="viewer-stage-scheduled">
                <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                  <Clock className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{t.waitingForHost}</h3>
                  <p className="text-xs text-slate-400 mt-1">{t.waitingForHostSubtitle}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
                  Presenter: <strong className="text-indigo-400">{hostName}</strong>
                </div>
              </div>
            ) : (
              /* Ended Mode */
              <div className="text-center p-6 space-y-4 max-w-md mx-auto z-10" data-testid="viewer-stage-ended">
                <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                  <AlertCircle className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{t.sessionConcluded}</h3>
                  <p className="text-xs text-slate-400 mt-1">{t.sessionConcludedSubtitle}</p>
                </div>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            )}

            {/* Stage Overlay HUD */}
            <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
              <span className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-xs font-semibold text-white border border-slate-800">
                Stage: {title}
              </span>
              {status === 'LIVE' && (
                <span className="px-2 py-0.5 rounded-md bg-rose-600/80 text-white text-[10px] font-bold tracking-wider">
                  LIVE
                </span>
              )}
            </div>
          </div>

          {/* Bottom Audience Control Strip */}
          <div
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl max-w-xl mx-auto w-full"
            data-testid="viewer-controls"
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2.5 rounded-xl transition-all ${
                  isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title={isMuted ? t.unmute : t.mute}
                data-testid="btn-viewer-audio"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setHandRaised(!handRaised)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  handRaised
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                data-testid="btn-raise-hand"
              >
                <Hand className="w-4 h-4" />
                <span>{handRaised ? 'Hand Raised' : 'Raise Hand'}</span>
              </button>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-mono block">Audience Mode</span>
              <span className="text-[10px] text-teal-400 font-semibold">[DEMO RECEIVER]</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Chat / Q&A / Polls */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/60 flex flex-col h-96 lg:h-auto">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
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
              onClick={() => setActiveTab('polls')}
              className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'polls'
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
              data-testid="tab-viewer-polls"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>{t.polls} ({polls.filter((p) => p.isActive).length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('qa')}
              className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'qa'
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
              data-testid="tab-viewer-qa"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t.qa} ({questions.length})</span>
            </button>
          </div>

          {/* Chat Panel */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col justify-between p-3 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs" data-testid="chat-message-list">
                <div className="p-2 rounded bg-amber-950/40 border border-amber-800/30 text-amber-300 text-[11px]">
                  <strong>[DEMO CHAT]:</strong> Audience messages are stored in local client state.
                </div>
                {messages.map((m) => (
                  <div key={m.id} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className={`font-semibold ${m.role === 'host' ? 'text-indigo-400' : 'text-slate-300'}`}>
                        {m.sender} {m.role === 'host' && `(${t.roleHost})`}
                      </span>
                      <span>{m.timestamp}</span>
                    </div>
                    <p className="text-slate-200">{m.message}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Chat with presenter and audience..."
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
          )}

          {/* Polls Panel */}
          {activeTab === 'polls' && (
            <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs" data-testid="panel-viewer-polls">
              <div className="p-2 rounded bg-teal-950/40 border border-teal-800/30 text-teal-300 text-[11px]">
                <strong>[LIVE POLLS]:</strong> Cast your vote on active presenter polls below.
              </div>

              {polls.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No polls active at this moment. The host will launch polls during the broadcast.
                </div>
              ) : (
                polls.map((poll) => (
                  <div key={poll.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3" data-testid={`viewer-poll-${poll.id}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-white text-xs">{poll.question}</p>
                      <Badge variant={poll.isActive ? 'primary' : 'outline'} size="sm">
                        {poll.isActive ? t.pollActiveBadge : t.pollEndedBadge}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {poll.options.map((opt) => {
                        const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                        const hasVotedThis = poll.userVotedOptionId === opt.id;

                        return (
                          <div key={opt.id} className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-300">{opt.text}</span>
                              <div className="flex items-center gap-1.5">
                                {hasVotedThis && (
                                  <span className="text-[10px] text-teal-400 font-semibold">[VOTED]</span>
                                )}
                                {poll.isActive && !poll.userVotedOptionId && (
                                  <button
                                    type="button"
                                    onClick={() => voteInPoll(poll.id, opt.id)}
                                    className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold"
                                    data-testid={`btn-vote-opt-${opt.id}`}
                                  >
                                    Vote
                                  </button>
                                )}
                                <span className="font-mono text-slate-400">{opt.votes} ({pct}%)</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  hasVotedThis ? 'bg-teal-400' : 'bg-indigo-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                      Total Audience Votes: {poll.totalVotes}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Q&A Panel */}
          {activeTab === 'qa' && (
            <div className="flex-1 flex flex-col justify-between p-3 overflow-hidden" data-testid="panel-viewer-qa">
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs" data-testid="viewer-qa-list">
                <div className="p-2 rounded bg-indigo-950/40 border border-indigo-800/30 text-indigo-300 text-[11px]">
                  <strong>[LIVE Q&A]:</strong> Ask questions and upvote others for the host to answer live.
                </div>

                {questions.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No questions submitted yet. Be the first to ask!
                  </div>
                ) : (
                  questions.map((q) => (
                    <div key={q.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block">{q.author}</span>
                          <p className="text-white text-xs font-medium">{q.question}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => upvoteQuestion(q.id)}
                          className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-all ${
                            q.userHasUpvoted
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                          data-testid={`btn-upvote-${q.id}`}
                          title="Upvote Question"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{q.upvotes}</span>
                        </button>
                      </div>

                      {q.isAnswered && (
                        <div className="p-2 rounded bg-emerald-950/40 border border-emerald-900/40 text-[11px] text-emerald-300 flex items-start gap-1.5 mt-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block text-[10px] text-emerald-200">Host Answer:</strong>
                            <span>{q.answerText || 'Answered live on broadcast.'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendQa} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={qaInput}
                  onChange={(e) => setQaInput(e.target.value)}
                  placeholder={t.askQuestionPlaceholder}
                  className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  data-testid="input-viewer-qa"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold"
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
