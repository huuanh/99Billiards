"use client";

import type { AdminActionState } from "@/app/actions";
import { useActionState, useEffect, useRef } from "react";

const emptyActionState: AdminActionState = {
  ok: false,
  message: "",
  fieldErrors: {},
};

export function AdminActionForm({
  action,
  closeModalOnSuccess = false,
  children,
  className = "grid gap-5",
}: {
  action: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  closeModalOnSuccess?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, emptyActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const lastFormDataRef = useRef<FormData | null>(null);

  useEffect(() => {
    if (state.ok && closeModalOnSuccess) {
      window.dispatchEvent(
        new CustomEvent("admin-form-success", { detail: { message: state.message } }),
      );
    }
  }, [closeModalOnSuccess, state]);

  useEffect(() => {
    if (!state.message || state.ok || !lastFormDataRef.current) return;

    const form = formRef.current;
    const formData = lastFormDataRef.current;
    if (!form) return;

    window.requestAnimationFrame(() => {
      for (const element of Array.from(form.elements)) {
        if (
          !(element instanceof HTMLInputElement) &&
          !(element instanceof HTMLTextAreaElement) &&
          !(element instanceof HTMLSelectElement)
        ) {
          continue;
        }

        if (!element.name || element.type === "file") continue;
        const value = formData.get(element.name);
        if (value === null) continue;

        if (element instanceof HTMLInputElement && element.type === "checkbox") {
          element.checked = value === "on";
        } else {
          element.value = String(value);
        }
      }
    });
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className={className}
      noValidate
      onSubmit={(event) => {
        lastFormDataRef.current = new FormData(event.currentTarget);
      }}
    >
      {state.message && state.ok && !closeModalOnSuccess ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
          {state.message}
        </div>
      ) : null}
      {state.message && !state.ok ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
        >
          <p>{state.message}</p>
          {state.fieldErrors && Object.keys(state.fieldErrors).length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
              {Object.entries(state.fieldErrors).map(([field, error]) => (
                <li key={field}>{error}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {children}
    </form>
  );
}
