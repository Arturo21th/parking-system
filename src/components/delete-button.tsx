"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import type { ActionResult } from "@/lib/actions/zones";

export function DeleteButton({
  id,
  action,
  confirmMessage,
}: {
  id: string;
  action: (id: string) => Promise<ActionResult>;
  confirmMessage?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    startTransition(async () => {
      const result = await action(id);
      if (result.ok) {
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      disabled={isPending}
      onClick={handleClick}
      aria-label="Delete"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </Button>
  );
}
