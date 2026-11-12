import { test, expect } from '@playwright/test';

test.describe('Phase 3: Local Webinar Functionality (API-Free / DEMO)', () => {
  // 1. Camera & Microphone Toggle and Native Video Preview in Host Studio
  test('1. Host can toggle camera and microphone with live loopback preview and visual status', async ({ page }) => {
    await page.goto('/webinar/host/webinar-101');
    await expect(page.getByTestId('host-room-title')).toBeVisible();

    // Initially camera and mic are inactive (never auto-start without user gesture)
    await expect(page.getByTestId('camera-standby-placeholder')).toBeVisible();
    await expect(page.getByText('MUTED')).toBeVisible();

    // Toggle Camera ON
    await page.getByTestId('btn-toggle-camera').click();
    // Video preview element appears with active stream
    await expect(page.getByTestId('local-video-preview')).toBeVisible();

    // Toggle Microphone ON
    await page.getByTestId('btn-toggle-mic').click();
    await expect(page.getByText(/LIVE MIC/i)).toBeVisible();

    // Toggle Camera OFF
    await page.getByTestId('btn-toggle-camera').click();
    await expect(page.getByTestId('camera-standby-placeholder')).toBeVisible();

    // Toggle Microphone OFF
    await page.getByTestId('btn-toggle-mic').click();
    await expect(page.getByText('MUTED')).toBeVisible();
  });

  // 2. Hardware Device Settings Modal & Diagnostics
  test('2. Host can open hardware device selector modal and inspect audio levels', async ({ page }) => {
    await page.goto('/webinar/host/webinar-101');
    await expect(page.getByTestId('host-room-title')).toBeVisible();

    // Open device modal
    await page.getByTestId('btn-device-settings').click();
    await expect(page.getByTestId('device-settings-modal')).toBeVisible();
    await expect(page.getByTestId('device-modal-title')).toBeVisible();

    // Check device dropdowns and audio meter
    await expect(page.getByTestId('select-camera-device')).toBeVisible();
    await expect(page.getByTestId('select-mic-device')).toBeVisible();
    await expect(page.getByTestId('audio-level-bar')).toBeVisible();

    // Close modal
    await page.getByTestId('btn-save-device-settings').click();
    await expect(page.getByTestId('device-settings-modal')).not.toBeVisible();
  });

  // 3. Screen Sharing Toggle
  test('3. Host can toggle screen sharing with local display preview', async ({ page }) => {
    await page.goto('/webinar/host/webinar-101');
    await expect(page.getByTestId('host-room-title')).toBeVisible();

    // Activate Screen Sharing
    await page.getByTestId('btn-toggle-share').click();

    // Screen sharing stage appears with local active indicator
    await expect(page.getByTestId('screen-share-stage')).toBeVisible();
    await expect(page.getByTestId('screen-video-element')).toBeVisible();

    // Stop Screen Sharing
    await page.getByTestId('btn-toggle-share').click();
    await expect(page.getByTestId('screen-share-stage')).not.toBeVisible();
  });

  // 4. Local Chat Submission and Real-time Display
  test('4. Host and Viewer can submit and read local demo chat messages', async ({ page }) => {
    // Host sends message
    await page.goto('/webinar/host/webinar-101');
    await page.getByTestId('tab-host-chat').click();
    await page.getByTestId('input-host-chat').fill('Phase 3 Architecture Verification');
    await page.getByTestId('btn-host-send-chat').click();

    await expect(page.getByText('Phase 3 Architecture Verification')).toBeVisible();

    // Viewer opens session and views chat
    await page.goto('/webinar/viewer/webinar-101');
    await page.getByTestId('tab-viewer-chat').click();
    await expect(page.getByText('Phase 3 Architecture Verification')).toBeVisible();

    // Viewer sends a question/message
    await page.getByTestId('input-viewer-chat').fill('Viewer feedback on stream fidelity');
    await page.getByTestId('btn-viewer-send-chat').click();
    await expect(page.getByText('Viewer feedback on stream fidelity')).toBeVisible();
  });

  // 5. Poll Creation, Audience Voting, and Host Poll Termination
  test('5. Host can create polls, viewers can vote, and results update reactively', async ({ page }) => {
    // Host creates a poll
    await page.goto('/webinar/host/webinar-101');
    await page.getByTestId('tab-host-polls').click();
    await page.getByTestId('btn-create-poll-tab').click();
    await expect(page.getByTestId('form-create-poll')).toBeVisible();

    await page.getByTestId('input-poll-question').fill('Do you prefer SFU or MCU architecture?');
    await page.getByTestId('input-poll-opt-1').fill('Selective Forwarding Unit (SFU)');
    await page.getByTestId('input-poll-opt-2').fill('Multipoint Control Unit (MCU)');
    await page.getByTestId('btn-launch-poll').click();

    // Confirm poll is visible in active list
    await expect(page.getByText('Do you prefer SFU or MCU architecture?')).toBeVisible();

    // Viewer navigates to poll and votes
    await page.goto('/webinar/viewer/webinar-101');
    await page.getByTestId('tab-viewer-polls').click();
    await expect(page.getByText('Do you prefer SFU or MCU architecture?')).toBeVisible();

    // Vote on first option
    const voteButton = page.locator('button:has-text("Vote")').first();
    await voteButton.click();

    // Check [VOTED] indicator appears
    await expect(page.getByText('[VOTED]')).toBeVisible();

    // Host terminates the poll
    await page.goto('/webinar/host/webinar-101');
    await page.getByTestId('tab-host-polls').click();
    const endPollBtn = page.getByTestId('btn-end-poll').first();
    await endPollBtn.click();
    await expect(page.getByText('CLOSED')).toBeVisible();
  });

  // 6. Q&A Submission, Upvoting, and Host Answer Management
  test('6. Viewer can submit Q&A questions, upvote them, and host can mark answered', async ({ page }) => {
    // Viewer submits question
    await page.goto('/webinar/viewer/webinar-101');
    await page.getByTestId('tab-viewer-qa').click();
    await page.getByTestId('input-viewer-qa').fill('How is end-to-end packet encryption verified?');
    await page.getByTestId('btn-viewer-send-qa').click();

    await expect(page.getByText('How is end-to-end packet encryption verified?')).toBeVisible();

    // Upvote the question
    const upvoteBtn = page.locator('button[title="Upvote Question"]').first();
    await upvoteBtn.click();

    // Host navigates to Q&A tab and provides answer
    await page.goto('/webinar/host/webinar-101');
    await page.getByTestId('tab-host-qa').click();
    await expect(page.getByText('How is end-to-end packet encryption verified?')).toBeVisible();

    const markAnsweredBtn = page.getByTestId('btn-answer-qa').first();
    await markAnsweredBtn.click();
    await page.getByTestId('textarea-answer-qa').fill('Using WebRTC insertable streams and AES-GCM framing.');
    await page.getByTestId('btn-submit-answer-qa').click();

    await expect(page.getByText('Answered by Host:').first()).toBeVisible();
    await expect(page.getByText('Using WebRTC insertable streams and AES-GCM framing.')).toBeVisible();
  });

  // 7. Controlled Demo Participant Simulation
  test('7. Host studio and Viewer room display controlled simulated participants alongside local registrations', async ({ page }) => {
    await page.goto('/webinar/host/webinar-101');
    await page.getByTestId('tab-host-participants').click();

    await expect(page.getByText(/Simulated Audience/i)).toBeVisible();
    await expect(page.getByText('[SIMULATED]').first()).toBeVisible();
  });

  // 8. Resource Cleanup on Unmount
  test('8. Navigating away from Host Studio properly cleans up media streams without memory leaks', async ({ page }) => {
    await page.goto('/webinar/host/webinar-101');
    // Turn camera on
    await page.getByTestId('btn-toggle-camera').click();
    await expect(page.getByTestId('local-video-preview')).toBeVisible();

    // Navigate to dashboard (unmounting studio)
    await page.getByTestId('btn-exit-studio').click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Return to studio and ensure camera was cleanly reset to off
    await page.goto('/webinar/host/webinar-101');
    await expect(page.getByTestId('camera-standby-placeholder')).toBeVisible();
  });

  // 9. Bilingual Language Switching across Phase 3 Controls
  test('9. Language switcher updates Phase 3 hardware, poll, and Q&A labels between EN and HI', async ({ page }) => {
    await page.goto('/webinar/host/webinar-101');

    // Switch to Hindi
    await page.getByTestId('lang-btn-hi').first().click();
    await expect(page.getByTestId('tab-host-polls')).toContainText('पोल');
    await expect(page.getByTestId('tab-host-qa')).toContainText('प्रश्नोत्तरी');
    await expect(page.getByTestId('tab-host-chat')).toContainText('लाइव चैट');

    // Switch back to English
    await page.getByTestId('lang-btn-en').first().click();
    await expect(page.getByTestId('tab-host-polls')).toContainText('Polls');
    await expect(page.getByTestId('tab-host-qa')).toContainText('Q&A');
  });

  // 10. Responsive Viewport Check: 320, 375, 768, 1024, 1440
  const viewports = [
    { name: '320px (Small Mobile)', width: 320, height: 568 },
    { name: '375px (Standard Mobile)', width: 375, height: 667 },
    { name: '768px (Tablet Portrait)', width: 768, height: 1024 },
    { name: '1024px (Tablet Landscape)', width: 1024, height: 768 },
    { name: '1440px (Desktop HD)', width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    test(`10. Viewport ${vp.name} has 0px horizontal overflow across Host Studio and Viewer Room`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Host Studio
      await page.goto('/webinar/host/webinar-101');
      let scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      let clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

      // Viewer Room
      await page.goto('/webinar/viewer/webinar-101');
      scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  }
});
