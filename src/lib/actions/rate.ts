"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session-guard";
import { rateConfigSchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/actions/zones";

export async function updateRateConfig(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = rateConfigSchema.safeParse({
    hourlyRate: formData.get("hourlyRate"),
    gracePeriodMins: formData.get("gracePeriodMins"),
    dailyMax: formData.get("dailyMax"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  // A new row is inserted (not an update-in-place) so the rate history is
  // preserved; every read uses the most recently created row as "active".
  await prisma.rateConfig.create({
    data: {
      hourlyRateCents: Math.round(parsed.data.hourlyRate * 100),
      gracePeriodMins: parsed.data.gracePeriodMins,
      dailyMaxCents: Math.round(parsed.data.dailyMax * 100),
    },
  });

  revalidatePath("/admin/rate");
  revalidatePath("/");
  return { ok: true };
}
