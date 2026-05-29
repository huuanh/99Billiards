"use client";

import { useState } from "react";

type StatusValue = "new" | "confirmed" | "cancelled" | "completed";

const STATUS_OPTIONS: { value: StatusValue; label: string }[] = [
  { value: "new", label: "Mới" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "cancelled", label: "Đã hủy" },
  { value: "completed", label: "Hoàn tất" },
];

type StatusFormProps = {
  id: string;
  status: string;
  action: (formData: FormData) => void | Promise<void>;
};

export function BookingStatusForm({ id, status, action }: StatusFormProps) {
  const initial = (STATUS_OPTIONS.find((option) => option.value === status)?.value ?? "new") as StatusValue;
  const [current, setCurrent] = useState<StatusValue>(initial);
  const dirty = current !== initial;

  return (
    <form action={action} className="flex gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        value={current}
        onChange={(event) => setCurrent(event.target.value as StatusValue)}
        className="min-h-9 rounded-md border border-[#cfd5c8] bg-white px-2 py-1 text-sm"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={!dirty}
        className="min-h-9 rounded-md bg-[#111713] px-3 py-1 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:bg-[#cfd5c8] disabled:text-[#657064]"
      >
        Lưu
      </button>
    </form>
  );
}

type DeleteFormProps = {
  id: string;
  customerName: string;
  action: (formData: FormData) => void | Promise<void>;
};

export function DeleteBookingForm({ id, customerName, action }: DeleteFormProps) {
  function confirmDelete(event: React.FormEvent<HTMLFormElement>) {
    const label = customerName ? `booking của "${customerName}"` : "booking này";
    if (!window.confirm(`Bạn chắc chắn muốn xóa ${label}?`)) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={confirmDelete}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="min-h-9 rounded-md border border-red-200 bg-red-50 px-3 py-1 text-sm font-bold text-red-700 transition hover:bg-red-100"
      >
        Xóa booking
      </button>
    </form>
  );
}
