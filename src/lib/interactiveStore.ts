'use client';

import { useSyncExternalStore } from 'react';

export interface ChatMessage {
  id: string;
  webinarId: string;
  sender: string;
  role: 'host' | 'viewer' | 'attendee';
  message: string;
  timestamp: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  webinarId: string;
  question: string;
  options: PollOption[];
  isActive: boolean;
  createdAt: string;
  totalVotes: number;
  userVotedOptionId?: string;
}

export interface QAQuestion {
  id: string;
  webinarId: string;
  author: string;
  question: string;
  upvotes: number;
  isAnswered: boolean;
  answerText?: string;
  createdAt: string;
  userHasUpvoted?: boolean;
}

export interface SimulatedParticipant {
  id: string;
  name: string;
  role: 'viewer' | 'co-host' | 'guest';
  joinedAt: string;
  isSimulated: true;
}

interface InteractiveData {
  messages: ChatMessage[];
  polls: Poll[];
  questions: QAQuestion[];
  simulatedParticipants: Record<string, SimulatedParticipant[]>;
}

const STORAGE_KEY = 'webinar_interactive_store_v1';

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    webinarId: 'webinar-101',
    sender: 'Audience Member (Pooja R.)',
    role: 'viewer',
    message: 'Hello everyone! Excited for the LiveKit architecture deep dive.',
    timestamp: '10:02 AM',
  },
  {
    id: 'msg-2',
    webinarId: 'webinar-101',
    sender: 'Host (Dr. Vikram Malhotra)',
    role: 'host',
    message: 'Welcome everyone! We will commence the live presentation in 2 minutes.',
    timestamp: '10:03 AM',
  },
  {
    id: 'msg-3',
    webinarId: 'webinar-101',
    sender: 'Audience Member (Sameer K.)',
    role: 'viewer',
    message: 'Audio and video stream quality looks crisp on 1080p.',
    timestamp: '10:04 AM',
  },
];

const SEED_POLLS: Poll[] = [
  {
    id: 'poll-1',
    webinarId: 'webinar-101',
    question: 'Which media protocol do you primarily evaluate for low-latency SaaS?',
    options: [
      { id: 'opt-1', text: 'WebRTC (SFU architecture)', votes: 28 },
      { id: 'opt-2', text: 'Low-Latency HLS (LL-HLS)', votes: 9 },
      { id: 'opt-3', text: 'WebTransport / QUIC', votes: 14 },
      { id: 'opt-4', text: 'RTMP / Traditional HLS', votes: 4 },
    ],
    isActive: true,
    createdAt: '2026-11-12T10:00:00Z',
    totalVotes: 55,
  },
];

const SEED_QUESTIONS: QAQuestion[] = [
  {
    id: 'qa-1',
    webinarId: 'webinar-101',
    author: 'Kavita Sundaram',
    question: 'How do you handle simulcast bitrate adaptation during network degradation?',
    upvotes: 12,
    isAnswered: true,
    answerText: 'We dynamically negotiate 3 layer spatial profiles (1080p, 720p, 360p) with the SFU based on client RTCP receiver reports.',
    createdAt: '2026-11-12T10:05:00Z',
  },
  {
    id: 'qa-2',
    webinarId: 'webinar-101',
    author: 'Arjun Mehta',
    question: 'Can host screen-share audio be isolated from presenter microphone track?',
    upvotes: 7,
    isAnswered: false,
    createdAt: '2026-11-12T10:08:00Z',
  },
];

const SEED_SIMULATED_ATTENDEES: SimulatedParticipant[] = [
  { id: 'sim-1', name: 'Aarav Patel', role: 'viewer', joinedAt: '10:01 AM', isSimulated: true },
  { id: 'sim-2', name: 'Diya Sen', role: 'viewer', joinedAt: '10:02 AM', isSimulated: true },
  { id: 'sim-3', name: 'Rohan Deshmukh', role: 'viewer', joinedAt: '10:02 AM', isSimulated: true },
  { id: 'sim-4', name: 'Tanvi Kapoor', role: 'co-host', joinedAt: '10:00 AM', isSimulated: true },
  { id: 'sim-5', name: 'Aditya Bhattacharya', role: 'viewer', joinedAt: '10:03 AM', isSimulated: true },
  { id: 'sim-6', name: 'Meera Nambiar', role: 'viewer', joinedAt: '10:04 AM', isSimulated: true },
];

