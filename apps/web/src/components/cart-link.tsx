"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@99billiards/ui";
import { readCart } from "./cart-storage";

function cartQuantity() {
  return readCart().reduce((total, item) => total + item.quantity, 0);
}

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
    <Link href="/cart" className={`relative inline-flex items-center gap-2 rounded-full hover:text-[#00684a] ${className}`}>
      <FontAwesomeIcon icon="cart-shopping" className="h-3.5 w-3.5" />
      Giỏ hàng
      {quantity ? (
        <span className="ml-1 inline-grid min-w-5 place-items-center rounded-full bg-[#00684a] px-1.5 py-0.5 text-[10px] font-black leading-none text-white">
          {quantity}
        </span>
      ) : null}
    </Link>
  );
}
