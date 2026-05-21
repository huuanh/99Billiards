"use client";

import { useEffect, useMemo, useState } from "react";
import type { Branch, Promotion } from "@99billiards/db/seed";

type Props = {
  branches: Branch[];
  promotions: Promotion[];
  defaultBranchId?: string;
};

export function BookingModal({ branches, promotions, defaultBranchId }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    function openModal() {
      setOpen(true);
    }

    window.addEventListener("open-booking-modal", openModal);
    return () => window.removeEventListener("open-booking-modal", openModal);
  }, []);

  async function submit(formData: FormData) {
    setStatus("loading");
    setMessage("");
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setStatus("success");
      setMessage("Đã nhận yêu cầu đặt bàn. 99 Billiards sẽ liên hệ xác nhận sớm.");
    } else {
      const data = await response.json().catch(() => null);
      setStatus("error");
      setMessage(data?.error || "Chưa gửi được đặt bàn, vui lòng thử lại.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring fixed bottom-5 right-5 z-40 hidden min-h-12 rounded-full bg-[#d6ff3f] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#071107] shadow-[0_0_28px_rgba(214,255,63,0.45)] transition hover:-translate-y-1 hover:bg-white motion-reduce:hover:translate-y-0 md:block"
      >
        Đặt bàn
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="glass max-h-[92vh] w-full max-w-3xl overflow-auto rounded-[2rem] p-5 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d6ff3f]">
                  Booking desk
                </p>
                <h2 className="mt-2 text-3xl font-black md:text-5xl">Giữ bàn trong 30 giây</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring h-11 w-11 rounded-full border border-white/15 text-xl text-white/80 transition hover:bg-white hover:text-black"
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <form action={submit} className="mt-8 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-white/75">
                Họ tên
                <input
                  name="customerName"
                  required
                  className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-white outline-none transition focus:border-[#d6ff3f]"
                  placeholder="Nguyễn Văn A"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-white/75">
                Số điện thoại
                <input
                  name="phone"
                  required
                  className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-white outline-none transition focus:border-[#d6ff3f]"
                  placeholder="09..."
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-white/75 md:col-span-2">
                Cơ sở
                <select
                  name="branchId"
                  defaultValue={defaultBranchId || branches[0]?.id}
                  className="rounded-2xl border border-white/10 bg-[#0c130f] px-4 py-3 text-white outline-none transition focus:border-[#d6ff3f]"
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.code} - {branch.address}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-white/75">
                Số khách
                <input
                  name="guestCount"
                  type="number"
                  min="1"
                  defaultValue="4"
                  className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-white outline-none transition focus:border-[#d6ff3f]"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-white/75">
                Ngày đặt
                <input
                  name="bookingDate"
                  type="date"
                  min={today}
                  defaultValue={today}
                  className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-white outline-none transition focus:border-[#d6ff3f]"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-white/75">
                Giờ đến
                <input
                  name="bookingTime"
                  type="time"
                  defaultValue="19:30"
                  className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-white outline-none transition focus:border-[#d6ff3f]"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-white/75">
                Ưu đãi
                <select
                  name="promotionId"
                  className="rounded-2xl border border-white/10 bg-[#0c130f] px-4 py-3 text-white outline-none transition focus:border-[#d6ff3f]"
                >
                  <option value="">Chọn sau</option>
                  {promotions.map((promotion) => (
                    <option key={promotion.id} value={promotion.id}>
                      {promotion.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-white/75 md:col-span-2">
                Ghi chú
                <textarea
                  name="note"
                  rows={3}
                  className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-white outline-none transition focus:border-[#d6ff3f]"
                  placeholder="Ví dụ: cần bàn yên tĩnh, đi sinh nhật, muốn xem kèo live..."
                />
              </label>
              <button
                disabled={status === "loading"}
                className="rounded-2xl bg-[#d6ff3f] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#071107] transition hover:bg-white disabled:opacity-60 md:col-span-2"
              >
                {status === "loading" ? "Đang gửi..." : "Đặt bàn ngay"}
              </button>
            </form>
            {message ? (
              <p className="mt-4 rounded-2xl border border-white/10 bg-white/8 p-4 text-sm text-white/80">
                {message}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
