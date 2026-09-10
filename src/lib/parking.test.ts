import { describe, expect, it } from "vitest";
import { calculateParkingFee, formatCents, formatDuration } from "./parking";

const RATE = { hourlyRateCents: 200, gracePeriodMins: 10, dailyMaxCents: 1500 };

function minutesAfter(base: Date, minutes: number): Date {
  return new Date(base.getTime() + minutes * 60_000);
}

describe("calculateParkingFee", () => {
  const entry = new Date("2026-01-01T10:00:00Z");

  it("charges nothing within the grace period", () => {
    const fee = calculateParkingFee({
      entryAt: entry,
      exitAt: minutesAfter(entry, 9),
      isSubscriber: false,
      rate: RATE,
    });
    expect(fee).toBe(0);
  });

  it("charges nothing exactly at the grace period boundary", () => {
    const fee = calculateParkingFee({
      entryAt: entry,
      exitAt: minutesAfter(entry, 10),
      isSubscriber: false,
      rate: RATE,
    });
    expect(fee).toBe(0);
  });

  it("rounds up to a full billed hour just past the grace period", () => {
    // 15 minutes total, 10 min grace -> 5 billable minutes -> rounds up to 1 hour
    const fee = calculateParkingFee({
      entryAt: entry,
      exitAt: minutesAfter(entry, 15),
      isSubscriber: false,
      rate: RATE,
    });
    expect(fee).toBe(200);
  });

  it("rounds up to 2 hours for anything past 1 billable hour", () => {
    // 80 minutes total, 10 min grace -> 70 billable minutes -> rounds up to 2 hours
    const fee = calculateParkingFee({
      entryAt: entry,
      exitAt: minutesAfter(entry, 80),
      isSubscriber: false,
      rate: RATE,
    });
    expect(fee).toBe(400);
  });

  it("applies the daily cap when the hourly total would exceed it", () => {
    // 10 hours billable at $2/hr = $20, capped at $15/day
    const fee = calculateParkingFee({
      entryAt: entry,
      exitAt: minutesAfter(entry, 10 * 60 + 10),
      isSubscriber: false,
      rate: RATE,
    });
    expect(fee).toBe(1500);
  });

  it("scales the daily cap across multi-day stays", () => {
    // ~2.5 days -> spans 3 calendar days -> cap is 3x daily max
    const fee = calculateParkingFee({
      entryAt: entry,
      exitAt: minutesAfter(entry, 60 * 60), // 60 hours = 2.5 days
      isSubscriber: false,
      rate: RATE,
    });
    expect(fee).toBe(3 * RATE.dailyMaxCents);
  });

  it("is always free for monthly subscribers regardless of duration", () => {
    const fee = calculateParkingFee({
      entryAt: entry,
      exitAt: minutesAfter(entry, 5000),
      isSubscriber: true,
      rate: RATE,
    });
    expect(fee).toBe(0);
  });

  it("never returns a negative fee for a malformed exit before entry", () => {
    const fee = calculateParkingFee({
      entryAt: entry,
      exitAt: minutesAfter(entry, -30),
      isSubscriber: false,
      rate: RATE,
    });
    expect(fee).toBe(0);
  });
});

describe("formatCents", () => {
  it("formats whole dollars", () => {
    expect(formatCents(200)).toBe("$2.00");
  });
  it("formats fractional cents", () => {
    expect(formatCents(150)).toBe("$1.50");
  });
  it("formats zero", () => {
    expect(formatCents(0)).toBe("$0.00");
  });
});

describe("formatDuration", () => {
  it("formats sub-hour durations without an hours part", () => {
    expect(formatDuration(45)).toBe("45m");
  });
  it("formats multi-hour durations", () => {
    expect(formatDuration(135)).toBe("2h 15m");
  });
});
