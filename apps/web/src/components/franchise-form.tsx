"use client";

import { useState } from "react";

const AREAS = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Bình Dương",
  "Đồng Nai",
  "Tỉnh / thành khác",
];

const inputClass =
  "focus-ring mt-2 w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm font-bold text-white placeholder:text-white/35 focus:border-[#2EB958]";

export function FranchiseForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setStatus("loading");
    setMessage("");
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/franchise-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setStatus("success");
    } else {
      const data = await response.json().catch(() => null);
      setStatus("error");
      setMessage(data?.error || "Chưa gửi được đăng ký, vui lòng thử lại.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-[2rem] border border-[#2EB958]/40 bg-black/35 p-8 text-center backdrop-blur-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#2EB958]/15 text-2xl text-[#2EB958]">
          ✓
        </span>
        <h3 className="mt-5 text-2xl font-black text-white">Đã nhận đăng ký!</h3>
        <p className="mt-3 text-sm font-bold leading-6 text-white/62">
          Cảm ơn bạn đã quan tâm tới cơ hội nhượng quyền 99 Billiards. Đội ngũ
          phát triển đối tác sẽ liên hệ tư vấn trong thời gian sớm nhất.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="focus-ring mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#2EB958] hover:text-white"
        >
          Gửi đăng ký khác
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-black/35 p-6 backdrop-blur-sm md:p-8">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-[#2EB958]">
        Đăng ký tư vấn
      </p>
      <h3 className="mt-3 text-2xl font-black leading-tight text-white">
        Nhận tư vấn nhượng quyền miễn phí
      </h3>
      <p className="mt-2 text-sm font-bold text-white/55">
        Để lại thông tin, chuyên gia của chúng tôi sẽ liên hệ trong 24 giờ.
      </p>

      <form className="mt-6 space-y-4" action={submit}>
        <div>
          <label
            htmlFor="franchise-name"
            className="text-xs font-black uppercase tracking-[0.16em] text-white/70"
          >
            Họ và tên <span className="text-[#2EB958]">*</span>
          </label>
          <input
            id="franchise-name"
            name="customerName"
            type="text"
            required
            placeholder="Nguyễn Văn A"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="franchise-phone"
            className="text-xs font-black uppercase tracking-[0.16em] text-white/70"
          >
            Số điện thoại <span className="text-[#2EB958]">*</span>
          </label>
          <input
            id="franchise-phone"
            name="phone"
            type="tel"
            required
            placeholder="09xx xxx xxx"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="franchise-area"
            className="text-xs font-black uppercase tracking-[0.16em] text-white/70"
          >
            Khu vực dự kiến
          </label>
          <select
            id="franchise-area"
            name="area"
            defaultValue=""
            className={`${inputClass} appearance-none`}
          >
            <option value="" disabled>
              Chọn khu vực
            </option>
            {AREAS.map((area) => (
              <option key={area} value={area} className="bg-[#0a140d]">
                {area}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="franchise-capital"
            className="text-xs font-black uppercase tracking-[0.16em] text-white/70"
          >
            Vốn đầu tư dự kiến
          </label>
          <input
            id="franchise-capital"
            name="capital"
            type="text"
            placeholder="VD: 1 – 2 tỷ đồng"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="focus-ring w-full rounded-full bg-[#2EB958] px-6 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-[#071107] transition hover:bg-white disabled:opacity-60"
        >
          {status === "loading" ? "Đang gửi..." : "Đăng ký ngay"}
        </button>
        {status === "error" ? (
          <p className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-center text-sm font-bold text-red-200">
            {message}
          </p>
        ) : (
          <p className="text-center text-[11px] font-bold text-white/40">
            Thông tin của bạn được bảo mật tuyệt đối.
          </p>
        )}
      </form>
    </div>
  );
}
