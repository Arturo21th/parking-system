"use client";

import { useRouter } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkOutByPlate } from "@/lib/actions/sessions";

export function CheckoutByPlateForm() {
  const router = useRouter();
  return (
    <ActionForm
      action={checkOutByPlate}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      onSuccess={() => router.refresh()}
    >
      <div className="space-y-1.5 flex-1">
        <Label htmlFor="plate-out">Plate number</Label>
        <Input id="plate-out" name="plate" placeholder="ABC-1234" required className="uppercase" />
      </div>
      <SubmitButton variant="secondary">Check out</SubmitButton>
    </ActionForm>
  );
}
