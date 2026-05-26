import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@99billiards/config";
import { CartLink } from "./cart-link";

const navItems = [
  { label: "Sản phẩm", href: "/products" },
  { label: "Cơ sở", href: "/#branches" },
  { label: "Ưu đãi", href: "/#promotions" },
  { label: "Tin tức", href: "/#news" },
];

export function PublicHeader({ active }: { active?: "branches" | "news" | "products" | "promotions" }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-full">
          <Image
            src="/logo.jpg"
            alt="99 Billiards Club"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full border border-[#d6ff3f]/40 object-cover"
          />
          <span className="hidden text-sm font-black uppercase tracking-[0.24em] text-white md:block">
            99 Billiards
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-xs font-bold uppercase tracking-[0.18em] text-white/65 lg:flex">
          {navItems.map((item) => {
            const isActive =
              (active === "products" && item.href === "/products") ||
              (active === "branches" && item.href === "/#branches") ||
              (active === "promotions" && item.href === "/#promotions") ||
              (active === "news" && item.href === "/#news");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`focus-ring rounded-full hover:text-[#d6ff3f] ${isActive ? "text-[#d6ff3f]" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
          <CartLink className="hover:text-[#d6ff3f]" />
        </nav>

        <a
          href={`tel:${siteConfig.hotline.replaceAll(" ", "")}`}
          className="focus-ring rounded-full border border-[#d6ff3f]/40 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#d6ff3f]"
        >
          {siteConfig.hotline}
        </a>
      </div>
    </header>
  );
}
