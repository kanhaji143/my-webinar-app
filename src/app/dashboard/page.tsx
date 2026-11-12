'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Radio,
  Video,
  PlusCircle,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  PlayCircle,
  Info,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

interface DemoWebinar {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  attendees: number;
  status: 'LIVE' | 'UPCOMING' | 'ENDED';
}

const INITIAL_WEBINARS: DemoWebinar[] = [
  {
    id: 'webinar-101',
    title: 'Modern Full-Stack Live Streaming Architecture',
    description: 'Deep dive into WebRTC, Next.js App Router, SFU scaling, and edge CDN distribution.',
    date: '2026-11-20',
    time: '18:00 IST',
    attendees: 342,
    status: 'UPCOMING',
  },
  {
    id: 'webinar-102',
    title: 'High-Volume Online Education Best Practices',
    description: 'How to deliver interactive presentations with live polls and moderated Q&A queues.',
    date: '2026-11-22',
    time: '19:30 IST',
    attendees: 512,
    status: 'UPCOMING',
  },
  {
    id: 'webinar-103',
    title: 'Building Real-Time Audio/Video SaaS from Scratch',
    description: 'Architectural lessons learned from implementing low-latency media servers.',
    date: '2026-11-10',
    time: '17:00 IST',
    attendees: 820,
    status: 'ENDED',
  },
];

export default function DashboardPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'webinars' | 'meetings'>('webinars');
  const [webinars] = useState<DemoWebinar[]>(INITIAL_WEBINARS);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight" data-testid="dashboard-heading">
              {t.dashboard}
            </h1>
            <Badge variant="warning" size="sm">
              DEMO DATA
            </Badge>
          </div>
          <p className="text-sm text-slate-400">
            Manage your broadcast stages, audience registrations, and quick collaborative meetings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/webinar/new">
            <Button variant="primary" size="md" data-testid="btn-create-webinar">
              <PlusCircle className="w-4 h-4" />
              <span>{t.createWebinar}</span>
            </Button>
          </Link>
          <Link href="/meeting/quick-conference">
            <Button variant="secondary" size="md" data-testid="btn-quick-meeting">
              <Video className="w-4 h-4" />
              <span>{t.newMeeting}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-3 mt-8 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('webinars')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'webinars'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-600/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          data-testid="tab-webinars"
        >
          <Radio className="w-4 h-4" />
          <span>{t.webinarMode} ({webinars.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('meetings')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'meetings'
              ? 'bg-teal-600/20 text-teal-300 border border-teal-600/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          data-testid="tab-meetings"
        >
          <Video className="w-4 h-4" />
          <span>{t.meetingMode} (Secondary)</span>
        </button>
      </div>

      {/* Webinars Tab View */}
      {activeTab === 'webinars' && (
        <div className="mt-8 space-y-6" data-testid="webinars-list-container">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-200">{t.scheduledWebinars}</h2>
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              Host & Viewer rooms testable locally
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {webinars.map((item) => (
              <Card key={item.id} variant="webinar" className="flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        item.status === 'LIVE'
                          ? 'destructive'
                          : item.status === 'UPCOMING'
                          ? 'primary'
                          : 'default'
                      }
                      size="sm"
                    >
                      {item.status === 'LIVE'
                        ? t.statusLive
                        : item.status === 'UPCOMING'
                        ? t.statusUpcoming
                        : t.statusEnded}
                    </Badge>
                    <span className="text-[11px] font-mono text-slate-500">ID: {item.id}</span>
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-col gap-1.5 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{item.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{item.attendees} Registered</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-2">
                  <Link
                    href={`/webinar/host/${item.id}`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors gap-1.5"
                    data-testid={`btn-host-${item.id}`}
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Host Studio</span>
                  </Link>

                  <Link
                    href={`/webinar/join/${item.id}`}
                    className="inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors gap-1"
                    data-testid={`btn-join-${item.id}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Join</span>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Meetings Tab View */}
      {activeTab === 'meetings' && (
        <div className="mt-8 space-y-6" data-testid="meetings-list-container">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-200">Interactive Meeting Engine</h2>
            <Badge variant="secondary">Zoom-like Collaboration Mode</Badge>
          </div>

          <Card variant="meeting" className="p-8 text-center max-w-2xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto">
              <Video className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-white">Instant Peer Collaboration</h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Launch or join an interactive multi-party video session with adaptive gallery layouts, equal speaker mic privileges, and low-friction access.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/meeting/standup-daily">
                <Button variant="secondary" size="lg" data-testid="btn-launch-instant-meeting">
                  <Video className="w-4 h-4" />
                  <span>Start Instant Meeting</span>
                </Button>
              </Link>
              <Link href="/meeting/design-sync">
                <Button variant="outline" size="lg">
                  <span>Enter Room: design-sync</span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
