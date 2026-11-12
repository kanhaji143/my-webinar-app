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
