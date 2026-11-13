import React from 'react';
import { estimateMonthlyUsage, usageWarningLevel, LIVEKIT_FREE_MONTHLY_MINUTES } from '@/lib/livekitUsage';
import { Badge } from '@/components/Badge';

/**
 * Simple banner that shows estimated usage and warnings.
 * Values are placeholders; update the numbers in the UI where appropriate.
 */
export default function LiveKitUsageBanner({ participantsPerSession, minutesPerSession, sessionsPerMonth }: {
  participantsPerSession: number;
  minutesPerSession: number;
  sessionsPerMonth: number;
}) {
  const estimated = estimateMonthlyUsage(participantsPerSession, minutesPerSession, sessionsPerMonth);
  const level = usageWarningLevel(estimated);
  const percent = ((estimated / LIVEKIT_FREE_MONTHLY_MINUTES) * 100).toFixed(1);

  const badgeVariant = level !== 'none' ? 'warning' : 'default';

  return (
    <div className="border rounded p-2 mb-2 bg-slate-800 text-slate-100">
      <p className="text-sm mb-1">
        Estimated LiveKit usage this month: <strong>{estimated} participant‑minutes</strong> ({percent}% of free tier limit of {LIVEKIT_FREE_MONTHLY_MINUTES}).
      </p>
      {level !== 'none' && (
        <Badge variant={badgeVariant} size="sm">
          {level === 'warning70' && '⚠️ Approaching 70% free‑tier'}
          {level === 'warning85' && '⚠️ Approaching 85% free‑tier'}
          {level === 'warning95' && '⚠️ Approaching 95% free‑tier'}
        </Badge>
      )}
    </div>
  );
}
