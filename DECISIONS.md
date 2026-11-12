# Architecture Decision Records (ADR)

## ADR-0001: Adoption of Permanent Project Development Rules
- **Status**: Accepted
- **Date**: 2026-11-12
- **Context**: Establish rigorous engineering, testing, documentation, and version control guidelines for the project.
- **Decision**: Adopt the standards outlined in `MASTER_PROJECT_GUIDE.md` covering efficient workflows, full Playwright-based E2E verification, Git commit conventions, safety constraints, and standardized status reporting.
- **Consequences**: Consistent, auditable documentation and high test rigor across all future milestones.

---

## ADR-0002: Combined Webinar and Video Meeting Platform Architecture
- **Status**: Accepted
- **Date**: 2026-11-12
- **Context**: Users require both a professional one-to-many broadcast webinar experience (large stage, host control, attendee registration, moderated Q&A/polls) and an interactive many-to-many video conference experience (Zoom-like gallery, equal participant mic/camera, waiting rooms) within a unified SaaS offering.
- **Decision**: Architect a unified platform built on Next.js App Router, React, Tailwind CSS, Lucide React, and LiveKit that cleanly decouples two operating modes:
  1. **Primary Mode:** Professional Webinar Engine (`/webinar/*`).
  2. **Secondary Mode:** Interactive Video Meeting Engine (`/meeting/*`).
  Use Next.js Route Handlers for all server APIs without introducing a separate Express or Fastify server unless a documented architectural need arises.
- **Consequences**:
  - Reusable media devices, layout components, and token infrastructure across both modes.
  - Simplified deployment pipeline using Next.js native serverless capabilities.
  - Distinct UX patterns tailored for both passive large audiences (webinars) and collaborative working sessions (meetings).

---

## ADR-0003: API-Free-First Development Strategy
- **Status**: Accepted
- **Date**: 2026-11-12
- **Context**: Relying on external third-party streaming API credentials during early development causes development friction, potential billing exposure, security token risks, and tight coupling with third-party service availability.
- **Decision**: Implement an **API-Free-First** policy:
  1. Build the complete UI, design system, layouts, and workflows (Homepage, Dashboard, Webinar Creation, Viewer Registration, Host Room, Viewer Room, Meeting Room) using standard browser APIs (`navigator.mediaDevices` for hardware camera/mic loopback) and explicitly labelled **DEMO** components.
  2. Implement simulated local chat, local polls, and mock participants with modular TypeScript interfaces.
  3. Validate all flows and interactions using automated Playwright tests before introducing external APIs.
  4. Integrate LiveKit credentials and real-time streaming infrastructure strictly in Phase 4 after explicit approval.
- **Consequences**:
  - Fast, self-contained local development and rapid visual iteration without API costs.
  - Test suites can run fully offline and deterministically in CI environments.
  - Interfaces are decoupled from streaming vendors, simplifying future real-time wiring.
