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
      setState({ ok: false, message: "Giỏ hàng đang trống." });
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
        setState({ ok: false, message: data.error || "Đặt hàng chưa thành công." });
        return;
      }

      writeCart([]);
      setItems([]);
      setState({ ok: true, message: "Đặt hàng thành công. 99 Billiards sẽ liên hệ xác nhận đơn.", orderCode: data.orderCode });
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
            Giỏ hàng
          </Link>
        </div>
      </header>

      <form onSubmit={submitOrder} className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:px-8 lg:grid-cols-[1fr_430px] lg:items-start lg:py-12">
        <div className="grid gap-6">
          <div className="border border-black/10 bg-white p-5 md:p-7">
            <div className="mb-5 flex flex-col gap-2 border-b border-black/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#00684a]">Thanh toán</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Thông tin nhận hàng</h1>
              </div>
              <p className="text-sm font-bold text-black/50">COD toàn quốc</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55 md:col-span-2">
                Email
                <input name="email" placeholder="Email (tùy chọn)" className="min-h-12 border border-black/15 bg-[#fbfaf6] px-4 text-sm font-bold normal-case tracking-normal text-black outline-none transition focus:border-[#00684a] focus:bg-white" />
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55">
                Họ và tên
                <input name="customerName" required placeholder="Nguyen Van A" className="min-h-12 border border-black/15 bg-[#fbfaf6] px-4 text-sm font-bold normal-case tracking-normal text-black outline-none transition focus:border-[#00684a] focus:bg-white" />
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55">
                Số điện thoại
                <input name="phone" required placeholder="09xx xxx xxx" className="min-h-12 border border-black/15 bg-[#fbfaf6] px-4 text-sm font-bold normal-case tracking-normal text-black outline-none transition focus:border-[#00684a] focus:bg-white" />
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55 md:col-span-2">
                Địa chỉ
                <input name="address" required placeholder="Số nhà, tên đường" className="min-h-12 border border-black/15 bg-[#fbfaf6] px-4 text-sm font-bold normal-case tracking-normal text-black outline-none transition focus:border-[#00684a] focus:bg-white" />
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55">
                Tỉnh thành
                <input name="province" placeholder="Hà Nội" className="min-h-12 border border-black/15 bg-[#fbfaf6] px-4 text-sm font-bold normal-case tracking-normal text-black outline-none transition focus:border-[#00684a] focus:bg-white" />
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55">
                Quận huyện
                <input name="district" placeholder="Tùy chọn" className="min-h-12 border border-black/15 bg-[#fbfaf6] px-4 text-sm font-bold normal-case tracking-normal text-black outline-none transition focus:border-[#00684a] focus:bg-white" />
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55">
                Phường xã
                <input name="ward" placeholder="Tùy chọn" className="min-h-12 border border-black/15 bg-[#fbfaf6] px-4 text-sm font-bold normal-case tracking-normal text-black outline-none transition focus:border-[#00684a] focus:bg-white" />
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55 md:col-span-2">
                Ghi chú
                <textarea name="note" placeholder="Ghi chú giao hàng (tùy chọn)" rows={4} className="border border-black/15 bg-[#fbfaf6] px-4 py-3 text-sm font-bold normal-case tracking-normal text-black outline-none transition focus:border-[#00684a] focus:bg-white" />
              </label>
            </div>
          </div>

          <div className="border border-black/10 bg-white p-5 md:p-7">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center bg-[#00684a] text-white">
                <FontAwesomeIcon icon="truck-fast" className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#00684a]">Phương thức</p>
                <h2 className="text-xl font-black">Thanh toán khi giao hàng</h2>
              </div>
            </div>
            <label className="flex min-h-14 items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 text-sm font-black">
              <input type="radio" checked readOnly className="accent-[#00684a]" />
              Thanh toán tiền mặt khi nhận hàng (COD)
            </label>
            <p className="mt-3 text-sm font-bold text-black/55">99 Billiards sẽ liên hệ xác nhận đơn trước khi giao.</p>

            {state.message && !state.ok ? (
              <div className={`mt-5 border px-4 py-3 text-sm font-bold ${state.ok ? "border-[#00684a]/25 bg-[#edf8f2] text-[#00684a]" : "border-red-200 bg-red-50 text-red-700"}`}>
                {state.orderCode ? <p className="mb-1 text-xs uppercase tracking-[0.12em]">Mã đơn: {state.orderCode}</p> : null}
                <p>{state.message}</p>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="border border-black/10 bg-white p-5 shadow-[0_24px_70px_rgba(0,0,0,0.08)] md:p-6 lg:sticky lg:top-6">
          <div className="flex items-center justify-between border-b border-black/10 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#00684a]">Đơn hàng</p>
              <h2 className="mt-1 text-2xl font-black">{totalQuantity} sản phẩm</h2>
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
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-black/40">Số lượng: {item.quantity}</p>
                    <p className="mt-1 text-base font-black text-[#0c3b2d]">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="border border-dashed border-black/15 bg-[#fbfaf6] px-4 py-8 text-center text-sm font-bold text-black/55">Giỏ hàng đang trống.</div>
            )}
          </div>

          <div className="mt-5 flex gap-2 border-b border-black/10 pb-5">
            <input name="discountCode" disabled placeholder="Nhập mã giảm giá" className="min-h-12 min-w-0 flex-1 border border-black/15 bg-[#fbfaf6] px-3 text-sm font-bold outline-none" />
            <button type="button" disabled className="min-h-12 bg-black/20 px-5 text-sm font-black uppercase tracking-[0.08em] text-white">
              Áp dụng
            </button>
          </div>

          <div className="mt-5 grid gap-4 text-sm font-bold text-black/60">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex items-end justify-between border-t border-black/10 pt-4">
              <span className="text-base text-black">Tổng cộng</span>
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
              {submitting ? "Đang đặt hàng..." : "Đặt hàng"}
            </span>
          </button>
        </aside>
      </form>

      {state.ok ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/55 px-4">
          <div className="w-full max-w-[520px] border border-black/10 bg-[#f7f4ec] shadow-2xl">
            <div className="border-b border-[#00684a]/20 bg-[#00684a] px-5 py-4 text-white">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/80">Đặt hàng thành công</p>
              <h2 className="mt-2 text-3xl font-black leading-tight">Cảm ơn bạn đã đặt hàng</h2>
            </div>
            <div className="bg-white px-5 py-6">
              {state.orderCode ? (
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#00684a]">Mã đơn: {state.orderCode}</p>
              ) : null}
              <p className="mt-3 text-base font-bold leading-7 text-black/68">
                99 Billiards đã nhận thông tin đơn hàng. Đội ngũ tư vấn sẽ liên hệ xác nhận trong thời gian sớm nhất.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center bg-[#00684a] px-5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#00553d]"
              >
                Quay về trang chủ
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
