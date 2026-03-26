/**
 * Country commission rates in the API/DB are stored as percentage points (9 = 9%).
 * Legacy rows may store decimals (0.09). Normalize to percentage points for display and form inputs.
 */
export function commissionRateToPercentPoints(stored: number): number {
  if (stored == null || Number.isNaN(stored)) return 0;
  if (stored > 0 && stored <= 1) return stored * 100;
  return stored;
}

export function formatStoredCommissionPercent(stored: number): string {
  return `${commissionRateToPercentPoints(stored).toFixed(1)}%`;
}
