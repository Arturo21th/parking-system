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
import { checkIn } from "@/lib/actions/sessions";

type Zone = { id: string; code: string; name: string };

export function CheckInForm({ zones }: { zones: Zone[] }) {
  const router = useRouter();
  return (
    <ActionForm
      action={checkIn}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      onSuccess={() => router.refresh()}
    >
      <div className="space-y-1.5 flex-1">
        <Label htmlFor="plate">Plate number</Label>
        <Input
          id="plate"
          name="plate"
          placeholder="ABC-1234"
          required
          className="uppercase"
        />
      </div>
      <div className="space-y-1.5 flex-1">
        <Label htmlFor="zoneId">Zone</Label>
        <Select name="zoneId" required>
          <SelectTrigger id="zoneId" className="w-full">
            <SelectValue placeholder="Choose a zone" />
          </SelectTrigger>
          <SelectContent>
            {zones.map((z) => (
              <SelectItem key={z.id} value={z.id}>
                {z.code} — {z.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <SubmitButton>Check in</SubmitButton>
    </ActionForm>
  );
}
