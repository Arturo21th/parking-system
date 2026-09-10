"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session-guard";
import { spotSchema, zoneSchema } from "@/lib/validations";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createZone(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = zoneSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    covered: formData.get("covered") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  try {
    await prisma.zone.create({ data: parsed.data });
  } catch {
    return { ok: false, error: "A zone with that code already exists." };
  }

  revalidatePath("/admin/zones");
  return { ok: true };
}

export async function deleteZone(zoneId: string): Promise<ActionResult> {
  await requireAdmin();
  const spotCount = await prisma.parkingSpot.count({ where: { zoneId } });
  if (spotCount > 0) {
    return {
      ok: false,
      error: "Remove this zone's spots first — it still has spots assigned.",
    };
  }
  await prisma.zone.delete({ where: { id: zoneId } });
  revalidatePath("/admin/zones");
  return { ok: true };
}

export async function createSpot(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = spotSchema.safeParse({
    code: formData.get("code"),
    type: formData.get("type"),
    zoneId: formData.get("zoneId"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  try {
    await prisma.parkingSpot.create({ data: parsed.data });
  } catch {
    return { ok: false, error: "A spot with that code already exists." };
  }

  revalidatePath("/admin/zones");
  return { ok: true };
}

export async function deleteSpot(spotId: string): Promise<ActionResult> {
  await requireAdmin();
  const activeSession = await prisma.parkingSession.findFirst({
    where: { spotId, status: "ACTIVE" },
  });
  if (activeSession) {
    return { ok: false, error: "This spot currently has a vehicle parked in it." };
  }
  await prisma.parkingSpot.delete({ where: { id: spotId } });
  revalidatePath("/admin/zones");
  return { ok: true };
}
