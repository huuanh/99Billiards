"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@99billiards/ui";
import { siteConfig } from "@99billiards/config";
import { readCart } from "./cart-storage";

type NavItem = { label: string; href: string; key: "products" | "branches" | "promotions" | "news" | "franchise" };

const navItems: NavItem[] = [
  { label: "Sản phẩm", href: "/products", key: "products" },
  { label: "Cơ sở", href: "/#branches", key: "branches" },
  { label: "Ưu đãi", href: "/#promotions", key: "promotions" },
  { label: "Tin tức", href: "/#news", key: "news" },
  { label: "Nhượng quyền", href: "/nhuong-quyen", key: "franchise" },
];

export function MobileNavDrawer({ active }: { active?: NavItem["key"] }) {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function refresh() {
      setCartCount(readCart().reduce((total, item) => total + item.quantity, 0));
    }
    refresh();
    window.addEventListener("cart-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("cart-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKeydown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Mở menu"
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white lg:hidden"
      >
        <FontAwesomeIcon icon="bars" className="h-4 w-4" />
      </button>

      {open && mounted && createPortal(
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu chính"
          className="lg:hidden"
          style={{ position: "fixed", inset: 0, zIndex: 1000 }}
        >
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={() => setOpen(false)}
            className="backdrop-blur-sm"
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              border: 0,
              cursor: "pointer",
            }}
          />
          <aside
            className="flex flex-col gap-6 border-l border-white/10 px-6 pt-6 shadow-2xl"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              width: "86%",
              maxWidth: "24rem",
              backgroundColor: "#050705",
              color: "#f5f1e8",
              paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
              zIndex: 1,
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#2EB958]">Menu</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng menu"
                className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white"
              >
                <FontAwesomeIcon icon="xmark" className="h-4 w-4" />
              </button>
            </div>

            <nav className="grid gap-1 text-base font-bold text-white">
              {navItems.map((item) => {
                const isActive = active === item.key;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`focus-ring flex items-center justify-between rounded-2xl border border-white/10 px-4 py-4 transition ${
                      isActive ? "border-[#2EB958]/45 bg-[#2EB958]/12 text-[#2EB958]" : "hover:border-[#2EB958]/40 hover:text-[#2EB958]"
                    }`}
                  >
                    <span>{item.label}</span>
                    <FontAwesomeIcon icon="chevron-right" className="h-3 w-3 opacity-60" />
                  </Link>
                );
              })}

              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="focus-ring mt-1 flex items-center justify-between rounded-2xl border border-white/10 px-4 py-4 hover:border-[#2EB958]/40 hover:text-[#2EB958]"
              >
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon icon="cart-shopping" className="h-4 w-4" />
                  Giỏ hàng
                </span>
                {cartCount ? (
                  <span className="inline-grid min-w-6 place-items-center rounded-full bg-[#2EB958] px-2 py-0.5 text-xs font-black text-black">
                    {cartCount}
                  </span>
                ) : (
                  <FontAwesomeIcon icon="chevron-right" className="h-3 w-3 opacity-60" />
                )}
              </Link>
            </nav>

            <div className="mt-auto grid gap-3 border-t border-white/10 pt-5">
              <a
                href={`tel:${siteConfig.hotline.replaceAll(" ", "")}`}
                className="focus-ring grid min-h-12 place-items-center rounded-full bg-[#2EB958] px-5 text-sm font-black uppercase tracking-[0.18em] text-[#071107]"
              >
                Gọi {siteConfig.hotline}
              </a>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new Event("open-booking-modal"));
                }}
                className="focus-ring min-h-12 rounded-full border border-white/20 px-5 text-sm font-black uppercase tracking-[0.18em] text-white"
              >
                Đặt bàn ngay
              </button>
            </div>
          </aside>
        </div>,
        document.body,
      )}
    </>
  );
}
