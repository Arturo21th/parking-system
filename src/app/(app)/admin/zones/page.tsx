import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateZoneForm } from "@/components/create-zone-form";
import { CreateSpotForm } from "@/components/create-spot-form";
import { DeleteButton } from "@/components/delete-button";
import { getZonesWithSpots } from "@/lib/data";
import { deleteSpot, deleteZone } from "@/lib/actions/zones";

export default async function ZonesAdminPage() {
  const zones = await getZonesWithSpots();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Zones & Spots</h2>
        <p className="text-muted-foreground text-sm">
          Manage the physical layout of the facility.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a zone</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateZoneForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a spot</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateSpotForm zones={zones.map((z) => ({ id: z.id, code: z.code }))} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {zones.map((zone) => (
          <Card key={zone.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  {zone.code} — {zone.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {zone.covered ? "Covered" : "Uncovered"} · {zone.spots.length} spot(s)
                </p>
              </div>
              <DeleteButton
                id={zone.id}
                action={deleteZone}
                confirmMessage={`Delete zone ${zone.code}? It must have no spots.`}
              />
            </CardHeader>
            <CardContent className="space-y-2">
              {zone.spots.length === 0 && (
                <p className="text-sm text-muted-foreground">No spots yet.</p>
              )}
              {zone.spots.map((spot) => {
                const occupied = spot.sessions.length > 0;
                return (
                  <div
                    key={spot.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{spot.code}</span>
                      <Badge variant="outline">{spot.type}</Badge>
                      <Badge variant={occupied ? "destructive" : "secondary"}>
                        {occupied ? "Occupied" : "Free"}
                      </Badge>
                    </div>
                    <DeleteButton
                      id={spot.id}
                      action={deleteSpot}
                      confirmMessage={`Delete spot ${spot.code}?`}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
