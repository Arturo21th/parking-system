"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateParkingFee, elapsedMinutes, formatCents, formatDuration } from "@/lib/parking";
import { checkOut } from "@/lib/actions/sessions";

type Row = {
  id: string;
  plate: string;
  entryAt: string; // ISO
  wasSubscriber: boolean;
  spotCode: string | null;
  zoneCode: string | null;
};

type Rate = {
  hourlyRateCents: number;
  gracePeriodMins: number;
  dailyMaxCents: number;
};

export function LiveSessionsTable({ rows, rate }: { rows: Row[]; rate: Rate | null }) {
  const [now, setNow] = useState(() => new Date());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No vehicles currently parked.
      </p>
    );
  }

  function handleCheckOut(id: string, plate: string) {
    startTransition(async () => {
      const result = await checkOut(id);
      if (result.ok) {
        toast.success(`${plate} checked out`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Plate</TableHead>
          <TableHead>Spot</TableHead>
          <TableHead>Entry time</TableHead>
          <TableHead>Elapsed</TableHead>
          <TableHead>Running fee</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => {
          const entryAt = new Date(r.entryAt);
          const minutes = elapsedMinutes(entryAt, now);
          const runningFee = rate
            ? calculateParkingFee({
                entryAt,
                exitAt: now,
                isSubscriber: r.wasSubscriber,
                rate,
              })
            : 0;
          return (
            <TableRow key={r.id}>
              <TableCell className="font-medium">
                {r.plate}
                {r.wasSubscriber && (
                  <Badge variant="secondary" className="ml-2">
                    Subscriber
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {r.zoneCode ? `${r.zoneCode} · ${r.spotCode}` : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {entryAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </TableCell>
              <TableCell>{formatDuration(minutes)}</TableCell>
              <TableCell>
                {r.wasSubscriber ? "Free" : formatCents(runningFee)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => handleCheckOut(r.id, r.plate)}
                >
                  Check out
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
