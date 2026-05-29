import Image from "next/image";
import type { ProductBrand } from "@99billiards/db/seed";

export function BrandsMarquee({ brands }: { brands: ProductBrand[] }) {
  const visibleBrands = brands.filter((brand) => brand.status !== "hidden");
  if (!visibleBrands.length) return null;

  const items = [...visibleBrands, ...visibleBrands];

  return (
    <section className="border-y border-white/10 bg-[#07110b] py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="text-center text-xs font-black uppercase tracking-[0.3em] text-[#2EB958]">
          Thương hiệu phân phối
        </p>
        <h2 className="mt-3 text-center text-3xl font-black md:text-4xl">Đối tác chính hãng</h2>
      </div>

      <div className="relative mt-8 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#07110b] to-transparent md:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#07110b] to-transparent md:w-24" />

        <div className="marquee flex w-max items-center gap-10 hover:[animation-play-state:paused] md:gap-16">
          {items.map((brand, index) => (
            <div
              key={`${brand.id}-${index}`}
              className="grid h-16 w-32 shrink-0 place-items-center md:h-20 md:w-44"
              aria-hidden={index >= visibleBrands.length}
            >
              {brand.logo ? (
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={200}
                  height={80}
                  unoptimized
                  className="h-full w-full object-contain opacity-70 transition hover:opacity-100"
                />
              ) : (
                <span className="text-base font-black uppercase tracking-[0.2em] text-white/70 md:text-lg">
                  {brand.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
