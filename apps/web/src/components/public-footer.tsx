import Link from "next/link";
import { siteConfig } from "@99billiards/config";

export function PublicFooter({
  kicker = "Liên hệ",
  title = "Lên lịch cho ván kế tiếp.",
  body = "99 Billiards sẵn sàng tư vấn sản phẩm, đặt bàn và lịch học phù hợp với ngân sách của bạn.",
}: {
  kicker?: string;
  title?: string;
  body?: string;
}) {
  return (
    <footer id="contact" className="felt-grid bg-[#050705] px-4 py-16 text-[#f5f1e8] md:px-6">
      <div className="mx-auto grid max-w-7xl gap-10 rounded-[2rem] border border-white/10 bg-black/35 p-8 md:grid-cols-[1fr_0.72fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#2EB958]">{kicker}</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">{title}</h2>
          <p className="mt-5 max-w-2xl text-base font-bold leading-7 text-white/62">{body}</p>
        </div>
        <div className="grid content-between gap-8 text-white/70">
          <div className="grid gap-4">
            <p>Hotline: {siteConfig.hotline}</p>
            <p>Đặt lịch học / tư vấn: {siteConfig.bookingPhone}</p>
            <p>Facebook: 99 Billiards Club</p>
            <p>TikTok: @99_billiards_club</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`tel:${siteConfig.hotline.replaceAll(" ", "")}`}
              className="focus-ring rounded-full bg-[#2EB958] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#071107] hover:bg-white"
            >
              Gọi ngay
            </a>
            <Link
              href="/products"
              className="focus-ring rounded-full border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white/75 hover:border-[#2EB958] hover:text-[#2EB958]"
            >
              Xem sản phẩm
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
