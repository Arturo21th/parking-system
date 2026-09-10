import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { calculateParkingFee } from "../src/lib/parking";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const RATE = { hourlyRateCents: 200, gracePeriodMins: 10, dailyMaxCents: 1500 };

async function main() {
  console.log("Seeding...");

  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@parking.demo" },
    update: {},
    create: {
      email: "admin@parking.demo",
      name: "Demo Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  await prisma.rateConfig.create({ data: RATE });

  const zoneDefs = [
    { code: "A", name: "Zone A - Ground Floor", covered: true, spots: 6 },
    { code: "B", name: "Zone B - Rooftop", covered: false, spots: 6 },
    { code: "C", name: "Zone C - Visitors", covered: true, spots: 4 },
  ];

  const zones = [];
  for (const def of zoneDefs) {
    const zone = await prisma.zone.create({
      data: { code: def.code, name: def.name, covered: def.covered },
    });
    zones.push(zone);
    for (let i = 1; i <= def.spots; i++) {
      const code = `${def.code}-${String(i).padStart(2, "0")}`;
      const type =
        i === 1 ? "HANDICAP" : i === def.spots ? "MOTORCYCLE" : "REGULAR";
      await prisma.parkingSpot.create({
        data: { code, zoneId: zone.id, type },
      });
    }
  }

  const subscribers = await Promise.all([
    prisma.monthlySubscriber.create({
      data: {
        plate: "SUB-001",
        holderName: "Laura Fernández",
        validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.monthlySubscriber.create({
      data: {
        plate: "SUB-002",
        holderName: "Marco Diaz",
        validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  const allSpots = await prisma.parkingSpot.findMany({ orderBy: { code: "asc" } });

  // A few vehicles currently parked (active sessions), spread across zones.
  const activePlates = [
    { plate: "ABC-1234", spot: allSpots[1], minutesAgo: 45, subscriber: false },
    { plate: "XYZ-9087", spot: allSpots[2], minutesAgo: 130, subscriber: false },
    { plate: subscribers[0].plate, spot: allSpots[7], minutesAgo: 20, subscriber: true },
  ];
  for (const a of activePlates) {
    await prisma.parkingSession.create({
      data: {
        plate: a.plate,
        spotId: a.spot.id,
        entryAt: new Date(Date.now() - a.minutesAgo * 60_000),
        wasSubscriber: a.subscriber,
        status: "ACTIVE",
      },
    });
  }

  // Historical closed sessions over the last two weeks, for the reports page.
  const closedSpots = allSpots.filter(
    (s) => !activePlates.some((a) => a.spot.id === s.id)
  );
  let spotCursor = 0;
  for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
    const sessionsToday = 2 + (daysAgo % 3);
    for (let i = 0; i < sessionsToday; i++) {
      const spot = closedSpots[spotCursor % closedSpots.length];
      spotCursor++;
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - daysAgo);
      dayStart.setHours(8 + i * 3, (i * 17) % 60, 0, 0);

      const stayMinutes = 20 + ((i * 53 + daysAgo * 7) % 240);
      const entryAt = dayStart;
      const exitAt = new Date(entryAt.getTime() + stayMinutes * 60_000);
      const feeCents = calculateParkingFee({
        entryAt,
        exitAt,
        isSubscriber: false,
        rate: RATE,
      });

      await prisma.parkingSession.create({
        data: {
          plate: `HIS-${1000 + daysAgo * 10 + i}`,
          spotId: spot.id,
          entryAt,
          exitAt,
          feeCents,
          status: "CLOSED",
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log("Demo login: admin@parking.demo / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
