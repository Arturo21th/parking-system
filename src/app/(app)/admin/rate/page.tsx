import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RateConfigForm } from "@/components/rate-config-form";
import { getActiveRateConfig } from "@/lib/data";

export default async function RateAdminPage() {
  const rate = await getActiveRateConfig();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Rate Configuration</h2>
        <p className="text-muted-foreground text-sm">
          Saving creates a new rate; past sessions keep the fee they were
          originally charged, so history stays accurate.
        </p>
      </div>

      {!rate && (
        <Alert>
          <AlertDescription>
            No rate is configured yet — set one below before checking anyone
            out.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {rate ? "Update rate" : "Set initial rate"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RateConfigForm
            hourlyRate={(rate?.hourlyRateCents ?? 0) / 100}
            gracePeriodMins={rate?.gracePeriodMins ?? 10}
            dailyMax={(rate?.dailyMaxCents ?? 0) / 100}
          />
        </CardContent>
      </Card>
    </div>
  );
}
