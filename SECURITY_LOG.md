# Security Log

## Security Baseline & Policies
- **Secret Management**: No secrets, `.env` files, or API credentials will ever be committed to source control.
- **Client Security Boundary**: LiveKit API credentials (`LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`) must never be bundled into or accessible by client-side browser code.
- **Access Control & RBAC**: Strict separation of token privileges:
  - Webinar Host: Publisher + Admin permissions.
  - Webinar Viewer: Subscriber-only permissions.
  - Meeting Participants: Controlled publisher permissions with moderator override.
- **Media Security**: Tokenized room access and secure media channel transport (WebSockets over TLS, SRTP / WebRTC encryption).

## Security Incidents & Audits
| Date | Item Checked | Severity | Status / Resolution |
| :--- | :--- | :--- | :--- |
| 2026-11-12 | Git credential & .env exclusion check | Critical | Configured comprehensive `.gitignore` |
| 2026-11-12 | Architectural Secret Isolation Review | Critical | Defined strict server-side JWT generation policy for Phase 4; confirmed zero external credentials present or required for Phases 0-3. |
| 2026-11-12 | Phase 3 Media Privacy & Zero-Leak Audit | High | Verified local camera and mic access requires explicit user interaction (no auto-start); verified all MediaStreamTracks are immediately terminated on component unmount; verified no media data, frames, audio, or credentials are saved to localStorage or sent to external endpoints. |
| 2026-11-13 | Phase 4 Server-Only Credentials & Token Guard | Critical | Verified `LIVEKIT_API_SECRET` and `LIVEKIT_API_KEY` are isolated strictly within server route handler `/api/livekit/token`. Token route enforces `LIVEKIT_ENABLED=true` guard; returns HTTP 403 when disabled. |
| 2026-11-13 | Phase 5 Real-Time Role Authorization Guard | High | Enforced host-authoritative message verification (`validateRealtimeMessage`). Viewers cannot forge or execute `POLL_CREATE`, `POLL_CLOSE`, `QA_ANSWER`, or `QA_DELETE` events. Real-time data payloads strictly validated and sanitized. |
| 2026-11-13 | Phase 5 Final Security Audit Remediation | Critical | Strengthened token endpoint (`/api/livekit/token`) with room/identity string sanitization and host role authentication gate (`hostPasscode`). Enhanced `realtimeProtocol.ts` and `useRealtimeWebinar.ts` with transport identity binding (`participant.identity === msg.senderId`) to eliminate impersonation. Added 5 automated security tests passing 100%. |
| 2026-11-13 | Phase 5 Fail-Closed Host Token Authorization Gate | Critical | Resolved BUG-011 in `/api/livekit/token`. Fixed permissive fallback when `LIVEKIT_HOST_PASSCODE` was unconfigured: endpoint now strictly fails closed (HTTP 503) if host passcode is unconfigured, HTTP 401 if incorrect, and HTTP 200 only upon valid verification. Viewers remain unblocked without passcode. Expanded security test suite to 6 automated tests. Added explicit security advisory that BroadcastChannel is strictly for local demo/inter-tab sync, not multi-user security. |
