"use client";

// Section "Ưu đãi đang chạy" trên homepage.
// Layout: hero ở giữa (eyebrow + title + desc + CTA), bên dưới là dải banner ngang.
// Auto scroll loop (pause khi hover/touch) + parallax billiards icons ở nền hero.

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Promotion } from "@99billiards/db/seed";

type Theme = {
  badge: string;
  glow: string;
};

const THEMES: Theme[] = [
  { badge: "bg-[#2EB958] text-black", glow: "hover:shadow-[0_0_42px_-6px_rgba(46,185,88,0.5)]" },
  { badge: "bg-[#ffc400] text-black", glow: "hover:shadow-[0_0_42px_-6px_rgba(255,196,0,0.5)]" },
  { badge: "bg-[#3aa6ff] text-white", glow: "hover:shadow-[0_0_42px_-6px_rgba(58,166,255,0.5)]" },
  { badge: "bg-[#ff6b6b] text-white", glow: "hover:shadow-[0_0_42px_-6px_rgba(255,107,107,0.5)]" },
];

// 7 vị trí icon bida quanh hero. Mỗi cái có intensity riêng (1 = parallax mạnh nhất).
const DECOR_ITEMS: Array<{
  type: "ball" | "cue" | "rack" | "diamond";
  // Pixel offsets so mỗi icon parallax theo cường độ riêng.
  intensity: number;
  // Vị trí: top-left positioning (percent).
  top: string;
  left?: string;
  right?: string;
  size: number;
  rotate?: number;
  // Cho ball: số / màu
  ballNumber?: number;
  ballColor?: string;
}> = [
  // Bên trái
  { type: "ball", intensity: 70, top: "-2%", left: "-2%", size: 120, ballNumber: 8, ballColor: "#111" },
  { type: "cue", intensity: 40, top: "18%", left: "-10%", size: 360, rotate: -28 },
  { type: "rack", intensity: 30, top: "62%", left: "-4%", size: 140, rotate: -10 },
  { type: "ball", intensity: 80, top: "78%", left: "8%", size: 84, ballNumber: 1, ballColor: "#f2c21a" },

  // Bên phải
  { type: "ball", intensity: 60, top: "5%", right: "-2%", size: 100, ballNumber: 9, ballColor: "#f2c21a" },
  { type: "cue", intensity: 45, top: "55%", right: "-12%", size: 400, rotate: 22 },
  { type: "ball", intensity: 90, top: "70%", right: "4%", size: 76, ballNumber: 3, ballColor: "#c82226" },
  { type: "diamond", intensity: 110, top: "32%", right: "8%", size: 48 },
  { type: "diamond", intensity: 95, top: "85%", right: "20%", size: 36 },

  // Trên / dưới đỡ giữa
  { type: "ball", intensity: 55, top: "-4%", left: "40%", size: 70, ballNumber: 2, ballColor: "#1e58a8" },
  { type: "ball", intensity: 75, top: "92%", left: "55%", size: 64, ballNumber: 6, ballColor: "#0b6f3a" },
];

