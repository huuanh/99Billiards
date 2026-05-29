"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { FontAwesomeIcon, formatCurrency } from "@99billiards/ui";
import { cartTotal, readCart, subscribeCart, writeCart } from "./cart-storage";
import { PurchaseFlowHeader } from "./purchase-flow-header";

export function CartPageClient() {
  const items = useSyncExternalStore(subscribeCart, readCart, () => []);
  const total = useMemo(() => cartTotal(items), [items]);

  function updateQuantity(productId: string, quantity: number) {
    const next = items.map((item) =>
      item.productId === productId ? { ...item, quantity: Math.min(99, Math.max(1, quantity)) } : item,
    );
    writeCart(next);
  }

  function removeItem(productId: string) {
    const next = items.filter((item) => item.productId !== productId);
    writeCart(next);
  }

  return (
    <main className="min-h-screen bg-[#f7f4ec] text-[#15120d]">
      <PurchaseFlowHeader backHref="/products" backLabel="Tiếp tục mua hàng" />
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex flex-col gap-3 border-b border-black/10 pb-6 md:flex-row md:items-end md:justify-between">
          <h1 className="text-5xl font-black leading-tight tracking-tight">Giỏ hàng</h1>
          <p className="text-sm font-medium text-black/55">{items.length} sản phẩm</p>
        </div>

        {items.length ? (
          <div className="grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-4">
              {items.map((item) => (
                <article key={item.productId} className="grid grid-cols-[88px_1fr] gap-3 rounded-lg border border-black/10 bg-white p-4 md:grid-cols-[112px_1fr_auto] md:items-center md:gap-4">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-[#ede8de]">
                    {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" /> : null}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold leading-snug text-black/85">{item.name}</h2>
                    <p className="mt-1.5 text-lg font-bold text-[#2EB958]">{formatCurrency(item.price)}</p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="mt-3 text-xs font-medium text-red-700 hover:text-red-800"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <FontAwesomeIcon icon="trash" className="h-3 w-3" />
                        Xóa khỏi giỏ
                      </span>
                    </button>
                  </div>
                  <div className="col-span-2 flex w-fit items-center overflow-hidden rounded-full border border-black/10 md:col-span-1">
                    <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} aria-label="Giảm số lượng" className="h-11 w-11 font-medium text-black/70 hover:bg-black/[0.04]">
                      −
                    </button>
                    <input
                      value={item.quantity}
                      onChange={(event) => updateQuantity(item.productId, Number(event.target.value || 1))}
                      inputMode="numeric"
                      aria-label="Số lượng"
                      className="h-11 w-14 border-x border-black/10 text-center font-medium outline-none"
                    />
                    <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)} aria-label="Tăng số lượng" className="h-11 w-11 font-medium text-black/70 hover:bg-black/[0.04]">
                      +
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-lg border border-black/10 bg-white p-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-black/55">Tổng đơn hàng</h2>
              <div className="mt-4 flex justify-between border-y border-black/10 py-4 text-sm font-normal text-black/62">
                <span>Tạm tính</span>
                <span className="font-medium text-black/80">{formatCurrency(total)}</span>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-sm font-medium text-black/70">Tổng cộng</span>
                <span className="text-2xl font-black text-[#2EB958]">{formatCurrency(total)}</span>
              </div>
              <Link
                href="/checkout"
                className="mt-6 block rounded-full bg-[#2EB958] px-6 py-4 text-center text-sm font-bold uppercase tracking-[0.14em] text-white shadow-md hover:bg-[#27a04b]"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon="cart-shopping" className="h-4 w-4" />
                  Thanh toán
                </span>
              </Link>
            </aside>
          </div>
        ) : (
          <div className="py-16">
            <p className="text-lg font-medium text-black/60">Giỏ hàng đang trống.</p>
            <Link href="/products" className="mt-6 inline-block rounded-full bg-[#2EB958] px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-md hover:bg-[#27a04b]">
              <span className="inline-flex items-center gap-2">
                <FontAwesomeIcon icon="arrow-left" className="h-4 w-4" />
                Xem sản phẩm
              </span>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
