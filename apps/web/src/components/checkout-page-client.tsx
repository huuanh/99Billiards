"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon, formatCurrency } from "@99billiards/ui";
import { type CartItem, cartTotal, readCart, writeCart } from "./cart-storage";

type SubmitState = {
  ok: boolean;
  message: string;
  orderCode?: string;
};

export function CheckoutPageClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<SubmitState>({ ok: false, message: "" });
  const total = useMemo(() => cartTotal(items), [items]);
  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ ok: false, message: "" });

    if (!items.length) {
      setState({ ok: false, message: "Gio hang dang trong." });
      return;
    }

    const formData = new FormData(event.currentTarget);
    setSubmitting(true);

    try {
      const response = await fetch("/api/sales-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: String(formData.get("customerName") || ""),
          phone: String(formData.get("phone") || ""),
          email: String(formData.get("email") || ""),
          address: String(formData.get("address") || ""),
          province: String(formData.get("province") || ""),
          district: String(formData.get("district") || ""),
          ward: String(formData.get("ward") || ""),
          note: String(formData.get("note") || ""),
          discountCode: String(formData.get("discountCode") || ""),
          paymentMethod: "cod",
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; orderCode?: string };
      if (!response.ok) {
        setState({ ok: false, message: data.error || "Dat hang chua thanh cong." });
        return;
      }

      writeCart([]);
      setItems([]);
      setState({ ok: true, message: "Dat hang thanh cong. 99 Billiards se lien he xac nhan don.", orderCode: data.orderCode });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ec] text-[#11100d]">
      <header className="border-b border-black/10 bg-[#f7f4ec]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <Link href="/products" className="inline-flex items-center gap-3">
            <Image src="/logo.jpg" alt="99 Billiards Club" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
            <span className="text-sm font-black uppercase tracking-[0.28em]">99 Billiards</span>
          </Link>
          <Link href="/cart" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#00684a]">
            <FontAwesomeIcon icon="arrow-left" className="h-3.5 w-3.5" />
            Gio hang
          </Link>
        </div>
      </header>

      <form onSubmit={submitOrder} className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:px-8 lg:grid-cols-[1fr_430px] lg:items-start lg:py-12">
        <div className="grid gap-6">
          <div className="border border-black/10 bg-white p-5 md:p-7">
            <div className="mb-5 flex flex-col gap-2 border-b border-black/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#00684a]">Thanh toan</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Thong tin nhan hang</h1>
              </div>
              <p className="text-sm font-bold text-black/50">COD toan quoc</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55 md:col-span-2">
                Email
                <input name="email" placeholder="Email (tuy chon)" className="min-h-12 border border-black/15 bg-[#fbfaf6] px-4 text-sm font-bold normal-case tracking-normal text-black outline-none transition focus:border-[#00684a] focus:bg-white" />
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55">
                Ho va ten
                <input name="customerName" required placeholder="Nguyen Van A" className="min-h-12 border border-black/15 bg-[#fbfaf6] px-4 text-sm font-bold normal-case tracking-normal text-black outline-none transition focus:border-[#00684a] focus:bg-white" />
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55">
                So dien thoai
                <input name="phone" required placeholder="09xx xxx xxx" className="min-h-12 border border-black/15 bg-[#fbfaf6] px-4 text-sm font-bold normal-case tracking-normal text-black outline-none transition focus:border-[#00684a] focus:bg-white" />
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55 md:col-span-2">
                Dia chi
                <input name="address" required placeholder="So nha, ten duong" className="min-h-12 border border-black/15 bg-[#fbfaf6] px-4 text-sm font-bold normal-case tracking-normal text-black outline-none transition focus:border-[#00684a] focus:bg-white" />
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55">
                Tinh thanh
                <input name="province" placeholder="Ha Noi" className="min-h-12 border border-black/15 bg-[#fbfaf6] px-4 text-sm font-bold normal-case tracking-normal text-black outline-none transition focus:border-[#00684a] focus:bg-white" />
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55">
                Quan huyen
                <input name="district" placeholder="Tuy chon" className="min-h-12 border border-black/15 bg-[#fbfaf6] px-4 text-sm font-bold normal-case tracking-normal text-black outline-none transition focus:border-[#00684a] focus:bg-white" />
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55">
                Phuong xa
                <input name="ward" placeholder="Tuy chon" className="min-h-12 border border-black/15 bg-[#fbfaf6] px-4 text-sm font-bold normal-case tracking-normal text-black outline-none transition focus:border-[#00684a] focus:bg-white" />
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55 md:col-span-2">
                Ghi chu
                <textarea name="note" placeholder="Ghi chu giao hang (tuy chon)" rows={4} className="border border-black/15 bg-[#fbfaf6] px-4 py-3 text-sm font-bold normal-case tracking-normal text-black outline-none transition focus:border-[#00684a] focus:bg-white" />
              </label>
            </div>
          </div>

          <div className="border border-black/10 bg-white p-5 md:p-7">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center bg-[#00684a] text-white">
                <FontAwesomeIcon icon="truck-fast" className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#00684a]">Phuong thuc</p>
                <h2 className="text-xl font-black">Thanh toan khi giao hang</h2>
              </div>
            </div>
            <label className="flex min-h-14 items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 text-sm font-black">
              <input type="radio" checked readOnly className="accent-[#00684a]" />
              Thanh toan tien mat khi nhan hang (COD)
            </label>
            <p className="mt-3 text-sm font-bold text-black/55">99 Billiards se lien he xac nhan don truoc khi giao.</p>

            {state.message ? (
              <div className={`mt-5 border px-4 py-3 text-sm font-bold ${state.ok ? "border-[#00684a]/25 bg-[#edf8f2] text-[#00684a]" : "border-red-200 bg-red-50 text-red-700"}`}>
                {state.orderCode ? <p className="mb-1 text-xs uppercase tracking-[0.12em]">Ma don: {state.orderCode}</p> : null}
                <p>{state.message}</p>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="border border-black/10 bg-white p-5 shadow-[0_24px_70px_rgba(0,0,0,0.08)] md:p-6 lg:sticky lg:top-6">
          <div className="flex items-center justify-between border-b border-black/10 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#00684a]">Don hang</p>
              <h2 className="mt-1 text-2xl font-black">{totalQuantity} san pham</h2>
            </div>
            <span className="grid h-11 w-11 place-items-center bg-[#00684a] text-white">
              <FontAwesomeIcon icon="cart-shopping" className="h-4 w-4" />
            </span>
          </div>

          <div className="grid max-h-[380px] gap-4 overflow-auto border-b border-black/10 py-5">
            {items.length ? (
              items.map((item) => (
                <div key={item.productId} className="grid grid-cols-[72px_1fr] gap-3">
                  <div className="relative h-[72px] w-[72px] border border-black/10 bg-[#ede8de]">
                    {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" /> : null}
                    <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-[#00684a] text-xs font-black text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-black leading-5">{item.name}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-black/40">So luong: {item.quantity}</p>
                    <p className="mt-1 text-base font-black text-[#0c3b2d]">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="border border-dashed border-black/15 bg-[#fbfaf6] px-4 py-8 text-center text-sm font-bold text-black/55">Gio hang dang trong.</div>
            )}
          </div>

          <div className="mt-5 flex gap-2 border-b border-black/10 pb-5">
            <input name="discountCode" disabled placeholder="Nhap ma giam gia" className="min-h-12 min-w-0 flex-1 border border-black/15 bg-[#fbfaf6] px-3 text-sm font-bold outline-none" />
            <button type="button" disabled className="min-h-12 bg-black/20 px-5 text-sm font-black uppercase tracking-[0.08em] text-white">
              Ap dung
            </button>
          </div>

          <div className="mt-5 grid gap-4 text-sm font-bold text-black/60">
            <div className="flex justify-between">
              <span>Tam tinh</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex items-end justify-between border-t border-black/10 pt-4">
              <span className="text-base text-black">Tong cong</span>
              <span className="text-3xl font-black text-[#0c3b2d]">{formatCurrency(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !items.length || state.ok}
            className="mt-6 w-full bg-[#00684a] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#00553d] disabled:cursor-not-allowed disabled:bg-black/25"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <FontAwesomeIcon icon="cart-shopping" className="h-4 w-4" />
              {submitting ? "Dang dat hang..." : "Dat hang"}
            </span>
          </button>
        </aside>
      </form>
    </main>
  );
}
