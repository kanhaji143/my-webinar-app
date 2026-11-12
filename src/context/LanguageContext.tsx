'use client';

import React, { createContext, useContext, useState, useSyncExternalStore } from 'react';
import { Language, translations, Translations } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): Language {
  try {
    const saved = localStorage.getItem('app_lang');
    if (saved === 'en' || saved === 'hi') return saved as Language;
  } catch {
    // LocalStorage unavailable
  }
  return 'en';
}

function getServerSnapshot(): Language {
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [localLang, setLocalLang] = useState<Language | null>(null);
  const storedLang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  
  const language = localLang ?? storedLang;

  const setLanguage = (lang: Language) => {
    setLocalLang(lang);
    try {
      localStorage.setItem('app_lang', lang);
      window.dispatchEvent(new Event('storage'));
    } catch {
      // Safely ignore
    }
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
