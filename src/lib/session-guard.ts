import { auth } from "@/lib/auth";

/** Throws if there's no authenticated session. Use at the top of every
 * Server Action — Server Functions are reachable via direct POST requests,
 * not just through the app's UI, so auth must be re-checked inside each one. */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden: admin role required");
  }
  return session;
}
