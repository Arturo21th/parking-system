import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getClosedSessions, getRevenueByDay } from "@/lib/data";
import { formatCents, formatDuration, elapsedMinutes } from "@/lib/parking";
import { RevenueChart } from "@/components/revenue-chart";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ plate?: string; from?: string; to?: string }>;
}) {
  const { plate, from, to } = await searchParams;

  const [sessions, revenue] = await Promise.all([
    getClosedSessions({ plate, from, to }),
    getRevenueByDay(14),
  ]);

  const totalRevenue = sessions.reduce((sum, s) => sum + (s.feeCents ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Reports</h2>
        <p className="text-muted-foreground text-sm">
          Closed sessions and revenue history.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue — last 14 days</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenue} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="flex flex-wrap items-end gap-3" method="get">
            <div className="space-y-1.5">
              <Label htmlFor="plate">Plate contains</Label>
              <Input id="plate" name="plate" defaultValue={plate ?? ""} className="w-40" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="from">From</Label>
              <Input id="from" name="from" type="date" defaultValue={from ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="to">To</Label>
              <Input id="to" name="to" type="date" defaultValue={to ?? ""} />
            </div>
            <Button type="submit" variant="secondary">
              Filter
            </Button>
          </form>

          <p className="text-sm text-muted-foreground">
            {sessions.length} session(s) — total revenue{" "}
            <span className="font-medium text-foreground">
              {formatCents(totalRevenue)}
            </span>
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plate</TableHead>
                <TableHead>Spot</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>Exit</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.plate}</TableCell>
                  <TableCell>
                    {s.spot ? `${s.spot.zone.code} · ${s.spot.code}` : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.entryAt.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.exitAt?.toLocaleString() ?? "—"}
                  </TableCell>
                  <TableCell>
                    {s.exitAt ? formatDuration(elapsedMinutes(s.entryAt, s.exitAt)) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {s.wasSubscriber ? "Free" : formatCents(s.feeCents ?? 0)}
                  </TableCell>
                </TableRow>
              ))}
              {sessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                    No sessions match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
