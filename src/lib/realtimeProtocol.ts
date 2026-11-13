/**
 * Real-Time Interaction Protocol (Phase 5)
 * Defines wire schemas, message types, and validation helpers
 * for real-time synchronization of Chat, Polls, and Q&A over LiveKit Reliable Data Channels
 * or browser BroadcastChannel fallback.
 *
 * Ephemeral session state only: no database persistence (deferred to Phase 9).
 */

import { ChatMessage, Poll, QAQuestion } from './interactiveStore';

export const PROTOCOL_VERSION = 'v1';
export const TOPIC_INTERACTION = 'webinar-interaction';

export type RealtimeMessageType =
  | 'CHAT_MESSAGE'
  | 'POLL_CREATE'
  | 'POLL_VOTE'
  | 'POLL_CLOSE'
  | 'POLL_UPDATE'
  | 'QA_ASK'
  | 'QA_UPVOTE'
  | 'QA_ANSWER'
  | 'QA_DELETE'
  | 'STATE_REQUEST'
  | 'STATE_SNAPSHOT';

export interface BaseRealtimeMessage {
  version: typeof PROTOCOL_VERSION;
  webinarId: string;
  senderId: string;
  senderRole: 'host' | 'viewer';
  timestamp: string;
}

export interface ChatRealtimeMessage extends BaseRealtimeMessage {
  type: 'CHAT_MESSAGE';
  payload: ChatMessage;
}

export interface PollCreateRealtimeMessage extends BaseRealtimeMessage {
  type: 'POLL_CREATE';
  payload: Poll;
}

export interface PollVoteRealtimeMessage extends BaseRealtimeMessage {
  type: 'POLL_VOTE';
  payload: {
    pollId: string;
    optionId: string;
    voterId: string;
  };
}

export interface PollCloseRealtimeMessage extends BaseRealtimeMessage {
  type: 'POLL_CLOSE';
  payload: {
    pollId: string;
  };
}

export interface PollUpdateRealtimeMessage extends BaseRealtimeMessage {
  type: 'POLL_UPDATE';
  payload: Poll;
}

export interface QAAskRealtimeMessage extends BaseRealtimeMessage {
  type: 'QA_ASK';
  payload: QAQuestion;
}

export interface QAUpvoteRealtimeMessage extends BaseRealtimeMessage {
  type: 'QA_UPVOTE';
  payload: {
    questionId: string;
    voterId: string;
  };
}

export interface QAAnswerRealtimeMessage extends BaseRealtimeMessage {
  type: 'QA_ANSWER';
  payload: {
    questionId: string;
    answerText: string;
  };
}

export interface QADeleteRealtimeMessage extends BaseRealtimeMessage {
  type: 'QA_DELETE';
  payload: {
    questionId: string;
  };
}

export interface StateRequestRealtimeMessage extends BaseRealtimeMessage {
  type: 'STATE_REQUEST';
  payload: {
    requesterId: string;
  };
}

export interface StateSnapshotRealtimeMessage extends BaseRealtimeMessage {
  type: 'STATE_SNAPSHOT';
  payload: {
    polls: Poll[];
    questions: QAQuestion[];
  };
}

export type RealtimeMessage =
  | ChatRealtimeMessage
  | PollCreateRealtimeMessage
  | PollVoteRealtimeMessage
  | PollCloseRealtimeMessage
  | PollUpdateRealtimeMessage
  | QAAskRealtimeMessage
  | QAUpvoteRealtimeMessage
  | QAAnswerRealtimeMessage
  | QADeleteRealtimeMessage
  | StateRequestRealtimeMessage
  | StateSnapshotRealtimeMessage;

/**
 * Validates whether an incoming message payload matches the protocol format and permissions.
 * Optionally verifies against the actual verified transport participant ID and designated host ID.
 */
export function validateRealtimeMessage(
  raw: unknown,
  verifiedParticipantId?: string,
  verifiedHostId?: string
): RealtimeMessage | null {
  if (!raw || typeof raw !== 'object') return null;
  const msg = raw as Record<string, unknown>;

  if (msg.version !== PROTOCOL_VERSION) return null;
  if (typeof msg.webinarId !== 'string' || !msg.webinarId || msg.webinarId.length > 128) return null;
  if (typeof msg.senderId !== 'string' || !msg.senderId || msg.senderId.length > 128) return null;
  if (msg.senderRole !== 'host' && msg.senderRole !== 'viewer') return null;
  if (typeof msg.type !== 'string' || !msg.payload || typeof msg.payload !== 'object') return null;

  // Transport Identity Verification:
  // If verifiedParticipantId is provided (from LiveKit RemoteParticipant), senderId in payload must match
  if (verifiedParticipantId && msg.senderId !== verifiedParticipantId) {
    console.warn(`[Security Guard] Identity mismatch: payload senderId '${msg.senderId}' does not match transport ID '${verifiedParticipantId}'`);
    return null;
  }

  // Security role validation: host-only message types
  const hostOnlyTypes: RealtimeMessageType[] = ['POLL_CREATE', 'POLL_CLOSE', 'POLL_UPDATE', 'QA_ANSWER', 'QA_DELETE', 'STATE_SNAPSHOT'];
  if (hostOnlyTypes.includes(msg.type as RealtimeMessageType)) {
    // 1. Must claim host role
    if (msg.senderRole !== 'host') {
      console.warn(`[Security Guard] Rejected unauthorized host-only action '${msg.type}' from viewer '${msg.senderId}'`);
      return null;
    }

    // 2. If designated hostId is known, senderId must match verifiedHostId
    if (verifiedHostId && msg.senderId !== verifiedHostId) {
      console.warn(`[Security Guard] Rejected host-only action '${msg.type}' from unverified host '${msg.senderId}' (expected '${verifiedHostId}')`);
      return null;
    }
  }

  return raw as RealtimeMessage;
}

/**
 * Encodes a message for transmission over LiveKit Data Channel.
 */
export function encodeRealtimeMessage(message: RealtimeMessage): Uint8Array {
  const json = JSON.stringify(message);
  return new TextEncoder().encode(json);
}

/**
 * Decodes a raw binary buffer received from LiveKit Data Channel.
 */
export function decodeRealtimeMessage(
  data: Uint8Array,
  verifiedParticipantId?: string,
  verifiedHostId?: string
): RealtimeMessage | null {
  try {
    const text = new TextDecoder().decode(data);
    const parsed = JSON.parse(text);
    return validateRealtimeMessage(parsed, verifiedParticipantId, verifiedHostId);
  } catch (err) {
    console.error('Failed to decode realtime message:', err);
    return null;
  }
}