export function PromotionsShowcase({ promotions }: { promotions: Promotion[] }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  // ─── Parallax: mouse di chuyển → icon di chuyển NGƯỢC (lerp mượt).
  useEffect(() => {
    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    function onMouseMove(event: MouseEvent) {
      const el = heroRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Chỉ tính khi chuột gần hero (1 viewport buffer).
      const inRange =
        event.clientY >= rect.top - window.innerHeight &&
        event.clientY <= rect.bottom + window.innerHeight;
      if (!inRange) return;
      const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
      const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
      // Ngược hướng chuột → âm. Clamp ±0.7 để icon không drift quá xa.
      targetX = Math.max(-0.7, Math.min(0.7, -dx));
      targetY = Math.max(-0.7, Math.min(0.7, -dy));
    }

    // Mobile fallback: dùng gyroscope (deviceorientation) thay cho mouse.
    function onOrientation(event: DeviceOrientationEvent) {
      const gamma = event.gamma; // [-90, 90] left/right tilt
      const beta = event.beta; // [-180, 180] front/back tilt
      if (gamma == null || beta == null) return;
      // Normalize ±30° → ±0.5.
      targetX = Math.max(-0.5, Math.min(0.5, -(gamma / 60)));
      targetY = Math.max(-0.5, Math.min(0.5, -((beta - 45) / 60)));
    }

    function tick() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      if (heroRef.current) {
        heroRef.current.style.setProperty("--px", String(currentX));
        heroRef.current.style.setProperty("--py", String(currentY));
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("deviceorientation", onOrientation);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("deviceorientation", onOrientation);
    };
  }, []);

  // ─── Auto scroll loop cho banner row (~30px/s). Pause khi hover/touch.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    if (promotions.length === 0) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let raf = 0;
    let last = performance.now();
    const SPEED_PX_PER_SEC = 32;

    function tick(now: number) {
      if (!el) return;
      const dt = Math.min(50, now - last) / 1000;
      last = now;
      if (!pausedRef.current) {
        el.scrollLeft += SPEED_PX_PER_SEC * dt;
        // Khi qua khỏi nửa width (vì items được nhân đôi để loop), nhảy về đầu.
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) {
          el.scrollLeft -= half;
        }
      }
      raf = requestAnimationFrame(tick);
    }

    function pause() {
      pausedRef.current = true;
    }
    function resume() {
      pausedRef.current = false;
    }

    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume, { passive: true });
    el.addEventListener("focusin", pause);
    el.addEventListener("focusout", resume);

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
      el.removeEventListener("focusin", pause);
      el.removeEventListener("focusout", resume);
    };
  }, [promotions.length]);

  if (!promotions.length) return null;

  // Nhân đôi danh sách để scroll loop seamlessly.
  const loopItems = [...promotions, ...promotions];

  return (
    <section id="promotions" className="relative overflow-hidden py-20 md:py-24">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050705] via-[#06110b] to-[#050705]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(46,185,88,0.4) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(46,185,88,0.3) 0%, transparent 45%)",
        }}
      />

      {/* HERO + DECORATIVE PARALLAX ICONS */}
      <div ref={heroRef} className="relative mx-auto max-w-4xl px-4 md:px-6">
        {/* Decor layer — billiards icons drift ngược chiều chuột. -inset-x mở rộng vùng decor ra ngoài hero để icon peek ra mép. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-32 -inset-y-16 md:-inset-x-48 md:-inset-y-20"
        >
          {DECOR_ITEMS.map((item, idx) => (
            <DecorIcon key={idx} item={item} />
          ))}
        </div>

        <div className="relative text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#2EB958] md:text-xs">
            99 Billiards Club
          </p>
          <h2 className="mt-4 text-4xl font-black uppercase leading-[1.05] text-white md:mt-5 md:text-6xl lg:text-7xl">
            <span className="block">Đặt bàn càng nhiều</span>
            <span className="mt-1 block bg-gradient-to-r from-[#2EB958] to-[#7CFFB1] bg-clip-text text-transparent">
              Ưu đãi càng đậm
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/65 md:mt-6 md:text-base md:leading-8">
            Hệ thống ưu đãi 99 Billiards: giảm 30% giờ vàng, combo nhóm, miễn phí giờ chơi cho
            khách thân thiết. Chọn kèo phù hợp và giữ bàn trong 30 giây.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:mt-8">
            <Link
              href="#booking"
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-[#2EB958] px-6 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-[#071107] shadow-[0_18px_40px_-14px_rgba(46,185,88,0.6)] transition hover:-translate-y-0.5 hover:bg-white md:px-7 md:py-4 md:text-sm md:tracking-[0.2em]"
            >
              Tham gia ngay
            </Link>
            <Link
              href="#branches"
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:border-[#2EB958] hover:text-[#2EB958] md:px-7 md:py-4 md:text-sm md:tracking-[0.2em]"
            >
              Xem cơ sở
            </Link>
          </div>
        </div>
      </div>

      {/* BANNER ROW — auto scroll loop */}
      <div className="relative mt-12 md:mt-16">
        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto px-4 pb-6 pt-2 md:gap-6 md:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {loopItems.map((promo, idx) => (
            <PromoBanner
              key={`${promo.id}-${idx}`}
              promotion={promo}
              theme={THEMES[idx % THEMES.length]}
            />
          ))}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#050705] to-transparent md:w-12"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#050705] to-transparent md:w-12"
        />
      </div>
    </section>
  );
}

