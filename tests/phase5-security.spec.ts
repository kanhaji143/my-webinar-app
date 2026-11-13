import { test, expect } from '@playwright/test';
import {
  encodeRealtimeMessage,
  decodeRealtimeMessage,
  RealtimeMessage,
  PROTOCOL_VERSION,
} from '../src/lib/realtimeProtocol';

test.describe('Phase 5 Final Security Audit: Authorization & Data Protection', () => {

  test('1. Token API: rejects invalid room identifiers and participant identities', async ({ request }) => {
    // Empty room
    const resEmptyRoom = await request.post('/api/livekit/token', {
      data: { room: '', identity: 'user-1', role: 'viewer' },
    });
    expect([400, 403]).toContain(resEmptyRoom.status());

    // Excessively long identity (> 128 chars)
    const longId = 'a'.repeat(200);
    const resLongId = await request.post('/api/livekit/token', {
      data: { room: 'webinar-101', identity: longId, role: 'viewer' },
    });
    expect([400, 403]).toContain(resLongId.status());

    // Invalid role
    const resBadRole = await request.post('/api/livekit/token', {
      data: { room: 'webinar-101', identity: 'user-1', role: 'superadmin' },
    });
    expect([400, 403]).toContain(resBadRole.status());
  });

  test('2. Token API: fail-closed host authorization blocks host tokens when unconfigured or invalid', async ({ request }) => {
    // Attempting to claim host role without valid authorization
    // In unconfigured / disabled mode, returns 403 (LiveKit disabled) or 503 (Host passcode unconfigured)
    const resNoPass = await request.post('/api/livekit/token', {
      data: {
        room: 'webinar-101',
        identity: 'attacker-client',
        role: 'host',
      },
    });

    // Guard MUST return 401, 403, or 503; NEVER 200 without configured passcode
    expect([401, 403, 503]).toContain(resNoPass.status());
    const dataNoPass = await resNoPass.json();
    expect(dataNoPass.error).toBeTruthy();

    // Attempting host role with incorrect passcode
    const resWrongPass = await request.post('/api/livekit/token', {
      data: {
        room: 'webinar-101',
        identity: 'attacker-client',
        role: 'host',
        hostPasscode: 'incorrect-passcode-attempt',
      },
    });
    expect([401, 403, 503]).toContain(resWrongPass.status());
    const dataWrongPass = await resWrongPass.json();
    expect(dataWrongPass.error).toBeTruthy();
  });

  test('3. Token API: viewer token request does not require host passcode', async ({ request }) => {
    // Viewer tokens must never require hostPasscode
    const resViewer = await request.post('/api/livekit/token', {
      data: {
        room: 'webinar-101',
        identity: 'viewer-regular-user',
        role: 'viewer',
      },
    });

    // When LiveKit is disabled (in test/demo mode), returns 403; when enabled, returns 200.
    // It should NEVER return 503 (host passcode missing) or 401 (unauthorized host).
    expect([200, 403]).toContain(resViewer.status());
    if (resViewer.status() === 200) {
      const data = await resViewer.json();
      expect(data.token).toBeTruthy();
    }
  });

  test('4. Data Channel Security: prevents identity spoofing and transport impersonation', async () => {
    const spoofedMessage: RealtimeMessage = {
      version: PROTOCOL_VERSION,
      webinarId: 'webinar-101',
      senderId: 'dr-vikram-malhotra', // claimed senderId in payload
      senderRole: 'host',
      timestamp: new Date().toISOString(),
      type: 'POLL_CREATE',
      payload: {
        id: 'poll-spoof',
        webinarId: 'webinar-101',
        question: 'Spoofed Question?',
        options: [{ id: '1', text: 'Spoof', votes: 0 }],
        isActive: true,
        createdAt: new Date().toISOString(),
        totalVotes: 0,
      },
    };

    // Actual LiveKit transport participant identity is 'attacker-user'
    const actualTransportId = 'attacker-user';
    const verifiedHostId = 'dr-vikram-malhotra';

    const encoded = encodeRealtimeMessage(spoofedMessage);
    const result = decodeRealtimeMessage(encoded, actualTransportId, verifiedHostId);

    // Security guard must reject the message because payload senderId does not match transport ID
    expect(result).toBeNull();
  });

  test('5. Data Channel Security: rejects unauthorized STATE_SNAPSHOT and host-only actions from non-host participants', async () => {
    const maliciousSnapshot: RealtimeMessage = {
      version: PROTOCOL_VERSION,
      webinarId: 'webinar-101',
      senderId: 'viewer-participant-1',
      senderRole: 'host', // Maliciously forged role in payload
      timestamp: new Date().toISOString(),
      type: 'STATE_SNAPSHOT',
      payload: {
        polls: [],
        questions: [],
      },
    };

    const actualTransportId = 'viewer-participant-1';
    const verifiedHostId = 'dr-vikram-malhotra';

    const encoded = encodeRealtimeMessage(maliciousSnapshot);
    const result = decodeRealtimeMessage(encoded, actualTransportId, verifiedHostId);

    // HostId mismatch: must be rejected to prevent room state wiping
    expect(result).toBeNull();

    // Viewer attempting QA_DELETE
    const maliciousDelete: RealtimeMessage = {
      version: PROTOCOL_VERSION,
      webinarId: 'webinar-101',
      senderId: 'viewer-participant-1',
      senderRole: 'host',
      timestamp: new Date().toISOString(),
      type: 'QA_DELETE',
      payload: {
        questionId: 'q-101',
      },
    };
    expect(decodeRealtimeMessage(encodeRealtimeMessage(maliciousDelete), actualTransportId, verifiedHostId)).toBeNull();
  });

  test('6. Data Channel Security: allows legitimate host operations and legitimate viewer interactions', async () => {
    const legitimateHostMsg: RealtimeMessage = {
      version: PROTOCOL_VERSION,
      webinarId: 'webinar-101',
      senderId: 'dr-vikram-malhotra',
      senderRole: 'host',
      timestamp: new Date().toISOString(),
      type: 'POLL_CREATE',
      payload: {
        id: 'poll-legit',
        webinarId: 'webinar-101',
        question: 'Legitimate Host Poll?',
        options: [{ id: '1', text: 'Yes', votes: 0 }],
        isActive: true,
        createdAt: new Date().toISOString(),
        totalVotes: 0,
      },
    };

    const legitimateViewerMsg: RealtimeMessage = {
      version: PROTOCOL_VERSION,
      webinarId: 'webinar-101',
      senderId: 'viewer-123',
      senderRole: 'viewer',
      timestamp: new Date().toISOString(),
      type: 'CHAT_MESSAGE',
      payload: {
        id: 'msg-legit',
        webinarId: 'webinar-101',
        sender: 'Viewer 123',
        role: 'viewer',
        message: 'Great presentation!',
        timestamp: '11:00 AM',
      },
    };

    const hostDecoded = decodeRealtimeMessage(
      encodeRealtimeMessage(legitimateHostMsg),
      'dr-vikram-malhotra',
      'dr-vikram-malhotra'
    );
    expect(hostDecoded).not.toBeNull();
    expect(hostDecoded?.type).toBe('POLL_CREATE');

    const viewerDecoded = decodeRealtimeMessage(
      encodeRealtimeMessage(legitimateViewerMsg),
      'viewer-123',
      'dr-vikram-malhotra'
    );
    expect(viewerDecoded).not.toBeNull();
    expect(viewerDecoded?.type).toBe('CHAT_MESSAGE');
  });

});
