/**
 * Core parking-fee business logic, kept framework-free and pure so it's easy
 * to unit test in isolation (see src/lib/parking.test.ts).
 */

export type RateConfigInput = {
  hourlyRateCents: number;
  gracePeriodMins: number;
  dailyMaxCents: number;
};

export type FeeCalculationInput = {
  entryAt: Date;
  exitAt: Date;
  isSubscriber: boolean;
  rate: RateConfigInput;
};

const MINUTE_MS = 60_000;
const HOUR_MINUTES = 60;
const DAY_MINUTES = 24 * 60;

/**
 * Computes the parking fee in cents for a completed session.
 *
 * Rules:
 * - Monthly subscribers never pay per-session (their subscription covers it).
 * - The grace period is subtracted before billing starts (a car that leaves
 *   within the grace window pays nothing at all).
 * - Billable time is rounded UP to the next full hour (standard lot pricing —
 *   1h05 of billable time bills as 2 hours), with a minimum of 1 billed hour
 *   for any billable stay.
 * - The daily cap applies per calendar day of the stay: a car parked for 3
 *   days can never be charged more than 3x the daily max, regardless of the
 *   hourly rate.
 */
export function calculateParkingFee({
  entryAt,
  exitAt,
  isSubscriber,
  rate,
}: FeeCalculationInput): number {
  if (isSubscriber) return 0;

  const totalMinutes = Math.max(
    0,
    Math.round((exitAt.getTime() - entryAt.getTime()) / MINUTE_MS)
  );

  const billableMinutes = totalMinutes - rate.gracePeriodMins;
  if (billableMinutes <= 0) return 0;

  const billedHours = Math.ceil(billableMinutes / HOUR_MINUTES);
  const rawFee = billedHours * rate.hourlyRateCents;

  const daysSpanned = Math.max(1, Math.ceil(totalMinutes / DAY_MINUTES));
  const cap = daysSpanned * rate.dailyMaxCents;

  return Math.min(rawFee, cap);
}

/** Elapsed whole minutes between two instants, never negative. */
export function elapsedMinutes(from: Date, to: Date): number {
  return Math.max(0, Math.round((to.getTime() - from.getTime()) / MINUTE_MS));
}

/** Formats a cents integer as a currency string, e.g. 150 -> "$1.50". */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Formats an elapsed-minutes duration as e.g. "2h 15m" or "45m". */
export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / HOUR_MINUTES);
  const minutes = totalMinutes % HOUR_MINUTES;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}
