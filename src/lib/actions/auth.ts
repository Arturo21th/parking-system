"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import type { ActionResult } from "@/lib/actions/zones";

export async function loginAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "Invalid email or password." };
    }
    throw error; // rethrow Next.js redirect signal
  }
}
