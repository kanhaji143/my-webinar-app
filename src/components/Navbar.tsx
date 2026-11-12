'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Radio, LayoutDashboard, PlusCircle, Video, Menu, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Badge } from './Badge';

export function Navbar() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-base sm:text-lg text-white group shrink-0"
              data-testid="brand-logo"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-linear-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight tracking-tight text-sm sm:text-base">{t.appName}</span>
                <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                  Webinar & Meetings
                </span>
              </div>
            </Link>
            <Badge variant="primary" size="sm" className="hidden lg:inline-flex">
              Dual-Mode
            </Badge>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
              data-testid="nav-dashboard"
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              <span>{t.dashboard}</span>
            </Link>

            <Link
              href="/webinar/new"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-300 hover:text-white hover:bg-indigo-950/50 rounded-lg transition-colors"
              data-testid="nav-create-webinar"
            >
              <PlusCircle className="w-4 h-4 text-indigo-400" />
              <span>{t.createWebinar}</span>
            </Link>

            <Link
              href="/meeting/demo-team-sync"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-teal-300 hover:text-white hover:bg-teal-950/50 rounded-lg transition-colors"
              data-testid="nav-instant-meeting"
            >
              <Video className="w-4 h-4 text-teal-400" />
              <span>{t.newMeeting}</span>
            </Link>
          </nav>

          {/* Right Action & Language Switcher (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition-all shrink-0"
              data-testid="nav-cta-dashboard"
            >
              {t.explorePlatform}
            </Link>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle menu"
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            data-testid="mobile-menu-dropdown"
            className="md:hidden border-t border-slate-800 py-3 px-2 space-y-1.5 bg-slate-950"
          >
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 rounded-lg"
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              <span>{t.dashboard}</span>
            </Link>
            <Link
              href="/webinar/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-indigo-300 hover:bg-indigo-950/40 rounded-lg"
            >
              <PlusCircle className="w-4 h-4 text-indigo-400" />
              <span>{t.createWebinar}</span>
            </Link>
            <Link
              href="/meeting/demo-team-sync"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-teal-300 hover:bg-teal-950/40 rounded-lg"
            >
              <Video className="w-4 h-4 text-teal-400" />
              <span>{t.newMeeting}</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
