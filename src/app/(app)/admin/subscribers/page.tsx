import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateSubscriberForm } from "@/components/create-subscriber-form";
import { DeleteButton } from "@/components/delete-button";
import { getSubscribers } from "@/lib/data";
import { deleteSubscriber } from "@/lib/actions/subscribers";

export default async function SubscribersAdminPage() {
  const subscribers = await getSubscribers();
  const now = new Date();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Monthly Subscribers</h2>
        <p className="text-muted-foreground text-sm">
          Vehicles on the subscriber list park for free while their subscription is valid.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a subscriber</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateSubscriberForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plate</TableHead>
                <TableHead>Holder</TableHead>
                <TableHead>Valid until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((s) => {
                const expired = s.validUntil < now;
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.plate}</TableCell>
                    <TableCell>{s.holderName}</TableCell>
                    <TableCell>{s.validUntil.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={expired ? "destructive" : "secondary"}>
                        {expired ? "Expired" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteButton id={s.id} action={deleteSubscriber} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {subscribers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    No subscribers yet.
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
