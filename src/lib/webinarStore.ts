'use client';

import { useSyncExternalStore } from 'react';

export type WebinarStatus = 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'ENDED';

export interface WebinarRegistration {
  name: string;
  email: string;
  registeredAt: string;
}

export interface WebinarSettings {
  recordSession: boolean;
  muteOnEntry: boolean;
  allowQa: boolean;
}

export interface Webinar {
  id: string;
  title: string;
  description: string;
  hostName: string;
  date: string;
  time: string;
  duration: number;
  timezone: string;
  status: WebinarStatus;
  createdAt: string;
  registrations: WebinarRegistration[];
  settings: WebinarSettings;
}

const STORAGE_KEY = 'webinarpulse_webinars_v2';
const STORE_EVENT = 'webinarpulse_store_updated';

const SEED_WEBINARS: Webinar[] = [
  {
    id: 'webinar-101',
    title: 'Modern Full-Stack Live Streaming Architecture',
    description: 'Deep dive into WebRTC, Next.js App Router, SFU scaling, and edge CDN distribution.',
    hostName: 'Dr. Vikram Malhotra',
    date: '2026-11-20',
    time: '18:00',
    duration: 60,
    timezone: 'IST (UTC+5:30)',
    status: 'SCHEDULED',
    createdAt: '2026-11-01T10:00:00Z',
    registrations: [
      { name: 'Aditi Rao', email: 'aditi@example.com', registeredAt: '2026-11-02T12:00:00Z' },
      { name: 'Karan Mehta', email: 'karan@example.com', registeredAt: '2026-11-03T15:30:00Z' },
    ],
    settings: { recordSession: true, muteOnEntry: true, allowQa: true },
  },
  {
    id: 'webinar-102',
    title: 'High-Volume Online Education Best Practices',
    description: 'How to deliver interactive presentations with live polls and moderated Q&A queues.',
    hostName: 'Ananya Deshmukh',
    date: '2026-11-22',
    time: '19:30',
    duration: 90,
    timezone: 'IST (UTC+5:30)',
    status: 'SCHEDULED',
    createdAt: '2026-11-04T09:00:00Z',
    registrations: [
      { name: 'Siddharth Patel', email: 'sid@example.com', registeredAt: '2026-11-05T11:00:00Z' },
    ],
    settings: { recordSession: true, muteOnEntry: false, allowQa: true },
  },
  {
    id: 'webinar-103',
    title: 'Building Real-Time Audio/Video SaaS from Scratch',
    description: 'Architectural lessons learned from implementing low-latency media servers.',
    hostName: 'Rohit Verma',
    date: '2026-11-10',
    time: '17:00',
    duration: 45,
    timezone: 'IST (UTC+5:30)',
    status: 'ENDED',
    createdAt: '2026-10-25T14:00:00Z',
    registrations: [
      { name: 'Neha Sharma', email: 'neha@example.com', registeredAt: '2026-10-26T10:00:00Z' },
    ],
    settings: { recordSession: true, muteOnEntry: true, allowQa: true },
  },
  {
    id: 'webinar-104',
    title: 'Draft: Scaling Live Broadcasts with Edge HLS',
    description: 'Internal review of multi-tier HLS distribution topology before scheduling publicly.',
    hostName: 'Pooja Nair',
    date: '2026-11-28',
    time: '16:00',
    duration: 60,
    timezone: 'IST (UTC+5:30)',
    status: 'DRAFT',
    createdAt: '2026-11-08T08:00:00Z',
    registrations: [],
    settings: { recordSession: false, muteOnEntry: true, allowQa: false },
  },
];

let memoryWebinars: Webinar[] = SEED_WEBINARS;
let storeInitialized = false;

function initStoreIfNeeded(): Webinar[] {
  if (typeof window === 'undefined') return SEED_WEBINARS;
  if (!storeInitialized) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryWebinars = parsed;
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_WEBINARS));
        }
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_WEBINARS));
      }
    } catch {
      // Storage unavailable
    }
    storeInitialized = true;
  }
  return memoryWebinars;
}

function syncFromStorage() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryWebinars = parsed;
      }
    }
  } catch {
    // Ignore
  }
}

function notifyStoreChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(STORE_EVENT));
  }
}

function saveStore(webinars: Webinar[]) {
  memoryWebinars = webinars;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(webinars));
    } catch {
      // Storage unavailable
    }
    notifyStoreChange();
  }
}

export function getAllWebinars(): Webinar[] {
  return initStoreIfNeeded();
}

export function getWebinarById(id: string): Webinar | undefined {
  const webinars = getAllWebinars();
  return webinars.find((w) => w.id === id);
}

export interface CreateWebinarInput {
  title: string;
  description: string;
  hostName: string;
  date: string;
  time: string;
  duration: number;
  timezone: string;
  status: 'DRAFT' | 'SCHEDULED';
  settings?: Partial<WebinarSettings>;
}

