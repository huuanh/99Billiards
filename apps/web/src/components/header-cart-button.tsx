"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@99billiards/ui";
import { readCart } from "./cart-storage";

export function HeaderCartButton() {
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    function refresh() {
      setQuantity(readCart().reduce((total, item) => total + item.quantity, 0));
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
      className="focus-ring relative inline-flex h-11 items-center gap-2 rounded-full bg-[#2EB958] px-4 text-xs font-black uppercase tracking-[0.16em] text-[#071107] transition hover:bg-white lg:hidden"
    >
      <FontAwesomeIcon icon="cart-shopping" className="h-4 w-4" />
      <span>Giỏ hàng</span>
      {quantity > 0 ? (
        <span className="ml-0.5 inline-grid h-5 min-w-5 place-items-center rounded-full bg-[#071107] px-1.5 text-[10px] font-black leading-none text-[#2EB958]">
          {quantity}
        </span>
      ) : null}
    </Link>
  );
}
