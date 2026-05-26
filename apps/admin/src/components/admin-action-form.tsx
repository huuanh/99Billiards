"use client";

import type { AdminActionState } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useRef, useState } from "react";

const emptyActionState: AdminActionState = {
  ok: false,
  message: "",
  fieldErrors: {},
};

const maxActionUploadBytes = 25 * 1024 * 1024;
const maxSingleUploadBytes = 10 * 1024 * 1024;

function formatMegabytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function validateFormFiles(formData: FormData) {
  const files = Array.from(formData.values()).filter(
    (value): value is File => value instanceof File && value.size > 0,
  );
  const oversizedFile = files.find((file) => file.size > maxSingleUploadBytes);
  if (oversizedFile) {
    return `Ảnh "${oversizedFile.name}" nặng ${formatMegabytes(oversizedFile.size)}. Mỗi ảnh tối đa ${formatMegabytes(maxSingleUploadBytes)}.`;
  }

  const totalSize = files.reduce((total, file) => total + file.size, 0);
  if (totalSize > maxActionUploadBytes) {
    return `Tổng dung lượng ảnh đang chọn là ${formatMegabytes(totalSize)}. Mỗi lần lưu tối đa ${formatMegabytes(maxActionUploadBytes)}.`;
  }

  return "";
}

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
  const [clientError, setClientError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const lastFormDataRef = useRef<FormData | null>(null);
  const router = useRouter();
  const formId = useId();

  useEffect(() => {
    if (!state.ok) return;

    formRef.current?.reset();
    lastFormDataRef.current = null;
    window.dispatchEvent(new CustomEvent("admin-form-reset", { detail: { formId } }));
    router.refresh();

    if (closeModalOnSuccess) {
      window.dispatchEvent(
        new CustomEvent("admin-form-success", { detail: { message: state.message } }),
      );
    }
  }, [closeModalOnSuccess, formId, router, state]);

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
      data-admin-form-id={formId}
      action={formAction}
      className={className}
      noValidate
      onSubmit={(event) => {
        const formData = new FormData(event.currentTarget);
        const fileError = validateFormFiles(formData);
        if (fileError) {
          event.preventDefault();
          setClientError(fileError);
          return;
        }

        setClientError("");
        lastFormDataRef.current = formData;
      }}
    >
      {clientError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
        >
          {clientError}
        </div>
      ) : null}
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
