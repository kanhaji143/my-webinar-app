import { test, expect } from '@playwright/test';

test.describe('Phase 1: Foundation, Routes & Design System', () => {
  // 1. Landing Page Loads
  test('1. Landing page loads with hero, dual-mode cards, and demo banner', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/WebinarPulse/);
    await expect(page.getByTestId('demo-banner')).toBeVisible();
    await expect(page.getByTestId('hero-heading')).toBeVisible();
    await expect(page.getByTestId('hero-cta-dashboard')).toBeVisible();
    await expect(page.getByTestId('hero-cta-webinar')).toBeVisible();
    await expect(page.getByTestId('hero-cta-meeting')).toBeVisible();
  });

  // 2. Dashboard Loads
  test('2. Dashboard loads with webinar-first view and mode switcher tabs', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-heading')).toBeVisible();
    await expect(page.getByTestId('tab-webinars')).toBeVisible();
    await expect(page.getByTestId('tab-meetings')).toBeVisible();
    await expect(page.getByTestId('webinars-list-container')).toBeVisible();

    // Verify sample demo webinar card
    await expect(page.getByTestId('btn-host-webinar-101')).toBeVisible();
    await expect(page.getByTestId('btn-join-webinar-101')).toBeVisible();

    // Switch to Meetings tab
    await page.getByTestId('tab-meetings').click();
    await expect(page.getByTestId('meetings-list-container')).toBeVisible();
    await expect(page.getByTestId('btn-launch-instant-meeting')).toBeVisible();
  });

  // 3. Webinar Creation Page Loads and Validates
  test('3. Webinar creation page loads and validates client input', async ({ page }) => {
    await page.goto('/webinar/new');
    await expect(page.getByTestId('create-webinar-heading')).toBeVisible();
    await expect(page.getByTestId('form-create-webinar')).toBeVisible();

    // Trigger validation with empty title
    await page.getByTestId('btn-submit-webinar').click();
    await expect(page.getByTestId('error-title')).toBeVisible();

    // Fill valid form
    await page.getByTestId('input-title').fill('Playwright Automated Verification Session');
    await page.getByTestId('input-host-name').fill('Dr. Vikram Malhotra');
    await page.getByTestId('input-description').fill('Validating Phase 1 E2E tests deterministically.');
    await page.getByTestId('btn-submit-webinar').click();

    // Verify success card appears with direct links
    await expect(page.getByTestId('created-success-card')).toBeVisible();
    await expect(page.getByTestId('btn-go-to-host')).toBeVisible();
    await expect(page.getByTestId('btn-go-to-join')).toBeVisible();
  });

  // 4. Webinar Join Route Loads
  test('4. Webinar join route loads and allows demo registration', async ({ page }) => {
    await page.goto('/webinar/join/session-e2e-test');
    await expect(page.getByTestId('join-heading')).toBeVisible();
    await expect(page.getByTestId('form-webinar-join')).toBeVisible();

    // Validate email requirement
    await page.getByTestId('btn-submit-registration').click();
    await expect(page.getByTestId('error-name')).toBeVisible();

    // Fill registration
    await page.getByTestId('input-name').fill('Verifier Auditor');
    await page.getByTestId('input-email').fill('auditor@test.local');
    await page.getByTestId('btn-submit-registration').click();

    // Check confirmation screen and enter button
    await expect(page.getByTestId('registration-confirmed')).toBeVisible();
    await expect(page.getByTestId('btn-enter-viewer-stage')).toBeVisible();
  });

  // 5. Webinar Host Route Loads
  test('5. Webinar host route loads with broadcast studio and host controls', async ({ page }) => {
    await page.goto('/webinar/host/session-e2e-test');
    await expect(page.getByTestId('host-room-title')).toBeVisible();
    await expect(page.getByTestId('host-controls')).toBeVisible();
    await expect(page.getByTestId('btn-toggle-mic')).toBeVisible();
    await expect(page.getByTestId('btn-toggle-camera')).toBeVisible();
    await expect(page.getByTestId('btn-toggle-share')).toBeVisible();
    await expect(page.getByTestId('btn-toggle-broadcast')).toBeVisible();

    // Toggle mic
    await page.getByTestId('btn-toggle-mic').click();
    await expect(page.getByText('MUTED')).toBeVisible();

    // Send chat message in host studio
    await page.getByTestId('input-host-chat').fill('Greetings from Host');
    await page.getByTestId('btn-host-send-chat').click();
    await expect(page.getByText('Greetings from Host')).toBeVisible();

    // Switch to participants tab
    await page.getByTestId('tab-host-participants').click();
    await expect(page.getByTestId('participants-list')).toBeVisible();
  });

  // 6. Webinar Viewer Route Loads
  test('6. Webinar viewer route loads with viewer stage and audience controls', async ({ page }) => {
    await page.goto('/webinar/viewer/session-e2e-test');
    await expect(page.getByTestId('viewer-room-title')).toBeVisible();
    await expect(page.getByTestId('viewer-controls')).toBeVisible();
    await expect(page.getByTestId('btn-viewer-audio')).toBeVisible();
    await expect(page.getByTestId('btn-raise-hand')).toBeVisible();
    await expect(page.getByTestId('btn-leave-viewer')).toBeVisible();

    // Raise hand toggle
    await page.getByTestId('btn-raise-hand').click();
    await expect(page.getByText('Hand Raised')).toBeVisible();

    // Viewer Q&A tab
    await page.getByTestId('tab-viewer-qa').click();
    await expect(page.getByTestId('viewer-qa-list')).toBeVisible();
    await page.getByTestId('input-viewer-qa').fill('What is the target latency?');
    await page.getByTestId('btn-viewer-send-qa').click();
    await expect(page.getByText('What is the target latency?')).toBeVisible();
  });

  // 7. Meeting Route Loads
  test('7. Interactive meeting route loads with gallery view and collaboration controls', async ({ page }) => {
    await page.goto('/meeting/session-daily-sync');
    await expect(page.getByTestId('meeting-room-title')).toBeVisible();
    await expect(page.getByTestId('meeting-participants-grid')).toBeVisible();
    await expect(page.getByTestId('participant-tile-user-1')).toBeVisible();
    await expect(page.getByTestId('participant-tile-user-2')).toBeVisible();
    await expect(page.getByTestId('participant-tile-user-3')).toBeVisible();
    await expect(page.getByTestId('participant-tile-user-4')).toBeVisible();

    // Controls
    await expect(page.getByTestId('meeting-controls')).toBeVisible();
    await expect(page.getByTestId('btn-meeting-toggle-mic')).toBeVisible();
    await expect(page.getByTestId('btn-meeting-toggle-camera')).toBeVisible();
    await expect(page.getByTestId('btn-meeting-share')).toBeVisible();
    await expect(page.getByTestId('btn-leave-meeting')).toBeVisible();
  });

  // 8. Navigation Works
  test('8. Navigation links between pages correctly', async ({ page }) => {
    await page.goto('/');

    // Go to Dashboard
    await page.getByTestId('nav-dashboard').first().click();
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Go to Create Webinar
    await page.getByTestId('nav-create-webinar').first().click();
    await expect(page).toHaveURL(/.*\/webinar\/new/);

    // Go to Instant Meeting
    await page.getByTestId('nav-instant-meeting').first().click();
    await expect(page).toHaveURL(/.*\/meeting\/demo-team-sync/);

    // Click Brand Logo to return to home
    await page.getByTestId('brand-logo').first().click();
    await expect(page).toHaveURL(/\//);
  });

  // 9. Language Switcher Works
  test('9. Language switcher updates UI labels between English and Hindi', async ({ page }) => {
    await page.goto('/');
    
    // Switch to Hindi using the visible language button
    await page.getByTestId('lang-btn-hi').first().click();
    await expect(page.getByTestId('hero-heading')).toHaveText(/हज़ारों लोगों तक प्रसारण करें, किसी से भी मिलें।/);
    await expect(page.getByTestId('nav-dashboard').first()).toContainText('डैशबोर्ड');

    // Switch back to English
    await page.getByTestId('lang-btn-en').first().click();
    await expect(page.getByTestId('hero-heading')).toHaveText(/Broadcast to Thousands, Meet with Anyone\./);
    await expect(page.getByTestId('nav-dashboard').first()).toContainText('Dashboard');
  });

  // 10. Responsive Layout Checks Across Viewports
  const viewports = [
    { width: 320, height: 600, label: '320px (Small Mobile)' },
    { width: 375, height: 667, label: '375px (Standard Mobile)' },
    { width: 768, height: 1024, label: '768px (Tablet Portrait)' },
    { width: 1024, height: 768, label: '1024px (Tablet Landscape/Laptop)' },
    { width: 1440, height: 900, label: '1440px (Desktop HD)' },
  ];

  for (const vp of viewports) {
    test(`10. Viewport ${vp.label} has no horizontal overflow and preserves core actions`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');

      // Verify no horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const innerWidth = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);

      // Verify header and primary call to action are reachable
      await expect(page.getByTestId('demo-banner')).toBeVisible();

      // Check Dashboard layout on this viewport
      await page.goto('/dashboard');
      const dashScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(dashScrollWidth).toBeLessThanOrEqual(innerWidth);
      await expect(page.getByTestId('dashboard-heading')).toBeVisible();
    });
  }
});
