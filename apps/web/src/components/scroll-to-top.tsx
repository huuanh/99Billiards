"use client";

import { useEffect, useState } from "react";

const SHOW_THRESHOLD_PX = 320;

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_THRESHOLD_PX);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleClick() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Lên đầu trang"
      tabIndex={visible ? 0 : -1}
      className={`focus-ring fixed bottom-4 right-4 z-[1200] grid h-11 w-11 place-items-center rounded-full bg-[#2EB958] text-black shadow-[0_10px_28px_-6px_rgba(46,185,88,0.55),0_4px_14px_-4px_rgba(0,0,0,0.6)] transition duration-200 hover:bg-white md:bottom-24 md:right-10 md:h-14 md:w-14 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
