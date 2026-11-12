'use client';

import React, { useState, use, Suspense } from 'react';
import Link from 'next/link';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  PhoneOff,
  Users,
  Volume2,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';

interface MeetingPageProps {
  params: Promise<{ id: string }>;
}

interface Participant {
  id: string;
  name: string;
  role: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeaking: boolean;
  color: string;
}

const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'user-1',
    name: 'You (Host)',
    role: 'Organizer',
    isMuted: false,
    isVideoOff: false,
    isSpeaking: true,
    color: 'from-teal-600 to-teal-400',
  },
  {
    id: 'user-2',
    name: 'Alex Rivera',
    role: 'Product Design',
    isMuted: false,
    isVideoOff: false,
    isSpeaking: false,
    color: 'from-blue-600 to-indigo-500',
  },
  {
    id: 'user-3',
    name: 'Priya Sharma',
    role: 'Lead Architect',
    isMuted: true,
    isVideoOff: false,
    isSpeaking: false,
    color: 'from-purple-600 to-pink-500',
  },
  {
    id: 'user-4',
    name: 'Marcus Chen',
    role: 'DevOps / QA',
    isMuted: true,
    isVideoOff: true,
    isSpeaking: false,
    color: 'from-amber-600 to-orange-500',
  },
];

function MeetingRoomContent({ params }: MeetingPageProps) {
  const resolvedParams = use(params);
  const meetingId = resolvedParams.id;
  const { t } = useLanguage();

  const [participants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showRoster, setShowRoster] = useState(false);

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-[calc(100vh-8rem)]">
      {/* Meeting Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" size="sm" className="gap-1">
            <Video className="w-3 h-3" />
            Meeting Mode
          </Badge>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight" data-testid="meeting-room-title">
              {t.meetingRoomTitle}
            </h1>
            <span className="text-xs font-mono text-slate-400">({meetingId})</span>
          </div>
          <Badge variant="outline" size="sm" className="hidden sm:inline-flex">
            Interactive Gallery
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="warning" size="sm">
            DEMO GRID
          </Badge>
          <Link href="/dashboard">
            <Button variant="danger" size="sm" className="gap-1.5" data-testid="btn-leave-meeting">
              <PhoneOff className="w-3.5 h-3.5" />
              <span>{t.leaveRoom}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 bg-slate-950/90 justify-between gap-6">
        {/* Gallery Grid (Responsive: 1 col on mobile, 2 cols on tablet/desktop) */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 max-w-6xl mx-auto w-full"
          data-testid="meeting-participants-grid"
        >
          {participants.map((p) => {
            const isSelf = p.id === 'user-1';
            const mutedState = isSelf ? isMuted : p.isMuted;
            const videoState = isSelf ? isVideoOff : p.isVideoOff;
            const speakingState = isSelf ? !isMuted : p.isSpeaking;

            return (
              <div
                key={p.id}
                className={`relative rounded-2xl bg-slate-900 border overflow-hidden flex flex-col items-center justify-center p-6 shadow-xl min-h-[220px] transition-all ${
                  speakingState
                    ? 'border-teal-500/80 ring-2 ring-teal-500/30'
                    : 'border-slate-800'
                }`}
                data-testid={`participant-tile-${p.id}`}
              >
                {/* Tile Center Avatar */}
                {videoState ? (
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto font-bold text-lg">
                      {p.name.charAt(0)}
                    </div>
                    <span className="text-xs text-slate-500">Camera Off</span>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div
                      className={`w-20 h-20 rounded-full bg-linear-to-tr ${p.color} border-2 border-white/20 flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-lg`}
                    >
                      {p.name.charAt(0)}
                    </div>
                    <p className="text-xs text-teal-400 font-medium">Video Stream Active (Demo)</p>
                  </div>
                )}

                {/* Top Right Speaking Indicator */}
                {speakingState && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-teal-950/80 border border-teal-500/60 text-teal-300 text-[10px] font-semibold flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-teal-400 animate-pulse" />
                    Speaking
                  </div>
                )}

                {/* Bottom Bar: Name & Mic status */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-sm border border-slate-800/80 text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-white truncate">{p.name}</span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">({p.role})</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {mutedState ? (
                      <MicOff className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Floating Meeting Controls */}
        <div
          className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl max-w-md mx-auto w-full"
          data-testid="meeting-controls"
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
            data-testid="btn-meeting-toggle-mic"
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
            data-testid="btn-meeting-toggle-camera"
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`p-3 rounded-xl transition-all ${
              isScreenSharing
                ? 'bg-teal-600 text-white hover:bg-teal-500'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            title={t.shareScreen}
            data-testid="btn-meeting-share"
          >
            <ScreenShare className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setShowRoster(!showRoster)}
            className="p-3 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all relative"
            title={t.participants}
            data-testid="btn-meeting-participants"
          >
            <Users className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal-600 text-white text-[9px] font-bold flex items-center justify-center">
              4
            </span>
          </button>

          <Link href="/dashboard">
            <button
              type="button"
              className="p-3 rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-all"
              title={t.leaveRoom}
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MeetingRoomPage({ params }: MeetingPageProps) {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-slate-400">Loading meeting room...</div>}>
      <MeetingRoomContent params={params} />
    </Suspense>
  );
}
