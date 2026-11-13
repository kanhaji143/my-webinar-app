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

  const { room, identity, role } = await req.json();

  // Basic validation.
  if (!room || !identity || !role) {
    return NextResponse.json({ error: 'Missing required fields: room, identity, role' }, { status: 400 });
  }
  if (!['host', 'viewer'].includes(role)) {
    return NextResponse.json({ error: "Invalid role. Must be 'host' or 'viewer'." }, { status: 400 });
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
      // Host can publish and subscribe; viewer can only subscribe.
      canPublish: role === 'host',
      canSubscribe: true,
      // Optional: enable room join (required for both).
      roomJoin: true,
    });

    const token = at.toJwt();
    return NextResponse.json({ token }, { status: 200 });
  } catch (err) {
    console.error('LiveKit token generation error:', err);
    return NextResponse.json({ error: 'Failed to generate token.' }, { status: 500 });
  }
}
