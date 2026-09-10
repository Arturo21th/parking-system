"use client";

import { useRouter } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateRateConfig } from "@/lib/actions/rate";

export function RateConfigForm({
  hourlyRate,
  gracePeriodMins,
  dailyMax,
}: {
  hourlyRate: number;
  gracePeriodMins: number;
  dailyMax: number;
}) {
  const router = useRouter();
  return (
    <ActionForm
      action={updateRateConfig}
      className="grid gap-4 sm:grid-cols-3"
      resetOnSuccess={false}
      onSuccess={() => router.refresh()}
    >
      <div className="space-y-1.5">
        <Label htmlFor="hourlyRate">Hourly rate (USD)</Label>
        <Input
          key={`hourly-${hourlyRate}`}
          id="hourlyRate"
          name="hourlyRate"
          type="number"
          step="0.01"
          min="0"
          defaultValue={hourlyRate.toFixed(2)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="gracePeriodMins">Grace period (minutes)</Label>
        <Input
          key={`grace-${gracePeriodMins}`}
          id="gracePeriodMins"
          name="gracePeriodMins"
          type="number"
          min="0"
          max="120"
          defaultValue={gracePeriodMins}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dailyMax">Daily max (USD)</Label>
        <Input
          key={`daily-${dailyMax}`}
          id="dailyMax"
          name="dailyMax"
          type="number"
          step="0.01"
          min="0"
          defaultValue={dailyMax.toFixed(2)}
          required
        />
      </div>
      <div className="sm:col-span-3">
        <SubmitButton>Save new rate</SubmitButton>
      </div>
    </ActionForm>
  );
}
