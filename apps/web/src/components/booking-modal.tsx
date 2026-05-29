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
  const [activeBranchId, setActiveBranchId] = useState<string | undefined>(
    defaultBranchId ?? branches[0]?.id,
  );

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function closeModal() {
    setOpen(false);
    // Reset status sau khi đóng để lần mở tiếp theo bắt đầu lại từ form trống.
    window.setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 200);
    if (window.location.hash === "#booking") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  useEffect(() => {
    function openModal(event: Event) {
      const detail = (event as CustomEvent<{ branchId?: string | null }>).detail;
      if (detail?.branchId) {
        setActiveBranchId(detail.branchId);
      }
      setOpen(true);
    }

    function openFromHash() {
      if (window.location.hash === "#booking") {
        setOpen(true);
      }
    }

    openFromHash();
    window.addEventListener("open-booking-modal", openModal as EventListener);
    window.addEventListener("hashchange", openFromHash);
    return () => {
      window.removeEventListener("open-booking-modal", openModal as EventListener);
      window.removeEventListener("hashchange", openFromHash);
    };
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
        className="focus-ring fixed bottom-5 right-5 z-40 hidden min-h-12 rounded-full bg-[#2EB958] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#071107] shadow-[0_0_28px_rgba(46, 185, 88,0.45)] transition hover:-translate-y-1 hover:bg-white motion-reduce:hover:translate-y-0 md:block"
      >
        Đặt bàn
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 md:p-4">
          <div className="glass max-h-[88vh] w-full max-w-2xl overflow-auto rounded-2xl p-4 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#2EB958]">
                  {status === "success" ? "Booking confirmed" : "Booking desk"}
                </p>
                <h2 className="mt-1 text-xl font-black md:text-2xl">
                  {status === "success" ? "Đặt bàn thành công" : "Giữ bàn trong 30 giây"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="focus-ring h-9 w-9 shrink-0 rounded-full border border-white/15 text-lg text-white/80 transition hover:bg-white hover:text-black"
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            {status === "success" ? (
              <div
                role="status"
                aria-live="polite"
                className="mt-6 flex flex-col items-center justify-center gap-5 rounded-2xl border border-[#2EB958]/35 bg-[#2EB958]/10 px-5 py-12 text-center md:py-16"
              >
                <span
                  aria-hidden="true"
                  className="grid h-20 w-20 place-items-center rounded-full bg-[#2EB958] text-4xl font-black text-[#071107] shadow-[0_0_36px_rgba(46,185,88,0.45)] md:h-24 md:w-24 md:text-5xl"
                >
                  ✓
                </span>
                <p className="max-w-md text-2xl font-black leading-snug text-white md:text-3xl">
                  {message}
                </p>
                <p className="text-sm font-bold text-white/65 md:text-base">
                  Cảm ơn bạn đã chọn 99 Billiards.
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="focus-ring mt-2 rounded-full bg-[#2EB958] px-7 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#071107] transition hover:bg-white"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <>
            <form action={submit} className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="grid min-w-0 gap-1.5 text-xs font-bold text-white/75">
                Họ tên
                <input
                  name="customerName"
                  required
                  className="w-full min-w-0 rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm text-white outline-none transition focus:border-[#2EB958]"
                  placeholder="Nguyễn Văn A"
                />
              </label>
              <label className="grid min-w-0 gap-1.5 text-xs font-bold text-white/75">
                Số điện thoại
                <input
                  name="phone"
                  required
                  className="w-full min-w-0 rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm text-white outline-none transition focus:border-[#2EB958]"
                  placeholder="09..."
                />
              </label>
              <label className="grid min-w-0 gap-1.5 text-xs font-bold text-white/75 md:col-span-2">
                Cơ sở
                <select
                  key={activeBranchId}
                  name="branchId"
                  defaultValue={activeBranchId || branches[0]?.id}
                  className="w-full min-w-0 rounded-lg border border-white/10 bg-[#0c130f] px-3 py-2 text-sm text-white outline-none transition focus:border-[#2EB958]"
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.code} - {branch.address}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid min-w-0 gap-1.5 text-xs font-bold text-white/75">
                Ngày đặt
                <input
                  name="bookingDate"
                  type="date"
                  min={today}
                  defaultValue={today}
                  className="w-full min-w-0 rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm text-white outline-none transition focus:border-[#2EB958]"
                />
              </label>
              <label className="grid min-w-0 gap-1.5 text-xs font-bold text-white/75">
                Giờ đến
                <input
                  name="bookingTime"
                  type="time"
                  defaultValue="19:30"
                  className="w-full min-w-0 rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm text-white outline-none transition focus:border-[#2EB958]"
                />
              </label>
              <label className="grid min-w-0 gap-1.5 text-xs font-bold text-white/75">
                Số khách
                <input
                  name="guestCount"
                  type="number"
                  min="1"
                  defaultValue="4"
                  className="w-full min-w-0 rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm text-white outline-none transition focus:border-[#2EB958]"
                />
              </label>
              <label className="grid min-w-0 gap-1.5 text-xs font-bold text-white/75">
                Ưu đãi
                <select
                  name="promotionId"
                  className="w-full min-w-0 rounded-lg border border-white/10 bg-[#0c130f] px-3 py-2 text-sm text-white outline-none transition focus:border-[#2EB958]"
                >
                  <option value="">Chọn sau</option>
                  {promotions.map((promotion) => (
                    <option key={promotion.id} value={promotion.id}>
                      {promotion.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid min-w-0 gap-1.5 text-xs font-bold text-white/75 md:col-span-2">
                Ghi chú
                <textarea
                  name="note"
                  rows={2}
                  className="w-full min-w-0 rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm text-white outline-none transition focus:border-[#2EB958]"
                  placeholder="VD: bàn yên tĩnh, sinh nhật, xem kèo live..."
                />
              </label>
              <button
                disabled={status === "loading"}
                className="rounded-full bg-[#2EB958] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#071107] transition hover:bg-white disabled:opacity-60 md:col-span-2"
              >
                {status === "loading" ? "Đang gửi..." : "Đặt bàn ngay"}
              </button>
            </form>
            {message && status === "error" ? (
              <p className="mt-3 rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm font-bold text-red-200">
                {message}
              </p>
            ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
