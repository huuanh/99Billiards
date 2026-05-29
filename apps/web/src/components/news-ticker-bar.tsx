// News ticker bar — neon marquee chạy fixed trên header.
// Inspired by Option E "ISSUE 99 / THE POOL HALL" TopBarE.

const DEFAULT_ITEMS = [
  "ĐANG LIVESTREAM · 99 CUP MÙA 8 · BÁN KẾT 2",
  "32/48 BÀN ĐANG HOẠT ĐỘNG TỐI NAY",
  "CƠ SỞ CẦU GIẤY — CÒN 4 BÀN TRỐNG",
  "GIẢI THỨ 7 · 18:00 · CÒN 12 SLOT",
  "ƯU ĐÃI GIỜ VÀNG 14H - 17H · GIẢM 30%",
];

export function NewsTickerBar({
  items = DEFAULT_ITEMS,
  height = 36,
  speed = 50,
}: {
  items?: string[];
  height?: number;
  speed?: number;
}) {
  // Duplicate items once so the marquee can translate -50% and loop seamlessly.
  const track = [...items, ...items];

  return (
    <div
      className="fixed inset-x-0 top-0 z-[1110] overflow-hidden bg-[#2EB958] text-[#0A0E0C]"
      style={{ height }}
      role="marquee"
      aria-label="Tin tức nhanh"
    >
      <div
        className="marquee flex h-full items-center whitespace-nowrap font-mono text-[11px] font-semibold uppercase tracking-[0.18em] md:text-xs"
        style={{ animationDuration: `${speed}s`, width: "max-content" }}
      >
        {track.map((item, index) => (
          <span key={index} className="inline-flex items-center gap-6 px-6">
            <span>{item}</span>
            <span aria-hidden className="text-[#0A0E0C]/55">／</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export const NEWS_TICKER_HEIGHT_PX = 36;
