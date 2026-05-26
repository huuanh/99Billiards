import Link from "next/link";
import { siteConfig } from "@99billiards/config";

export function PublicFooter({
  kicker = "Contact",
  title = "Len lich cho van ke tiep.",
  body = "99 Billiards san sang tu van san pham, dat ban va lich hoc phu hop voi ngan sach cua ban.",
}: {
  kicker?: string;
  title?: string;
  body?: string;
}) {
  return (
    <footer id="contact" className="felt-grid bg-[#050705] px-4 py-16 text-[#f5f1e8] md:px-6">
      <div className="mx-auto grid max-w-7xl gap-10 rounded-[2rem] border border-white/10 bg-black/35 p-8 md:grid-cols-[1fr_0.72fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#d6ff3f]">{kicker}</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">{title}</h2>
          <p className="mt-5 max-w-2xl text-base font-bold leading-7 text-white/62">{body}</p>
        </div>
        <div className="grid content-between gap-8 text-white/70">
          <div className="grid gap-4">
            <p>Hotline: {siteConfig.hotline}</p>
            <p>Dat lich hoc / tu van: {siteConfig.bookingPhone}</p>
            <p>Facebook: 99 Billiards Club</p>
            <p>TikTok: @99_billiards_club</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`tel:${siteConfig.hotline.replaceAll(" ", "")}`}
              className="focus-ring rounded-full bg-[#d6ff3f] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#071107] hover:bg-white"
            >
              Goi ngay
            </a>
            <Link
              href="/products"
              className="focus-ring rounded-full border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white/75 hover:border-[#d6ff3f] hover:text-[#d6ff3f]"
            >
              Xem san pham
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
