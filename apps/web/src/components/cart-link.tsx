"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readCart } from "./cart-storage";

function cartQuantity() {
  return readCart().reduce((total, item) => total + item.quantity, 0);
}

/**
 * Cart icon — matches Option E ("ISSUE 99") header style:
 * outlined shopping cart SVG + rectangular neon-green pill with mono digit.
 */
export function CartLink({ className = "" }: { className?: string }) {
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    function refresh() {
      setQuantity(cartQuantity());
    }

    refresh();
    window.addEventListener("cart-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("cart-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <Link
      href="/cart"
      aria-label={`Giỏ hàng${quantity ? ` (${quantity} sản phẩm)` : ""}`}
      className={`items-center gap-2 transition hover:text-[#2EB958] ${className}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3 6h2l2.5 11h11L21 9H6" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="17" cy="20" r="1.5" />
      </svg>
      {quantity ? (
        <span className="inline-flex min-w-[20px] items-center justify-center bg-[#2EB958] px-1.5 py-[3px] font-mono text-[10px] font-bold leading-none tracking-tight text-[#0A0E0C]">
          {quantity}
        </span>
      ) : null}
    </Link>
  );
}
