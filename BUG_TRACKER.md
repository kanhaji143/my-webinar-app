# Bug Tracker

All defects, test failures, regressions, and security anomalies are logged here.

| ID | Description | Severity | Found In | Status | Resolution Summary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| BUG-001 | Next.js 16 prerender error from `new Date()` in Client Component (`Footer.tsx`). | Medium | Phase 1 Build | Resolved | Replaced runtime `new Date().getFullYear()` with constant 2026. |
| BUG-002 | Next.js 16 Partial Prerendering failure due to `params` access outside `<Suspense>`. | High | Phase 1 Build | Resolved | Wrapped all dynamic route page contents (`/meeting/[id]`, `/webinar/host/[id]`, `/webinar/viewer/[id]`, `/webinar/join/[id]`) in React `<Suspense>`. |
| BUG-003 | Test harness failed on port 3000 due to collision with running host process PID 10300. | Medium | Playwright E2E | Resolved | Configured Playwright and Next start command to run isolated on dedicated port 3030. |
| BUG-004 | React 19 ESLint error `react-hooks/set-state-in-effect` in `LanguageContext.tsx`. | Medium | ESLint Check | Resolved | Replaced `useEffect` setState with `useSyncExternalStore` for clean client synchronization. |
| BUG-005 | Horizontal viewport overflow on mobile viewports (<400px) caused by `DemoBanner` and `Navbar`. | Medium | Playwright Viewports | Resolved | Added `flex-wrap`, `break-words`, and global `overflow-x: hidden`. |
| BUG-006 | `Badge` component did not forward `...props` (`HTMLAttributes<HTMLSpanElement>`), causing Playwright `data-testid` queries to miss rendered status badges. | Low | Phase 2 Playwright | Resolved | Added `...props` forwarding to `<span>` root in `src/components/Badge.tsx`. |
| BUG-007 | Ad-hoc dynamic session IDs in Phase 1 regression test (`session-e2e-test`) failed in `registerAttendee` with "not found" error. | Medium | Phase 2 Regression | Resolved | Implemented client-side auto-provisioning fallback for ad-hoc demo session IDs in `webinarStore.ts`. |
| BUG-008 | Chromium launch flag `--auto-accept-camera-and-microphone-capture` caused `chrome-headless-shell` to crash on Windows. | High | Phase 3 Playwright | Resolved | Removed unsupported CLI argument; used standard `--use-fake-ui-for-media-stream` and Playwright context permissions. |
| BUG-009 | React 19 ESLint flagged ref access during render and synchronous `setState` in `useLocalMedia.ts`. | Medium | ESLint Check | Resolved | Shifted ref updates to callback/effect flows and converted device enumeration to async `.then()` resolution. |
| BUG-010 | Strict mode violation in Playwright Q&A test due to duplicate "Answered by Host:" label across pre-seeded and user-answered items. | Low | Phase 3 Playwright | Resolved | Scoped assertions using specific test item locators and `.first()`. |
| BUG-011 | Permissive host token issuance when `LIVEKIT_HOST_PASSCODE` was unconfigured in standalone/pre-auth mode. | Critical | Phase 5 Security Audit | Resolved | Enforced fail-closed validation: returns HTTP 503 if passcode unconfigured on server, HTTP 401 if invalid, HTTP 200 only with valid passcode. Viewers never require host passcode. |
