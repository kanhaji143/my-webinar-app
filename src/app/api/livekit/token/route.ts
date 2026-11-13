import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

/**
 * POST /api/livekit/token
 * Body JSON: { room: string, identity: string, role: 'host' | 'viewer' }
 * Returns: { token: string }
 *
 * LiveKit integration is gated by the environment variable LIVEKIT_ENABLED.
 * If disabled, the endpoint returns 403.
 * All required LiveKit credentials must be provided via environment variables.
 */
export async function POST(req: NextRequest) {
  // Guard: LiveKit must be explicitly enabled.
  if (process.env.LIVEKIT_ENABLED !== 'true') {
    return NextResponse.json(
      { error: 'LiveKit integration is disabled. Set LIVEKIT_ENABLED=true to enable.' },
      { status: 403 }
    );
  }

  const { room, identity, role, hostPasscode } = await req.json();

  // Basic validation.
  if (!room || typeof room !== 'string' || room.trim().length === 0 || room.length > 128) {
    return NextResponse.json({ error: 'Invalid or missing room identifier.' }, { status: 400 });
  }
  if (!identity || typeof identity !== 'string' || identity.trim().length === 0 || identity.length > 128) {
    return NextResponse.json({ error: 'Invalid or missing participant identity.' }, { status: 400 });
  }
  if (!['host', 'viewer'].includes(role)) {
    return NextResponse.json({ error: "Invalid role. Must be 'host' or 'viewer'." }, { status: 400 });
  }

  // Security Guard: Fail-Closed Host Authorization
  // Never issue a host token when host authorization is not configured on the server.
  // In pre-auth / standalone mode before Phase 9 Database & Auth, LIVEKIT_HOST_PASSCODE is mandatory for role: 'host'.
  if (role === 'host') {
    const requiredPasscode = process.env.LIVEKIT_HOST_PASSCODE;
    if (!requiredPasscode || requiredPasscode.trim().length === 0) {
      return NextResponse.json(
        { error: 'Host authorization is not configured on this server. Set LIVEKIT_HOST_PASSCODE.' },
        { status: 503 }
      );
    }
    if (hostPasscode !== requiredPasscode) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid host authorization credentials.' },
        { status: 401 }
      );
    }
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const serverUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !serverUrl) {
    return NextResponse.json(
      { error: 'LiveKit credentials are not configured. Set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET.' },
      { status: 500 }
    );
  }

  try {
    const ttl = 2 * 60 * 60; // 2 hours in seconds.
    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      ttl,
    });

    // Grant permissions based on role.
    at.addGrant({
      room: room,
      // Host can publish media (video/audio); viewer cannot.
      canPublish: role === 'host',
      // Both host and viewer need data publishing permissions for chat, polls, and Q&A.
      canPublishData: true,
      canSubscribe: true,
      // Enable room join (required for both).
      roomJoin: true,
    });

    const token = at.toJwt();
    return NextResponse.json({ token }, { status: 200 });
  } catch (err) {
    console.error('LiveKit token generation error:', err);
    return NextResponse.json({ error: 'Failed to generate token.' }, { status: 500 });
  }
}
