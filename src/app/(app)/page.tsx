import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckInForm } from "@/components/check-in-form";
import { CheckoutByPlateForm } from "@/components/checkout-by-plate-form";
import { LiveSessionsTable } from "@/components/live-sessions-table";
import {
  getActiveRateConfig,
  getActiveSessions,
  getDashboardSummary,
  getZonesList,
} from "@/lib/data";

export default async function DashboardPage() {
  const [summary, sessions, zones, rate] = await Promise.all([
    getDashboardSummary(),
    getActiveSessions(),
    getZonesList(),
    getActiveRateConfig(),
  ]);

  const rows = sessions.map((s) => ({
    id: s.id,
    plate: s.plate,
    entryAt: s.entryAt.toISOString(),
    wasSubscriber: s.wasSubscriber,
    spotCode: s.spot?.code ?? null,
    zoneCode: s.spot?.zone.code ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground text-sm">
          Live view of the facility — check vehicles in and out here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total spots</CardDescription>
            <CardTitle className="text-3xl">{summary.totalSpots}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Occupied</CardDescription>
            <CardTitle className="text-3xl text-orange-600">
              {summary.occupiedSpots}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Free</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {summary.freeSpots}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {summary.zoneBreakdown.map((z) => (
              <div key={z.id} className="rounded-lg border p-3">
                <p className="font-medium">
                  {z.code} · {z.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {z.occupied} / {z.total} occupied
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Check in a vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckInForm zones={zones} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Check out by plate</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckoutByPlateForm />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Currently parked</CardTitle>
        </CardHeader>
        <CardContent>
          <LiveSessionsTable
            rows={rows}
            rate={
              rate
                ? {
                    hourlyRateCents: rate.hourlyRateCents,
                    gracePeriodMins: rate.gracePeriodMins,
                    dailyMaxCents: rate.dailyMaxCents,
                  }
                : null
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
