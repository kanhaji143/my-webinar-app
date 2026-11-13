# Changelog

All notable changes to the Live Webinar + Video Meeting SaaS Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
### Added
- **Phase 5: Real-Time Chat, Polls & Q&A Protocol & Permissions**:
  - Implemented real-time interaction wire protocol (`src/lib/realtimeProtocol.ts`) with typed schemas for Chat, Polls, and Q&A over LiveKit Reliable Data Channels (`TOPIC_INTERACTION = 'webinar-interaction'`).
  - Added multi-tab demo synchronization hook (`src/hooks/useRealtimeWebinar.ts`) utilizing `BroadcastChannel` when running without LiveKit Cloud.
  - Implemented client-side security guards (`validateRealtimeMessage`) preventing viewers from issuing host-authoritative actions (`POLL_CREATE`, `POLL_CLOSE`, `POLL_UPDATE`, `QA_ANSWER`, `QA_DELETE`, `STATE_SNAPSHOT`).
  - Added Q&A moderation control in Host Studio allowing hosts to remove inappropriate questions.
  - Added duplicate vote prevention in Viewer Room with visual indicator (`[VOTED]`).
  - Late joiner state snapshot request/response flow catching up viewers to currently active polls and questions.
  - Full Playwright test coverage (`tests/phase5-realtime.spec.ts`) passing 46/48 total tests (with 2 expected credential-blocked tests).
- **Phase 4: LiveKit Webinar Integration Foundation**:
  - Integrated official `livekit-client` and `livekit-server-sdk` dependencies with strict cost guards.
  - Added token route handler (`src/app/api/livekit/token/route.ts`) enforcing `LIVEKIT_ENABLED` flag and server-only credential isolation.
  - Built usage tracking utilities (`src/lib/livekitUsage.ts`) with 5,000 participant-minute free tier cap and 70%, 85%, and 95% warning tiers.
  - Added `LiveKitUsageBanner.tsx` and Host Studio LiveKit integration.
- **Phase 3: Local Webinar Functionality (API-Free / DEMO)**:
  - Browser-native camera and microphone hook (`src/hooks/useLocalMedia.ts`) utilizing standard Web MediaStream API (`navigator.mediaDevices.getUserMedia()`).
  - Safe media control lifecycle: camera toggling, mic muting, dynamic track additions/removals, Web Audio API analyser audio-level detection, and mandatory component unmount cleanup (`track.stop()`) preventing memory or device leaks.
  - Native local video preview in Host Studio (`<video autoPlay playsInline muted />`) rendering genuine local webcam stream when active, and reverting to standby placeholder when inactive.
  - Native display capture (`navigator.mediaDevices.getDisplayMedia()`) powering local screen sharing with track end-event handling and picture-in-picture host camera integration.
  - Device Diagnostics & Settings modal (`src/components/DeviceSettingsModal.tsx`) allowing audio and video input device selection (`enumerateDevices()`) and live microphone level bar.
  - Reactive interactive state store (`src/lib/interactiveStore.ts`) supporting local Chat message feeds, Poll creation and real-time audience voting with percentage bars, and Q&A submission, upvoting, and host response tagging.
  - Controlled simulated participant list clearly tagged `[SIMULATED ATTENDEE]` displayed alongside real local store registrations.
  - Complete English and Hindi bilingual coverage for all hardware permissions, device settings, polls, and Q&A elements in `src/lib/i18n.ts`.
  - Comprehensive Playwright test suite (`tests/phase3-local-functionality.spec.ts`) with 14 automated tests covering camera/mic toggling, loopback video verification, screen sharing, device modals, polls, Q&A, chat, cleanup, and 5 responsive viewports (320px, 375px, 768px, 1024px, 1440px). Full suite now passes 40/40 tests.
