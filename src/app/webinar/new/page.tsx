'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  User,
  Globe,
  Settings,
  FileEdit,
  CalendarCheck,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { createWebinar, Webinar } from '@/lib/webinarStore';

export default function CreateWebinarPage() {
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hostName, setHostName] = useState('');
  const [date, setDate] = useState('2026-11-25');
  const [time, setTime] = useState('19:00');
  const [duration, setDuration] = useState('60');
  const [timezone, setTimezone] = useState('IST (UTC+5:30)');

  // Settings
  const [recordSession, setRecordSession] = useState(true);
  const [muteOnEntry, setMuteOnEntry] = useState(true);
  const [allowQa, setAllowQa] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdWebinar, setCreatedWebinar] = useState<Webinar | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Webinar title is required';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    }

    if (!hostName.trim()) {
      newErrors.hostName = 'Host/Presenter name is required';
    } else if (hostName.trim().length < 2) {
      newErrors.hostName = 'Host name must be at least 2 characters long';
    }

    if (!date) {
      newErrors.date = 'Scheduled date is required';
    }

    if (!time) {
      newErrors.time = 'Start time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (actionType: 'DRAFT' | 'SCHEDULED') => {
    if (!validate()) return;

    const result = createWebinar({
      title,
      description,
      hostName,
      date,
      time,
      duration: parseInt(duration, 10) || 60,
      timezone,
      status: actionType,
      settings: {
        recordSession,
        muteOnEntry,
        allowQa,
      },
    });

    if (result.success && result.webinar) {
      setCreatedWebinar(result.webinar);
    } else if (result.error) {
      setErrors({ form: result.error });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="primary" size="sm">
            Webinar Studio
          </Badge>
          <Badge variant="warning" size="sm">
            [DEMO CREATION]
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight" data-testid="create-webinar-heading">
          {t.createWebinar}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Configure session details and generate direct entry rooms for hosts and viewers.
        </p>
      </div>

      {createdWebinar ? (
        /* Success State */
        <Card variant="webinar" className="p-8 space-y-6 text-center" data-testid="created-success-card">
          <div className="w-14 h-14 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <Badge
                variant={createdWebinar.status === 'DRAFT' ? 'default' : 'primary'}
                size="sm"
              >
                STATUS: {createdWebinar.status}
              </Badge>
              <Badge variant="warning" size="sm">[DEMO]</Badge>
            </div>
            <h2 className="text-xl font-bold text-white">
              {createdWebinar.status === 'DRAFT' ? 'Webinar Draft Saved' : 'Webinar Successfully Scheduled'}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Session <span className="font-mono text-indigo-400 font-semibold">{createdWebinar.id}</span> is ready for local preview testing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-left">
            <div className="p-4 rounded-lg bg-slate-950/80 border border-indigo-900/40">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                Host Access Link
              </span>
              <p className="text-xs text-slate-400 mt-1 mb-3">
                Full stage broadcast control, microphone, camera, and participant moderation.
              </p>
              <Link href={`/webinar/host/${createdWebinar.id}`}>
                <Button variant="primary" size="sm" className="w-full" data-testid="btn-go-to-host">
                  <span>Enter Host Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                Viewer Registration Link
              </span>
              <p className="text-xs text-slate-400 mt-1 mb-3">
                Attendee landing page to register and watch the live stream as an audience member.
              </p>
              <Link href={`/webinar/join/${createdWebinar.id}`}>
                <Button variant="outline" size="sm" className="w-full" data-testid="btn-go-to-join">
                  <span>Open Join Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setCreatedWebinar(null);
                setTitle('');
                setHostName('');
              }}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              ← Schedule another webinar
            </button>
            <Link href="/dashboard" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              Go to Dashboard →
            </Link>
          </div>
        </Card>
      ) : (
        /* Form */
        <Card variant="default" className="p-6 sm:p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit('SCHEDULED');
            }}
            className="space-y-6"
            data-testid="form-create-webinar"
          >
            {errors.form && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                {t.title} <span className="text-rose-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                }}
                placeholder="e.g., Scaling Next.js 16 to Millions of Viewers"
                className={`w-full rounded-lg bg-slate-950/90 border px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.title
                    ? 'border-rose-500 focus:ring-rose-500/40'
                    : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/30'
                }`}
                data-testid="input-title"
              />
              {errors.title && (
                <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1" data-testid="error-title">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            {/* Host Name */}
            <div>
              <label htmlFor="hostName" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                {t.hostName} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="hostName"
                  type="text"
                  value={hostName}
                  onChange={(e) => {
                    setHostName(e.target.value);
                    if (errors.hostName) setErrors((prev) => ({ ...prev, hostName: '' }));
                  }}
                  placeholder={t.hostNamePlaceholder}
                  className={`w-full rounded-lg bg-slate-950/90 border pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.hostName
                      ? 'border-rose-500 focus:ring-rose-500/40'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/30'
                  }`}
                  data-testid="input-host-name"
                />
              </div>
              {errors.hostName && (
                <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1" data-testid="error-host-name">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.hostName}</span>
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                {t.description}
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key takeaways, presenter introductions, and agenda summary..."
                className="w-full rounded-lg bg-slate-950/90 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                data-testid="input-description"
              />
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  {t.dateTime} <span className="text-rose-400">*</span>
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg bg-slate-950/90 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                  data-testid="input-date"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Start Time <span className="text-rose-400">*</span>
                </label>
                <input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-lg bg-slate-950/90 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                  data-testid="input-time"
                />
              </div>
            </div>

            {/* Duration & Timezone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="duration" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  {t.duration}
                </label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-lg bg-slate-950/90 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                  data-testid="select-duration"
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes (Standard)</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes (Deep Dive)</option>
                </select>
              </div>

              <div>
                <label htmlFor="timezone" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  {t.timezone}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Globe className="w-4 h-4" />
                  </div>
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full rounded-lg bg-slate-950/90 border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    data-testid="select-timezone"
                  >
                    <option value="IST (UTC+5:30)">IST (UTC+5:30) — India Standard Time</option>
                    <option value="UTC">UTC — Universal Coordinated Time</option>
                    <option value="EST (UTC-5)">EST (UTC-5) — US Eastern Time</option>
                    <option value="PST (UTC-8)">PST (UTC-8) — US Pacific Time</option>
                    <option value="GMT (UTC+0)">GMT (UTC+0) — Greenwich Mean Time</option>
                    <option value="SGT (UTC+8)">SGT (UTC+8) — Singapore Time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Basic Settings */}
            <div className="pt-2 border-t border-slate-800/80 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-indigo-400" />
                {t.settingsHeading}
              </span>

              <div className="space-y-2">
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recordSession}
                    onChange={(e) => setRecordSession(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    data-testid="checkbox-record"
                  />
                  <span>{t.recordSessionLabel}</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={muteOnEntry}
                    onChange={(e) => setMuteOnEntry(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    data-testid="checkbox-mute-entry"
                  />
                  <span>{t.muteOnEntryLabel}</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowQa}
                    onChange={(e) => setAllowQa(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    data-testid="checkbox-allow-qa"
                  />
                  <span>{t.allowQaLabel}</span>
                </label>
              </div>
            </div>

            {/* Notice */}
            <div className="p-3.5 rounded-lg bg-indigo-950/40 border border-indigo-900/40 text-xs text-indigo-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>[DEMO MODE]:</strong> Saving as Draft or Scheduling updates the centralized client-side store, enabling immediate local testing of Host Studio lifecycle controls and Viewer registration gates without external media APIs.
              </span>
            </div>

            {/* Actions: Save Draft & Schedule */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
              <Link href="/dashboard" className="w-full sm:w-auto text-center">
                <Button type="button" variant="ghost" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </Link>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleSubmit('DRAFT')}
                className="w-full sm:w-auto gap-1.5"
                data-testid="btn-save-draft"
              >
                <FileEdit className="w-4 h-4 text-slate-400" />
                <span>{t.saveDraft}</span>
              </Button>

              <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-auto gap-1.5"
                data-testid="btn-submit-webinar"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>{t.scheduleWebinar}</span>
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
