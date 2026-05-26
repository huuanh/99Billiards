import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getProductCategories,
  getProductBrands,
  getProductPageSettings,
  getProductSubcategories,
  getProducts,
} from "@99billiards/db";
import type { Product, ProductBrand, ProductCategory, ProductPageSettings, ProductSubcategory } from "@99billiards/db/seed";
import { siteConfig } from "@99billiards/config";
import { FontAwesomeIcon, formatCurrency } from "@99billiards/ui";
import { CartLink } from "@/components/cart-link";

const priceRanges = [
  { label: "Duoi 2 trieu", min: 0, max: 2_000_000 },
  { label: "2 - 4 trieu", min: 2_000_000, max: 4_000_000 },
  { label: "4 - 7 trieu", min: 4_000_000, max: 7_000_000 },
  { label: "7 - 13 trieu", min: 7_000_000, max: 13_000_000 },
  { label: "Tren 13 trieu", min: 13_000_000, max: Number.POSITIVE_INFINITY },
];

export async function generateMetadata(): Promise<Metadata> {
  const settings = (await getProductPageSettings()) as ProductPageSettings;

  return {
    title: settings.seoTitle || settings.heroTitle || "San pham 99 Billiards",
    description: settings.seoDescription || settings.heroSubtitle,
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) || {};
  const selectedCategory = paramValue(params.category);
  const selectedSubcategory = paramValue(params.subcategory);
  const selectedBrand = paramValue(params.brand);
  const selectedPrice = paramValue(params.price);
  const query = paramValue(params.q).toLowerCase();

  const [productsRaw, categoriesRaw, subcategoriesRaw, brandsRaw, settingsRaw] = await Promise.all([
    getProducts() as Promise<Product[]>,
    getProductCategories() as Promise<ProductCategory[]>,
    getProductSubcategories() as Promise<ProductSubcategory[]>,
    getProductBrands() as Promise<ProductBrand[]>,
    getProductPageSettings() as Promise<ProductPageSettings>,
  ]);

  const categories = categoriesRaw.filter((category) => category.status !== "hidden");
  const subcategories = subcategoriesRaw.filter((subcategory) => subcategory.status !== "hidden");
  const brands = brandsRaw.filter((brand) => brand.status !== "hidden");
  const settings = settingsRaw;
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const subcategoryNames = new Map(subcategories.map((subcategory) => [subcategory.id, subcategory.name]));
  const brandNames = new Map(brands.map((brand) => [brand.id, brand.name]));

  const filteredProducts = productsRaw.filter((product) => {
    const categoryMatch = !selectedCategory || product.categoryId === selectedCategory || product.category === selectedCategory;
    const subcategoryMatch =
      !selectedSubcategory ||
      product.subcategoryId === selectedSubcategory ||
      product.subcategoryIds?.includes(selectedSubcategory);
    const brandMatch = !selectedBrand || product.brandId === selectedBrand || product.brand === selectedBrand;
    const priceRange = priceRanges.find((range) => slugify(range.label) === selectedPrice);
    const priceMatch = !priceRange || (product.price >= priceRange.min && product.price < priceRange.max);
    const text = `${product.name} ${product.category} ${product.brand || ""} ${product.description || ""}`.toLowerCase();
    const queryMatch = !query || text.includes(query);
    return categoryMatch && subcategoryMatch && brandMatch && priceMatch && queryMatch;
  });

  const featuredProducts = productsRaw.filter((product) => product.featured).slice(0, 6);
  const heroImage =
    settings.heroImage ||
    "https://images.unsplash.com/photo-1541305678321-60de370004b7?auto=format&fit=crop&w=2200&q=80";

  return (
    <main className="min-h-screen bg-[#f7f4ec] text-[#15120d]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f4ec]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link href="/" className="focus-ring flex items-center gap-3 rounded-full">
            <Image src="/logo.jpg" alt="99 Billiards Club" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
            <span className="hidden text-sm font-black uppercase tracking-[0.2em] md:block">99 Billiards</span>
          </Link>
          <nav className="hidden items-center gap-5 text-xs font-black uppercase tracking-[0.16em] text-black/58 lg:flex">
            <Link href="/products" className="rounded-full text-[#00684a]">San pham</Link>
            <Link href="/#branches" className="rounded-full hover:text-[#00684a]">Co so</Link>
            <Link href="/#promotions" className="rounded-full hover:text-[#00684a]">Uu dai</Link>
            <Link href="/#news" className="rounded-full hover:text-[#00684a]">Tin tuc</Link>
            <CartLink />
          </nav>
          <a href={`tel:${siteConfig.hotline.replaceAll(" ", "")}`} className="focus-ring rounded-full bg-[#00684a] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white">
            {siteConfig.hotline}
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src={heroImage} alt="" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/86 via-black/58 to-black/14" />
        </div>
        <div className="relative mx-auto grid min-h-[76vh] max-w-7xl items-end gap-8 px-4 pb-12 pt-28 md:px-6 lg:grid-cols-[1fr_0.42fr]">
          <div className="max-w-4xl text-white">
            <p className="text-xs font-black uppercase tracking-[0.34em] text-[#d6ff3f]">
              {settings.heroEyebrow || "99 Billiards Store"}
            </p>
            <h1 className="mt-5 text-5xl font-black leading-[0.95] md:text-7xl lg:text-8xl">
              {settings.heroTitle || "San pham cho moi van choi"}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
              {settings.heroSubtitle || "Catalog san pham, dich vu va phu kien billiards."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={settings.primaryCtaHref || "#catalog"} className="focus-ring rounded-full bg-[#d6ff3f] px-7 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-black">
                {settings.primaryCtaLabel || "Xem san pham"}
              </Link>
              <Link href={settings.secondaryCtaHref || "#contact"} className="focus-ring rounded-full border border-white/25 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-white">
                {settings.secondaryCtaLabel || "Lien he tu van"}
              </Link>
            </div>
          </div>
          <div className="border border-white/15 bg-black/40 p-5 text-white backdrop-blur-md">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d6ff3f]">
              {settings.promoTitle || "Goi y nhanh"}
            </p>
            <p className="mt-3 text-sm leading-6 text-white/72">
              {settings.promoText || "Loc theo danh muc, nhan hang hoac khoang gia de tim dung san pham."}
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <Metric value={String(productsRaw.length)} label="San pham" />
              <Metric value={String(categories.length)} label="Danh muc" />
              <Metric value={String(brands.length)} label="Nhan hang" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#15120d] px-4 py-5 text-white md:px-6">
        <div className="mx-auto grid max-w-7xl gap-3 text-sm font-bold md:grid-cols-4">
          <span>Van chuyen hoa toc khu vuc Ha Noi</span>
          <span>Ho tro bao duong co mien phi</span>
          <span>Nhieu phuong thuc thanh toan</span>
          <span>Tu van theo ngan sach va trinh do</span>
        </div>
      </section>

      <section id="catalog" className="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:px-6 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit border border-black/10 bg-white p-4 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-lg font-black">Danh muc san pham</h2>
          <div className="mt-4 grid gap-2">
            <FilterLink label="Tat ca san pham" param="category" value="" active={!selectedCategory} />
            {categories.map((category) => (
              <FilterLink
                key={category.id}
                label={category.name}
                param="category"
                value={category.id}
                active={selectedCategory === category.id}
              />
            ))}
          </div>

          <h3 className="mt-8 text-sm font-black uppercase tracking-[0.14em] text-black/55">Nhan hang</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {brands.map((brand) => (
              <FilterChip key={brand.id} label={brand.name} param="brand" value={brand.id} active={selectedBrand === brand.id} />
            ))}
          </div>

          <h3 className="mt-8 text-sm font-black uppercase tracking-[0.14em] text-black/55">Khoang gia</h3>
          <div className="mt-3 grid gap-2">
            {priceRanges.map((range) => (
              <FilterLink
                key={range.label}
                label={range.label}
                param="price"
                value={slugify(range.label)}
                active={selectedPrice === slugify(range.label)}
              />
            ))}
          </div>
        </aside>

        <div>
          <div className="flex flex-col gap-4 border-b border-black/10 pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#00684a]">Catalog</p>
              <h2 className="mt-2 text-4xl font-black">Tat ca san pham</h2>
              <p className="mt-2 text-sm font-bold text-black/55">{filteredProducts.length} san pham dang hien thi</p>
            </div>
            <form action="/products" className="flex min-w-0 gap-2">
              <input
                name="q"
                defaultValue={query}
                placeholder="Tim co, ngon, phu kien..."
                className="min-h-11 min-w-0 border border-black/15 bg-white px-4 text-sm font-bold outline-none focus:border-[#00684a]"
              />
              <button className="min-h-11 bg-[#00684a] px-5 text-sm font-black uppercase tracking-[0.12em] text-white">
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon icon="magnifying-glass" className="h-4 w-4" />
                  Tim
                </span>
              </button>
            </form>
          </div>

          {featuredProducts.length ? (
            <section className="py-8">
              <h3 className="text-xl font-black">Hang noi bat</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} categoryNames={categoryNames} subcategoryNames={subcategoryNames} brandNames={brandNames} featured />
                ))}
              </div>
            </section>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} categoryNames={categoryNames} subcategoryNames={subcategoryNames} brandNames={brandNames} />
            ))}
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-[#15120d] px-4 py-14 text-white md:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_0.6fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#d6ff3f]">Tu van mua hang</p>
            <h2 className="mt-3 text-4xl font-black">Can chon dung san pham?</h2>
          </div>
          <div className="space-y-3 text-white/70">
            <p>Hotline: {siteConfig.hotline}</p>
            <p>Dat lich hoc / tu van: {siteConfig.bookingPhone}</p>
            <p>99 Billiards Club</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ProductCard({
  product,
  categoryNames,
  subcategoryNames,
  brandNames,
  featured = false,
}: {
  product: Product;
  categoryNames: Map<string, string>;
  subcategoryNames: Map<string, string>;
  brandNames: Map<string, string>;
  featured?: boolean;
}) {
  const category = categoryNames.get(product.categoryId || "") || product.category;
  const subcategory = subcategoryNames.get(product.subcategoryId || "") || "";
  const brand = brandNames.get(product.brandId || "") || product.brand || "";
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block overflow-hidden border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e0d2]">
        {product.image ? <Image src={product.image} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" /> : null}
        <div className="absolute left-3 top-3 flex gap-2">
          {featured ? <span className="bg-[#d6ff3f] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-black">Noi bat</span> : null}
          {discount ? <span className="bg-red-600 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-white">-{discount}%</span> : null}
        </div>
      </div>
      <div className="p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#00684a]">{category}</p>
        <h3 className="mt-2 min-h-[3.5rem] text-xl font-black leading-tight">{product.name}</h3>
        {brand || subcategory ? <p className="mt-1 text-sm font-bold text-black/48">{[brand, subcategory].filter(Boolean).join(" / ")}</p> : null}
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-black text-[#0c3b2d]">{formatCurrency(product.price)}</p>
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <p className="text-sm font-bold text-black/40 line-through">{formatCurrency(product.compareAtPrice)}</p>
            ) : null}
          </div>
          <span className="border border-black/10 px-3 py-2 text-xs font-black uppercase tracking-[0.1em] text-black/55">
            {product.stockStatus === "out-of-stock" ? "Het hang" : product.stockStatus === "preorder" ? "Dat truoc" : "Con hang"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="border border-white/10 bg-white/8 p-3">
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/48">{label}</p>
    </div>
  );
}

function FilterLink({ label, param, value, active }: { label: string; param: string; value: string; active: boolean }) {
  const href = value ? `/products?${param}=${encodeURIComponent(value)}` : "/products";
  return (
    <Link
      href={href}
      className={`block border px-3 py-2 text-sm font-bold transition ${
        active ? "border-[#00684a] bg-[#00684a] text-white" : "border-black/10 bg-[#f7f4ec] text-black/68 hover:border-[#00684a]"
      }`}
    >
      {label}
    </Link>
  );
}

function FilterChip({ label, param, value, active }: { label: string; param: string; value: string; active: boolean }) {
  return (
    <Link
      href={`/products?${param}=${encodeURIComponent(value)}`}
      className={`border px-3 py-2 text-xs font-black uppercase tracking-[0.1em] ${
        active ? "border-[#00684a] bg-[#00684a] text-white" : "border-black/10 bg-white text-black/62"
      }`}
    >
      {label}
    </Link>
  );
}

function paramValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
