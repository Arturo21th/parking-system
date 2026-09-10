"use client";

import { useRouter } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSubscriber } from "@/lib/actions/subscribers";

export function CreateSubscriberForm() {
  const router = useRouter();
  return (
    <ActionForm
      action={createSubscriber}
      className="flex flex-wrap items-end gap-3"
      onSuccess={() => router.refresh()}
    >
      <div className="space-y-1.5">
        <Label htmlFor="sub-plate">Plate</Label>
        <Input id="sub-plate" name="plate" placeholder="SUB-001" className="uppercase w-32" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="holderName">Holder name</Label>
        <Input id="holderName" name="holderName" placeholder="Jane Doe" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="validUntil">Valid until</Label>
        <Input id="validUntil" name="validUntil" type="date" required />
      </div>
      <SubmitButton>Add subscriber</SubmitButton>
    </ActionForm>
  );
}
