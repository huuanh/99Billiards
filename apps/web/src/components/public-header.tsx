import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@99billiards/config";
import { buildTickerItems } from "@/lib/ticker-items";
import { CartLink } from "./cart-link";
import { HeaderBookingButton } from "./header-booking-button";
import { HeaderCartButton } from "./header-cart-button";
import { MobileNavDrawer } from "./mobile-nav-drawer";
import { NewsTickerBar } from "./news-ticker-bar";

const navItems = [
  { label: "Sản phẩm", href: "/products" },
  { label: "Cơ sở", href: "/#branches" },
  { label: "Ưu đãi", href: "/#promotions" },
  { label: "Tin tức", href: "/#news" },
  { label: "Nhượng quyền", href: "/nhuong-quyen" },
];

export async function PublicHeader({ active }: { active?: "branches" | "franchise" | "news" | "products" | "promotions" }) {
  const tickerItems = await buildTickerItems();
  return (
    <>
      <NewsTickerBar items={tickerItems} />
      <header className="fixed left-0 right-0 top-9 z-[1100] border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-full">
          <Image
            src="/logo.jpg"
            alt="99 Billiards Club"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full border border-[#2EB958]/40 object-cover"
          />
          <span className="hidden text-lg font-black uppercase tracking-[0.22em] text-white md:block lg:text-xl">
            Billiards Club
          </span>
        </Link>

        <nav className="hidden items-center divide-x divide-white/15 text-xs font-bold uppercase tracking-[0.18em] text-white/65 lg:flex">
          {navItems.map((item, idx) => {
            const isActive =
              (active === "products" && item.href === "/products") ||
              (active === "branches" && item.href === "/#branches") ||
              (active === "promotions" && item.href === "/#promotions") ||
              (active === "news" && item.href === "/#news") ||
              (active === "franchise" && item.href === "/nhuong-quyen");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`focus-ring px-5 transition hover:text-[#2EB958] ${
                  idx === 0 ? "pl-0" : ""
                } ${isActive ? "font-black text-[#2EB958]" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <CartLink className="hidden text-white/80 lg:inline-flex" />
          <a
            href={`tel:${siteConfig.hotline.replaceAll(" ", "")}`}
            className="focus-ring hidden items-center gap-2 text-xs font-bold tracking-[0.16em] text-white transition hover:text-[#2EB958] sm:inline-flex"
          >
            <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-[#2EB958] shadow-[0_0_8px_rgba(46,185,88,0.65)]" />
            {siteConfig.hotline}
          </a>
          {active === "products" ? <HeaderCartButton /> : <HeaderBookingButton />}
          <MobileNavDrawer active={active} />
        </div>
        </div>
      </header>
    </>
  );
}
