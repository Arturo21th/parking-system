import { prisma } from "@/lib/prisma";

export async function getActiveRateConfig() {
  return prisma.rateConfig.findFirst({ orderBy: { createdAt: "desc" } });
}

export async function getZonesWithSpots() {
  return prisma.zone.findMany({
    orderBy: { code: "asc" },
    include: {
      spots: {
        orderBy: { code: "asc" },
        include: {
          sessions: {
            where: { status: "ACTIVE" },
            take: 1,
          },
        },
      },
    },
  });
}

export async function getActiveSessions() {
  return prisma.parkingSession.findMany({
    where: { status: "ACTIVE" },
    include: { spot: { include: { zone: true } } },
    orderBy: { entryAt: "asc" },
  });
}

export async function getDashboardSummary() {
  const [totalSpots, occupiedSpots, zones] = await Promise.all([
    prisma.parkingSpot.count(),
    prisma.parkingSpot.count({ where: { sessions: { some: { status: "ACTIVE" } } } }),
    prisma.zone.findMany({
      orderBy: { code: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        _count: { select: { spots: true } },
        spots: {
          select: {
            sessions: { where: { status: "ACTIVE" }, select: { id: true } },
          },
        },
      },
    }),
  ]);

  const zoneBreakdown = zones.map((z) => ({
    id: z.id,
    code: z.code,
    name: z.name,
    total: z._count.spots,
    occupied: z.spots.filter((s) => s.sessions.length > 0).length,
  }));

  return {
    totalSpots,
    occupiedSpots,
    freeSpots: totalSpots - occupiedSpots,
    zoneBreakdown,
  };
}

export async function getZonesList() {
  return prisma.zone.findMany({ orderBy: { code: "asc" } });
}

export async function getSubscribers() {
  return prisma.monthlySubscriber.findMany({ orderBy: { validUntil: "asc" } });
}

export type ClosedSessionFilters = {
  plate?: string;
  from?: string;
  to?: string;
};

export async function getClosedSessions(filters: ClosedSessionFilters = {}) {
  return prisma.parkingSession.findMany({
    where: {
      status: "CLOSED",
      ...(filters.plate ? { plate: { contains: filters.plate.toUpperCase() } } : {}),
      ...(filters.from || filters.to
        ? {
            entryAt: {
              ...(filters.from ? { gte: new Date(filters.from) } : {}),
              ...(filters.to ? { lte: new Date(`${filters.to}T23:59:59`) } : {}),
            },
          }
        : {}),
    },
    include: { spot: { include: { zone: true } } },
    orderBy: { exitAt: "desc" },
    take: 200,
  });
}

export async function getRevenueByDay(days: number) {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const sessions = await prisma.parkingSession.findMany({
    where: { status: "CLOSED", exitAt: { gte: since } },
    select: { exitAt: true, feeCents: true },
  });

  const byDay = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const s of sessions) {
    if (!s.exitAt) continue;
    const key = s.exitAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + (s.feeCents ?? 0));
  }

  return Array.from(byDay.entries()).map(([date, totalCents]) => ({ date, totalCents }));
}
