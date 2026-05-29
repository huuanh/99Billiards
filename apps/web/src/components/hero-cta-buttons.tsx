"use client";

import Link from "next/link";

type Props = {
  primaryLabel: string;
  secondaryLabel: string;
  secondaryHref?: string;
};

function openBookingModal() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("open-booking-modal"));
}

// Nút chính trên hero LUÔN mở popup đặt bàn, bỏ qua mọi href config từ settings.
// Nút phụ vẫn theo href (mặc định scroll tới #branches).
export function HeroCtaButtons({ primaryLabel, secondaryLabel, secondaryHref }: Props) {
  const primaryClass =
    "focus-ring animate-cta-pulse rounded-full bg-[#2EB958] px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-[#071107] hover:bg-white sm:px-7 sm:tracking-[0.2em]";
  const secondaryClass =
    "focus-ring rounded-full border border-white/20 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-white hover:border-[#2EB958] hover:text-[#2EB958] sm:px-7 sm:tracking-[0.2em]";

  return (
    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
      <button type="button" onClick={openBookingModal} className={primaryClass}>
        {primaryLabel}
      </button>
      <Link href={secondaryHref || "#branches"} className={secondaryClass}>
        {secondaryLabel}
      </Link>
    </div>
  );
}
