"use client";

import type { ReactNode } from "react";
import { FontAwesomeIcon } from "@99billiards/ui";

// Generic status workflow component dùng cho cả bookings + sales-orders.
// Mỗi button = 1 form độc lập, submit ngay 1 click (no dropdown).

type Variant = "primary" | "danger" | "neutral";

type Step = { value: string; label: string };

export type StatusWorkflow = {
  // Trạng thái → bước tiếp theo (forward).
  next?: Record<string, Step>;
  // Trạng thái cancelled → có thể revert về trạng thái gì.
  revert?: Record<string, Step>;
  // Trạng thái nào còn cho phép hủy.
  canCancelFrom: string[];
};

export const BOOKING_WORKFLOW: StatusWorkflow = {
  next: {
    new: { value: "contacted", label: "Liên hệ khách hàng" },
    contacted: { value: "completed", label: "Hoàn tất" },
    // Backward-compat: record cũ có status "confirmed" đối xử như đã liên hệ.
    confirmed: { value: "completed", label: "Hoàn tất" },
  },
  revert: {
    cancelled: { value: "new", label: "Mở lại" },
  },
  canCancelFrom: ["new", "contacted", "confirmed"],
};

export const FRANCHISE_LEAD_WORKFLOW: StatusWorkflow = {
  next: {
    new: { value: "contacted", label: "Liên hệ khách hàng" },
    contacted: { value: "completed", label: "Hoàn tất" },
    confirmed: { value: "completed", label: "Hoàn tất" },
  },
  revert: {
    cancelled: { value: "new", label: "Mở lại" },
  },
  canCancelFrom: ["new", "contacted", "confirmed"],
};

export const SALES_ORDER_WORKFLOW: StatusWorkflow = {
  next: {
    new: { value: "contacted", label: "Liên hệ khách hàng" },
    contacted: { value: "shipping", label: "Bắt đầu giao hàng" },
    shipping: { value: "completed", label: "Hoàn tất" },
    // Backward-compat: order cũ có status "confirmed" tiến thẳng sang Bắt đầu giao.
    confirmed: { value: "shipping", label: "Bắt đầu giao hàng" },
  },
  revert: {
    cancelled: { value: "new", label: "Mở lại" },
  },
  canCancelFrom: ["new", "contacted", "confirmed", "shipping"],
};

type Props = {
  id: string;
  status: string;
  workflow: StatusWorkflow;
  // Server action nhận formData {id, status}
  updateAction: (formData: FormData) => void | Promise<void>;
  deleteAction?: (formData: FormData) => void | Promise<void>;
  deleteConfirmMessage?: string;
};

export function StatusActions({
  id,
  status,
  workflow,
  updateAction,
  deleteAction,
  deleteConfirmMessage,
}: Props) {
  const current = status || "new";
  const next = workflow.next?.[current];
  const revert = workflow.revert?.[current];
  const canCancel = workflow.canCancelFrom.includes(current);

  return (
    <div className="flex flex-col gap-1.5">
      {next ? (
        <ActionButton
          id={id}
          status={next.value}
          action={updateAction}
          variant="primary"
          icon="chevron-right"
        >
          {next.label}
        </ActionButton>
      ) : null}
      {revert ? (
        <ActionButton
          id={id}
          status={revert.value}
          action={updateAction}
          variant="neutral"
          icon="chevron-left"
        >
          {revert.label}
        </ActionButton>
      ) : null}
      {canCancel ? (
        <ActionButton
          id={id}
          status="cancelled"
          action={updateAction}
          variant="danger"
          icon="xmark"
        >
          Hủy
        </ActionButton>
      ) : null}
      {deleteAction ? (
        <DeleteButton id={id} action={deleteAction} confirmMessage={deleteConfirmMessage} />
      ) : null}
    </div>
  );
}

function ActionButton({
  id,
  status,
  action,
  variant,
  icon,
  children,
}: {
  id: string;
  status: string;
  action: (formData: FormData) => void | Promise<void>;
  variant: Variant;
  icon: "chevron-right" | "chevron-left" | "xmark" | "trash";
  children: ReactNode;
}) {
  const base =
    "min-h-9 w-full rounded-md px-3 py-1 text-xs font-black uppercase tracking-[0.06em] transition";
  const classes: Record<Variant, string> = {
    primary: `${base} bg-[#2EB958] text-black hover:bg-[#27a04b]`,
    danger: `${base} border border-red-200 bg-white text-red-700 hover:bg-red-50`,
    neutral: `${base} border border-[#cfd5c8] bg-white text-[#2b332d] hover:border-[#111713]`,
  };

  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={classes[variant]}>
        <span className="inline-flex items-center gap-1.5">
          <FontAwesomeIcon icon={icon} className="h-3 w-3" />
          {children}
        </span>
      </button>
    </form>
  );
}

function DeleteButton({
  id,
  action,
  confirmMessage,
}: {
  id: string;
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage?: string;
}) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="min-h-9 w-full rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-black uppercase tracking-[0.06em] text-red-700 transition hover:bg-red-100"
      >
        <span className="inline-flex items-center gap-1.5">
          <FontAwesomeIcon icon="trash" className="h-3 w-3" />
          Xóa
        </span>
      </button>
    </form>
  );
}
