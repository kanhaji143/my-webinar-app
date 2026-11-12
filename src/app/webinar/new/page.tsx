'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';

export default function CreateWebinarPage() {
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-11-25');
  const [time, setTime] = useState('19:00');
  const [duration, setDuration] = useState('60');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdSessionId, setCreatedSessionId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Webinar title is required';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    }

    if (!date) {
      newErrors.date = 'Scheduled date is required';
    }

    if (!time) {
      newErrors.time = 'Start time is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    // Generate deterministic simulated session ID
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 30);
    const mockId = `${slug || 'session'}-${Math.floor(100 + Math.random() * 900)}`;
    setCreatedSessionId(mockId);
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
            DEMO CREATION
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight" data-testid="create-webinar-heading">
          {t.createWebinar}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Configure session details and generate direct entry rooms for hosts and viewers.
        </p>
      </div>

      {createdSessionId ? (
        /* Success State */
        <Card variant="webinar" className="p-8 space-y-6 text-center" data-testid="created-success-card">
          <div className="w-14 h-14 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">Webinar Session Created (Demo)</h2>
            <p className="mt-2 text-sm text-slate-300">
              Session <span className="font-mono text-indigo-400 font-semibold">{createdSessionId}</span> is ready for local preview testing.
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
              <Link href={`/webinar/host/${createdSessionId}`}>
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
              <Link href={`/webinar/join/${createdSessionId}`}>
                <Button variant="outline" size="sm" className="w-full" data-testid="btn-go-to-join">
                  <span>Open Join Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setCreatedSessionId(null);
                setTitle('');
              }}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              ← Schedule another webinar
            </button>
          </div>
        </Card>
      ) : (
        /* Form */
        <Card variant="default" className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-create-webinar">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                {t.title} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
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
              </div>
              {errors.title && (
                <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1" data-testid="error-title">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.title}</span>
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
                <div className="relative">
                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg bg-slate-950/90 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    data-testid="input-date"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="time" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Start Time <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
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
            </div>

            {/* Duration */}
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

            {/* Notice */}
            <div className="p-3.5 rounded-lg bg-indigo-950/40 border border-indigo-900/40 text-xs text-indigo-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>API-Free Preview:</strong> Submitting will create an immediate in-memory session link allowing you to test both Host Studio and Viewer Stage without requiring backend databases or media tokens.
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <Link href="/dashboard">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="primary" data-testid="btn-submit-webinar">
                {t.createSubmit}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
