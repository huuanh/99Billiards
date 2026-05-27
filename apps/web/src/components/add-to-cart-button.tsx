"use client";

import Image from "next/image";
import { useState } from "react";
import { FontAwesomeIcon, formatCurrency } from "@99billiards/ui";
import { addCartItem, readCart } from "./cart-storage";

export function AddToCartButton({
  product,
}: {
  product: {
    productId: string;
    name: string;
    image?: string;
    price: number;
  };
}) {
  const [quantity, setQuantity] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);

  function updateQuantity(nextQuantity: number) {
    setQuantity(Math.min(99, Math.max(1, nextQuantity)));
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <div className="flex w-fit overflow-hidden rounded border border-black/10 bg-white">
        <button
          type="button"
          onClick={() => updateQuantity(quantity - 1)}
          className="h-14 w-12 text-lg font-black text-[#00684a] transition hover:bg-[#f1f7f4]"
          aria-label="Giảm số lượng"
        >
          -
        </button>
        <input
          value={quantity}
          onChange={(event) => updateQuantity(Number(event.target.value || 1))}
          className="h-14 w-16 border-x border-black/10 text-center text-base font-black outline-none"
          inputMode="numeric"
          aria-label="Số lượng"
        />
        <button
          type="button"
          onClick={() => updateQuantity(quantity + 1)}
          className="h-14 w-12 text-lg font-black text-[#00684a] transition hover:bg-[#f1f7f4]"
          aria-label="Tăng số lượng"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          const nextCart = addCartItem({ ...product, quantity });
          setCartQuantity(nextCart.reduce((total, item) => total + item.quantity, 0) || readCart().reduce((total, item) => total + item.quantity, 0));
          setModalOpen(true);
        }}
        className="focus-ring bg-[#00684a] px-7 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-white"
      >
        <span className="inline-flex items-center justify-center gap-2">
          <FontAwesomeIcon icon="cart-shopping" className="h-4 w-4" />
          Thêm vào giỏ hàng
        </span>
      </button>

      {modalOpen ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/45 px-3">
          <div className="w-full max-w-[460px] overflow-hidden border border-black/10 bg-[#f7f4ec] shadow-2xl">
            <div className="flex min-h-14 items-center justify-between border-b border-[#00684a]/20 bg-[#00684a] px-4 py-3 text-white">
              <div className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em]">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-white/80">
                  <FontAwesomeIcon icon="cart-shopping" className="h-3 w-3" />
                </span>
                Thêm vào giỏ hàng
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="grid h-8 w-8 place-items-center text-white transition hover:bg-white/10"
                aria-label="Đóng thông báo"
              >
                <FontAwesomeIcon icon="xmark" className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-[82px_1fr] gap-4 border-b border-black/10 bg-white p-4">
              <div className="relative aspect-square overflow-hidden border border-black/10 bg-[#ede8de]">
                {product.image ? <Image src={product.image} alt={product.name} fill className="object-cover" /> : null}
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 text-base font-black leading-tight">{product.name}</p>
                <p className="mt-3 text-xl font-black text-[#0c3b2d]">{formatCurrency(product.price)}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-black/45">Số lượng: {quantity}</p>
              </div>
            </div>

            <div className="px-4 py-4">
              <p className="text-sm font-bold text-black/55">Giỏ hàng của bạn hiện có {cartQuantity} sản phẩm.</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="min-h-11 border border-black/15 bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.1em] text-black transition hover:border-[#00684a] hover:text-[#00684a]"
                >
                  Tiếp tục mua hàng
                </button>
                <a
                  href="/checkout"
                  className="grid min-h-11 place-items-center bg-[#00684a] px-4 py-2 text-sm font-black uppercase tracking-[0.1em] text-white transition hover:bg-[#00553d]"
                >
                  Thanh toán ngay
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
