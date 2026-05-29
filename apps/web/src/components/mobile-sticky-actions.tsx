"use client";

import type { Branch } from "@99billiards/db/seed";

export function MobileStickyActions({ branch }: { branch?: Branch | null }) {
  const phone = branch?.phone || "0923 699 999";
  const mapUrl = branch?.mapUrl || "#branches";

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 gap-2 border-t border-white/10 bg-[#050705]/92 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden">
      <a
        href={`tel:${phone.replaceAll(" ", "")}`}
        className="focus-ring min-h-12 rounded-2xl bg-white px-3 py-3 text-center text-xs font-black uppercase tracking-[0.12em] text-black"
      >
        Gọi
      </a>
      <a
        href={mapUrl}
        target={mapUrl.startsWith("http") ? "_blank" : undefined}
        rel={mapUrl.startsWith("http") ? "noreferrer" : undefined}
        className="focus-ring min-h-12 rounded-2xl border border-white/15 px-3 py-3 text-center text-xs font-black uppercase tracking-[0.12em] text-white"
      >
        Map
      </a>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("open-booking-modal"))}
        className="focus-ring min-h-12 rounded-2xl bg-[#2EB958] px-3 py-3 text-center text-xs font-black uppercase tracking-[0.12em] text-black"
      >
        Đặt bàn
      </button>
    </div>
  );
}