export function createWebinar(input: CreateWebinarInput): { success: boolean; webinar?: Webinar; error?: string } {
  if (!input.title || input.title.trim().length < 5) {
    return { success: false, error: 'Title must be at least 5 characters long.' };
  }
  if (!input.hostName || input.hostName.trim().length < 2) {
    return { success: false, error: 'Host name must be at least 2 characters long.' };
  }
  if (!input.date) {
    return { success: false, error: 'Scheduled date is required.' };
  }
  if (!input.time) {
    return { success: false, error: 'Start time is required.' };
  }

  const slug = input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 30);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const id = `${slug || 'webinar'}-${randomSuffix}`;

  const newWebinar: Webinar = {
    id,
    title: input.title.trim(),
    description: input.description.trim(),
    hostName: input.hostName.trim(),
    date: input.date,
    time: input.time,
    duration: input.duration || 60,
    timezone: input.timezone || 'IST (UTC+5:30)',
    status: input.status,
    createdAt: new Date().toISOString(),
    registrations: [],
    settings: {
      recordSession: input.settings?.recordSession ?? true,
      muteOnEntry: input.settings?.muteOnEntry ?? true,
      allowQa: input.settings?.allowQa ?? true,
    },
  };

  const current = getAllWebinars();
  saveStore([newWebinar, ...current]);
  return { success: true, webinar: newWebinar };
}

export function updateWebinarStatus(
  id: string,
  newStatus: WebinarStatus
): { success: boolean; webinar?: Webinar; error?: string } {
  let current = getAllWebinars();
  let index = current.findIndex((w) => w.id === id);
  if (index === -1) {
    // Demo auto-initialization for ad-hoc or dynamic test sessions
    const fallbackWebinar: Webinar = {
      id,
      title: id.replace(/[-_]+/g, ' ').toUpperCase(),
      description: 'Dynamic session preview and demonstration room.',
      hostName: 'Dr. Vikram Malhotra',
      date: '2026-11-20',
      time: '18:00',
      duration: 60,
      timezone: 'IST (UTC+5:30)',
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
      registrations: [],
      settings: { recordSession: true, muteOnEntry: true, allowQa: true },
    };
    current = [fallbackWebinar, ...current];
    index = 0;
  }

  const webinar = current[index];
  const oldStatus = webinar.status;

  // Strict Lifecycle Transition Rules
  if (oldStatus === 'ENDED') {
    return { success: false, error: 'Cannot transition an ENDED webinar. This session has concluded.' };
  }

  if (oldStatus === 'DRAFT' && newStatus === 'LIVE') {
    return { success: false, error: 'Cannot start a DRAFT webinar directly. Please schedule or publish it first.' };
  }

  if (oldStatus === 'LIVE' && newStatus === 'DRAFT') {
    return { success: false, error: 'Cannot revert an active LIVE broadcast back to DRAFT.' };
  }

  if (oldStatus === 'SCHEDULED' && newStatus === 'ENDED') {
    return { success: false, error: 'Cannot end a SCHEDULED webinar that has not gone LIVE.' };
  }

  const updated: Webinar = {
    ...webinar,
    status: newStatus,
  };

  const nextWebinars = [...current];
  nextWebinars[index] = updated;
  saveStore(nextWebinars);

  return { success: true, webinar: updated };
}

export function registerAttendee(
  id: string,
  attendee: { name: string; email: string }
): { success: boolean; error?: string; registrationCount?: number } {
  let current = getAllWebinars();
  let index = current.findIndex((w) => w.id === id);
  if (index === -1) {
    // Demo auto-initialization for ad-hoc or dynamic test sessions
    const fallbackWebinar: Webinar = {
      id,
      title: id.replace(/[-_]+/g, ' ').toUpperCase(),
      description: 'Dynamic session preview and demonstration room.',
      hostName: 'Dr. Vikram Malhotra',
      date: '2026-11-20',
      time: '18:00',
      duration: 60,
      timezone: 'IST (UTC+5:30)',
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
      registrations: [],
      settings: { recordSession: true, muteOnEntry: true, allowQa: true },
    };
    current = [fallbackWebinar, ...current];
    index = 0;
  }

  const webinar = current[index];
  if (webinar.status === 'DRAFT') {
    return { success: false, error: 'Registration is not available for webinars in DRAFT status.' };
  }
  if (webinar.status === 'ENDED') {
    return { success: false, error: 'Registration is closed because this webinar has already ended.' };
  }

  if (!attendee.name.trim()) {
    return { success: false, error: 'Please provide your full name.' };
  }
  if (!attendee.email.trim() || !attendee.email.includes('@')) {
    return { success: false, error: 'Please provide a valid email address.' };
  }

  const alreadyRegistered = webinar.registrations.some(
    (r) => r.email.toLowerCase() === attendee.email.trim().toLowerCase()
  );

  const updatedRegistrations = alreadyRegistered
    ? webinar.registrations
    : [
        ...webinar.registrations,
        {
          name: attendee.name.trim(),
          email: attendee.email.trim(),
          registeredAt: new Date().toISOString(),
        },
      ];

  const updated: Webinar = {
    ...webinar,
    registrations: updatedRegistrations,
  };

  const nextWebinars = [...current];
  nextWebinars[index] = updated;
  saveStore(nextWebinars);

  return {
    success: true,
    registrationCount: updatedRegistrations.length,
  };
}

function storeSubscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const handleStorage = () => {
    syncFromStorage();
    callback();
  };
  window.addEventListener(STORE_EVENT, callback);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(STORE_EVENT, callback);
    window.removeEventListener('storage', handleStorage);
  };
}

function getStoreSnapshot(): Webinar[] {
  return initStoreIfNeeded();
}

function getServerStoreSnapshot(): Webinar[] {
  return SEED_WEBINARS;
}

export function useWebinarStore() {
  const webinars = useSyncExternalStore(storeSubscribe, getStoreSnapshot, getServerStoreSnapshot);

  return {
    webinars,
    getWebinar: (id: string) => webinars.find((w) => w.id === id),
    createWebinar,
    updateWebinarStatus,
    registerAttendee,
  };
}