- **Phase 2: Webinar Management & Room UI**:
  - Centralized client-side state store (`src/lib/webinarStore.ts`) implementing robust reactive subscriptions via `useSyncExternalStore` and localStorage persistence.
  - Full webinar lifecycle state machine enforcing strict transitions: `DRAFT` → `SCHEDULED` → `LIVE` → `ENDED`, with protection against invalid transitions (e.g. DRAFT directly to LIVE, or transitioning ENDED sessions).
  - Enhanced Webinar Creation Studio (`/webinar/new`): Added Host Name, Duration, Timezone, and advanced settings (auto-record, mute-on-entry, Q&A toggle) with dual actions: "Save as Draft" and "Schedule Webinar".
  - Upgraded Platform Dashboard (`/dashboard`): Implemented instant search, status filter pills (`ALL`, `SCHEDULED`, `LIVE`, `DRAFT`, `ENDED`), direct lifecycle action buttons (Publish Draft, Go Live Now, End Broadcast), and attendee count indicators.
  - Dynamic Webinar Registration Gate (`/webinar/join/[id]`): Displays schedule, host profile, timezone, and live status. Enforces lifecycle business rules: blocks registration for `DRAFT` and `ENDED` sessions with clear guidance, and seamlessly accepts attendee registrations for `SCHEDULED` and `LIVE` webinars.
  - Broadcast Host Studio (`/webinar/host/[id]`): Features live status telemetry, dynamic participant counter linked to store registrations, real-time lifecycle controls ("Go Live [DEMO]", "End Broadcast"), presenter media preview, and sidebar tabs for simulated Chat, Attendee Roster, Q&A, Polls, and Recording controls.
  - Viewer Auditorium (`/webinar/viewer/[id]`): Dynamic stage displaying standby notice for `SCHEDULED` sessions, active receiver for `LIVE` broadcasts, and concluded notice for `ENDED` webinars.
  - Full bilingual expansion in `src/lib/i18n.ts` covering all Phase 2 lifecycle states, dashboard filter pills, creation options, and studio/viewer notices in English (`EN`) and Hindi (`हिंदी`).
  - Comprehensive Playwright test suite (`tests/phase2-webinar-management.spec.ts`) with 12 end-to-end tests covering validation, draft vs scheduled creation, dashboard search and filtering, registration status gates, host lifecycle transitions, viewer stage responsiveness, language switching, and 5 viewport tiers (320px, 375px, 768px, 1024px, 1440px). All 26 suite tests (14 Phase 1 + 12 Phase 2) pass cleanly.
- **Phase 1: Project Scaffolding & Design System Foundation**:
  - Initialized Next.js 16 (App Router), React 19, TypeScript strict, and Tailwind CSS 4 foundation.
  - Installed `lucide-react` icon system and `@playwright/test` verification framework.
  - Built unified SaaS design system with dark-mode palette distinguishing Primary Webinar mode (indigo) from Secondary Meeting mode (teal).
  - Implemented bilingual architecture supporting English and Hindi (`EN` / `हिंदी`) with instant client-side toggling and localStorage persistence.
  - Implemented 7 initial application routes:
    - `/`: Product landing page featuring dual-mode overview, feature badges, and primary action CTAs.
    - `/dashboard`: Main user dashboard with webinar-first navigation, interactive meeting entry, and sample demo cards.
    - `/webinar/new`: Webinar creation studio with client-side validation and simulated access link generation.
    - `/webinar/join/[id]`: Webinar registration gate with name/email validation and viewer entry transition.
    - `/webinar/host/[id]`: Host broadcast studio with stage feed, broadcast toggle, mic/camera controls, simulated attendee roster, and demo chat.
    - `/webinar/viewer/[id]`: Audience viewing auditorium with stage receiver, raise hand toggle, audio controls, and interactive demo Q&A feed.
    - `/meeting/[id]`: Interactive video meeting room with 4-up responsive participant gallery, active speaker highlight, and collaboration controls.
  - Set up automated Playwright test suite (`tests/phase1-foundation.spec.ts`) validating 14 test cases across all routes, navigation, language switching, and responsive viewports (320px, 375px, 768px, 1024px, 1440px).
  - Isolated test harness server on dedicated port 3030 to prevent port collisions.
  - All features verified strictly in API-Free demo mode without external credentials or media servers.

- Consolidated master product vision combining Primary (Professional Webinar) and Secondary (Interactive Video Meeting) platforms.
- Formalized ADR-0002: Combined Webinar and Video Meeting Platform Architecture.
- Formalized ADR-0003: API-Free-First Development Strategy.
- Established 12-phase development roadmap (Phases 0 through 11) with clear dependency chains and DEMO vs. REAL feature classification.
- Updated system architecture to Next.js App Router, Route Handlers, TypeScript, Tailwind CSS, Lucide React, and modular LiveKit integration contracts.
- Strengthened security guidelines regarding server-side secret isolation and client-side token generation.

### Changed
- Refactored `MASTER_PROJECT_GUIDE.md`, `PROJECT_PLAN.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `SECURITY_LOG.md`, and `AUDIT_LOG.md` to reflect unified product architecture and API-Free-First rules.

---

## [0.1.0] - 2026-11-12
### Added
- Repository initialization with permanent project development standards (Commit `054c749`).
- Core governance files: `MASTER_PROJECT_GUIDE.md`, `PROJECT_PLAN.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `AUDIT_LOG.md`, `CHANGELOG.md`, `SECURITY_LOG.md`, `BUG_TRACKER.md`, `DEPLOYMENT_LOG.md`, `TEST_REPORTS/`.
- Baseline `.gitignore` to protect against credential, environment, and cache leaks.
