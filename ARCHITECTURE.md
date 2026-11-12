# System Architecture: Live Webinar + Video Meeting SaaS Platform

## 1. High-Level Concept
The platform is an independent browser-based SaaS combining two distinct operational modes:
1. **Primary Mode (Professional Webinar):** One-to-many broadcast architecture with Host controls, viewer stage, moderated chat, live polls, and audience participation controls.
2. **Secondary Mode (Interactive Video Meeting):** Many-to-many conferencing architecture (Zoom-like) with multi-participant audio/video gallery grid, active speaker switching, waiting rooms, and peer collaboration.

---

## 2. Approved Technology Stack

| Layer | Approved Technology | Purpose & Architectural Justification |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | Unified modern SSR/SSG and client-side application router. |
| **Language** | TypeScript | Strong typing for room states, participant models, and token claims. |
| **Styling & Icons**| Tailwind CSS + Lucide React | High-performance styling and responsive enterprise icon set. |
| **Backend API** | Next.js Route Handlers (`app/api/*`)| Built-in serverless endpoints for token issuance, room management. *No separate Express or Fastify server is used.* |
| **Real-Time Engine**| LiveKit (Client, React, Server SDK)| WebRTC SFU-based real-time video, audio, screen share, and data packets. |
| **Testing Harness** | Playwright Test | Browser automation, visual validation, multi-tab E2E scenarios. |
| **Version Control**| Git | Clean branch management, atomic milestone commits, security safeguards. |

---

## 3. Application Routing & Structure

```
app/
├── (marketing)/
│   └── page.tsx                    # Homepage: Create Webinar / Start Meeting quick flows
├── dashboard/
│   └── page.tsx                    # Management Dashboard: scheduled sessions & recordings
├── webinar/
│   ├── new/page.tsx                # Webinar creation & configuration form
│   ├── join/[id]/page.tsx          # Viewer registration & pre-join lobby
│   ├── host/[id]/page.tsx          # Host broadcast room (Host controls, stage preview, moderation)
│   └── viewer/[id]/page.tsx        # Viewer broadcast room (Live player, chat, polls)
├── meeting/
│   └── [id]/page.tsx               # Interactive Meeting room (Gallery grid, speaker view, waiting room)
└── api/
    ├── livekit/
    │   └── token/route.ts          # Server-side LiveKit JWT generation with strict RBAC
    └── demo/                       # API-free mock endpoints for local simulation
```

---

## 4. Multi-Phase Architectural Strategy

### Phase A: API-Free-First Architecture (Active Foundation)
- **Local Media Capture:** Uses standard browser `navigator.mediaDevices.getUserMedia` and `getDisplayMedia` for real hardware camera/mic/screen tests without external service dependency.
- **Local State Management:** In-memory React state and local storage emulation for chat messages, poll questions/responses, and simulated attendee lists.
- **Clear Boundaries:** All demo components adhere to strictly typed TypeScript interfaces (`IChatMessage`, `IPoll`, `IParticipant`, `IRoomToken`) that mirror future LiveKit data channel payloads.

### Phase B: LiveKit Integrated Architecture (Post-Approval)
- **Signaling & SFU:** LiveKit SFU server orchestrates WebRTC media streams and binary/text data channels.
- **Server Token Generation:** Next.js Route Handler uses `livekit-server-sdk` with `AccessToken` and `VideoGrant`.
  - **Host Token:** `roomJoin: true`, `canPublish: true`, `canPublishData: true`, `canSubscribe: true`, `roomAdmin: true`.
  - **Viewer Token:** `roomJoin: true`, `canPublish: false`, `canPublishData: true`, `canSubscribe: true`.
  - **Meeting Participant Token:** `roomJoin: true`, `canPublish: true`, `canPublishData: true`, `canSubscribe: true`.
- **Data Channels:** Real-time chat, live polls, reactions, and room control signals routed over low-latency WebRTC data channels without database roundtrips.

---

## 5. Security & Boundary Architecture
- **Secret Isolation:** `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` reside exclusively in server-side runtime environments (`.env.local`). Zero exposure to browser bundles.
- **Client Boundary:** The browser interacts with LiveKit exclusively via ephemeral, short-lived JWT tokens containing signed participant identities and grant limits.
- **Permission Enforcement:** Viewers are strictly prohibited by SFU grants from publishing audio/video tracks unless promoted by the Host via server-validated permissions.
