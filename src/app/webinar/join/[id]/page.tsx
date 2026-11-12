'use client';

import React, { useState, use, Suspense } from 'react';
import Link from 'next/link';
import {
  Radio,
  Calendar,
  Clock,
  User,
  Mail,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';

interface JoinPageProps {
  params: Promise<{ id: string }>;
}

function WebinarJoinContent({ params }: JoinPageProps) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registered, setRegistered] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Please provide your full name';
    }

    if (!email.trim() || !email.includes('@')) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setRegistered(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 w-full flex-1 flex flex-col justify-center">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <Badge variant="primary" size="sm">
            <Radio className="w-3 h-3 mr-1 text-indigo-400" />
            Live Webinar Registration
          </Badge>
          <Badge variant="warning" size="sm">
            DEMO GATE
          </Badge>
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight" data-testid="join-heading">
          {t.registerNow}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Session Identifier: <span className="font-mono text-indigo-400 font-semibold">{sessionId}</span>
        </p>
      </div>

      <Card variant="webinar" className="p-6 sm:p-8">
        {/* Session Snapshot */}
        <div className="p-4 rounded-lg bg-slate-950/70 border border-indigo-950/60 mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-300">Target Session</span>
            <Badge variant="success" size="sm">Active Stage</Badge>
          </div>
          <h2 className="text-base font-bold text-white">
            {sessionId.replace(/-/g, ' ').toUpperCase()}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Scheduled Today
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              60 Minutes
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Free Access
            </span>
          </div>
        </div>

        {registered ? (
          /* Confirmation & Enter Stage */
          <div className="text-center space-y-6 py-4" data-testid="registration-confirmed">
            <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">You are Registered!</h3>
              <p className="mt-1 text-xs text-slate-300">
                Welcome <span className="font-semibold text-white">{name}</span> ({email}). You can now join the live viewer auditorium.
              </p>
            </div>

            <Link href={`/webinar/viewer/${sessionId}`}>
              <Button variant="primary" size="lg" className="w-full gap-2" data-testid="btn-enter-viewer-stage">
                <span>{t.joinAsViewer}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleRegister} className="space-y-5" data-testid="form-webinar-join">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                {t.name} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  placeholder="e.g., Alex Morgan"
                  className={`w-full rounded-lg bg-slate-950/90 border pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? 'border-rose-500 focus:ring-rose-500/40'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/30'
                  }`}
                  data-testid="input-name"
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1" data-testid="error-name">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                {t.email} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  placeholder="alex.morgan@company.com"
                  className={`w-full rounded-lg bg-slate-950/90 border pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-rose-500 focus:ring-rose-500/40'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/30'
                  }`}
                  data-testid="input-email"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1" data-testid="error-email">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2" data-testid="btn-submit-registration">
              <span>Continue to Webinar Stage</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

export default function WebinarJoinPage({ params }: JoinPageProps) {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-slate-400">Loading registration...</div>}>
      <WebinarJoinContent params={params} />
    </Suspense>
  );
}
