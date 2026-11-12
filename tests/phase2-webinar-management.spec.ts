import { test, expect } from '@playwright/test';

test.describe('Phase 2: Webinar Management & Room UI', () => {
  // 1. Webinar Creation Form & Client Validation
  test('1. Webinar creation form enforces title, host, date and time validation', async ({ page }) => {
    await page.goto('/webinar/new');
    await expect(page.getByTestId('create-webinar-heading')).toBeVisible();

    // Trigger validation with empty inputs
    await page.getByTestId('btn-submit-webinar').click();
    await expect(page.getByTestId('error-title')).toBeVisible();

    // Fill title but leave host empty
    await page.getByTestId('input-title').fill('Mastering Next.js Live Streaming');
    await page.getByTestId('btn-submit-webinar').click();
    await expect(page.getByTestId('error-host-name')).toBeVisible();

    // Fill host name
    await page.getByTestId('input-host-name').fill('Dr. Alok Verma');
    await expect(page.getByTestId('input-date')).toHaveValue('2026-11-25');
  });

  // 2. Save as Draft vs Schedule Webinar
  test('2. Can save webinar as Draft and Schedule Webinar with distinct status', async ({ page }) => {
    // A: Save as Draft
    await page.goto('/webinar/new');
    await page.getByTestId('input-title').fill('Draft Session: Scalable Video Delivery');
    await page.getByTestId('input-host-name').fill('Sarah Jenkins');
    await page.getByTestId('btn-save-draft').click();

    await expect(page.getByTestId('created-success-card')).toBeVisible();
    await expect(page.getByText('Webinar Draft Saved')).toBeVisible();
    await expect(page.getByText('STATUS: DRAFT')).toBeVisible();

    // B: Schedule Webinar
    await page.goto('/webinar/new');
    await page.getByTestId('input-title').fill('Scheduled Session: Real-Time WebRTC Architecture');
    await page.getByTestId('input-host-name').fill('Marcus Chen');
    await page.getByTestId('btn-submit-webinar').click();

    await expect(page.getByTestId('created-success-card')).toBeVisible();
    await expect(page.getByText('Webinar Successfully Scheduled')).toBeVisible();
    await expect(page.getByText('STATUS: SCHEDULED')).toBeVisible();
  });

  // 3. Dashboard Listing, Search, and Status Filters
  test('3. Dashboard correctly displays, searches, and filters webinars by status', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-heading')).toBeVisible();
    await expect(page.getByTestId('webinars-grid')).toBeVisible();

    // Verify initial seed webinars exist
    await expect(page.getByTestId('webinar-card-webinar-101')).toBeVisible();
    await expect(page.getByTestId('webinar-card-webinar-103')).toBeVisible();

    // Test Search by title
    await page.getByTestId('input-search-webinars').fill('Education');
    await expect(page.getByTestId('webinar-card-webinar-102')).toBeVisible();
    await expect(page.getByTestId('webinar-card-webinar-101')).not.toBeVisible();
    await page.getByTestId('input-search-webinars').fill('');

    // Test Status Filter: DRAFT
    await page.getByTestId('filter-draft').click();
    await expect(page.getByTestId('badge-status-webinar-104')).toHaveText(/DRAFT/);
    await expect(page.getByTestId('webinar-card-webinar-101')).not.toBeVisible();

    // Test Status Filter: SCHEDULED
    await page.getByTestId('filter-scheduled').click();
    await expect(page.getByTestId('webinar-card-webinar-101')).toBeVisible();

    // Test Status Filter: ENDED
    await page.getByTestId('filter-ended').click();
    await expect(page.getByTestId('webinar-card-webinar-103')).toBeVisible();

    // Reset to ALL
    await page.getByTestId('filter-all').click();
    await expect(page.getByTestId('webinar-card-webinar-101')).toBeVisible();
  });

  // 4. Webinar Details & Registration with State Guards
  test('4. Webinar registration gate respects status rules (Draft, Ended, Scheduled)', async ({ page }) => {
    // Case A: Draft status denies public registration
    await page.goto('/webinar/join/webinar-104');
    await expect(page.getByTestId('draft-mode-notice')).toBeVisible();
    await expect(page.getByTestId('form-webinar-join')).not.toBeVisible();

    // Case B: Ended status denies registration
    await page.goto('/webinar/join/webinar-103');
    await expect(page.getByTestId('ended-mode-notice')).toBeVisible();
    await expect(page.getByTestId('form-webinar-join')).not.toBeVisible();

    // Case C: Scheduled session allows registration
    await page.goto('/webinar/join/webinar-101');
    await expect(page.getByTestId('form-webinar-join')).toBeVisible();
    await expect(page.getByTestId('join-session-status-badge')).toContainText('SCHEDULED');

    // Fill registration
    await page.getByTestId('input-name').fill('Priya Patel');
    await page.getByTestId('input-email').fill('priya.patel@test.org');
    await page.getByTestId('btn-submit-registration').click();

    await expect(page.getByTestId('registration-confirmed')).toBeVisible();
    await expect(page.getByTestId('btn-enter-viewer-stage')).toBeVisible();
  });

  // 5. Host Studio Lifecycle Transitions (Go Live -> End Broadcast)
  test('5. Host Studio manages broadcast lifecycle from Scheduled to Live to Ended', async ({ page }) => {
    await page.goto('/webinar/host/webinar-102');
    await expect(page.getByTestId('host-room-title')).toBeVisible();
    await expect(page.getByTestId('host-status-badge')).toContainText('STANDBY / SCHEDULED');

    // Click "Go Live (Start Broadcast) [DEMO]"
    await page.getByTestId('btn-toggle-broadcast').click();

    // Status updates to LIVE
    await expect(page.getByTestId('host-status-badge')).toContainText('LIVE BROADCAST');
    await expect(page.getByTestId('btn-toggle-broadcast')).toContainText('End Broadcast');

    // Click "End Broadcast"
    await page.getByTestId('btn-toggle-broadcast').click();

    // Status updates to ENDED
    await expect(page.getByTestId('host-status-badge')).toContainText('BROADCAST ENDED');
    await expect(page.getByText('Broadcast Concluded')).toBeVisible();
  });

  // 6. Viewer Room Dynamic State Reaction
  test('6. Viewer Room reflects actual webinar lifecycle status', async ({ page }) => {
    // Scheduled state shows standby notice
    await page.goto('/webinar/viewer/webinar-101');
    await expect(page.getByTestId('viewer-status-badge')).toContainText('SCHEDULED');
    await expect(page.getByTestId('viewer-stage-scheduled')).toBeVisible();

    // Ended state shows concluded message
    await page.goto('/webinar/viewer/webinar-103');
    await expect(page.getByTestId('viewer-status-badge')).toContainText('ENDED');
    await expect(page.getByTestId('viewer-stage-ended')).toBeVisible();
  });

  // 7. Bilingual Foundation Updates (EN/HI)
  test('7. Language switcher toggles Phase 2 labels, filters, and lifecycle statuses between EN and HI', async ({ page }) => {
    await page.goto('/dashboard');

    // Switch to Hindi
    await page.getByTestId('lang-btn-hi').first().click();
    await expect(page.getByTestId('dashboard-heading')).toHaveText(/डैशबोर्ड/);
    await expect(page.getByTestId('filter-all')).toContainText('सभी');
    await expect(page.getByTestId('filter-scheduled')).toContainText('शेड्यूल्ड');
    await expect(page.getByTestId('filter-draft')).toContainText('ड्राफ्ट');

    // Switch back to English
    await page.getByTestId('lang-btn-en').first().click();
    await expect(page.getByTestId('dashboard-heading')).toHaveText(/Dashboard/);
    await expect(page.getByTestId('filter-all')).toContainText('All');
  });

  // 8. Responsive Viewport Verifications
  const viewports = [
    { width: 320, height: 600, label: '320px (Small Mobile)' },
    { width: 375, height: 667, label: '375px (Standard Mobile)' },
    { width: 768, height: 1024, label: '768px (Tablet Portrait)' },
    { width: 1024, height: 768, label: '1024px (Tablet Landscape)' },
    { width: 1440, height: 900, label: '1440px (Desktop HD)' },
  ];

  for (const vp of viewports) {
    test(`8. Viewport ${vp.label} has 0px horizontal overflow across Phase 2 pages`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Dashboard
      await page.goto('/dashboard');
      let scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      let innerWidth = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);

      // Create Webinar Form
      await page.goto('/webinar/new');
      scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      innerWidth = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);

      // Host Studio
      await page.goto('/webinar/host/webinar-101');
      scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      innerWidth = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
    });
  }
});
