"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modalOpen]);

  function updateQuantity(nextQuantity: number) {
    setQuantity(Math.min(99, Math.max(1, nextQuantity)));
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-stretch gap-2 border-t border-black/10 bg-white/95 p-3 shadow-[0_-10px_24px_-12px_rgba(0,0,0,0.25)] backdrop-blur-md sm:gap-3 md:static md:flex-row md:gap-3 md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
      <div className="flex shrink-0 overflow-hidden rounded-full border border-black/10 bg-white">
        <button
          type="button"
          onClick={() => updateQuantity(quantity - 1)}
          className="h-12 w-10 text-lg font-black text-[#2EB958] transition hover:bg-[#f1f7f4] md:h-14 md:w-12"
          aria-label="Giảm số lượng"
        >
          -
        </button>
        <input
          value={quantity}
          onChange={(event) => updateQuantity(Number(event.target.value || 1))}
          className="h-12 w-12 border-x border-black/10 text-center text-base font-black outline-none md:h-14 md:w-16"
          inputMode="numeric"
          aria-label="Số lượng"
        />
        <button
          type="button"
          onClick={() => updateQuantity(quantity + 1)}
          className="h-12 w-10 text-lg font-black text-[#2EB958] transition hover:bg-[#f1f7f4] md:h-14 md:w-12"
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
        className="focus-ring flex-1 rounded-full bg-[#2EB958] px-4 text-xs font-black uppercase tracking-[0.12em] text-white shadow-md transition hover:bg-[#27a04b] md:flex-none md:px-7 md:py-4 md:text-sm md:tracking-[0.14em]"
      >
        <span className="inline-flex items-center justify-center gap-2">
          <FontAwesomeIcon icon="cart-shopping" className="h-4 w-4" />
          Thêm vào giỏ
        </span>
      </button>

      {modalOpen && mounted && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Đã thêm vào giỏ hàng"
          style={{ position: "fixed", inset: 0, zIndex: 1200 }}
        >
          <button
            type="button"
            aria-label="Đóng"
            onClick={() => setModalOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.55)",
              border: 0,
              cursor: "pointer",
            }}
          />
          <div
            className="overflow-hidden rounded-2xl border border-black/10 bg-[#f7f4ec] shadow-2xl"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "calc(100% - 24px)",
              maxWidth: "460px",
              maxHeight: "calc(100vh - 24px)",
              overflowY: "auto",
              zIndex: 1,
            }}
          >
            <div className="flex min-h-14 items-center justify-between border-b border-[#2EB958]/20 bg-[#2EB958] px-4 py-3 text-white">
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
              <div className="relative aspect-square overflow-hidden rounded-lg border border-black/10 bg-[#ede8de]">
                {product.image ? <Image src={product.image} alt={product.name} fill className="object-cover" /> : null}
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 text-base font-black leading-tight">{product.name}</p>
                <p className="mt-3 text-xl font-black text-[#2EB958]">{formatCurrency(product.price)}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-black/45">Số lượng: {quantity}</p>
              </div>
            </div>

            <div className="px-4 py-4">
              <p className="text-sm font-bold text-black/55">Giỏ hàng của bạn hiện có {cartQuantity} sản phẩm.</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="min-h-11 rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.1em] text-black transition hover:border-[#2EB958] hover:text-[#2EB958]"
                >
                  Tiếp tục mua hàng
                </button>
                <a
                  href="/checkout"
                  className="grid min-h-11 place-items-center rounded-full bg-[#2EB958] px-4 py-2 text-sm font-black uppercase tracking-[0.1em] text-white shadow-md transition hover:bg-[#27a04b]"
                >
                  Thanh toán ngay
                </a>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
