"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ActionResult } from "@/lib/actions/zones";

type Props = {
  action: (
    prevState: ActionResult | null,
    formData: FormData
  ) => Promise<ActionResult>;
  children: React.ReactNode;
  className?: string;
  onSuccess?: () => void;
  resetOnSuccess?: boolean;
};

/** Wraps a Server Action form with pending state and inline error/success
 * feedback via React 19's useActionState — avoids a full client-side form
 * library for what are otherwise simple create/update forms. */
export function ActionForm({
  action,
  children,
  className,
  onSuccess,
  resetOnSuccess = true,
}: Props) {
  const [state, formAction] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);
  const lastState = useRef<ActionResult | null>(null);

  useEffect(() => {
    if (state && state !== lastState.current) {
      lastState.current = state;
      if (state.ok) {
        if (resetOnSuccess) formRef.current?.reset();
        onSuccess?.();
      }
    }
  }, [state, onSuccess, resetOnSuccess]);

  return (
    <form ref={formRef} action={formAction} className={className}>
      {children}
      {state && !state.ok && (
        <p className="text-sm text-destructive mt-2" role="alert">
          {state.error}
        </p>
      )}
      {state && state.ok && (
        <p className="text-sm text-green-600 mt-2">Saved.</p>
      )}
    </form>
  );
}
