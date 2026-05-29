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
import { FontAwesomeIcon, formatCurrency } from "@99billiards/ui";
import { HeroTitle } from "@/components/hero-title";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

const priceRanges = [
  { label: "Dưới 2 triệu", min: 0, max: 2_000_000 },
  { label: "2 - 4 triệu", min: 2_000_000, max: 4_000_000 },
  { label: "4 - 7 triệu", min: 4_000_000, max: 7_000_000 },
  { label: "7 - 13 triệu", min: 7_000_000, max: 13_000_000 },
  { label: "Trên 13 triệu", min: 13_000_000, max: Number.POSITIVE_INFINITY },
];

export async function generateMetadata(): Promise<Metadata> {
  const settings = (await getProductPageSettings()) as ProductPageSettings;

  return {
    title: settings.seoTitle || settings.heroTitle || "Sản phẩm 99 Billiards",
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

  const heroImage = settings.heroImage || "/cover.png";

  const activeCategoryRecord = categories.find((category) => category.id === selectedCategory);
  const activeSubcategoryRecord = subcategories.find((subcategory) => subcategory.id === selectedSubcategory);
  const activeBrandRecord = brands.find((brand) => brand.id === selectedBrand);
  const activePriceRange = priceRanges.find((range) => slugify(range.label) === selectedPrice);

  let pageTitle = "Tất cả sản phẩm";
  if (query) {
    pageTitle = `Kết quả tìm "${query}"`;
  } else if (activeSubcategoryRecord) {
    pageTitle = activeSubcategoryRecord.name;
  } else if (activeCategoryRecord) {
    pageTitle = activeCategoryRecord.name;
  } else if (activeBrandRecord) {
    pageTitle = activeBrandRecord.name;
  } else if (activePriceRange) {
    pageTitle = activePriceRange.label;
  }

  const eyebrowParts: string[] = ["Catalog"];
  if (activeCategoryRecord && activeSubcategoryRecord) {
    eyebrowParts.push(activeCategoryRecord.name);
  }
  if (activeBrandRecord && (activeCategoryRecord || activeSubcategoryRecord)) {
    eyebrowParts.push(activeBrandRecord.name);
  }
  const eyebrowLabel = eyebrowParts.join(" / ");

  return (
    <main className="min-h-screen bg-[#f7f4ec] text-[#15120d]">
      <PublicHeader active="products" />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src={heroImage} alt="" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/86 via-black/58 to-black/14" />
        </div>
        <div className="relative mx-auto flex min-h-[76vh] max-w-7xl items-end px-4 pb-12 pt-28 md:px-6">
          <div className="max-w-4xl text-white">
            <p className="text-xs font-black uppercase tracking-[0.34em] text-[#2EB958]">
              {settings.heroEyebrow || "99 Billiards Store"}
            </p>
            <h1 className="mt-5 text-5xl font-black uppercase leading-[1.15] md:text-7xl lg:text-8xl">
              {settings.heroTitle ? (
                <HeroTitle title={settings.heroTitle} accent={settings.heroTitleAccent} />
              ) : (
                <>
                  Đẳng cấp
                  <br />
                  trong từng
                  <br />
                  <span className="text-[#2EB958]">cú đánh</span>
                </>
              )}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
              {settings.heroSubtitle ||
                "Khám phá bộ sưu tập gậy billiards chính hãng từ các thương hiệu hàng đầu thế giới."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={settings.primaryCtaHref || "#catalog"} className="focus-ring rounded-full bg-[#2EB958] px-7 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-black">
                {settings.primaryCtaLabel || "Xem sản phẩm"}
              </Link>
              <Link href={settings.secondaryCtaHref || "#contact"} className="focus-ring rounded-full border border-white/25 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-white">
                {settings.secondaryCtaLabel || "Liên hệ tư vấn"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-[#15120d] px-4 py-3 text-white md:px-6 md:py-5">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-2.5 md:grid-cols-4 md:gap-3">
          {[
            { icon: "truck-fast", label: "Hỏa tốc Hà Nội" },
            { icon: "shield-halved", label: "Bảo dưỡng cơ miễn phí" },
            { icon: "gift", label: "Quà tặng đơn hàng" },
            { icon: "phone", label: "Tư vấn theo trình độ" },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-2 text-xs font-semibold text-white/85 md:text-sm md:font-bold"
            >
              <FontAwesomeIcon
                icon={icon as "truck-fast" | "shield-halved" | "gift" | "phone"}
                className="h-3.5 w-3.5 shrink-0 text-[#2EB958] md:h-4 md:w-4"
              />
              {label}
            </span>
          ))}
        </div>
      </section>

      <nav
        aria-label="Danh mục sản phẩm"
        // Sticky bar — ở yên tại vị trí natural cho tới khi scroll past 104px thì
        // dính dưới header. Bỏ backdrop-blur vì backdrop-filter trên element
        // position:sticky sẽ phá sticky behavior trên iOS Safari.
        // z-index nằm DƯỚI header (header z-[1100]) nhưng TRÊN content thường.
        style={{ position: "sticky", top: 104 }}
        className="z-[1090] border-b border-black/10 bg-[#f7f4ec] shadow-sm"
      >
        <div
          // touchAction: pan-x → chỉ cho phép vuốt ngang (scroll tabs).
          // Vuốt dọc trong nav bị block, không trigger page scroll dọc gây glitch.
          style={{ touchAction: "pan-x" }}
          className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto overscroll-x-contain px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:justify-between md:overflow-x-visible md:px-6"
        >
          <Link
            href="/products"
            className={`focus-ring shrink-0 rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.12em] whitespace-nowrap transition ${
              selectedBrand || selectedCategory || selectedSubcategory
                ? "text-black/72 hover:text-[#2EB958]"
                : "bg-[#2EB958] text-black"
            }`}
          >
            Tất cả
          </Link>
          {categories.map((category) => {
            const isActive = selectedCategory === category.id;
            const categorySubs = subcategories.filter((sub) => sub.categoryId === category.id);
            return (
              <div key={category.id} className="group relative shrink-0">
                <Link
                  href={`/products?category=${encodeURIComponent(category.id)}#catalog`}
                  className={`focus-ring flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-black uppercase tracking-[0.1em] whitespace-nowrap transition ${
                    isActive ? "text-[#2EB958]" : "text-black/72 hover:text-[#2EB958]"
                  }`}
                >
                  {category.name}
                  {categorySubs.length > 0 ? (
                    <FontAwesomeIcon icon="chevron-right" className="h-3 w-3 rotate-90 opacity-60" />
                  ) : null}
                </Link>
                {categorySubs.length > 0 ? (
                  <div className="invisible absolute left-0 top-full z-40 min-w-[240px] -translate-y-1 pt-1 opacity-0 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <div className="rounded-md border border-black/10 bg-white py-2 shadow-xl">
                      {categorySubs.map((sub) => {
                        const subActive = selectedSubcategory === sub.id;
                        return (
                          <Link
                            key={sub.id}
                            href={`/products?category=${encodeURIComponent(category.id)}&subcategory=${encodeURIComponent(sub.id)}#catalog`}
                            className={`block px-4 py-2 text-sm font-medium transition ${
                              subActive ? "bg-[#f7f4ec] text-[#2EB958]" : "text-black/72 hover:bg-[#f7f4ec] hover:text-[#2EB958]"
                            }`}
                          >
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </nav>

      <section id="catalog" className="mx-auto max-w-7xl scroll-mt-[160px] px-4 py-8 md:px-6 md:py-14">
        <div>
          <div className="flex flex-col gap-3 border-b border-black/10 pb-4 md:flex-row md:items-end md:justify-between md:gap-4 md:pb-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2EB958] md:text-xs">{eyebrowLabel}</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl md:mt-2 md:text-4xl">{pageTitle}</h2>
              <p className="mt-1 text-xs font-normal text-black/55 md:mt-2 md:text-sm">
                {filteredProducts.length} sản phẩm{filteredProducts.length !== productsRaw.length ? ` (lọc từ ${productsRaw.length})` : ""}
              </p>
            </div>
            <form
              action="/products"
              className="group relative w-full min-w-0 md:w-80"
            >
              <input
                name="q"
                defaultValue={query}
                placeholder="Tìm cơ, ngọn, phụ kiện..."
                className="min-h-10 w-full min-w-0 rounded-full border border-black/15 bg-white pl-4 pr-24 text-sm font-normal outline-none placeholder:text-black/40 focus:border-[#2EB958] md:min-h-11 md:pr-28"
              />
              <button
                type="submit"
                aria-label="Tìm kiếm"
                className="absolute inset-y-1 right-1 inline-flex items-center gap-1.5 rounded-full bg-[#2EB958] px-3 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:bg-[#27a04b] md:gap-2 md:px-4 md:text-sm"
              >
                <FontAwesomeIcon icon="magnifying-glass" className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Tìm
              </button>
            </form>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.length ? filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} categoryNames={categoryNames} subcategoryNames={subcategoryNames} brandNames={brandNames} />
            )) : (
              <div className="col-span-2 rounded-lg border border-dashed border-black/20 bg-white p-8 lg:col-span-3 xl:col-span-4">
                <p className="text-2xl font-bold">Không tìm thấy sản phẩm phù hợp</p>
                <p className="mt-3 max-w-xl text-sm font-normal leading-6 text-black/58">
                  Thử bỏ bớt bộ lọc hoặc tìm bằng từ khóa rộng hơn. Đội ngũ 99 Billiards vẫn có thể tư vấn theo ngân sách qua hotline.
                </p>
                <Link
                  href="/products"
                  className="focus-ring mt-6 inline-flex rounded-full bg-[#2EB958] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-black hover:bg-[#27a04b]"
                >
                  Xóa bộ lọc
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <PublicFooter
        kicker="Tư vấn mua hàng"
        title="Cần chọn đúng sản phẩm?"
        body="Gửi nhu cầu hoặc gọi hotline, đội ngũ 99 Billiards sẽ tư vấn sản phẩm phù hợp với ngân sách và trình độ chơi."
      />
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
  void subcategoryNames;
  void brandNames;
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-[#e8e0d2]">
        {product.image ? <Image src={product.image} alt={product.name} fill sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" /> : null}
        <div className="absolute left-3 top-3 flex gap-2">
          {featured ? <span className="rounded-full bg-[#2EB958] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-black shadow-sm">Nổi bật</span> : null}
          {discount ? <span className="rounded-full bg-red-600 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-white shadow-sm">-{discount}%</span> : null}
        </div>
      </div>
      <div className="p-2.5 sm:p-4">
        <p className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2EB958] sm:block">{category}</p>
        <h3 className="line-clamp-2 text-sm font-bold leading-tight tracking-tight text-black sm:mt-2 sm:min-h-[3rem] sm:text-lg sm:leading-snug">{product.name}</h3>
        <div className="mt-1.5 sm:mt-3">
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <p className="text-[11px] font-normal text-black/40 line-through sm:text-sm">{formatCurrency(product.compareAtPrice)}</p>
          ) : null}
          <p className="text-sm font-black tracking-tight text-[#2EB958] sm:text-2xl">{formatCurrency(product.price)}</p>
        </div>
      </div>
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

