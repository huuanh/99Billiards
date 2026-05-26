import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductById,
  getProductBrands,
  getProductCategories,
  getProducts,
} from "@99billiards/db";
import type { Product, ProductBrand, ProductCategory } from "@99billiards/db/seed";
import { siteConfig } from "@99billiards/config";
import { FontAwesomeIcon, formatCurrency } from "@99billiards/ui";
import { ProductGallerySlider } from "@/components/product-gallery-slider";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { CartLink } from "@/components/cart-link";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = (await getProductById(id)) as Product | null;
  if (!product) return {};

  return {
    title: `${product.name} - 99 Billiards`,
    description: product.description || `${product.name} tai 99 Billiards.`,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, products, categories, brands] = await Promise.all([
    getProductById(id) as Promise<Product | null>,
    getProducts() as Promise<Product[]>,
    getProductCategories() as Promise<ProductCategory[]>,
    getProductBrands() as Promise<ProductBrand[]>,
  ]);

  if (!product) notFound();

  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const brandById = new Map(brands.map((brand) => [brand.id, brand]));
  const category = categoryNames.get(product.categoryId || "") || product.category;
  const brandRecord = brandById.get(product.brandId || "");
  const brand = brandRecord?.name || product.brand || "";
  const gallery = uniqueUrls([product.image, ...(product.gallery || [])]);
  const stockLabel =
    product.stockStatus === "out-of-stock" ? "Het hang" : product.stockStatus === "preorder" ? "Dat truoc" : "Con hang";
  const relatedProducts = products
    .filter((item) => item.id !== product.id && (item.categoryId === product.categoryId || item.brandId === product.brandId))
    .slice(0, 4);

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
            <CartLink />
          </nav>
          <a href={`tel:${siteConfig.hotline.replaceAll(" ", "")}`} className="focus-ring rounded-full bg-[#00684a] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white">
            {siteConfig.hotline}
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <nav className="flex flex-wrap gap-2 text-sm font-bold text-black/55">
          <Link href="/" className="hover:text-[#00684a]">Trang chu</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#00684a]">San pham</Link>
          {category ? (
            <>
              <span>/</span>
              <Link href={`/products?category=${encodeURIComponent(product.categoryId || product.category)}`} className="hover:text-[#00684a]">
                {category}
              </Link>
            </>
          ) : null}
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </nav>
        <h1 className="mt-7 text-4xl font-black leading-tight md:text-6xl lg:text-7xl">{product.name}</h1>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 md:px-6 lg:grid-cols-[0.96fr_1.04fr]">
        <ProductGallerySlider images={gallery} productName={product.name} />

        <div>
          <div className="flex flex-wrap items-end gap-4">
            <p className="text-4xl font-black leading-tight text-[#0c3b2d] md:text-6xl">{formatCurrency(product.price)}</p>
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <p className="pb-2 text-lg font-bold text-black/38 line-through">{formatCurrency(product.compareAtPrice)}</p>
            ) : null}
          </div>
          <div className="mt-5 grid gap-2 border-y border-black/10 py-4 text-sm font-bold text-black/62 sm:grid-cols-2">
            <p>Thuong hieu: <span className="text-black">{brand || "-"}</span></p>
            <p>Tinh trang: <span className="text-black">{stockLabel}</span></p>
          </div>

          {product.specs?.length ? (
            <ul className="mt-6 grid gap-3 border border-black/10 bg-white p-5 text-sm font-bold text-black/72">
              {product.specs.map((spec) => (
                <li key={spec} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00684a]" />
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-7">
            <AddToCartButton
              product={{
                productId: product.id,
                name: product.name,
                image: product.image,
                price: product.price,
              }}
            />
          </div>

          <div className="mt-7 grid gap-3 border border-[#00684a]/20 bg-[#00684a] p-5 text-sm font-bold text-white md:grid-cols-2">
            <p className="inline-flex items-center gap-2"><FontAwesomeIcon icon="truck-fast" className="h-4 w-4" />Van chuyen hoa toc trong Ha Noi</p>
            <p className="inline-flex items-center gap-2"><FontAwesomeIcon icon="shield-halved" className="h-4 w-4" />Ho tro bao duong ve sinh mien phi</p>
            <p className="inline-flex items-center gap-2"><FontAwesomeIcon icon="gift" className="h-4 w-4" />Qua tang hap dan cho don hang</p>
            <p className="inline-flex items-center gap-2"><FontAwesomeIcon icon="shield-halved" className="h-4 w-4" />Bao mat thong tin khach hang</p>
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:px-6 lg:grid-cols-[1fr_0.42fr]">
          <article>
            <h2 className="text-3xl font-black">Mo ta san pham</h2>
            <ProductDetailContent product={product} />
          </article>
          <aside className="border border-black/10 bg-[#f7f4ec] p-5">
            <h3 className="text-xl font-black">Chinh sach bao hanh</h3>
            <WarrantyPolicy content={product.warrantyPolicy} />
          </aside>
        </div>
      </section>

      {relatedProducts.length ? (
        <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <h2 className="text-3xl font-black">San pham lien quan</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <Link key={item.id} href={`/products/${item.id}`} className="group overflow-hidden border border-black/10 bg-white shadow-sm">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={item.image} alt={item.name} fill className="object-cover transition group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#00684a]">
                    {categoryNames.get(item.categoryId || "") || item.category}
                  </p>
                  <h3 className="mt-2 min-h-12 font-black leading-tight">{item.name}</h3>
                  <p className="mt-3 text-lg font-black text-[#0c3b2d]">{formatCurrency(item.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function uniqueUrls(urls: Array<string | undefined>) {
  return Array.from(new Set(urls.map((url) => String(url || "").trim()).filter(Boolean)));
}

interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: TiptapMark[];
}

function isTiptapNode(value: unknown): value is TiptapNode {
  return Boolean(value && typeof value === "object" && typeof (value as TiptapNode).type === "string");
}

function ProductDetailContent({ product }: { product: Product }) {
  if (product.detailContentFormat === "tiptap" && isTiptapNode(product.detailContentJson)) {
    return <div className="mt-5">{renderChildren(product.detailContentJson.content, "product-detail")}</div>;
  }

  const content = product.detailContentText || product.detailContent || product.description || "";
  if (!content) {
    return <p className="mt-5 text-base leading-8 text-black/68">San pham duoc 99 Billiards tu van va phan phoi cho nguoi choi billiards.</p>;
  }

  return (
    <div className="mt-5 space-y-4 text-base leading-8 text-black/68">
      {content.split(/\n+/).map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

function WarrantyPolicy({ content }: { content?: string }) {
  const items = (content || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!items.length) {
    return (
      <p className="mt-4 text-sm font-bold leading-6 text-black/55">
        Chua cap nhat chinh sach bao hanh cho san pham nay.
      </p>
    );
  }

  return (
    <ul className="mt-4 grid gap-3 text-sm font-bold leading-6 text-black/62">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function renderChildren(nodes: TiptapNode[] | undefined, keyPrefix: string): ReactNode {
  return nodes?.map((node, index) => renderNode(node, `${keyPrefix}-${index}`)) || null;
}

function applyMarks(content: ReactNode, marks: TiptapMark[] | undefined, key: string): ReactNode {
  return (marks || []).reduce((current, mark, index) => {
    if (mark.type === "bold") return <strong key={`${key}-mark-${index}`}>{current}</strong>;
    if (mark.type === "italic") return <em key={`${key}-mark-${index}`}>{current}</em>;
    if (mark.type === "underline") return <u key={`${key}-mark-${index}`}>{current}</u>;
    if (mark.type === "strike") return <s key={`${key}-mark-${index}`}>{current}</s>;
    if (mark.type === "code") {
      return (
        <code key={`${key}-mark-${index}`} className="rounded bg-black/5 px-1.5 py-0.5 text-sm text-[#00684a]">
          {current}
        </code>
      );
    }
    if (mark.type === "link") {
      const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "#";
      return (
        <a key={`${key}-mark-${index}`} href={href} className="font-bold text-[#00684a] underline underline-offset-4" rel="noreferrer" target={href.startsWith("http") ? "_blank" : undefined}>
          {current}
        </a>
      );
    }
    return current;
  }, content);
}

function renderNode(node: TiptapNode, key: string): ReactNode {
  if (node.type === "text") return applyMarks(node.text || "", node.marks, key);
  if (node.type === "hardBreak") return <br key={key} />;

  if (node.type === "paragraph") {
    return (
      <p key={key} className="my-5 text-base leading-8 text-black/68">
        {renderChildren(node.content, key)}
      </p>
    );
  }

  if (node.type === "heading") {
    const level = node.attrs?.level === 3 ? 3 : 2;
    if (level === 3) {
      return (
        <h3 key={key} className="mb-3 mt-8 text-2xl font-black text-black">
          {renderChildren(node.content, key)}
        </h3>
      );
    }
    return (
      <h2 key={key} className="mb-4 mt-10 text-3xl font-black text-black">
        {renderChildren(node.content, key)}
      </h2>
    );
  }

  if (node.type === "bulletList") {
    return (
      <ul key={key} className="my-6 list-disc space-y-2 pl-6 text-base leading-8 text-black/68">
        {renderChildren(node.content, key)}
      </ul>
    );
  }

  if (node.type === "orderedList") {
    return (
      <ol key={key} className="my-6 list-decimal space-y-2 pl-6 text-base leading-8 text-black/68">
        {renderChildren(node.content, key)}
      </ol>
    );
  }

  if (node.type === "listItem") return <li key={key}>{renderChildren(node.content, key)}</li>;

  if (node.type === "blockquote") {
    return (
      <blockquote key={key} className="my-8 border-l-4 border-[#00684a] bg-[#f7f4ec] px-5 py-4 text-lg font-bold leading-8 text-black">
        {renderChildren(node.content, key)}
      </blockquote>
    );
  }

  if (node.type === "horizontalRule") return <hr key={key} className="my-10 border-black/10" />;

  if (node.type === "image") {
    const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
    const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
    const caption =
      typeof node.attrs?.caption === "string"
        ? node.attrs.caption
        : typeof node.attrs?.title === "string"
          ? node.attrs.title
          : "";
    if (!src) return null;

    return (
      <figure key={key} className="my-8 overflow-hidden border border-black/10 bg-[#f7f4ec]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full object-cover" />
        {caption ? <figcaption className="border-t border-black/10 px-4 py-3 text-sm font-bold text-black/55">{caption}</figcaption> : null}
      </figure>
    );
  }

  return <div key={key}>{renderChildren(node.content, key)}</div>;
}
