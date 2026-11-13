// LiveKit usage estimation utilities

/**
 * Estimate monthly participant‑minutes based on usage assumptions.
 * This is a **rough estimate** used only for free‑tier warning thresholds.
 */
export function estimateMonthlyUsage(
  participantsPerSession: number,
  minutesPerSession: number,
  sessionsPerMonth: number
): number {
  return participantsPerSession * minutesPerSession * sessionsPerMonth;
}

/**
 * Free‑tier monthly participant‑minute allowance (as documented by LiveKit).
 * Update this constant if LiveKit changes its free‑tier limits.
 */
export const LIVEKIT_FREE_MONTHLY_MINUTES = 15000; // placeholder – verify against docs

/**
 * Determine which warning level (if any) should be shown based on the estimated usage.
 * Returns one of: 'none', 'warning70', 'warning85', 'warning95'.
 */
export function usageWarningLevel(estimatedMinutes: number):
  | 'none'
  | 'warning70'
  | 'warning85'
  | 'warning95' {
  const usageRatio = estimatedMinutes / LIVEKIT_FREE_MONTHLY_MINUTES;
  if (usageRatio >= 0.95) return 'warning95';
  if (usageRatio >= 0.85) return 'warning85';
  if (usageRatio >= 0.70) return 'warning70';
  return 'none';
}
