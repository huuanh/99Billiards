import Image from "next/image";
import Link from "next/link";
import {
  getBranches,
  getPosts,
  getProductBrands,
  getProductCategories,
  getProductSubcategories,
  getProducts,
  getPromotions,
  getSiteSettings,
} from "@99billiards/db";
import type {
  Branch,
  Post,
  Product,
  ProductBrand,
  ProductCategory,
  ProductSubcategory,
  Promotion,
} from "@99billiards/db/seed";
import { siteConfig } from "@99billiards/config";
import { BilliardsHero3D } from "@/components/billiards-hero-3d";
import { BookingModal } from "@/components/booking-modal";
import { BrandsMarquee } from "@/components/brands-marquee";
import { BranchesLocator } from "@/components/branches-locator";
import { FeaturedProductsCarousel } from "@/components/featured-products-carousel";
import { HeroCtaButtons } from "@/components/hero-cta-buttons";
import { HeroTitle } from "@/components/hero-title";
import { PromotionsShowcase } from "@/components/promotions-showcase";
import { PublicHeader } from "@/components/public-header";

export default async function Home() {
  const [
    branchesRaw,
    productsRaw,
    promotionsRaw,
    postsRaw,
    settings,
    categoriesRaw,
    subcategoriesRaw,
    brandsRaw,
  ] = await Promise.all([
    getBranches(),
    getProducts(),
    getPromotions(),
    getPosts(),
    getSiteSettings(),
    getProductCategories(),
    getProductSubcategories(),
    getProductBrands(),
  ]);
  const branches = branchesRaw as Branch[];
  const products = productsRaw as Product[];
  const promotions = promotionsRaw as Promotion[];
  const posts = postsRaw as Post[];
  const categoryNames = Object.fromEntries(
    (categoriesRaw as ProductCategory[]).map((c) => [c.id, c.name]),
  );
  const subcategoryNames = Object.fromEntries(
    (subcategoriesRaw as ProductSubcategory[]).map((s) => [s.id, s.name]),
  );
  const brandNames = Object.fromEntries(
    (brandsRaw as ProductBrand[]).map((b) => [b.id, b.name]),
  );
  const totalTables = branches.reduce((sum, branch) => sum + (branch.tables ?? 0), 0);
  const heroMetrics = [
    { value: `${branches.length}+`, label: "cơ sở" },
    { value: `${totalTables}`, label: "bàn Billiards" },
    { value: `${products.length}+`, label: "sản phẩm" },
  ];

  return (
    <main className="min-h-screen overflow-x-clip bg-[#050705] text-[#f5f1e8]">
      <a
        href="#products"
        className="focus-ring sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-sm focus:font-black focus:text-black"
      >
        Bỏ qua tới nội dung chính
      </a>

      <section id="home" className="felt-grid relative min-h-screen">
        <div className="absolute inset-0">
          <Image
            src={settings.heroImage || "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=2200&q=80"}
            alt="Không gian billiards"
            fill
            priority
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#06110b]/75 to-[#050705]" />
        </div>

        <PublicHeader />

        <BilliardsHero3D />

        <div className="pointer-events-none relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 pb-16 pt-32 md:px-6 md:pt-28 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="pointer-events-auto">
            <p className="text-xs font-black uppercase tracking-[0.42em] text-[#2EB958]">
              {settings.heroEyebrow || "Chuỗi billiards hiện đại tại Hà Nội"}
            </p>
            <h1 className="neon-text mt-5 max-w-4xl text-4xl font-black leading-[1.1] sm:text-5xl md:text-6xl md:leading-[1.05] lg:text-7xl">
              {settings.heroTitle ? (
                <HeroTitle title={settings.heroTitle} accent={settings.heroTitleAccent} />
              ) : (
                <>
                  Chơi là cuốn.
                  <br />
                  Lên cơ là tới.
                </>
              )}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72">
              {settings.heroSubtitle ||
                "99 Billiards gom trải nghiệm bàn chuẩn, cafe, đồ ăn, giải đấu và livestream kèo hot vào một hệ thống cơ sở luôn sáng đèn."}
            </p>
            <div className="mt-7 grid max-w-xl grid-cols-3 border-y border-white/12 bg-black/25 text-center backdrop-blur-sm">
              {heroMetrics.map((metric) => (
                <div key={metric.label} className="border-r border-white/10 px-3 py-4 last:border-r-0">
                  <p className="text-2xl font-black text-white md:text-3xl">{metric.value}</p>
                  <p className="mt-1 text-[11px] font-black uppercase tracking-[0.18em] text-white/48">{metric.label}</p>
                </div>
              ))}
            </div>
            <HeroCtaButtons
              primaryLabel={settings.primaryCtaLabel || "Đặt bàn ngay"}
              secondaryLabel={settings.secondaryCtaLabel || "Tìm cơ sở gần bạn"}
              secondaryHref={settings.secondaryCtaHref || "#branches"}
            />
          </div>
        </div>
      </section>

      <FeaturedProductsCarousel
        products={products.slice(0, 12)}
        categoryNames={categoryNames}
        subcategoryNames={subcategoryNames}
        brandNames={brandNames}
      />

      <section id="branches" className="bg-[#07110b] px-4 py-24 md:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionTitle kicker={`${branches.length} locations`} title="Hệ thống cơ sở" />
          <BranchesLocator branches={branches} />
        </div>
      </section>

      <PromotionsShowcase promotions={promotions} />

      <section id="news" className="bg-[#eef2e1] px-4 py-16 text-[#071107] md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionTitle kicker="Newsroom" title="Tin tức & kèo đấu" dark />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:mt-10 md:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/tin-tuc/${post.id}`}
                className="rounded-lg bg-white p-3 shadow-xl md:p-4"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                  <Image src={post.image} alt={post.title} fill className="object-cover" />
                </div>
                <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#2EB958] md:mt-5 md:text-xs md:tracking-[0.2em]">
                  {post.category} · {post.publishedAt}
                </p>
                <h3 className="mt-1.5 line-clamp-3 text-sm font-black leading-tight md:mt-3 md:line-clamp-none md:text-2xl md:leading-tight">
                  {post.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-black/60 md:mt-3 md:line-clamp-none md:text-sm md:leading-6">
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <BrandsMarquee brands={brandsRaw as ProductBrand[]} />

      <footer id="contact" className="felt-grid px-4 py-16 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 rounded-[2rem] border border-white/10 bg-black/35 p-8 md:grid-cols-[1fr_0.7fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#2EB958]">Liên hệ</p>
            <h2 className="mt-3 text-4xl font-black md:text-6xl">Lên lịch cho ván kế tiếp.</h2>
          </div>
          <div className="space-y-4 text-white/70">
            <p>Hotline: {siteConfig.hotline}</p>
            <p>Đặt lịch học / tư vấn: {siteConfig.bookingPhone}</p>
            <p>Facebook: 99 Billiards Club</p>
            <p>TikTok: @99_billiards_club</p>
          </div>
        </div>
      </footer>

      <div id="booking" />
      <BookingModal branches={branches} promotions={promotions} />
    </main>
  );
}

function SectionTitle({ kicker, title, dark = false }: { kicker: string; title: string; dark?: boolean }) {
  const displayTitle = kicker === "Products" ? "Sản phẩm nổi bật" : title;

  return (
    <div>
      <p className={`text-xs font-black uppercase tracking-[0.35em] ${dark ? "text-[#2EB958]" : "text-[#2EB958]"}`}>
        {kicker}
      </p>
      <h2 className="mt-3 max-w-3xl text-4xl font-black md:text-6xl">{displayTitle}</h2>
    </div>
  );
}

