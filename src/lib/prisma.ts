import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Prisma 7 requires an explicit driver adapter — no more bundled query engine
// binary. SQLite here keeps local dev zero-config (no external DB account
// needed); swap this file's adapter for `@prisma/adapter-pg` (Postgres /
// Supabase / Vercel Postgres) in production. See README "Deploying to
// production" for the exact steps.
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