let memoryStore: InteractiveData = {
  messages: SEED_MESSAGES,
  polls: SEED_POLLS,
  questions: SEED_QUESTIONS,
  simulatedParticipants: {
    'webinar-101': SEED_SIMULATED_ATTENDEES,
    'session-e2e-test': SEED_SIMULATED_ATTENDEES.slice(0, 3),
  },
};

let storeInitialized = false;

function initStoreIfNeeded(): InteractiveData {
  if (typeof window === 'undefined') return memoryStore;
  if (!storeInitialized) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.messages) && Array.isArray(parsed.polls)) {
          memoryStore = parsed;
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore));
        }
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore));
      }
    } catch {
      // Local storage unavailable
    }
    storeInitialized = true;
  }
  return memoryStore;
}

const listeners = new Set<() => void>();

function notifyStoreChange() {
  for (const listener of listeners) {
    listener();
  }
}

function saveStore(data: InteractiveData) {
  memoryStore = data;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage unavailable
    }
    notifyStoreChange();
  }
}

export function subscribeInteractiveStore(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getInteractiveSnapshot(): InteractiveData {
  return initStoreIfNeeded();
}

// Actions
export function addChatMessage(webinarId: string, sender: string, role: 'host' | 'viewer', message: string): ChatMessage {
  const current = getInteractiveSnapshot();
  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    webinarId,
    sender,
    role,
    message: message.trim(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  saveStore({
    ...current,
    messages: [...current.messages, newMsg],
  });

  return newMsg;
}

export function createPoll(webinarId: string, question: string, optionTexts: string[]): Poll | null {
  if (!question.trim() || optionTexts.length < 2) return null;

  const current = getInteractiveSnapshot();
  const cleanOptions = optionTexts
    .map((t) => t.trim())
    .filter(Boolean)
    .map((text, idx) => ({
      id: `opt-${idx + 1}-${Date.now()}`,
      text,
      votes: 0,
    }));

  if (cleanOptions.length < 2) return null;

  const newPoll: Poll = {
    id: `poll-${Date.now()}`,
    webinarId,
    question: question.trim(),
    options: cleanOptions,
    isActive: true,
    createdAt: new Date().toISOString(),
    totalVotes: 0,
  };

  saveStore({
    ...current,
    polls: [newPoll, ...current.polls],
  });

  return newPoll;
}

export function voteInPoll(webinarId: string, pollId: string, optionId: string): boolean {
  const current = getInteractiveSnapshot();
  const pollIdx = current.polls.findIndex((p) => p.id === pollId && p.webinarId === webinarId);
  if (pollIdx === -1) return false;

  const poll = current.polls[pollIdx];
  if (!poll.isActive) return false;
  if (poll.userVotedOptionId) return false; // Already voted

  const updatedOptions = poll.options.map((opt) =>
    opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
  );

  const updatedPoll: Poll = {
    ...poll,
    options: updatedOptions,
    totalVotes: poll.totalVotes + 1,
    userVotedOptionId: optionId,
  };

  const nextPolls = [...current.polls];
  nextPolls[pollIdx] = updatedPoll;

  saveStore({
    ...current,
    polls: nextPolls,
  });

  return true;
}

export function endPoll(webinarId: string, pollId: string): boolean {
  const current = getInteractiveSnapshot();
  const pollIdx = current.polls.findIndex((p) => p.id === pollId && p.webinarId === webinarId);
  if (pollIdx === -1) return false;

  const poll = current.polls[pollIdx];
  const updatedPoll: Poll = {
    ...poll,
    isActive: false,
  };

  const nextPolls = [...current.polls];
  nextPolls[pollIdx] = updatedPoll;

  saveStore({
    ...current,
    polls: nextPolls,
  });

  return true;
}

export function askQuestion(webinarId: string, author: string, question: string): QAQuestion | null {
  if (!question.trim() || !author.trim()) return null;

  const current = getInteractiveSnapshot();
  const newQuestion: QAQuestion = {
    id: `qa-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    webinarId,
    author: author.trim(),
    question: question.trim(),
    upvotes: 1,
    isAnswered: false,
    createdAt: new Date().toISOString(),
    userHasUpvoted: true,
  };

  saveStore({
    ...current,
    questions: [newQuestion, ...current.questions],
  });

  return newQuestion;
}

export function upvoteQuestion(webinarId: string, questionId: string): boolean {
  const current = getInteractiveSnapshot();
  const qIdx = current.questions.findIndex((q) => q.id === questionId && q.webinarId === webinarId);
  if (qIdx === -1) return false;

  const q = current.questions[qIdx];
  const isUpvoted = !!q.userHasUpvoted;

  const updatedQ: QAQuestion = {
    ...q,
    upvotes: isUpvoted ? Math.max(0, q.upvotes - 1) : q.upvotes + 1,
    userHasUpvoted: !isUpvoted,
  };

  const nextQuestions = [...current.questions];
  nextQuestions[qIdx] = updatedQ;

  saveStore({
    ...current,
    questions: nextQuestions,
  });

  return true;
}

export function answerQuestion(webinarId: string, questionId: string, answerText: string): boolean {
  const current = getInteractiveSnapshot();
  const qIdx = current.questions.findIndex((q) => q.id === questionId && q.webinarId === webinarId);
  if (qIdx === -1) return false;

  const q = current.questions[qIdx];
  const updatedQ: QAQuestion = {
    ...q,
    isAnswered: true,
    answerText: answerText.trim(),
  };

  const nextQuestions = [...current.questions];
  nextQuestions[qIdx] = updatedQ;

  saveStore({
    ...current,
    questions: nextQuestions,
  });

  return true;
}

export function deleteQuestion(webinarId: string, questionId: string): boolean {
  const current = getInteractiveSnapshot();
  const nextQuestions = current.questions.filter((q) => !(q.id === questionId && q.webinarId === webinarId));

  saveStore({
    ...current,
    questions: nextQuestions,
  });

  return true;
}

export function setPollSnapshot(webinarId: string, polls: Poll[]) {
  const current = getInteractiveSnapshot();
  const otherPolls = current.polls.filter((p) => p.webinarId !== webinarId);
  saveStore({
    ...current,
    polls: [...otherPolls, ...polls],
  });
}

export function setQASnapshot(webinarId: string, questions: QAQuestion[]) {
  const current = getInteractiveSnapshot();
  const otherQuestions = current.questions.filter((q) => q.webinarId !== webinarId);
  saveStore({
    ...current,
    questions: [...otherQuestions, ...questions],
  });
}

// Custom React hook
export function useInteractiveStore(webinarId: string) {
  const data = useSyncExternalStore(subscribeInteractiveStore, getInteractiveSnapshot, () => memoryStore);

  const messages = data.messages.filter((m) => m.webinarId === webinarId);
  const polls = data.polls.filter((p) => p.webinarId === webinarId);
  const questions = data.questions.filter((q) => q.webinarId === webinarId);
  const simulatedParticipants = data.simulatedParticipants[webinarId] || (
    // Default simulated participants for any session to ensure visual consistency
    SEED_SIMULATED_ATTENDEES.slice(0, 4)
  );

  return {
    messages,
    polls,
    questions,
    simulatedParticipants,
    addChatMessage: (sender: string, role: 'host' | 'viewer', msg: string) => addChatMessage(webinarId, sender, role, msg),
    createPoll: (question: string, options: string[]) => createPoll(webinarId, question, options),
    voteInPoll: (pollId: string, optionId: string) => voteInPoll(webinarId, pollId, optionId),
    endPoll: (pollId: string) => endPoll(webinarId, pollId),
    askQuestion: (author: string, q: string) => askQuestion(webinarId, author, q),
    upvoteQuestion: (qId: string) => upvoteQuestion(webinarId, qId),
    answerQuestion: (qId: string, text: string) => answerQuestion(webinarId, qId, text),
    deleteQuestion: (qId: string) => deleteQuestion(webinarId, qId),
    setPollSnapshot: (polls: Poll[]) => setPollSnapshot(webinarId, polls),
    setQASnapshot: (questions: QAQuestion[]) => setQASnapshot(webinarId, questions),
  };
}
