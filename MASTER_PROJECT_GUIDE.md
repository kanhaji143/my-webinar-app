# Live Webinar + Video Meeting SaaS Platform - Master Project Guide

## Overview
This document serves as the master guide and single source of truth for the **Live Webinar + Video Meeting SaaS Platform** project.

---

## 1. Product Vision & Architecture

The platform is an independent browser-based SaaS combining two operating modes:

### Primary Mode: Professional Webinar Platform
- **Roles:** Host and Viewer roles.
- **Webinar Lifecycle:** Creation, scheduling, lifecycle state transitions.
- **Registration:** Viewer registration and join flow.
- **Stage & Controls:** Host media controls, screen sharing, broadcast stage.
- **Engagement:** Real-time chat, moderated Q&A, and live polls.
- **Management:** Audience management, attendance tracking, and engagement metrics.

### Secondary Mode: Interactive Video Meeting Platform (Zoom-like)
- **Multi-participant:** Simultaneous camera and microphone for attendees.
- **Layouts:** Dynamic gallery view and active speaker view.
- **Collaboration:** Screen sharing, meeting chat, raise hand, emoji reactions.
- **Control:** Participant management (mute/remove), waiting room moderation.

---

## 2. Approved Technology Stack

- **Framework:** Next.js (App Router)
- **UI & Components:** React, Tailwind CSS, Lucide React
- **Language:** TypeScript
- **Backend / API:** Next.js Route Handlers (`app/api/*`)
  > *Constraint: No separate Express or Fastify server unless a documented architectural reason emerges and is formally approved.*
- **Real-Time Video / Audio / Data Engine:** LiveKit (LiveKit Server SDK, LiveKit React Components, LiveKit Client SDK)
- **Testing & Browser Automation:** Playwright Test
- **Version Control:** Git

---

## 3. Core Development Principles

### API-Free-First Policy
All UI layouts, flows, and interactive components are developed and verified before requiring external API credentials or third-party service connections:
- Build complete UI surfaces: Homepage, Dashboard, Creation, Registration, Host Room, Viewer Room, Meeting Room.
- Implement clearly labelled **DEMO** implementations for chat, polls, camera/mic browser preview, and participant management.
- Do not claim local demo data is shared between different devices or sessions.
- Prepare clean, modular interfaces for seamless transition to live backends.

### Future LiveKit Integration Policy
LiveKit real-time engine integration will occur strictly after API-free development is complete and explicitly approved:
- Configure LiveKit credentials securely via server-side environment variables.
- Generate secure server-side JWT tokens via Next.js Route Handlers.
- Implement real-time media tracks, screen sharing, and data channels.
- **Security Rule:** Never expose LiveKit API secrets to client-side/browser code.

---

## 4. Permanent Project Development Rules

### Development Philosophy
- Work efficiently and avoid unnecessary repetitive steps.
- Do not divide related tasks into unnecessarily small steps.
- Complete all approved related tasks together.
- Never repeat an already completed audit without a valid reason.
- Maintain a clear record of every important operation.

### Documentation Requirements
The following documents must be maintained and updated after every approved phase:
- `MASTER_PROJECT_GUIDE.md`: Project master reference, standards, and rules.
- `PROJECT_PLAN.md`: Roadmap, milestones, phases, and status tracking.
- `ARCHITECTURE.md`: System design, tech stack, data flow, and components.
- `DECISIONS.md`: Architectural Decision Records (ADR).
- `AUDIT_LOG.md`: System audits, code reviews, and dependency checks.
- `CHANGELOG.md`: Chronological log of notable additions, changes, and fixes.
- `SECURITY_LOG.md`: Security considerations, vulnerability scans, and auth configurations.
- `BUG_TRACKER.md`: Logged bugs, steps to reproduce, root causes, and resolutions.
- `DEPLOYMENT_LOG.md`: Environments, deployment procedures, releases, and rollbacks.
- `TEST_REPORTS/`: Playwright test results, coverage, execution logs, and screenshots.

### Testing Requirements
- Use **Playwright** for browser automation and end-to-end testing.
- Capture screenshots and failure logs.
- Maintain reproducible test cases.
- Run regression tests after significant changes.
- Use Python only when it provides a practical benefit.

### Version Control
- Use Git for change tracking.
- Create meaningful commits after verified milestones.
- Never commit `.env` files, credentials, or secrets.
- Keep a clean and recoverable project history.

### Approval & Safety
- No unapproved production deployment.
- No unapproved paid subscriptions or billing.
- No destructive database or file operations without permission.
- Do not claim a feature is complete without test evidence.
- Report failures honestly.

### Communication Standard
Progress reports follow this structured format:
1. **Completed**: Finished tasks and implementation details.
2. **Tested and Passed**: Verification results with test evidence.
3. **Failed**: Blockers, test failures, or defects found.
4. **Pending**: Next steps and upcoming queue.
5. **Decisions Required**: Items needing user approval or clarification.
