"use client";

import { useRouter } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSpot } from "@/lib/actions/zones";

const TYPES = ["REGULAR", "HANDICAP", "RESERVED", "MOTORCYCLE"] as const;

export function CreateSpotForm({ zones }: { zones: { id: string; code: string }[] }) {
  const router = useRouter();
  return (
    <ActionForm action={createSpot} className="flex flex-wrap items-end gap-3" onSuccess={() => router.refresh()}>
      <div className="space-y-1.5">
        <Label htmlFor="spot-code">Code</Label>
        <Input id="spot-code" name="code" placeholder="D-01" className="w-28" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="zoneId">Zone</Label>
        <Select name="zoneId" required>
          <SelectTrigger id="zoneId" className="w-32">
            <SelectValue placeholder="Zone" />
          </SelectTrigger>
          <SelectContent>
            {zones.map((z) => (
              <SelectItem key={z.id} value={z.id}>
                {z.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="type">Type</Label>
        <Select name="type" defaultValue="REGULAR">
          <SelectTrigger id="type" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <SubmitButton>Add spot</SubmitButton>
    </ActionForm>
  );
}
