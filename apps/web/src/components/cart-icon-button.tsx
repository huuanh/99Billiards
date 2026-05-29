"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { FontAwesomeIcon } from "@99billiards/ui";
import { addCartItem } from "./cart-storage";

export function CartIconButton({
  product,
  size = "md",
}: {
  product: { productId: string; name: string; image?: string; price: number };
  size?: "sm" | "md";
}) {
  const [showToast, setShowToast] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    addCartItem({ ...product, quantity: 1 });
    setShowToast(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowToast(false), 1800);
  }

  const sizeClass = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const iconClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={`Thêm ${product.name} vào giỏ hàng`}
        className={`focus-ring grid ${sizeClass} shrink-0 place-items-center rounded-full bg-[#2EB958] text-white shadow-sm transition hover:scale-105 hover:bg-[#25a14b]`}
      >
        <FontAwesomeIcon icon="cart-shopping" className={iconClass} />
      </button>
      {showToast ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[#15120d] px-5 py-3 text-sm font-bold text-white shadow-xl"
        >
          Đã thêm <span className="text-[#2EB958]">{product.name}</span> vào giỏ
        </div>
      ) : null}
    </>
  );
}
