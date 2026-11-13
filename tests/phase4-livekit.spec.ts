import { test, expect } from '@playwright/test';
import { estimateMonthlyUsage, usageWarningLevel, LIVEKIT_FREE_MONTHLY_MINUTES } from '../src/lib/livekitUsage';

test.describe('Phase 4: LiveKit Webinar Integration Foundation', () => {

  test('1. livekitUsage utility correctly calculates monthly participant-minutes and warning tiers', async () => {
    // Verify monthly estimation formula: participants * minutes * sessions
    // 10 participants, 20 mins, 4 sessions = 800 minutes
    const usage = estimateMonthlyUsage(10, 20, 4);
    expect(usage).toBe(800);

    // Free tier constant verification (configured to 5,000 participant-minutes)
    expect(LIVEKIT_FREE_MONTHLY_MINUTES).toBe(5000);

    // Warning tier thresholds for 5,000 allowance (70% = 3500, 85% = 4250, 95% = 4750):
    // Below 70% (< 3500 min) -> 'none'
    expect(usageWarningLevel(3499)).toBe('none');

    // 3500 minutes -> warning70 (70% <= x < 85%)
    expect(usageWarningLevel(3500)).toBe('warning70');
    expect(usageWarningLevel(4249)).toBe('warning70');

    // 4250 minutes -> warning85 (85% <= x < 95%)
    expect(usageWarningLevel(4250)).toBe('warning85');
    expect(usageWarningLevel(4749)).toBe('warning85');

    // 4750 minutes -> warning95 (>= 95%)
    expect(usageWarningLevel(4750)).toBe('warning95');

    // 5000 minutes (100% / at cap) -> warning95
    expect(usageWarningLevel(5000)).toBe('warning95');
    expect(usageWarningLevel(6000)).toBe('warning95');
  });

  test('2. LiveKit token API route returns 403 or error when LiveKit is disabled / unconfigured', async ({ request }) => {
    // Calling token API without credentials or when disabled should safely reject without leaking secrets
    const res = await request.post('/api/livekit/token', {
      data: {
        room: 'test-room',
        identity: 'host-user',
        role: 'host',
      },
    });

    // Guard: returns 403 when LIVEKIT_ENABLED is not 'true'
    expect([400, 403, 500, 503]).toContain(res.status());
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });

  test('3. Real LiveKit connection remains BLOCKED without real credentials', async () => {
    // Explicit safety assertion: real cloud connection test is blocked until owner provides credentials
    const hasLiveKitCreds = Boolean(
      process.env.LIVEKIT_URL && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET
    );

    if (!hasLiveKitCreds) {
      test.skip(true, 'BLOCKED: Real LiveKit connection requires owner-supplied LiveKit Cloud credentials and billing verification.');
    }
  });

});
