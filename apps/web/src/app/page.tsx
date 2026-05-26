import Image from "next/image";
import Link from "next/link";
import { getBranches, getPosts, getProducts, getPromotions, getSiteSettings } from "@99billiards/db";
import type { Branch, Post, Product, Promotion } from "@99billiards/db/seed";
import { siteConfig } from "@99billiards/config";
import { formatCurrency } from "@99billiards/ui";
import { BilliardsHero3D } from "@/components/billiards-hero-3d";
import { BookingModal } from "@/components/booking-modal";
import { MobileStickyActions } from "@/components/mobile-sticky-actions";

const nav = [
  ["Home", "#home"],
  ["Sản phẩm", "#products"],
  ["Cơ sở", "#branches"],
  ["Ưu đãi", "#promotions"],
  ["Tin tức", "#news"],
  ["Liên hệ", "#contact"],
];

export default async function Home() {
  const [branchesRaw, productsRaw, promotionsRaw, postsRaw, settings] = await Promise.all([
    getBranches(),
    getProducts(),
    getPromotions(),
    getPosts(),
    getSiteSettings(),
  ]);
  const branches = branchesRaw as Branch[];
  const products = productsRaw as Product[];
  const promotions = promotionsRaw as Promotion[];
  const posts = postsRaw as Post[];
  const districts = Array.from(new Set(branches.map((branch) => branch.district)));
  const featuredProducts = products.filter((product) => product.featured).slice(0, 4);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050705] pb-20 text-[#f5f1e8] md:pb-0">
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

        <header className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-black/45 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
            <Link href="#home" className="focus-ring flex items-center gap-3 rounded-full">
              <Image
                src="/logo.jpg"
                alt="99 Billiards Club"
                width={44}
                height={44}
                className="h-11 w-11 rounded-full border border-[#d6ff3f]/40 object-cover"
              />
              <span className="hidden text-sm font-black uppercase tracking-[0.24em] md:block">
                Billiards Club
              </span>
            </Link>
            <nav className="hidden items-center gap-6 text-xs font-bold uppercase tracking-[0.18em] text-white/65 lg:flex">
              {nav.map(([label, href]) => (
                <Link key={href} href={href === "#products" ? "/products" : href} className="focus-ring rounded-full hover:text-[#d6ff3f]">
                  {label}
                </Link>
              ))}
            </nav>
            <a
              href={`tel:${siteConfig.hotline.replaceAll(" ", "")}`}
              className="focus-ring rounded-full border border-[#d6ff3f]/40 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#d6ff3f]"
            >
              {siteConfig.hotline}
            </a>
          </div>
        </header>

        <BilliardsHero3D />

        <div className="pointer-events-none relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 pb-16 pt-[46vh] md:px-6 md:pt-28 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="pointer-events-auto">
            <p className="text-xs font-black uppercase tracking-[0.42em] text-[#d6ff3f]">
              Chuỗi billiards hiện đại tại Hà Nội
            </p>
            <h1 className="neon-text mt-5 max-w-4xl text-6xl font-black leading-[0.88] md:text-8xl lg:text-9xl">
              Chơi là cuốn.
              <br />
              Lên cơ là tới.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72">
              99 Billiards gom trải nghiệm bàn chuẩn, cafe, đồ ăn, giải đấu và livestream kèo hot
              vào một hệ thống cơ sở luôn sáng đèn.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#branches"
                className="focus-ring rounded-full bg-[#d6ff3f] px-7 py-4 text-center text-sm font-black uppercase tracking-[0.2em] text-[#071107] hover:bg-white"
              >
                Tìm cơ sở gần bạn
              </Link>
              <Link
                href="#booking"
                className="focus-ring rounded-full border border-white/20 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.2em] text-white hover:border-[#d6ff3f] hover:text-[#d6ff3f]"
              >
                Đặt bàn ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-4 py-24 md:px-6">
        <SectionTitle kicker="Products" title="Sản phẩm & dịch vụ" />
        <Link
          href="/products"
          className="focus-ring mt-6 inline-flex rounded-full border border-white/15 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white/75 hover:border-[#d6ff3f] hover:text-[#d6ff3f]"
        >
          Xem tất cả sản phẩm
        </Link>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-[#d6ff3f]/45 hover:bg-white/[0.07]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={product.image} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute left-3 top-3 bg-[#d6ff3f] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-black">
                  Nổi bật
                </span>
              </div>
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d6ff3f]">
                  {product.category}
                </p>
                <h3 className="mt-2 text-2xl font-black">{product.name}</h3>
                <p className="mt-4 text-lg font-black text-[#d6ff3f]">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="branches" className="bg-[#07110b] px-4 py-24 md:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionTitle kicker={`${branches.length} locations`} title="Hệ thống cơ sở" />
          <div className="mt-8 flex gap-3 overflow-auto pb-2">
            {districts.map((district) => (
              <span key={district} className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white/75">
                {district}
              </span>
            ))}
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {branches.map((branch) => (
              <article key={branch.id} className="grid overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/25 md:grid-cols-[0.9fr_1.1fr]">
                <div className="relative min-h-64 overflow-hidden">
                  <Image src={branch.image} alt={branch.name} fill className="object-cover" />
                  <span className="absolute left-4 top-4 rounded-full bg-[#d6ff3f] px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-black">
                    {branch.code}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={branch.status} />
                    <span className="rounded-full bg-white/8 px-3 py-2 text-xs font-bold text-white/60">
                      {branch.hours}
                    </span>
                  </div>
                  <h3 className="mt-5 text-2xl font-black">{branch.name}</h3>
                  <p className="mt-3 text-white/64">{branch.address}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {branch.highlights.map((item) => (
                      <span key={item} className="rounded-full bg-white/8 px-3 py-2 text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href={`/co-so/${branch.id}`} className="focus-ring rounded-full bg-white px-5 py-3 text-sm font-black text-black">
                      Xem chi tiết
                    </Link>
                    <a href={branch.mapUrl || "#branches"} target="_blank" rel="noreferrer" className="focus-ring rounded-full border border-white/15 px-5 py-3 text-sm font-black text-white/75">
                      Chỉ đường
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="promotions" className="mx-auto max-w-7xl px-4 py-24 md:px-6">
        <SectionTitle kicker="Promotion" title="Ưu đãi đang chạy" />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {promotions.map((promotion) => (
            <Link key={promotion.id} href={`/uu-dai/${promotion.id}`} className="relative min-h-96 overflow-hidden rounded-[1.8rem] border border-white/10 p-6">
              <Image src={promotion.image} alt={promotion.title} fill className="object-cover opacity-55" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
              <div className="relative flex h-full min-h-80 flex-col justify-end">
                <span className="mb-4 w-fit rounded-full bg-[#d6ff3f] px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-black">
                  {promotion.badge}
                </span>
                <h3 className="text-3xl font-black">{promotion.title}</h3>
                <p className="mt-3 text-white/72">{promotion.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="news" className="bg-[#eef2e1] px-4 py-24 text-[#071107] md:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionTitle kicker="Newsroom" title="Tin tức & kèo đấu" dark />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/tin-tuc/${post.id}`} className="rounded-[1.5rem] bg-white p-4 shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.2rem]">
                  <Image src={post.image} alt={post.title} fill className="object-cover" />
                </div>
                <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                  {post.category} · {post.publishedAt}
                </p>
                <h3 className="mt-3 text-2xl font-black">{post.title}</h3>
                <p className="mt-3 text-sm leading-6 text-black/60">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer id="contact" className="felt-grid px-4 py-16 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 rounded-[2rem] border border-white/10 bg-black/35 p-8 md:grid-cols-[1fr_0.7fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#d6ff3f]">Liên hệ</p>
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
      <MobileStickyActions branch={branches[0]} />
    </main>
  );
}

function SectionTitle({ kicker, title, dark = false }: { kicker: string; title: string; dark?: boolean }) {
  const displayTitle = kicker === "Products" ? "Hàng nổi bật" : title;

  return (
    <div>
      <p className={`text-xs font-black uppercase tracking-[0.35em] ${dark ? "text-emerald-700" : "text-[#d6ff3f]"}`}>
        {kicker}
      </p>
      <h2 className="mt-3 max-w-3xl text-4xl font-black md:text-6xl">{displayTitle}</h2>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const text = status === "coming-soon" ? "Sắp khai trương" : status === "busy" ? "Đông bàn" : "Đang mở";
  return (
    <span className="rounded-full bg-[#d6ff3f] px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-black">
      {text}
    </span>
  );
}
