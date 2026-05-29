"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { FontAwesomeIcon, formatCurrency } from "@99billiards/ui";
import { cartTotal, readCart, subscribeCart, writeCart } from "./cart-storage";
import { PurchaseFlowHeader } from "./purchase-flow-header";

type SubmitState = {
  ok: boolean;
  message: string;
  orderCode?: string;
};

type FieldName =
  | "email"
  | "customerName"
  | "phone"
  | "address"
  | "province"
  | "district"
  | "ward";

const FIELD_ORDER: FieldName[] = [
  "email",
  "customerName",
  "phone",
  "address",
  "province",
  "district",
  "ward",
];

const FIELD_LABEL: Record<FieldName, string> = {
  email: "Email",
  customerName: "Họ và tên",
  phone: "Số điện thoại",
  address: "Địa chỉ",
  province: "Tỉnh thành",
  district: "Quận huyện",
  ward: "Phường xã",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Vietnamese mobile: 10 digits starting with 0, or +84 prefix.
const PHONE_PATTERN = /^(0\d{9}|(\+|00)84\d{9})$/;

function validateField(name: FieldName, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return `${FIELD_LABEL[name]} chưa được điền.`;
  if (name === "email" && !EMAIL_PATTERN.test(trimmed)) {
    return "Email chưa đúng định dạng.";
  }
  if (name === "phone" && !PHONE_PATTERN.test(trimmed.replaceAll(/\s+/g, ""))) {
    return "Số điện thoại chưa đúng định dạng.";
  }
  return null;
}

export function CheckoutPageClient() {
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<SubmitState>({ ok: false, message: "" });
  const [values, setValues] = useState<Record<FieldName, string>>({
    email: "",
    customerName: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    ward: "",
  });
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  // Bumps each time we set errors so the flash animation can replay.
  const [errorTick, setErrorTick] = useState(0);
  const inputRefs = useRef<Record<FieldName, HTMLInputElement | null>>({
    email: null,
    customerName: null,
    phone: null,
    address: null,
    province: null,
    district: null,
    ward: null,
  });

  const items = useSyncExternalStore(subscribeCart, readCart, () => []);
  const total = useMemo(() => cartTotal(items), [items]);
  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  function setFieldValue(name: FieldName, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        if (!prev[name]) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function focusField(name: FieldName) {
    const el = inputRefs.current[name];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const target = window.scrollY + rect.top - 120;
    window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    // Defer focus until after the smooth scroll has settled.
    window.setTimeout(() => {
      el.focus({ preventScroll: true });
    }, 280);
  }

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ ok: false, message: "" });

    if (!items.length) {
      setState({ ok: false, message: "Giỏ hàng đang trống." });
      return;
    }

    const nextErrors: Partial<Record<FieldName, string>> = {};
    for (const name of FIELD_ORDER) {
      const message = validateField(name, values[name]);
      if (message) nextErrors[name] = message;
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setErrorTick((tick) => tick + 1);
      const firstInvalid = FIELD_ORDER.find((name) => nextErrors[name]);
      if (firstInvalid) {
        focusField(firstInvalid);
        setState({
          ok: false,
          message: nextErrors[firstInvalid] ?? "Vui lòng kiểm tra lại thông tin.",
        });
      }
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/sales-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: values.customerName.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          address: values.address.trim(),
          province: values.province.trim(),
          district: values.district.trim(),
          ward: values.ward.trim(),
          note: note.trim(),
          discountCode: "",
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
      setState({ ok: true, message: "Đặt hàng thành công. 99 Billiards sẽ liên hệ xác nhận đơn.", orderCode: data.orderCode });
    } finally {
      setSubmitting(false);
    }
  }

  const inputBaseClass =
    "min-h-12 rounded-lg border border-black/15 bg-[#fbfaf6] px-4 text-sm font-bold normal-case tracking-normal text-black outline-none transition focus:border-[#2EB958] focus:bg-white";

  function inputClass(name: FieldName) {
    return errors[name] ? `${inputBaseClass} field-error` : inputBaseClass;
  }

  function registerRef(name: FieldName) {
    return (el: HTMLInputElement | null) => {
      inputRefs.current[name] = el;
    };
  }

  return (
    <main className="min-h-screen bg-[#f7f4ec] pb-28 text-[#11100d] lg:pb-0">
      <PurchaseFlowHeader backHref="/cart" backLabel="Giỏ hàng" />

      <form onSubmit={submitOrder} noValidate className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:px-8 lg:grid-cols-[1fr_430px] lg:items-start lg:py-12">
        <div className="grid gap-6">
          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:p-7">
            <div className="mb-5 flex flex-col gap-2 border-b border-black/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2EB958]">Thanh toán</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Thông tin nhận hàng</h1>
              </div>
              <p className="text-sm font-bold text-black/50">COD toàn quốc</p>
            </div>

            <div key={errorTick} className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55 md:col-span-2">
                Email
                <input
                  ref={registerRef("email")}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(event) => setFieldValue("email", event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  placeholder="ten@email.com"
                  className={inputClass("email")}
                />
                {errors.email ? <span className="text-[11px] font-bold normal-case tracking-normal text-red-600">{errors.email}</span> : null}
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55">
                Họ và tên
                <input
                  ref={registerRef("customerName")}
                  name="customerName"
                  autoComplete="name"
                  value={values.customerName}
                  onChange={(event) => setFieldValue("customerName", event.target.value)}
                  aria-invalid={Boolean(errors.customerName)}
                  placeholder="Nguyen Van A"
                  className={inputClass("customerName")}
                />
                {errors.customerName ? <span className="text-[11px] font-bold normal-case tracking-normal text-red-600">{errors.customerName}</span> : null}
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55">
                Số điện thoại
                <input
                  ref={registerRef("phone")}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={values.phone}
                  onChange={(event) => setFieldValue("phone", event.target.value)}
                  aria-invalid={Boolean(errors.phone)}
                  placeholder="09xx xxx xxx"
                  className={inputClass("phone")}
                />
                {errors.phone ? <span className="text-[11px] font-bold normal-case tracking-normal text-red-600">{errors.phone}</span> : null}
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55">
                Tỉnh thành
                <input
                  ref={registerRef("province")}
                  name="province"
                  autoComplete="address-level1"
                  value={values.province}
                  onChange={(event) => setFieldValue("province", event.target.value)}
                  aria-invalid={Boolean(errors.province)}
                  placeholder="Hà Nội"
                  className={inputClass("province")}
                />
                {errors.province ? <span className="text-[11px] font-bold normal-case tracking-normal text-red-600">{errors.province}</span> : null}
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55">
                Quận huyện
                <input
                  ref={registerRef("district")}
                  name="district"
                  autoComplete="address-level2"
                  value={values.district}
                  onChange={(event) => setFieldValue("district", event.target.value)}
                  aria-invalid={Boolean(errors.district)}
                  placeholder="Quận / Huyện"
                  className={inputClass("district")}
                />
                {errors.district ? <span className="text-[11px] font-bold normal-case tracking-normal text-red-600">{errors.district}</span> : null}
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55">
                Phường xã
                <input
                  ref={registerRef("ward")}
                  name="ward"
                  autoComplete="address-level3"
                  value={values.ward}
                  onChange={(event) => setFieldValue("ward", event.target.value)}
                  aria-invalid={Boolean(errors.ward)}
                  placeholder="Phường / Xã"
                  className={inputClass("ward")}
                />
                {errors.ward ? <span className="text-[11px] font-bold normal-case tracking-normal text-red-600">{errors.ward}</span> : null}
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55">
                Địa chỉ
                <input
                  ref={registerRef("address")}
                  name="address"
                  autoComplete="street-address"
                  value={values.address}
                  onChange={(event) => setFieldValue("address", event.target.value)}
                  aria-invalid={Boolean(errors.address)}
                  placeholder="Số nhà, tên đường"
                  className={inputClass("address")}
                />
                {errors.address ? <span className="text-[11px] font-bold normal-case tracking-normal text-red-600">{errors.address}</span> : null}
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/55 md:col-span-2">
                Ghi chú
                <textarea
                  name="note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Ghi chú giao hàng (tùy chọn)"
                  rows={4}
                  className="rounded-lg border border-black/15 bg-[#fbfaf6] px-4 py-3 text-sm font-bold normal-case tracking-normal text-black outline-none transition focus:border-[#2EB958] focus:bg-white"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:p-7">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#2EB958] text-white">
                <FontAwesomeIcon icon="truck-fast" className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2EB958]">Phương thức</p>
                <h2 className="text-xl font-black">Thanh toán khi giao hàng</h2>
              </div>
            </div>
            <label className="flex min-h-14 items-center gap-3 rounded-lg border border-black/10 bg-[#fbfaf6] px-4 text-sm font-black">
              <input type="radio" checked readOnly className="accent-[#2EB958]" />
              Thanh toán tiền mặt khi nhận hàng (COD)
            </label>
            <p className="mt-3 text-sm font-bold text-black/55">99 Billiards sẽ liên hệ xác nhận đơn trước khi giao.</p>

            {state.message && !state.ok ? (
              <div className={`mt-5 rounded-lg border px-4 py-3 text-sm font-bold ${state.ok ? "border-[#2EB958]/25 bg-[#edf8f2] text-[#2EB958]" : "border-red-200 bg-red-50 text-red-700"}`}>
                {state.orderCode ? <p className="mb-1 text-xs uppercase tracking-[0.12em]">Mã đơn: {state.orderCode}</p> : null}
                <p>{state.message}</p>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_24px_70px_rgba(0,0,0,0.08)] md:p-6 lg:sticky lg:top-[120px]">
          <div className="flex items-center justify-between border-b border-black/10 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2EB958]">Đơn hàng</p>
              <h2 className="mt-1 text-2xl font-black">{totalQuantity} sản phẩm</h2>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#2EB958] text-white">
              <FontAwesomeIcon icon="cart-shopping" className="h-4 w-4" />
            </span>
          </div>

          <div className="grid max-h-[380px] gap-4 overflow-auto border-b border-black/10 py-5">
            {items.length ? (
              items.map((item) => (
                <div key={item.productId} className="grid grid-cols-[72px_1fr] gap-3">
                  <div className="relative h-[72px] w-[72px] overflow-hidden rounded-lg border border-black/10 bg-[#ede8de]">
                    {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" /> : null}
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-black leading-5">{item.name}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-black/40">Số lượng: {item.quantity}</p>
                    <p className="mt-1 text-base font-black text-[#2EB958]">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-black/15 bg-[#fbfaf6] px-4 py-8 text-center text-sm font-bold text-black/55">Giỏ hàng đang trống.</div>
            )}
          </div>

          <div className="mt-5 flex gap-2 border-b border-black/10 pb-5">
            <input
              name="discountCode"
              placeholder="Nhập mã giảm giá"
              className="min-h-12 min-w-0 flex-1 rounded-lg border border-black/15 bg-[#fbfaf6] px-3 text-sm font-bold outline-none transition focus:border-[#2EB958] focus:bg-white"
            />
            <button
              type="button"
              className="min-h-12 shrink-0 rounded-lg bg-[#2EB958] px-5 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#27a04b]"
            >
              Áp dụng
            </button>
          </div>

          {/* Tổng cộng + Đặt hàng — chỉ hiện inline trên lg+, mobile dùng sticky bar phía dưới. */}
          <div className="hidden lg:contents">
            <div className="mt-5 grid gap-4 text-sm font-bold text-black/60">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex items-end justify-between border-t border-black/10 pt-4">
                <span className="text-base text-black">Tổng cộng</span>
                <span className="text-3xl font-black text-[#2EB958]">{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !items.length || state.ok}
              className="mt-6 w-full rounded-full bg-[#2EB958] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#27a04b] disabled:cursor-not-allowed disabled:bg-black/25"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <FontAwesomeIcon icon="cart-shopping" className="h-4 w-4" />
                {submitting ? "Đang đặt hàng..." : "Đặt hàng"}
              </span>
            </button>
          </div>
        </aside>

        {/* Mobile-only sticky bottom bar: tổng cộng + nút đặt hàng */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 p-3 shadow-[0_-10px_24px_-12px_rgba(0,0,0,0.2)] backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">Tổng cộng</p>
              <p className="truncate text-xl font-black text-[#2EB958]">{formatCurrency(total)}</p>
            </div>
            <button
              type="submit"
              disabled={submitting || !items.length || state.ok}
              className="shrink-0 rounded-full bg-[#2EB958] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#27a04b] disabled:cursor-not-allowed disabled:bg-black/25"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <FontAwesomeIcon icon="cart-shopping" className="h-4 w-4" />
                {submitting ? "Đang đặt..." : "Đặt hàng"}
              </span>
            </button>
          </div>
        </div>
      </form>

      {state.ok ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/55 px-4">
          <div className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-black/10 bg-[#f7f4ec] shadow-2xl">
            <div className="border-b border-[#2EB958]/20 bg-[#2EB958] px-5 py-4 text-white">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/80">Đặt hàng thành công</p>
              <h2 className="mt-2 text-3xl font-black leading-tight">Cảm ơn bạn đã đặt hàng</h2>
            </div>
            <div className="bg-white px-5 py-6">
              {state.orderCode ? (
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#2EB958]">Mã đơn: {state.orderCode}</p>
              ) : null}
              <p className="mt-3 text-base font-bold leading-7 text-black/68">
                99 Billiards đã nhận thông tin đơn hàng. Đội ngũ tư vấn sẽ liên hệ xác nhận trong thời gian sớm nhất.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#2EB958] px-5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#27a04b]"
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
