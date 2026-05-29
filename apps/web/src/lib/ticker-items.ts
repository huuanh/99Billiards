// Tổng hợp items cho NewsTickerBar từ data thật trong DB.
// Chiến lược: lấy số liệu cơ sở + 1-2 cơ sở highlight + promotions đang chạy + post mới nhất.
// Cap ~7 items để marquee không quá rối.

import { cache } from "react";
import { getBranches, getPosts, getPromotions } from "@99billiards/db";
import type { Branch, Post, Promotion } from "@99billiards/db/seed";

const MAX_ITEMS = 7;

function vnUpper(input: string): string {
  return input.normalize("NFC").toUpperCase();
}

function pickRandom<T>(items: T[], seed: number): T | undefined {
  if (items.length === 0) return undefined;
  // Deterministic pick within the same minute to avoid hydration mismatches.
  const index = Math.abs(Math.floor(seed)) % items.length;
  return items[index];
}

export const buildTickerItems = cache(async (): Promise<string[]> => {
  const [branchesRaw, promotionsRaw, postsRaw] = await Promise.all([
    getBranches(),
    getPromotions(),
    getPosts(),
  ]);

  const branches = branchesRaw as Branch[];
  const promotions = promotionsRaw as Promotion[];
  const posts = postsRaw as Post[];

  const items: string[] = [];

  const openBranches = branches.filter((branch) => branch.status === "open");
  const comingSoon = branches.filter((branch) => branch.status === "coming-soon");
  const openTables = openBranches.reduce((sum, branch) => sum + (branch.tables ?? 0), 0);

  // 1. Tổng quan hệ thống (chỉ tính branch đang open)
  if (openBranches.length > 0 && openTables > 0) {
    items.push(
      vnUpper(`${openBranches.length} cơ sở đang mở cửa · ${openTables} bàn billiards`),
    );
  }

  // 2. Cơ sở highlight (random theo phút để các lượt fetch trong cùng 1 phút trùng nhau)
  const seed = Math.floor(Date.now() / 60_000);
  const featuredBranch = pickRandom(openBranches, seed);
  if (featuredBranch) {
    const highlight = featuredBranch.highlights?.[0];
    const label = highlight
      ? `Cơ sở ${featuredBranch.name.replace(/^99 Billiards\s*/i, "")} · ${highlight}`
      : `Cơ sở ${featuredBranch.name.replace(/^99 Billiards\s*/i, "")} · mở cửa ${featuredBranch.hours}`;
    items.push(vnUpper(label));
  }

  // 3. Coming-soon branch (nếu có)
  const comingBranch = comingSoon[0];
  if (comingBranch) {
    items.push(
      vnUpper(`Cơ sở ${comingBranch.name.replace(/^99 Billiards\s*/i, "")} · sắp khai trương`),
    );
  }

  // 4. Promotions đang publish (tối đa 2)
  const activePromos = promotions.filter((promo) => promo.status === "published").slice(0, 2);
  for (const promo of activePromos) {
    const badge = promo.badge?.trim();
    const title = promo.title?.trim() || "";
    const text = badge ? `${badge} · ${title}` : `Ưu đãi · ${title}`;
    if (title) items.push(vnUpper(text));
  }

  // 5. Tin mới nhất (nếu có)
  const latestPost = posts[0];
  if (latestPost?.title) {
    items.push(vnUpper(`Tin mới · ${latestPost.title}`));
  }

  // Fallback nếu DB trống / chưa seed gì
  if (items.length === 0) {
    return [
      "99 BILLIARDS · ĐẲNG CẤP TRONG TỪNG CÚ ĐÁNH",
      "HOTLINE 0923 699 999 · TƯ VẤN MUA HÀNG & ĐẶT BÀN",
    ];
  }

  return items.slice(0, MAX_ITEMS);
});
