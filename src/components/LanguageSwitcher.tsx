'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      data-testid="language-switcher"
      className="inline-flex items-center rounded-lg border border-slate-700/80 bg-slate-900/90 p-0.5 text-xs font-medium"
    >
      <Languages className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1 shrink-0" />
      <button
        type="button"
        data-testid="lang-btn-en"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-md transition-all ${
          language === 'en'
            ? 'bg-indigo-600 text-white font-semibold shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        type="button"
        data-testid="lang-btn-hi"
        onClick={() => setLanguage('hi')}
        className={`px-2.5 py-1 rounded-md transition-all ${
          language === 'hi'
            ? 'bg-indigo-600 text-white font-semibold shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-label="Switch to Hindi"
      >
        हिंदी
      </button>
    </div>
  );
}
