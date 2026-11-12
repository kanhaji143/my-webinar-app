'use client';

import React from 'react';
import { Radio, Shield, Terminal } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from './Badge';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white">
              <Radio className="w-4 h-4" />
            </div>
            <span className="font-semibold text-white">{t.appName}</span>
          </div>
          <p className="text-xs text-slate-500">
            © 2026 {t.appName}. {t.footerRights}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>API-Free Phase 1</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next.js App Router</span>
          </div>
          <span className="text-slate-700">•</span>
          <Badge variant="outline" size="sm">
            v0.1.0-alpha
          </Badge>
        </div>
      </div>
    </footer>
  );
}
