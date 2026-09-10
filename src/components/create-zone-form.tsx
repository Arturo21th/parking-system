"use client";

import { useRouter } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createZone } from "@/lib/actions/zones";

export function CreateZoneForm() {
  const router = useRouter();
  return (
    <ActionForm action={createZone} className="flex flex-wrap items-end gap-3" onSuccess={() => router.refresh()}>
      <div className="space-y-1.5">
        <Label htmlFor="code">Code</Label>
        <Input id="code" name="code" placeholder="D" className="w-24" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" placeholder="Zone D - Basement" required />
      </div>
      <label className="flex items-center gap-2 text-sm pb-2">
        <input type="checkbox" name="covered" className="size-4" />
        Covered
      </label>
      <SubmitButton>Add zone</SubmitButton>
    </ActionForm>
  );
}
