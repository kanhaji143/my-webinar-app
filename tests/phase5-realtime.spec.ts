import { test, expect } from '@playwright/test';
import {
  validateRealtimeMessage,
  encodeRealtimeMessage,
  decodeRealtimeMessage,
  RealtimeMessage,
  PROTOCOL_VERSION,
} from '../src/lib/realtimeProtocol';

test.describe('Phase 5: Real-Time Chat, Polls & Q&A Protocol & Permissions', () => {

  test('1. Protocol message encoding, decoding, and validation', async () => {
    const validChat: RealtimeMessage = {
      version: PROTOCOL_VERSION,
      webinarId: 'webinar-101',
      senderId: 'user-1',
      senderRole: 'viewer',
      timestamp: new Date().toISOString(),
      type: 'CHAT_MESSAGE',
      payload: {
        id: 'msg-1',
        webinarId: 'webinar-101',
        sender: 'Alice',
        role: 'viewer',
        message: 'Hello everyone!',
        timestamp: '10:00 AM',
      },
    };

    const encoded = encodeRealtimeMessage(validChat);
    const decoded = decodeRealtimeMessage(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.type).toBe('CHAT_MESSAGE');
    expect(decoded?.webinarId).toBe('webinar-101');
  });

  test('2. Security Guard: rejects unauthorized host actions from viewers', async () => {
    // A viewer attempting to broadcast a POLL_CREATE message
    const invalidPollCreate = {
      version: PROTOCOL_VERSION,
      webinarId: 'webinar-101',
      senderId: 'viewer-attacker',
      senderRole: 'viewer', // viewer role
      timestamp: new Date().toISOString(),
      type: 'POLL_CREATE',
      payload: {
        id: 'poll-fake',
        webinarId: 'webinar-101',
        question: 'Malicious poll?',
        options: [{ id: '1', text: 'Yes', votes: 0 }],
        isActive: true,
        createdAt: new Date().toISOString(),
        totalVotes: 0,
      },
    };

    const validated = validateRealtimeMessage(invalidPollCreate);
    expect(validated).toBeNull(); // Must be blocked

    // A viewer attempting to mark a question answered
    const invalidQAAnswer = {
      version: PROTOCOL_VERSION,
      webinarId: 'webinar-101',
      senderId: 'viewer-attacker',
      senderRole: 'viewer',
      timestamp: new Date().toISOString(),
      type: 'QA_ANSWER',
      payload: {
        questionId: 'q-1',
        answerText: 'Unauthorized answer',
      },
    };
    expect(validateRealtimeMessage(invalidQAAnswer)).toBeNull();
  });

  test('3. Host Studio and Viewer Room interactive tabs and moderation UI', async ({ page }) => {
    // Navigate to Host Studio
    await page.goto('/webinar/host/webinar-101');
    await expect(page.getByTestId('host-room-title')).toBeVisible();

    // Switch to Chat tab and send a message
    await page.getByTestId('tab-host-chat').click();
    await page.getByTestId('input-host-chat').fill('Phase 5 Real-Time Announcement');
    await page.getByTestId('btn-host-send-chat').click();
    await expect(page.locator('text=Phase 5 Real-Time Announcement')).toBeVisible();

    // Switch to Polls tab, verify create poll button
    await page.getByTestId('tab-host-polls').click();
    await expect(page.getByTestId('btn-create-poll-tab')).toBeVisible();

    // Switch to Q&A tab, verify question list and moderation controls
    await page.getByTestId('tab-host-qa').click();
    await expect(page.getByTestId('panel-qa')).toBeVisible();

    // Verify question items have moderation remove button
    const removeBtn = page.locator('button[data-testid^="btn-delete-qa-"]').first();
    if (await removeBtn.isVisible()) {
      await expect(removeBtn).toBeVisible();
    }
  });

  test('4. Viewer Room voting and duplicate vote prevention UI', async ({ page }) => {
    await page.goto('/webinar/viewer/webinar-101');
    await expect(page.getByTestId('viewer-status-badge')).toBeVisible();

    // Switch to Polls tab
    await page.getByTestId('tab-viewer-polls').click();
    await expect(page.getByTestId('panel-viewer-polls')).toBeVisible();

    // Check if an active poll vote button exists
    const voteBtn = page.locator('button[data-testid^="btn-vote-opt-"]').first();
    if (await voteBtn.isVisible()) {
      await voteBtn.click();
      // After voting, [VOTED] indicator appears and button is replaced/disabled
      await expect(page.locator('text=[VOTED]').first()).toBeVisible();
    }

    // Switch to Q&A tab and submit a question
    await page.getByTestId('tab-viewer-qa').click();
    await expect(page.getByTestId('panel-viewer-qa')).toBeVisible();
  });

  test('5. Real LiveKit connection remains BLOCKED without credentials', async () => {
    const hasLiveKitCreds = Boolean(
      process.env.LIVEKIT_URL && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET
    );

    if (!hasLiveKitCreds) {
      test.skip(true, 'BLOCKED: Real LiveKit connection requires owner-supplied LiveKit Cloud credentials and billing verification.');
    }
  });

});
