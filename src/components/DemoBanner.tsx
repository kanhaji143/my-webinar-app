'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function DemoBanner() {
  const { t } = useLanguage();

  return (
    <div
      role="banner"
      data-testid="demo-banner"
      className="bg-amber-950/60 border-b border-amber-800/40 text-amber-200 text-xs px-2 sm:px-4 py-2 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 font-medium text-center w-full max-w-full overflow-hidden"
    >
      <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
      <span className="break-words leading-tight">{t.demoModeNotice}</span>
      <span className="bg-amber-800/60 text-amber-100 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider shrink-0">
        {t.demoBadge}
      </span>
    </div>
  );
}
