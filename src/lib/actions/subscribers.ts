"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session-guard";
import { subscriberSchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/actions/zones";

export async function createSubscriber(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = subscriberSchema.safeParse({
    plate: formData.get("plate"),
    holderName: formData.get("holderName"),
    validUntil: formData.get("validUntil"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  try {
    await prisma.monthlySubscriber.create({
      data: {
        plate: parsed.data.plate,
        holderName: parsed.data.holderName,
        validUntil: new Date(parsed.data.validUntil),
      },
    });
  } catch {
    return { ok: false, error: "A subscriber with that plate already exists." };
  }

  revalidatePath("/admin/subscribers");
  return { ok: true };
}

export async function deleteSubscriber(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.monthlySubscriber.delete({ where: { id } });
  revalidatePath("/admin/subscribers");
  return { ok: true };
}
