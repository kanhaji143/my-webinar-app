'use client';

import React, { useState, useMemo } from 'react';
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
  Search,
  Filter,
  Play,
  Square,
  FileEdit,
  User,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useWebinarStore, WebinarStatus, Webinar } from '@/lib/webinarStore';

export default function DashboardPage() {
  const { t } = useLanguage();
  const { webinars, updateWebinarStatus } = useWebinarStore();

  const [activeTab, setActiveTab] = useState<'webinars' | 'meetings'>('webinars');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | WebinarStatus>('ALL');
  const [actionFeedback, setActionFeedback] = useState<{ message: string; error?: boolean } | null>(null);

  // Filter & Search logic
  const filteredWebinars = useMemo(() => {
    return webinars.filter((item) => {
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.hostName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [webinars, statusFilter, searchQuery]);

  // Counts for tabs/filters
  const statusCounts = useMemo(() => {
    return {
      ALL: webinars.length,
      SCHEDULED: webinars.filter((w) => w.status === 'SCHEDULED').length,
      LIVE: webinars.filter((w) => w.status === 'LIVE').length,
      DRAFT: webinars.filter((w) => w.status === 'DRAFT').length,
      ENDED: webinars.filter((w) => w.status === 'ENDED').length,
    };
  }, [webinars]);

  const handleStartBroadcast = (webinar: Webinar) => {
    const res = updateWebinarStatus(webinar.id, 'LIVE');
    if (res.success) {
      setActionFeedback({ message: `Webinar "${webinar.title}" is now LIVE [DEMO].` });
    } else {
      setActionFeedback({ message: res.error || 'Failed to start broadcast.', error: true });
    }
  };

  const handleEndBroadcast = (webinar: Webinar) => {
    const res = updateWebinarStatus(webinar.id, 'ENDED');
    if (res.success) {
      setActionFeedback({ message: `Webinar "${webinar.title}" has been ENDED.` });
    } else {
      setActionFeedback({ message: res.error || 'Failed to end broadcast.', error: true });
    }
  };

  const handlePublishDraft = (webinar: Webinar) => {
    const res = updateWebinarStatus(webinar.id, 'SCHEDULED');
    if (res.success) {
      setActionFeedback({ message: `Draft "${webinar.title}" is now published and SCHEDULED.` });
    } else {
      setActionFeedback({ message: res.error || 'Failed to publish draft.', error: true });
    }
  };

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
              [DEMO STATE]
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

      {/* Action Notification Banner */}
      {actionFeedback && (
        <div
          className={`mt-4 p-3 rounded-lg flex items-center justify-between text-xs font-medium border ${
            actionFeedback.error
              ? 'bg-rose-950/60 border-rose-800 text-rose-300'
              : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
          }`}
          data-testid="dashboard-feedback-alert"
        >
          <div className="flex items-center gap-2">
            {actionFeedback.error ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-slate-400 hover:text-white text-xs px-2"
          >
            ✕
          </button>
        </div>
      )}

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
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                data-testid="input-search-webinars"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5" data-testid="filter-status-group">
              <span className="text-[11px] uppercase font-semibold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Filter:
              </span>

              {(['ALL', 'SCHEDULED', 'LIVE', 'DRAFT', 'ENDED'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                  data-testid={`filter-${st.toLowerCase()}`}
                >
                  {st === 'ALL'
                    ? `${t.filterAll} (${statusCounts.ALL})`
                    : st === 'SCHEDULED'
                    ? `${t.statusScheduled} (${statusCounts.SCHEDULED})`
                    : st === 'LIVE'
                    ? `${t.statusLive} (${statusCounts.LIVE})`
                    : st === 'DRAFT'
                    ? `${t.statusDraft} (${statusCounts.DRAFT})`
                    : `${t.statusEnded} (${statusCounts.ENDED})`}
                </button>
              ))}
            </div>
          </div>

          {/* Webinars Cards Grid */}
          {filteredWebinars.length === 0 ? (
            <Card variant="default" className="text-center py-12 space-y-3" data-testid="empty-webinars-state">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">{t.noWebinarsTitle}</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {t.noWebinarsDesc}
              </p>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                  }}
                  data-testid="btn-reset-filters"
                >
                  Reset Search & Filters
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="webinars-grid">
              {filteredWebinars.map((item) => (
                <Card
                  key={item.id}
                  variant={item.status === 'LIVE' ? 'webinar' : 'default'}
                  className={`flex flex-col justify-between relative ${
                    item.status === 'LIVE' ? 'ring-1 ring-rose-500/40 shadow-lg shadow-rose-950/20' : ''
                  }`}
                  data-testid={`webinar-card-${item.id}`}
                >
                  <div className="space-y-3">
                    {/* Status Badge & ID */}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          item.status === 'LIVE'
                            ? 'destructive'
                            : item.status === 'SCHEDULED'
                            ? 'primary'
                            : item.status === 'DRAFT'
                            ? 'outline'
                            : 'default'
                        }
                        size="sm"
                        className={item.status === 'LIVE' ? 'animate-pulse' : ''}
                        data-testid={`badge-status-${item.id}`}
                      >
                        {item.status === 'LIVE'
                          ? `● ${t.statusLive}`
                          : item.status === 'SCHEDULED'
                          ? t.statusScheduled
                          : item.status === 'DRAFT'
                          ? t.statusDraft
                          : t.statusEnded}
                      </Badge>
                      <span className="text-[11px] font-mono text-slate-500">ID: {item.id}</span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-bold text-white text-base leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description || 'No detailed overview provided.'}
                    </p>

                    {/* Host & Meta Details */}
                    <div className="flex flex-col gap-1.5 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="font-medium text-slate-200">{item.hostName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>
                          {item.time} ({item.duration}m) — {item.timezone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{item.registrations.length} Registered</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/webinar/host/${item.id}`}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors gap-1.5"
                        data-testid={`btn-host-${item.id}`}
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Host Studio</span>
                      </Link>

                      {item.status === 'DRAFT' ? (
                        <button
                          type="button"
                          disabled
                          className="inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-900 border border-slate-800 rounded-lg cursor-not-allowed opacity-60"
                          title="Registration disabled in Draft mode"
                          data-testid={`btn-join-disabled-${item.id}`}
                        >
                          Draft
                        </button>
                      ) : (
                        <Link
                          href={`/webinar/join/${item.id}`}
                          className="inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors gap-1"
                          data-testid={`btn-join-${item.id}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{item.status === 'LIVE' ? 'Watch' : 'Join'}</span>
                        </Link>
                      )}
                    </div>

                    {/* Quick Lifecycle Action Buttons */}
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      {item.status === 'DRAFT' && (
                        <button
                          type="button"
                          onClick={() => handlePublishDraft(item)}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                          data-testid={`btn-publish-${item.id}`}
                        >
                          <FileEdit className="w-3 h-3" />
                          <span>Publish / Schedule</span>
                        </button>
                      )}

                      {item.status === 'SCHEDULED' && (
                        <button
                          type="button"
                          onClick={() => handleStartBroadcast(item)}
                          className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                          data-testid={`btn-quick-start-${item.id}`}
                        >
                          <Play className="w-3 h-3" />
                          <span>Go Live Now [DEMO]</span>
                        </button>
                      )}

                      {item.status === 'LIVE' && (
                        <button
                          type="button"
                          onClick={() => handleEndBroadcast(item)}
                          className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                          data-testid={`btn-quick-end-${item.id}`}
                        >
                          <Square className="w-3 h-3" />
                          <span>End Broadcast</span>
                        </button>
                      )}

                      {item.status === 'ENDED' && (
                        <span className="text-slate-500 italic">Concluded Session</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
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
