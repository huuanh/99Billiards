import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBranches, getPostById, getPromotions } from "@99billiards/db";
import type { Branch, Post, Promotion } from "@99billiards/db/seed";
import { ArticleContent } from "@/components/article-content";
import { BookingModal } from "@/components/booking-modal";
import { MobileStickyActions } from "@/components/mobile-sticky-actions";
import { PublicFooter } from "@/components/public-footer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = (await getPostById(id)) as Post | null;
  if (!post) return {};
  return {
    title: post.seoTitle || `${post.title} - 99 Billiards`,
    description: post.seoDescription || post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: [post.image] },
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [post, branchesRaw, promotionsRaw] = await Promise.all([
    getPostById(id),
    getBranches(),
    getPromotions(),
  ]);
  if (!post) notFound();

  const branches = branchesRaw as Branch[];
  const promotions = promotionsRaw as Promotion[];

  return (
    <main className="min-h-screen bg-[#050705] pb-20 text-[#f5f1e8] md:pb-0">
      <article className="mx-auto max-w-4xl px-4 py-28 md:px-6">
        <Link href="/#news" className="text-sm font-black uppercase tracking-[0.2em] text-[#d6ff3f]">
          ← Tin tức
        </Link>
        <p className="mt-12 text-xs font-black uppercase tracking-[0.25em] text-[#d6ff3f]">
          {post.category} · {post.publishedAt}
        </p>
        <h1 className="mt-4 text-5xl font-black md:text-7xl">{post.title}</h1>
        {post.contentFormat !== "tiptap" && post.image ? (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-white/10">
            <Image src={post.image} alt={post.title} fill priority className="object-cover" />
          </div>
        ) : null}
        <ArticleContent post={post} />
      </article>
      <PublicFooter
        kicker="Tin tuc 99"
        title="Theo doi lich dau va uu dai moi."
        body="Cap nhat tin tuc, keo dau, su kien va cac goi tu van moi nhat tu he thong 99 Billiards."
      />
      <div id="booking" />
      <BookingModal branches={branches} promotions={promotions} />
      <MobileStickyActions branch={branches[0]} />
    </main>
  );
}
