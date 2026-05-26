"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon, formatCurrency } from "@99billiards/ui";
import { type CartItem, cartTotal, readCart, writeCart } from "./cart-storage";

export function CartPageClient() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  const total = useMemo(() => cartTotal(items), [items]);

  function updateQuantity(productId: string, quantity: number) {
    const next = items.map((item) =>
      item.productId === productId ? { ...item, quantity: Math.min(99, Math.max(1, quantity)) } : item,
    );
    setItems(next);
    writeCart(next);
  }

  function removeItem(productId: string) {
    const next = items.filter((item) => item.productId !== productId);
    setItems(next);
    writeCart(next);
  }

  return (
    <main className="min-h-screen bg-[#f7f4ec] text-[#15120d]">
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex flex-col gap-3 border-b border-black/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/products" className="text-sm font-black uppercase tracking-[0.14em] text-[#00684a]">
              <span className="inline-flex items-center gap-2">
                <FontAwesomeIcon icon="arrow-left" className="h-3.5 w-3.5" />
                Quay lại sản phẩm
              </span>
            </Link>
            <h1 className="mt-3 text-5xl font-black leading-tight">Giỏ hàng</h1>
          </div>
          <p className="text-sm font-bold text-black/55">{items.length} sản phẩm</p>
        </div>

        {items.length ? (
          <div className="grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-4">
              {items.map((item) => (
                <article key={item.productId} className="grid gap-4 border border-black/10 bg-white p-4 md:grid-cols-[112px_1fr_auto] md:items-center">
                  <div className="relative aspect-square overflow-hidden bg-[#ede8de]">
                    {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" /> : null}
                  </div>
                  <div>
                    <h2 className="text-xl font-black">{item.name}</h2>
                    <p className="mt-2 text-lg font-black text-[#0c3b2d]">{formatCurrency(item.price)}</p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="mt-3 text-sm font-black text-red-700"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <FontAwesomeIcon icon="trash" className="h-3.5 w-3.5" />
                        Xóa khỏi giỏ
                      </span>
                    </button>
                  </div>
                  <div className="flex w-fit items-center border border-black/10">
                    <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="h-10 w-10 font-black">
                      -
                    </button>
                    <input
                      value={item.quantity}
                      onChange={(event) => updateQuantity(item.productId, Number(event.target.value || 1))}
                      className="h-10 w-14 border-x border-black/10 text-center font-black outline-none"
                    />
                    <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="h-10 w-10 font-black">
                      +
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit border border-black/10 bg-white p-5">
              <h2 className="text-xl font-black">Tổng đơn hàng</h2>
              <div className="mt-5 flex justify-between border-y border-black/10 py-4 text-sm font-bold text-black/62">
                <span>Tạm tính</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="mt-4 flex justify-between text-lg font-black">
                <span>Tổng cộng</span>
                <span className="text-[#0c3b2d]">{formatCurrency(total)}</span>
              </div>
              <Link
                href="/checkout"
                className="mt-6 block bg-[#00684a] px-6 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-white"
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
            <p className="text-lg font-bold text-black/60">Giỏ hàng đang trống.</p>
            <Link href="/products" className="mt-6 inline-block bg-[#00684a] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white">
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
