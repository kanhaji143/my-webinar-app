'use client';

import React, { useState, use, Suspense, useRef, useEffect } from 'react';
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
  Settings,
  Plus,
  CheckCircle,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { DeviceSettingsModal } from '@/components/DeviceSettingsModal';
import { useWebinarStore, WebinarStatus } from '@/lib/webinarStore';
import { useLocalMedia } from '@/hooks/useLocalMedia';
import { useInteractiveStore } from '@/lib/interactiveStore';

interface HostPageProps {
  params: Promise<{ id: string }>;
}

function WebinarHostContent({ params }: HostPageProps) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const { t } = useLanguage();
  const { getWebinar, updateWebinarStatus } = useWebinarStore();

  const webinar = getWebinar(sessionId);

  // Local media hook (API-Free native browser media)
  const {
    mediaStream,
    screenStream,
    isCameraOn,
    isMicOn,
    isScreenSharing,
    audioDevices,
    videoDevices,
    selectedAudioDeviceId,
    selectedVideoDeviceId,
    permissionError,
    hardwareError,
    audioLevel,
    toggleCamera,
    toggleMic,
    startScreenShare,
    stopScreenShare,
    switchVideoDevice,
    switchAudioDevice,
  } = useLocalMedia();

  // Interactive store hook (local chat, polls, Q&A, participants)
  const {
    messages,
    polls,
    questions,
    simulatedParticipants,
    addChatMessage,
    createPoll,
    endPoll,
    answerQuestion,
  } = useInteractiveStore(sessionId);

  const [activeSideTab, setActiveSideTab] = useState<'chat' | 'participants' | 'polls' | 'qa' | 'recording'>('chat');
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);

  // Chat local input
  const [chatInput, setChatInput] = useState('');

  // Poll creation state
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOpt1, setPollOpt1] = useState('');
  const [pollOpt2, setPollOpt2] = useState('');
  const [pollError, setPollError] = useState('');

  // Q&A answer input state
  const [answeringQId, setAnsweringQId] = useState<string | null>(null);
  const [answerInputText, setAnswerInputText] = useState('');

  // Video element references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);

  // Fallbacks
  const status: WebinarStatus = webinar?.status || 'SCHEDULED';
  const title = webinar?.title || sessionId.replace(/-/g, ' ').toUpperCase();
  const hostName = webinar?.hostName || 'Dr. Vikram Malhotra';
  const duration = webinar?.duration || 60;
  const timezone = webinar?.timezone || 'IST (UTC+5:30)';
  const registrations = webinar?.registrations || [];

  // Total visible attendee count: registrations + simulated
  const totalAttendeeCount = registrations.length + simulatedParticipants.length;

  // Attach media stream to video element whenever camera stream updates
  useEffect(() => {
    if (videoRef.current) {
      if (mediaStream && isCameraOn) {
        videoRef.current.srcObject = mediaStream;
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [mediaStream, isCameraOn]);

  // Attach screen stream to screen video element
  useEffect(() => {
    if (screenVideoRef.current) {
      if (screenStream && isScreenSharing) {
        screenVideoRef.current.srcObject = screenStream;
      } else {
        screenVideoRef.current.srcObject = null;
      }
    }
  }, [screenStream, isScreenSharing]);

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
    addChatMessage(hostName, 'host', chatInput.trim());
    setChatInput('');
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    setPollError('');
    if (!pollQuestion.trim()) {
      setPollError('Please enter a poll question.');
      return;
    }
    if (!pollOpt1.trim() || !pollOpt2.trim()) {
      setPollError('At least 2 options are required.');
      return;
    }

    createPoll(pollQuestion, [pollOpt1, pollOpt2]);
    setPollQuestion('');
    setPollOpt1('');
    setPollOpt2('');
    setIsCreatingPoll(false);
  };

  const handleAnswerSubmit = (qId: string) => {
    if (!answerInputText.trim()) return;
    answerQuestion(qId, answerInputText);
    setAnsweringQId(null);
    setAnswerInputText('');
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
            {totalAttendeeCount} Attendees ({registrations.length} Local + {simulatedParticipants.length} Sim)
          </Badge>

          <button
            type="button"
            onClick={() => setIsDeviceModalOpen(true)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
            data-testid="btn-device-settings"
            title={t.deviceSettingsTitle}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">Hardware</span>
          </button>

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

      {/* Media or Permission Alert */}
      {(permissionError || hardwareError) && (
        <div
          className="bg-amber-950/80 border-b border-amber-800 text-amber-200 text-xs px-4 py-2 flex items-center justify-between gap-2"
          data-testid="media-error-alert"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{permissionError || hardwareError}</span>
          </div>
        </div>
      )}

      {/* Main Studio Body: Stage + Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Stage Area */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 bg-slate-950/90 justify-between gap-4">
          <div className="relative flex-1 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden min-h-[340px] sm:min-h-[420px] shadow-2xl">
            {/* Screen Share View Active */}
            {isScreenSharing && (
              <div className="absolute inset-0 bg-black flex items-center justify-center z-10" data-testid="screen-share-stage">
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                  data-testid="screen-video-element"
                />
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <Badge variant="warning" size="sm" className="bg-indigo-900/90 border border-indigo-500 text-white font-semibold">
                    <ScreenShare className="w-3.5 h-3.5 mr-1" />
                    {t.screenShareActive} [LOCAL]
                  </Badge>
                </div>
              </div>
            )}

            {/* Camera View (Full stage if not screen sharing, or Picture-in-Picture if screen sharing) */}
            {isCameraOn ? (
              <div
                className={
                  isScreenSharing
                    ? 'absolute bottom-4 right-4 w-44 h-28 sm:w-56 sm:h-36 rounded-xl overflow-hidden border-2 border-indigo-500 shadow-2xl z-30 bg-slate-950'
                    : 'absolute inset-0 flex items-center justify-center bg-black'
                }
                data-testid="camera-video-container"
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  data-testid="local-video-preview"
                />
                <div className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-white">
                  {hostName} (Local)
                </div>
              </div>
            ) : null}

            {/* Placeholder Standby Backdrop when Camera is Off and Not Screen Sharing */}
            {!isCameraOn && !isScreenSharing && (
              <div className="text-center p-6 space-y-3 z-10" data-testid="camera-standby-placeholder">
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
                    {!isCameraOn
                      ? 'Camera is currently off. Click the camera icon below to activate your browser webcam.'
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
            )}

            {/* Overlaid Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2 z-20 pointer-events-none">
              <span className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-xs font-semibold text-white border border-slate-800">
                {t.roleHost}: {hostName}
              </span>
              {!isMicOn ? (
                <span className="px-2 py-1 rounded-md bg-rose-950/80 text-rose-300 text-xs font-semibold border border-rose-800">
                  MUTED
                </span>
              ) : (
                <span className="px-2 py-1 rounded-md bg-emerald-950/80 text-emerald-300 text-xs font-semibold border border-emerald-800 flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-emerald-400" />
                  LIVE MIC ({audioLevel}%)
                </span>
              )}
            </div>
          </div>

          {/* Bottom Floating Control Bar */}
          <div
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl max-w-2xl mx-auto w-full"
            data-testid="host-controls"
          >
            {/* Toggle Mic */}
            <button
              type="button"
              onClick={toggleMic}
              className={`p-3 rounded-xl transition-all ${
                !isMicOn
                  ? 'bg-rose-600 text-white hover:bg-rose-500'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
              title={!isMicOn ? t.unmute : t.mute}
              data-testid="btn-toggle-mic"
            >
              {!isMicOn ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Toggle Camera */}
            <button
              type="button"
              onClick={toggleCamera}
              className={`p-3 rounded-xl transition-all ${
                !isCameraOn
                  ? 'bg-rose-600 text-white hover:bg-rose-500'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
              title={!isCameraOn ? t.cameraOn : t.cameraOff}
              data-testid="btn-toggle-camera"
            >
              {!isCameraOn ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            {/* Toggle Screen Share */}
            <button
              type="button"
              onClick={isScreenSharing ? stopScreenShare : startScreenShare}
              className={`p-3 rounded-xl transition-all ${
                isScreenSharing
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={isScreenSharing ? t.stopScreenShare : t.startScreenShare}
              data-testid="btn-toggle-share"
            >
              <ScreenShare className="w-5 h-5" />
            </button>

            {/* Device Settings Shortcut */}
            <button
              type="button"
              onClick={() => setIsDeviceModalOpen(true)}
              className="p-3 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all"
              title={t.deviceSettingsTitle}
              data-testid="btn-open-settings"
            >
              <Settings className="w-5 h-5" />
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
                <span>{t.publishDraft}</span>
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
                <span>{t.endBroadcast}</span>
              </Button>
            )}

            {status === 'ENDED' && (
              <span className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold" data-testid="badge-broadcast-concluded">
                Broadcast Concluded
              </span>
            )}
          </div>
        </div>

        {/* Right Sidebar: Chat / Participants / Polls / Q&A / Recording Tabs */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/60 flex flex-col h-96 lg:h-auto">
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
              <span>{t.participants} ({totalAttendeeCount})</span>
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
              <span>{t.polls} ({polls.length})</span>
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
              <span>{t.qa} ({questions.length})</span>
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

          {/* 1. Chat Tab Content */}
          {activeSideTab === 'chat' && (
            <div className="flex-1 flex flex-col justify-between p-3 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs" data-testid="chat-message-list">
                <div className="p-2 rounded bg-amber-950/40 border border-amber-800/30 text-amber-300 text-[11px]">
                  <strong>[DEMO CHAT]:</strong> Messages are stored in local client state.
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

          {/* 2. Participants Tab Content */}
          {activeSideTab === 'participants' && (
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs" data-testid="participants-list">
              {/* Host Entry */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-indigo-900/40">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                    H
                  </div>
                  <div>
                    <p className="font-medium text-white">{hostName}</p>
                    <p className="text-[10px] text-indigo-400">Broadcaster & Host</p>
                  </div>
                </div>
                <Badge variant="primary" size="sm">{t.roleHost}</Badge>
              </div>

              {/* Local Registered Attendees */}
              <div className="pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Local Registrations ({registrations.length})
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
                    <Badge variant="outline" size="sm" className="text-emerald-400 border-emerald-900/40">Registered</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-2 text-slate-500 text-xs">
                  No local attendees registered yet.
                </div>
              )}

              {/* Controlled Simulated Audience */}
              <div className="pt-3 text-[10px] font-semibold uppercase tracking-wider text-amber-400/80 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Simulated Audience ({simulatedParticipants.length})</span>
              </div>
              {simulatedParticipants.map((sim) => (
                <div key={sim.id} className="flex items-center justify-between p-2 rounded bg-slate-950/30 border border-amber-950/30">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">
                      {sim.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-400">{sim.name}</p>
                      <p className="text-[9px] text-slate-600 font-mono">Joined {sim.joinedAt}</p>
                    </div>
                  </div>
                  <Badge variant="warning" size="sm" className="text-[9px]">
                    [SIMULATED]
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* 3. Polls Tab Content */}
          {activeSideTab === 'polls' && (
            <div className="flex-1 flex flex-col p-3 overflow-y-auto space-y-3 text-xs" data-testid="panel-polls">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-teal-400" />
                  {t.polls}
                </span>
                {!isCreatingPoll && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingPoll(true)}
                    className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1"
                    data-testid="btn-create-poll-tab"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create Poll</span>
                  </button>
                )}
              </div>

              {/* Poll Creation Form */}
              {isCreatingPoll && (
                <form onSubmit={handleCreatePoll} className="p-3 rounded-xl bg-slate-950 border border-indigo-900/60 space-y-2.5" data-testid="form-create-poll">
                  <h4 className="font-bold text-white text-xs">{t.createPollTitle}</h4>
                  {pollError && (
                    <div className="text-[11px] text-rose-400 bg-rose-950/40 p-1.5 rounded border border-rose-900/40">
                      {pollError}
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                      Question
                    </label>
                    <input
                      type="text"
                      value={pollQuestion}
                      onChange={(e) => setPollQuestion(e.target.value)}
                      placeholder={t.pollQuestionPlaceholder}
                      className="w-full rounded bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      data-testid="input-poll-question"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                      Option A
                    </label>
                    <input
                      type="text"
                      value={pollOpt1}
                      onChange={(e) => setPollOpt1(e.target.value)}
                      placeholder="Option 1"
                      className="w-full rounded bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      data-testid="input-poll-opt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                      Option B
                    </label>
                    <input
                      type="text"
                      value={pollOpt2}
                      onChange={(e) => setPollOpt2(e.target.value)}
                      placeholder="Option 2"
                      className="w-full rounded bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      data-testid="input-poll-opt-2"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button variant="primary" size="sm" type="submit" data-testid="btn-launch-poll">
                      {t.pollCreateSubmit}
                    </Button>
                    <Button variant="outline" size="sm" type="button" onClick={() => setIsCreatingPoll(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {/* List of Active & Past Polls */}
              {polls.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No polls created yet. Click &quot;Create Poll&quot; to survey your live audience.
                </div>
              ) : (
                polls.map((poll) => (
                  <div key={poll.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5" data-testid={`poll-item-${poll.id}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-white text-xs">{poll.question}</p>
                      <Badge variant={poll.isActive ? 'primary' : 'outline'} size="sm">
                        {poll.isActive ? t.pollActiveBadge : t.pollEndedBadge}
                      </Badge>
                    </div>

                    <div className="space-y-1.5">
                      {poll.options.map((opt) => {
                        const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                        return (
                          <div key={opt.id} className="space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-300">
                              <span>{opt.text}</span>
                              <span className="font-mono">{opt.votes} ({pct}%)</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-teal-500 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px] text-slate-400">
                      <span>Total Votes: {poll.totalVotes}</span>
                      {poll.isActive && (
                        <button
                          type="button"
                          onClick={() => endPoll(poll.id)}
                          className="text-rose-400 hover:text-rose-300 font-semibold"
                          data-testid="btn-end-poll"
                        >
                          {t.pollEndAction}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 4. Q&A Tab Content */}
          {activeSideTab === 'qa' && (
            <div className="flex-1 flex flex-col p-3 overflow-y-auto space-y-3 text-xs" data-testid="panel-qa">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  {t.qa} Moderation
                </span>
                <Badge variant="outline" size="sm">{questions.length} Questions</Badge>
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No audience questions submitted yet.
                </div>
              ) : (
                questions.map((q) => (
                  <div key={q.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2" data-testid={`qa-item-${q.id}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-medium">{q.author}</span>
                        <p className="text-xs text-white font-medium">{q.question}</p>
                      </div>
                      <Badge variant={q.isAnswered ? 'default' : 'primary'} size="sm">
                        {q.upvotes} ▲
                      </Badge>
                    </div>

                    {q.isAnswered ? (
                      <div className="p-2 rounded bg-emerald-950/40 border border-emerald-900/40 text-[11px] text-emerald-300 flex items-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[10px] text-emerald-200">Answered by Host:</strong>
                          <span>{q.answerText || 'Answered live on stream.'}</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {answeringQId === q.id ? (
                          <div className="space-y-2 pt-1">
                            <textarea
                              value={answerInputText}
                              onChange={(e) => setAnswerInputText(e.target.value)}
                              placeholder="Provide textual answer or type 'Answered on stream'..."
                              className="w-full rounded bg-slate-900 border border-slate-800 p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                              rows={2}
                              data-testid="textarea-answer-qa"
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAnswerSubmit(q.id)}
                                data-testid="btn-submit-answer-qa"
                              >
                                Submit Answer
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setAnsweringQId(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setAnsweringQId(q.id);
                              setAnswerInputText('');
                            }}
                            className="text-indigo-400 hover:text-indigo-300 font-semibold text-[11px] flex items-center gap-1"
                            data-testid="btn-answer-qa"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>{t.markAnswered}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 5. Recording Tab Content */}
          {activeSideTab === 'recording' && (
            <div className="flex-1 p-4 text-center space-y-3" data-testid="panel-recording-placeholder">
              <Disc className="w-8 h-8 text-rose-400 mx-auto" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cloud Recording [DEMO]</h4>
              <p className="text-xs text-slate-400">
                Automated session recording and cloud archive delivery (Scheduled for Phase 8).
              </p>
              <Badge variant="outline" size="sm">Scheduled for Phase 8</Badge>
            </div>
          )}
        </div>
      </div>

      {/* Device Selection Modal */}
      <DeviceSettingsModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        audioDevices={audioDevices}
        videoDevices={videoDevices}
        selectedAudioDeviceId={selectedAudioDeviceId}
        selectedVideoDeviceId={selectedVideoDeviceId}
        onSelectAudioDevice={switchAudioDevice}
        onSelectVideoDevice={switchVideoDevice}
        audioLevel={audioLevel}
        permissionError={permissionError}
        hardwareError={hardwareError}
      />
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
