'use client';

/**
 * useRealtimeWebinar Hook (Phase 5)
 * Coordinates real-time Chat, Polls, and Q&A across participants.
 * Integrates with LiveKit reliable data channels when connected,
 * and maintains seamless sync with local interactiveStore and demo mode.
 */

import { useEffect, useRef, useCallback } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import {
  RealtimeMessage,
  decodeRealtimeMessage,
  encodeRealtimeMessage,
  TOPIC_INTERACTION,
  PROTOCOL_VERSION,
} from '@/lib/realtimeProtocol';
import { useInteractiveStore, Poll, QAQuestion, ChatMessage, SimulatedParticipant } from '@/lib/interactiveStore';

interface UseRealtimeWebinarOptions {
  webinarId: string;
  userId: string;
  role: 'host' | 'viewer';
  livekitRoom?: Room | null;
}

export function useRealtimeWebinar({
  webinarId,
  userId,
  role,
  livekitRoom,
}: UseRealtimeWebinarOptions) {
  const store = useInteractiveStore(webinarId);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Broadcast helper
  const sendRealtimeMessage = useCallback(
    async (partialMsg: Omit<RealtimeMessage, 'version' | 'webinarId' | 'senderId' | 'senderRole' | 'timestamp'>) => {
      const fullMsg: RealtimeMessage = {
        ...partialMsg,
        version: PROTOCOL_VERSION,
        webinarId,
        senderId: userId,
        senderRole: role,
        timestamp: new Date().toISOString(),
      } as RealtimeMessage;

      // 1. LiveKit Data Channel broadcast if connected
      if (livekitRoom && livekitRoom.state === 'connected') {
        try {
          const bytes = encodeRealtimeMessage(fullMsg);
          // Cast Uint8Array buffer to standard ArrayBuffer required by livekit-client
          await livekitRoom.localParticipant.publishData(bytes as unknown as Uint8Array<ArrayBuffer>, {
            reliable: true,
            topic: TOPIC_INTERACTION,
          });
        } catch (err) {
          console.warn('[Realtime] Failed to publish data over LiveKit:', err);
        }
      }

      // 2. BroadcastChannel broadcast for multi-tab demo mode
      if (broadcastChannelRef.current) {
        try {
          broadcastChannelRef.current.postMessage(fullMsg);
        } catch (err) {
          console.warn('[Realtime] BroadcastChannel send error:', err);
        }
      }
    },
    [webinarId, userId, role, livekitRoom]
  );

  // Handle incoming validated message
  const handleIncomingMessage = useCallback(
    (msg: RealtimeMessage) => {
      if (msg.webinarId !== webinarId) return;

      switch (msg.type) {
        case 'CHAT_MESSAGE': {
          store.addChatMessage(msg.payload.sender, msg.payload.role === 'host' ? 'host' : 'viewer', msg.payload.message);
          break;
        }

        case 'POLL_CREATE': {
          // Host authoritative
          if (msg.senderRole === 'host') {
            store.setPollSnapshot([msg.payload, ...store.polls.filter((p: Poll) => p.id !== msg.payload.id)]);
          }
          break;
        }

        case 'POLL_VOTE': {
          // If this node is host, record vote and broadcast updated poll
          if (role === 'host') {
            store.voteInPoll(msg.payload.pollId, msg.payload.optionId);
            const updated = store.polls.find((p: Poll) => p.id === msg.payload.pollId);
            if (updated) {
              sendRealtimeMessage({
                type: 'POLL_UPDATE',
                payload: updated,
              });
            }
          }
          break;
        }

        case 'POLL_UPDATE': {
          if (msg.senderRole === 'host') {
            const next = store.polls.map((p: Poll) => (p.id === msg.payload.id ? msg.payload : p));
            if (!next.some((p: Poll) => p.id === msg.payload.id)) {
              next.unshift(msg.payload);
            }
            store.setPollSnapshot(next);
          }
          break;
        }

        case 'POLL_CLOSE': {
          if (msg.senderRole === 'host') {
            store.endPoll(msg.payload.pollId);
          }
          break;
        }

        case 'QA_ASK': {
          // Add question to list if not existing
          if (!store.questions.some((q: QAQuestion) => q.id === msg.payload.id)) {
            store.setQASnapshot([msg.payload, ...store.questions]);
          }
          break;
        }

        case 'QA_UPVOTE': {
          store.upvoteQuestion(msg.payload.questionId);
          break;
        }

        case 'QA_ANSWER': {
          if (msg.senderRole === 'host') {
            store.answerQuestion(msg.payload.questionId, msg.payload.answerText);
          }
          break;
        }

        case 'QA_DELETE': {
          if (msg.senderRole === 'host') {
            store.deleteQuestion(msg.payload.questionId);
          }
          break;
        }

        case 'STATE_REQUEST': {
          // If host receives state request from late joiner, reply with current snapshot
          if (role === 'host') {
            sendRealtimeMessage({
              type: 'STATE_SNAPSHOT',
              payload: {
                polls: store.polls,
                questions: store.questions,
              },
            });
          }
          break;
        }

        case 'STATE_SNAPSHOT': {
          if (msg.senderRole === 'host') {
            if (msg.payload.polls) store.setPollSnapshot(msg.payload.polls);
            if (msg.payload.questions) store.setQASnapshot(msg.payload.questions);
          }
          break;
        }
      }
    },
    [webinarId, role, store, sendRealtimeMessage]
  );

  // Set up BroadcastChannel for local/demo cross-tab sync
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

    const channelName = `webinar_realtime_${webinarId}`;
    const bc = new BroadcastChannel(channelName);
    broadcastChannelRef.current = bc;

    bc.onmessage = (event) => {
      const msg = event.data as RealtimeMessage;
      // Do not process messages sent by ourselves
      if (msg && msg.senderId !== userId) {
        handleIncomingMessage(msg);
      }
    };

    // Late joiner state request
    if (role === 'viewer') {
      bc.postMessage({
        version: PROTOCOL_VERSION,
        webinarId,
        senderId: userId,
        senderRole: role,
        type: 'STATE_REQUEST',
        payload: { requesterId: userId },
        timestamp: new Date().toISOString(),
      });
    }

    return () => {
      bc.close();
      broadcastChannelRef.current = null;
    };
  }, [webinarId, userId, role, handleIncomingMessage]);

  // Set up LiveKit Room DataReceived listener
  useEffect(() => {
    if (!livekitRoom) return;

    const onDataReceived = (payload: Uint8Array, participant?: unknown, kind?: unknown, topic?: string) => {
      if (topic && topic !== TOPIC_INTERACTION) return;
      const msg = decodeRealtimeMessage(payload);
      if (msg && msg.senderId !== userId) {
        handleIncomingMessage(msg);
      }
    };

    livekitRoom.on(RoomEvent.DataReceived, onDataReceived);

    // If connected as viewer, send state request over LiveKit
    if (livekitRoom.state === 'connected' && role === 'viewer') {
      sendRealtimeMessage({
        type: 'STATE_REQUEST',
        payload: { requesterId: userId },
      });
    }

    return () => {
      livekitRoom.off(RoomEvent.DataReceived, onDataReceived);
    };
  }, [livekitRoom, userId, role, handleIncomingMessage, sendRealtimeMessage]);

  // Public facade methods
  const broadcastChat = useCallback(
    (sender: string, chatRole: 'host' | 'viewer', text: string) => {
      const res = store.addChatMessage(sender, chatRole, text);
      if (res) {
        sendRealtimeMessage({
          type: 'CHAT_MESSAGE',
          payload: res,
        });
      }
      return res;
    },
    [store, sendRealtimeMessage]
  );

  const broadcastPollCreate = useCallback(
    (question: string, options: string[]) => {
      if (role !== 'host') return null;
      const poll = store.createPoll(question, options);
      if (poll) {
        sendRealtimeMessage({
          type: 'POLL_CREATE',
          payload: poll,
        });
      }
      return poll;
    },
    [role, store, sendRealtimeMessage]
  );

  const broadcastPollVote = useCallback(
    (pollId: string, optionId: string) => {
      const ok = store.voteInPoll(pollId, optionId);
      if (ok) {
        sendRealtimeMessage({
          type: 'POLL_VOTE',
          payload: { pollId, optionId, voterId: userId },
        });
      }
      return ok;
    },
    [userId, store, sendRealtimeMessage]
  );

  const broadcastPollClose = useCallback(
    (pollId: string) => {
      if (role !== 'host') return false;
      const ok = store.endPoll(pollId);
      if (ok) {
        sendRealtimeMessage({
          type: 'POLL_CLOSE',
          payload: { pollId },
        });
      }
      return ok;
    },
    [role, store, sendRealtimeMessage]
  );

  const broadcastAskQuestion = useCallback(
    (author: string, question: string) => {
      const q = store.askQuestion(author, question);
      if (q) {
        sendRealtimeMessage({
          type: 'QA_ASK',
          payload: q,
        });
      }
      return q;
    },
    [store, sendRealtimeMessage]
  );

  const broadcastUpvoteQuestion = useCallback(
    (qId: string) => {
      const ok = store.upvoteQuestion(qId);
      if (ok) {
        sendRealtimeMessage({
          type: 'QA_UPVOTE',
          payload: { questionId: qId, voterId: userId },
        });
      }
      return ok;
    },
    [userId, store, sendRealtimeMessage]
  );

  const broadcastAnswerQuestion = useCallback(
    (qId: string, answerText: string) => {
      if (role !== 'host') return false;
      const ok = store.answerQuestion(qId, answerText);
      if (ok) {
        sendRealtimeMessage({
          type: 'QA_ANSWER',
          payload: { questionId: qId, answerText },
        });
      }
      return ok;
    },
    [role, store, sendRealtimeMessage]
  );

  const broadcastDeleteQuestion = useCallback(
    (qId: string) => {
      if (role !== 'host') return false;
      const ok = store.deleteQuestion(qId);
      if (ok) {
        sendRealtimeMessage({
          type: 'QA_DELETE',
          payload: { questionId: qId },
        });
      }
      return ok;
    },
    [role, store, sendRealtimeMessage]
  );

  return {
    ...store,
    broadcastChat,
    broadcastPollCreate,
    broadcastPollVote,
    broadcastPollClose,
    broadcastAskQuestion,
    broadcastUpvoteQuestion,
    broadcastAnswerQuestion,
    broadcastDeleteQuestion,
  };
}
