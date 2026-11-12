'use client';

import React from 'react';
import Link from 'next/link';
import {
  Radio,
  Video,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center flex-1">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-800/80 bg-linear-to-b from-slate-950 via-slate-900/60 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.25),rgba(255,255,255,0))]" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <Badge variant="primary" size="md">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              Unified Streaming SaaS Platform
            </Badge>
            <Badge variant="outline" size="md">
              Option C Architecture
            </Badge>
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight md:leading-none"
            data-testid="hero-heading"
          >
            {t.heroTitle}
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all gap-2 group"
              data-testid="hero-cta-dashboard"
            >
              <span>{t.explorePlatform}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/webinar/new"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all gap-2"
              data-testid="hero-cta-webinar"
            >
              <Radio className="w-4 h-4 text-indigo-400" />
              <span>{t.launchWebinar}</span>
            </Link>

            <Link
              href="/meeting/instant-preview"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-teal-300 hover:text-white bg-slate-900 hover:bg-teal-950/40 border border-teal-800/60 rounded-xl transition-all gap-2"
              data-testid="hero-cta-meeting"
            >
              <Video className="w-4 h-4 text-teal-400" />
              <span>{t.startMeeting}</span>
            </Link>
          </div>

          {/* Feature Highlights Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Webinar-First Broadcaster
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Gallery Meeting Mode
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Bilingual (EN / हिंदी)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              API-Free-First Sandbox
            </span>
          </div>
        </div>
      </section>

      {/* Dual Mode Overview */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <Badge variant="default" size="sm" className="mb-3">
            Two Operating Engines, One SaaS Platform
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Purpose-Built for Broadcasts & Collaboration
          </h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Seamlessly toggle between large-audience presenter stages and equal-participation interactive meeting rooms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Primary Mode: Webinar */}
          <Card variant="webinar" className="flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Radio className="w-6 h-6" />
                </div>
                <Badge variant="primary">Primary Mode</Badge>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  Professional Webinar Platform
                </h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  Engineered for high-capacity broadcasts, structured speaker stages, moderated attendee chat, live polls, and audience registration gates.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Dedicated Host Studio (`/webinar/host/[id]`)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Low-latency Viewer Stage (`/webinar/viewer/[id]`)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Registration & Join Landing Page (`/webinar/join/[id]`)</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <Link
                href="/webinar/new"
                className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                <span>{t.createWebinar}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          {/* Secondary Mode: Meeting */}
          <Card variant="meeting" className="flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <Video className="w-6 h-6" />
                </div>
                <Badge variant="secondary">Secondary Mode</Badge>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  Interactive Video Meetings
                </h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  A collaborative multi-party video conferencing experience featuring adaptive gallery grids, equal audio/video participation, and fast peer joining.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Interactive Gallery View (`/meeting/[id]`)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Equal microphone and camera participant controls</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Instant meeting links with zero setup friction</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <Link
                href="/meeting/quick-session"
                className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 hover:text-teal-300"
              >
                <span>{t.newMeeting}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
