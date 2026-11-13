# Phase 5 Initial Audit Report: Real-Time Chat, Polls & Q&A

**Date:** 2026-11-13  
**Active Project Repository:** `E:\AI\Boot Camp 3.0\my-webinar-app`  
**Git Baseline Commit:** `1b7e845` (`fix(livekit): correct free monthly allowance to 5000 participant-minutes and update threshold tests`)  
**Git Branch:** `master`  
**Git Status:** Clean working tree  

---

## 1. Environment & Architecture Verification

1. **Git Root & Working Tree:**
   - Git repository verified at `E:\AI\Boot Camp 3.0\my-webinar-app`.
   - The reference inactive repository `Live-Webinar-Platform` remains completely isolated and untouched.
   - Working tree is clean on branch `master`.

2. **Accepted Governance Documents & Milestones:**
   - Acceptance baseline is Phase 4 (commit `1b7e845`).
   - Governance documents verified: `MASTER_PROJECT_GUIDE.md`, `PROJECT_PLAN.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `SECURITY_LOG.md`.
   - ADR-0001, ADR-0002, and ADR-0003 remain authoritative.
   - Database persistence belongs strictly to Phase 9. In Phase 5, all real-time session state is ephemeral/in-memory (synchronized across active room participants via LiveKit Data Channel messages and local stores).

3. **Existing Implementation Analysis:**
   - `src/lib/interactiveStore.ts`:
     - Currently provides in-memory local state using `useSyncExternalStore` and `localStorage` caching (`STORAGE_KEY = 'webinar_interactive_store_v1'`).
     - Contains types: `ChatMessage`, `Poll`, `PollOption`, `QAQuestion`, `SimulatedParticipant`.
     - Seed data provides initial items for demo mode (`webinar-101`).
     - Includes simulation timers for demo audience members.
   - `src/app/api/livekit/token/route.ts`:
     - Generates tokens using `livekit-server-sdk`.
     - Checks `process.env.LIVEKIT_ENABLED === 'true'`, returns HTTP 403 when unconfigured.
     - Role handling (`host` vs `viewer`): currently grants `canPublish: role === 'host'`, `canSubscribe: true`.
     - **Note for LiveKit Data Messages:** Both host and viewer need data publishing permission (`canPublishData: true`) so viewers can send chat messages, submit questions, and cast poll votes over the LiveKit data channel.
   - `src/components/LiveKitRoom.tsx`:
     - Creates `Room` instance and calls `connect()`.
     - Renders connection status and LiveKit live badge.

---

## 2. Real-Time Protocol Specification (Phase 5)

To synchronize Chat, Polls, and Q&A across participants in real-time without introducing a database (Phase 9):

1. **Transport Layer:**
   - **LiveKit Reliable Data Channel** (`DataPacket_Kind.RELIABLE` or `room.localParticipant.publishData(payload, { reliable: true, topic: 'webinar-interaction' })`).
   - **Local BroadcastChannel / Store fallback:** When LiveKit is disabled (`LIVEKIT_ENABLED !== 'true'`), fallback to browser-local state and optional tab-to-tab `BroadcastChannel` synchronization so multiple browser tabs on demo mode can interact.

2. **Wire Protocol & Event Typing:**
   Payload schema version `v1`:
   - `type: 'CHAT_MESSAGE'` (Host & Viewer): `{ id, sender, role, message, timestamp }`
   - `type: 'POLL_CREATE'` (Host-Authoritative): `{ poll: Poll }`
   - `type: 'POLL_VOTE'` (Viewer/Participant): `{ pollId, optionId, voterId }`
   - `type: 'POLL_CLOSE'` (Host-Authoritative): `{ pollId }`
   - `type: 'POLL_UPDATE'` (Host Broadcast): `{ poll: Poll }` (updated counts/percentages)
   - `type: 'QA_ASK'` (Viewer/Participant): `{ question: QAQuestion }`
   - `type: 'QA_UPVOTE'` (Viewer/Participant): `{ questionId, voterId }`
   - `type: 'QA_ANSWER'` (Host-Authoritative): `{ questionId, answerText }`
   - `type: 'QA_DELETE'` (Host-Authoritative moderation): `{ questionId }`
   - `type: 'STATE_REQUEST'` (Late Joiner): Sent by newly joined participant.
   - `type: 'STATE_SNAPSHOT'` (Host-Authoritative): Host sends current snapshot `{ polls, questions }` to catch up late joiners.

3. **Security & Role Validation:**
   - Incoming messages on the client must be validated against expected roles.
   - Viewers attempting to broadcast `POLL_CREATE`, `POLL_CLOSE`, `QA_ANSWER`, or `QA_DELETE` are rejected by recipients and ignored.
   - Duplicate voting per participant tracked via `userVotedOptionId` and voter ID sets.
   - `[DEMO]` and `[SIMULATED]` labels remain visually distinct from real participant interactions.

4. **Ephemeral State Clarification:**
   - Phase 5 session state lives in room memory.
   - No database persistence is promised or created.
   - Disconnecting without reconnecting drops session state unless refreshed from an active Host.

---

## 3. Implementation Plan

1. **Update LiveKit Token Route (`src/app/api/livekit/token/route.ts`):**
   - Ensure `canPublishData: true` is granted to both hosts and viewers in `AccessToken.addGrant()` so chat messages, votes, and Q&A submissions can be sent over data channels.

2. **Real-Time Interaction Service / Hook (`src/lib/realtimeInteraction.ts` / `useRealtimeWebinar.ts`):**
   - Wire event serialization, payload validation, and message parsing.
   - Connect to `RoomEvent.DataReceived` when LiveKit Room is connected.
   - Host authoritative state loopback: host updates state and broadcasts updates.
   - Handle late-joiner state request & snapshot reply.

3. **UI Integration:**
   - Host Studio (`src/app/webinar/host/[id]/page.tsx`):
     - Support Q&A moderation (delete question).
     - Hook real-time events into chat, polls, Q&A.
     - Keep demo indicators clear.
   - Viewer Room (`src/app/webinar/viewer/[id]/page.tsx`):
     - Hook real-time events into chat, polls, Q&A.
     - Prevent duplicate voting with responsive visual indicators.

4. **Testing Suite (`tests/phase5-realtime.spec.ts`):**
   - Chat validation and transmission.
   - Poll creation, real-time voting, duplicate vote restriction, poll closure.
   - Q&A submission, upvoting, answer marking, and host moderation.
   - Role permission enforcement (viewer cannot create polls or answer/delete questions).
   - Late joiner state synchronization.
   - Full regression across Phase 1–4 suites.
   - Real LiveKit connection remains marked BLOCKED.

5. **Documentation & Final Checks:**
   - Update `PROJECT_PLAN.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `CHANGELOG.md`, `AUDIT_LOG.md`, `SECURITY_LOG.md`.
   - Create `TEST_REPORTS/2026-11-13-phase-5-test-report.md`.
   - Run typecheck, lint, and build.
   - Git commit with clean status.
