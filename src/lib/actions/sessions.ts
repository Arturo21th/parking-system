"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session-guard";
import { checkInSchema } from "@/lib/validations";
import { calculateParkingFee } from "@/lib/parking";
import type { ActionResult } from "@/lib/actions/zones";

export async function checkIn(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireSession();
  const parsed = checkInSchema.safeParse({
    plate: formData.get("plate"),
    zoneId: formData.get("zoneId"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const { plate, zoneId } = parsed.data;

  const alreadyActive = await prisma.parkingSession.findFirst({
    where: { plate, status: "ACTIVE" },
  });
  if (alreadyActive) {
    return { ok: false, error: `Plate ${plate} is already checked in.` };
  }

  // Pick any free spot in the requested zone: a spot with no currently
  // active session on it.
  const freeSpot = await prisma.parkingSpot.findFirst({
    where: { zoneId, sessions: { none: { status: "ACTIVE" } } },
    orderBy: { code: "asc" },
  });
  if (!freeSpot) {
    return { ok: false, error: "No free spots in that zone right now." };
  }

  const subscriber = await prisma.monthlySubscriber.findFirst({
    where: { plate, validUntil: { gte: new Date() } },
  });

  await prisma.parkingSession.create({
    data: {
      plate,
      spotId: freeSpot.id,
      wasSubscriber: Boolean(subscriber),
    },
  });

  revalidatePath("/");
  return { ok: true };
}

export async function checkOut(sessionId: string): Promise<ActionResult> {
  await requireSession();

  const session = await prisma.parkingSession.findUnique({
    where: { id: sessionId },
  });
  if (!session || session.status !== "ACTIVE") {
    return { ok: false, error: "That session is not active." };
  }

  const rate = await prisma.rateConfig.findFirst({ orderBy: { createdAt: "desc" } });
  if (!rate) {
    return { ok: false, error: "No rate configuration exists yet — set one up in Admin." };
  }

  const exitAt = new Date();
  const feeCents = calculateParkingFee({
    entryAt: session.entryAt,
    exitAt,
    isSubscriber: session.wasSubscriber,
    rate: {
      hourlyRateCents: rate.hourlyRateCents,
      gracePeriodMins: rate.gracePeriodMins,
      dailyMaxCents: rate.dailyMaxCents,
    },
  });

  await prisma.parkingSession.update({
    where: { id: sessionId },
    data: { exitAt, feeCents, status: "CLOSED" },
  });

  revalidatePath("/");
  revalidatePath("/reports");
  return { ok: true };
}

/** Convenience check-out used by the dashboard's "check out by plate" box. */
export async function checkOutByPlate(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireSession();
  const plate = String(formData.get("plate") ?? "").trim().toUpperCase();
  if (!plate) return { ok: false, error: "Enter a plate number." };

  const session = await prisma.parkingSession.findFirst({
    where: { plate, status: "ACTIVE" },
  });
  if (!session) {
    return { ok: false, error: `No active session found for plate ${plate}.` };
  }
  return checkOut(session.id);
}