function DecorIcon({ item }: { item: (typeof DECOR_ITEMS)[number] }) {
  // Icon càng intensity mạnh = càng "gần camera" = sharp + opaque hơn.
  // Icon intensity yếu = "xa" = blur nhẹ + mờ hơn để tạo depth illusion.
  const isFar = item.intensity < 50;
  const opacity = isFar ? 0.55 : 0.85;
  const blur = isFar ? 1.5 : 0;

  const positionStyle: React.CSSProperties = {
    position: "absolute",
    top: item.top,
    left: item.left,
    right: item.right,
    width: item.size,
    height: item.type === "cue" ? Math.round(item.size / 14) : item.size,
    transform: `translate(calc(var(--px, 0) * ${item.intensity}px), calc(var(--py, 0) * ${item.intensity}px)) rotate(${item.rotate ?? 0}deg)`,
    willChange: "transform",
    opacity,
    filter: blur > 0 ? `blur(${blur}px)` : undefined,
  };

  if (item.type === "ball") {
    return (
      <div style={positionStyle}>
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <defs>
            <radialGradient id={`ball-${item.ballNumber}`} cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
              <stop offset="35%" stopColor={item.ballColor || "#222"} />
              <stop offset="100%" stopColor="#000" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill={`url(#ball-${item.ballNumber})`} />
          <circle cx="50" cy="50" r="22" fill="#f8f5ea" />
          <text
            x="50"
            y="56"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="22"
            fill="#111"
          >
            {item.ballNumber}
          </text>
        </svg>
      </div>
    );
  }

  if (item.type === "cue") {
    return (
      <div style={positionStyle}>
        <svg viewBox="0 0 400 28" width="100%" height="100%" preserveAspectRatio="none">
          {/* Tip (chalk blue) */}
          <rect x="0" y="10" width="6" height="8" fill="#1e58a8" />
          {/* Ferrule (white) */}
          <rect x="6" y="9" width="10" height="10" fill="#f8f5ea" />
          {/* Shaft (light maple) */}
          <rect x="16" y="8" width="220" height="12" fill="#e9d8a4" />
          {/* Wrap */}
          <rect x="236" y="6" width="60" height="16" fill="#1c1410" />
          {/* Butt (dark wood) */}
          <rect x="296" y="5" width="104" height="18" fill="#382214" />
          {/* End cap */}
          <rect x="396" y="6" width="4" height="16" fill="#0a0805" />
        </svg>
      </div>
    );
  }

  if (item.type === "rack") {
    return (
      <div style={positionStyle}>
        <svg viewBox="0 0 100 90" width="100%" height="100%">
          <polygon
            points="50,5 95,85 5,85"
            fill="none"
            stroke="rgba(46,185,88,0.55)"
            strokeWidth="3"
          />
        </svg>
      </div>
    );
  }

  // diamond
  return (
    <div style={positionStyle}>
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          fill="rgba(46,185,88,0.45)"
          transform="rotate(45 12 12)"
        />
      </svg>
    </div>
  );
}

function PromoBanner({
  promotion,
  theme,
}: {
  promotion: Promotion;
  theme: Theme;
}) {
  return (
    <Link
      href={`/uu-dai/${promotion.id}`}
      className={[
        "group relative w-[82vw] shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-[#0a0d0b] transition duration-300 hover:-translate-y-1 sm:w-[60vw] md:w-[460px] lg:w-[520px]",
        theme.glow,
      ].join(" ")}
      style={{ aspectRatio: "16 / 9" }}
    >
      <Image
        src={promotion.image}
        alt={promotion.title}
        fill
        sizes="(min-width: 1024px) 520px, (min-width: 640px) 60vw, 82vw"
        className="object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-black/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      <div className="relative flex h-full flex-col justify-end p-5 md:p-7">
        {promotion.badge ? (
          <span
            className={[
              "mb-3 inline-flex w-fit items-center rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] shadow-sm md:text-xs",
              theme.badge,
            ].join(" ")}
          >
            {promotion.badge}
          </span>
        ) : null}
        <h3 className="text-xl font-black uppercase leading-[1.1] text-white md:text-2xl lg:text-3xl">
          {promotion.title}
        </h3>
        {promotion.description ? (
          <p className="mt-2 line-clamp-2 max-w-md text-xs text-white/75 md:text-sm">
            {promotion.description}
          </p>
        ) : null}
        <span className="mt-4 inline-flex w-fit items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#2EB958] transition group-hover:gap-2.5 md:text-xs">
          Xem chi tiết
          <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
