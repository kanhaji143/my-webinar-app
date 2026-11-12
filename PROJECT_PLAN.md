# Project Plan: Live Webinar + Video Meeting SaaS Platform

## Status Overview
- **Current Phase**: Phase 0 - Project Foundation and Documentation (Active)
- **Target Architecture**: Combined Professional Webinar + Zoom-like Video Meeting SaaS
- **Development Strategy**: API-Free-First (Local DEMO implementation before external API credentials)

---

## Phased Development Roadmap

### Phase 0: Project Foundation and Documentation (Active)
- [x] Establish Permanent Project Development Rules & Governance structure (Commit `054c749`).
- [x] Initialize Git repository & baseline `.gitignore` configuration.
- [x] Formalize ADR-001 (Permanent Rules), ADR-002 (Combined Webinar & Meeting), ADR-003 (API-Free-First).
- [x] Consolidate master documentation and architecture specification.
- [ ] Await approval to initialize application scaffold.

### Phase 1: Core Application and Design System
- [ ] Initialize Next.js (App Router), TypeScript, Tailwind CSS, Lucide React setup.
- [ ] Setup Playwright E2E browser automation testing framework.
- [ ] Build global layout, navigation, and reusable UI design system tokens (buttons, badges, modals, tabs).
- [ ] Build Homepage (`/`) with quick actions: "Create Webinar" vs "Start Meeting".
- [ ] Build main Navigation & Platform Dashboard shell.
- *Dependencies*: Phase 0 completion.

### Phase 2: Webinar Management and Room UI
- [ ] Webinar creation flow with Title, Description, Scheduled Time, and Host details.
- [ ] Generate distinct Host Room URLs and Viewer Join URLs.
- [ ] Viewer registration page (`/join/[webinarId]`).
- [ ] Professional Host Room UI layout (Stage preview, host control bar, attendee panel, side panels).
- [ ] Clean Viewer Room UI layout (Broadcast viewer window, reaction bar, engagement side panels).
- *Dependencies*: Phase 1 design system.
- *Status*: UI-only / [DEMO] state transitions.

### Phase 3: Local Webinar Functionality (API-Free / DEMO)
- [ ] Browser camera & microphone access preview using standard Web MediaStream API (`navigator.mediaDevices`).
- [ ] Device selector controls (camera, microphone, speaker selection) with visual audio level indicator.
- [ ] Local Screen Share preview on Host Stage.
- [ ] Local [DEMO] Chat component (client-side state simulation).
- [ ] Local [DEMO] Polls component (host creation, simulated voting, instant visual results).
- [ ] Local [DEMO] Q&A component (submit questions, upvote, host answer state).
- [ ] Automated Playwright tests verifying camera preview controls, chat interactions, and poll voting.
- *Dependencies*: Phase 2 UI.
- *Note*: Clearly labelled [DEMO] local state; no multi-device synchronization claimed without real backend.

### Phase 4: LiveKit Webinar Integration (Real Infrastructure)
> *Gate: Requires explicit user approval and LiveKit credentials configuration.*
- [ ] Configure server-side LiveKit credentials via `.env.local` (`LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`).
- [ ] Implement secure server-side JWT token generation Next.js Route Handler (`/api/livekit/token`).
- [ ] Enforce RBAC permissions: Host (`canPublish: true`, admin rights), Viewer (`canPublish: false`, subscribe only).
- [ ] Connect LiveKit React Components (`LiveKitRoom`, `VideoConference`, `ParticipantTile`, audio/video tracks).
- [ ] Real-time Host broadcast to Viewers across separate browser sessions.
- [ ] Real-time screen share track publishing and subscribing.
- [ ] Playwright multi-page E2E test verifying Host broadcast and Viewer live playback.
- *Dependencies*: Phase 3 approval + LiveKit credentials.

### Phase 5: Chat, Polls and Q&A (Live Data Channels)
- [ ] Transition Chat from [DEMO] state to LiveKit real-time Data Packets / Data Channels.
- [ ] Synchronized multi-user Live Polls broadcasting across all connected room participants.
- [ ] Synchronized Q&A moderation flow (host pin question, answered list).
- [ ] Room reactions (floating emoji stream via lightweight data packets).
- *Dependencies*: Phase 4 LiveKit integration.

### Phase 6: Participant Management and Security
- [ ] Host controls: Mute participant, disable camera, remove participant.
- [ ] Raise hand queue with host-granted speaking permission ("invite to stage").
- [ ] Protected room routing with token verification and expiration handling.
- [ ] Audit room connection limits and participant eviction handling.
- *Dependencies*: Phase 4 & 5.

### Phase 7: Interactive Meeting Mode (Zoom-like)
- [ ] Meeting Room UI layout (`/meeting/[meetingId]`): Dynamic Gallery grid & Active Speaker view.
- [ ] Multi-participant simultaneous audio and video publishing for all approved peers.
- [ ] Waiting Room moderation flow (Host admit / deny entry queue).
- [ ] Meeting in-room chat and screen sharing toggle.
- [ ] Playwright multi-participant test simulation for gallery resizing and mute actions.
- *Dependencies*: Phase 4 engine.

### Phase 8: Recording and Playback
- [ ] LiveKit Egress / Cloud Recording integration architecture.
- [ ] Start / Stop recording controls with visual "REC" status indicator for Host and Viewers.
- [ ] Post-session recording list and secure playback page.
- *Dependencies*: Phase 4 & Phase 7.

### Phase 9: Authentication, Database and SaaS Readiness
- [ ] User authentication (OAuth / Email credentials) for Hosts and Organization admins.
- [ ] Database schema (Users, Organizations, Webinars, Meetings, Registrations, Recordings).
- [ ] Persistent webinar scheduling, historical session logs, and participant rosters.
- [ ] Role-based access control (Superadmin, Org Admin, Host, Guest Speaker, Viewer).
- *Dependencies*: Phase 8.

### Phase 10: Advanced Features and Analytics
- [ ] Real-time attendance duration tracking & engagement scoring.
- [ ] Post-webinar exportable analytics report (CSV/PDF attendee list, poll results, Q&A log).
- [ ] Custom branding (logos, theme accents, custom registration banners).
- *Dependencies*: Phase 9 persistence.

### Phase 11: Performance, Security and Production Readiness
- [ ] End-to-end Playwright regression test suite across all device viewports.
- [ ] Full security audit: XSS prevention, token leak checks, rate limiting on Route Handlers.
- [ ] Production build optimization, bundle analysis, and responsive layout verification.
- [ ] Final sign-off and deployment documentation.
- *Dependencies*: Phases 1 through 10.

---

## Feature Classification Matrix (DEMO vs REAL)

| Feature | Phase 1-3 (API-Free-First) | Phase 4+ (Integrated) |
| :--- | :--- | :--- |
| **Video / Audio** | [DEMO] Browser MediaStream local loopback preview | [REAL] LiveKit WebRTC multi-peer SFU broadcast |
| **Screen Share** | [DEMO] Browser `getDisplayMedia` local preview tile | [REAL] Real-time SFU published video track |
| **Chat** | [DEMO] Local in-memory / state-based chat simulation | [REAL] LiveKit Data Channel multi-client sync |
| **Polls** | [DEMO] Local client simulated votes | [REAL] Real-time distributed data broadcast |
| **Token Generation** | [DEMO] Mock participant identity & room ID | [REAL] Cryptographic server JWT with role claims |
| **Participant List** | [DEMO] Simulated sample attendees | [REAL] Live room participant roster & state sync |
