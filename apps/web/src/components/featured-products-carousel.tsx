"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { FontAwesomeIcon, formatCurrency } from "@99billiards/ui";
import type { Product } from "@99billiards/db/seed";

const PER_PAGE_DESKTOP = 4;
const AUTOPLAY_INTERVAL_MS = 5000;

export function FeaturedProductsCarousel({
  products,
  categoryNames = {},
  subcategoryNames = {},
  brandNames = {},
}: {
  products: Product[];
  categoryNames?: Record<string, string>;
  subcategoryNames?: Record<string, string>;
  brandNames?: Record<string, string>;
}) {
  const [page, setPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  if (products.length === 0) {
    return (
      <section id="products" className="mx-auto max-w-7xl px-4 py-24 md:px-6">
        <h2 className="text-center text-4xl font-black md:text-5xl">Sản phẩm</h2>
        <div className="mt-10 rounded-lg border border-white/10 bg-white/[0.04] p-6 text-center text-white/70">
          Chưa có sản phẩm. Vào trang catalog để xem toàn bộ.
        </div>
      </section>
    );
  }

  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE_DESKTOP));
  const clampedPage = Math.min(page, totalPages - 1);

  const goPrev = () => setPage((p) => (p <= 0 ? totalPages - 1 : p - 1));
  const goNext = () => setPage((p) => (p >= totalPages - 1 ? 0 : p + 1));

  useEffect(() => {
    if (totalPages <= 1 || isPaused) return;
    intervalRef.current = setInterval(() => {
      setPage((p) => (p >= totalPages - 1 ? 0 : p + 1));
    }, AUTOPLAY_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [totalPages, isPaused]);

  useEffect(() => {
    function onVisibilityChange() {
      setIsPaused(document.hidden);
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  return (
    <section id="products" className="relative overflow-hidden py-12 md:py-24">
      {/* Section background: felt pattern + accent glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(46,185,88,0.6) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(46,185,88,0.12), transparent 60%), radial-gradient(ellipse 50% 40% at 80% 100%, rgba(46,185,88,0.08), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#2EB958] md:text-xs">
            99 Billiards Store
          </p>
          <h2 className="mt-3 inline-flex items-center gap-3 text-3xl font-black uppercase leading-none sm:text-4xl md:mt-4 md:text-5xl lg:text-6xl">
            <span aria-hidden className="hidden h-px w-12 bg-gradient-to-r from-transparent to-[#2EB958]/60 md:block" />
            <span>Sản phẩm nổi bật</span>
            <span aria-hidden className="hidden h-px w-12 bg-gradient-to-l from-transparent to-[#2EB958]/60 md:block" />
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-xs text-white/55 md:mt-4 md:text-sm">
            Cơ, ngọn, phụ kiện chính hãng — bảo hành dài hạn, ship hoả tốc Hà Nội.
          </p>
        </div>

        <div
          className="relative mt-4 md:mt-6 md:px-12"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
        >
          <button
            type="button"
            onClick={goPrev}
            aria-label="Sản phẩm trước"
            className="focus-ring absolute left-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition hover:scale-110 hover:border-[#2EB958] hover:text-[#2EB958] md:flex"
          >
            <FontAwesomeIcon icon="chevron-left" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Sản phẩm tiếp"
            className="focus-ring absolute right-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition hover:scale-110 hover:border-[#2EB958] hover:text-[#2EB958] md:flex"
          >
            <FontAwesomeIcon icon="chevron-right" className="h-4 w-4" />
          </button>

          <div className="overflow-x-clip py-3 md:py-6" style={{ overflowClipMargin: "200px" } as React.CSSProperties}>
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${clampedPage * 100}%)` }}
            >
              {Array.from({ length: totalPages }).map((_, pageIdx) => {
                const pageItems = products.slice(
                  pageIdx * PER_PAGE_DESKTOP,
                  (pageIdx + 1) * PER_PAGE_DESKTOP,
                );
                return (
                  <div
                    key={pageIdx}
                    className="grid w-full shrink-0 grid-cols-2 gap-3 px-2 sm:gap-4 sm:px-3 xl:grid-cols-4"
                  >
                    {pageItems.map((product) => {
                      const category = categoryNames[product.categoryId || ""] || product.category;
                      const subcategory = subcategoryNames[product.subcategoryId || ""] || "";
                      const brand = brandNames[product.brandId || ""] || product.brand || "";
                      const discount =
                        product.compareAtPrice && product.compareAtPrice > product.price
                          ? Math.round(
                              ((product.compareAtPrice - product.price) / product.compareAtPrice) *
                                100,
                            )
                          : 0;
                      return (
                        <ProductSpotlightCard
                          key={product.id}
                          product={product}
                          category={category}
                          subcategory={subcategory}
                          brand={brand}
                          discount={discount}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-2 flex items-center justify-center gap-2 md:mt-3">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPage(idx)}
                aria-label={`Tới trang ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  idx === clampedPage ? "w-8 bg-[#2EB958] shadow-[0_0_12px_rgba(46,185,88,0.6)]" : "w-2.5 bg-white/25 hover:bg-white/45"
                }`}
              />
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-center md:mt-10">
          <Link
            href="/products"
            className="focus-ring group inline-flex items-center gap-2 rounded-full border border-[#2EB958]/45 bg-black/30 px-8 py-4 text-sm font-black uppercase tracking-[0.2em] text-[#2EB958] backdrop-blur transition hover:-translate-y-0.5 hover:border-[#2EB958] hover:bg-[#2EB958] hover:text-black hover:shadow-[0_18px_40px_-14px_rgba(46,185,88,0.6)]"
          >
            Xem tất cả sản phẩm
            <span aria-hidden className="transition group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProductSpotlightCard({
  product,
  category,
  subcategory,
  brand,
  discount,
}: {
  product: Product;
  category: string;
  subcategory: string;
  brand: string;
  discount: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  function onMouseMove(event: ReactMouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    // Spotlight position theo cursor.
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
    // 3D tilt nhẹ: ±4deg theo cursor offset từ tâm.
    const tiltX = ((event.clientY - rect.top - rect.height / 2) / rect.height) * -4;
    const tiltY = ((event.clientX - rect.left - rect.width / 2) / rect.width) * 4;
    el.style.setProperty("--tilt-x", `${tiltX}deg`);
    el.style.setProperty("--tilt-y", `${tiltY}deg`);
  }

  function onMouseLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", `0deg`);
    el.style.setProperty("--tilt-y", `0deg`);
  }

  return (
    <Link
      ref={ref}
      href={`/products/${product.id}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="group relative z-0 flex flex-col rounded-xl border border-white/15 bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_36px_-12px_rgba(0,0,0,0.7)] transition-[transform,box-shadow,border-color] duration-300 hover:z-20 hover:border-[#2EB958]/65 hover:shadow-[0_0_0_1px_rgba(46,185,88,0.55),0_0_42px_-4px_rgba(46,185,88,0.55),0_32px_60px_-20px_rgba(0,0,0,0.85)]"
      style={
        {
          transform:
            "perspective(900px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) translateZ(0)",
          transformStyle: "preserve-3d",
        } as React.CSSProperties
      }
    >
      {/* Cursor-follow spotlight: radial gradient theo cursor */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle 260px at var(--mx, 50%) var(--my, 50%), rgba(46,185,88,0.22), transparent 60%)",
        }}
      />

      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-white/[0.06]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-700 ease-out group-hover:scale-110"
        />
        {/* Gradient overlay đáy cho contrast khi ảnh sáng */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050705]/85 via-transparent to-transparent"
        />
        {/* Shine sweep on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-y-2 -left-2/3 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100"
        />
      </div>

      {(product.featured || discount) ? (
        <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-wrap gap-2">
          {product.featured ? (
            <span className="relative overflow-hidden rounded-full bg-[#2EB958] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-black shadow-md ring-1 ring-black/5">
              <span className="relative z-10">Nổi bật</span>
              {/* Shine sweep loop trên badge */}
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                style={{
                  animation: "badge-shine 3s ease-in-out infinite",
                }}
              />
            </span>
          ) : null}
          {discount ? (
            <span className="rounded-full bg-red-600 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-white shadow-[0_4px_16px_rgba(220,38,38,0.45)] ring-1 ring-black/10">
              -{discount}%
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="relative flex flex-1 flex-col p-2.5 sm:p-4">
        <p className="hidden text-[11px] font-black uppercase tracking-[0.16em] text-[#2EB958] sm:block">
          {category}
        </p>
        <h3 className="line-clamp-2 text-xs font-black leading-tight sm:mt-2 sm:min-h-[3rem] sm:text-lg">
          {product.name}
        </h3>
        <p className="mt-1 hidden min-h-[1.25rem] text-sm font-bold text-white/45 sm:block">
          {[brand, subcategory].filter(Boolean).join(" / ") || " "}
        </p>
        <div className="mt-1.5 sm:mt-3">
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <p className="text-[11px] font-bold text-white/40 line-through sm:text-sm">
              {formatCurrency(product.compareAtPrice)}
            </p>
          ) : (
            <p className="text-[11px] font-bold text-transparent sm:text-sm" aria-hidden>
              &nbsp;
            </p>
          )}
          <p
            className="text-sm font-black text-[#2EB958] transition-all duration-300 group-hover:text-[#7CFFB1] sm:text-2xl"
            style={{ textShadow: "0 0 0 transparent" }}
          >
            <span className="group-hover:[text-shadow:0_0_18px_rgba(124,255,177,0.55)]">
              {formatCurrency(product.price)}
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}
