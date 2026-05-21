import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBranches, getPromotionById, getPromotions } from "@99billiards/db";
import type { Branch, Promotion } from "@99billiards/db/seed";
import { BookingModal } from "@/components/booking-modal";
import { MobileStickyActions } from "@/components/mobile-sticky-actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const promotion = (await getPromotionById(id)) as Promotion | null;
  if (!promotion) return {};
  return {
    title: promotion.seoTitle || `${promotion.title} - 99 Billiards`,
    description: promotion.seoDescription || promotion.description,
    openGraph: { title: promotion.title, description: promotion.description, images: [promotion.image] },
  };
}

export default async function PromotionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [promotion, branchesRaw, promotionsRaw] = await Promise.all([
    getPromotionById(id),
    getBranches(),
    getPromotions(),
  ]);
  if (!promotion) notFound();

  const branches = branchesRaw as Branch[];
  const promotions = promotionsRaw as Promotion[];
  const appliedBranches = branches.filter((branch) => promotion.branchIds.includes(branch.id));

  return (
    <main className="min-h-screen bg-[#050705] pb-20 text-[#f5f1e8] md:pb-0">
      <article className="relative px-4 py-28 md:px-6">
        <Image src={promotion.image} alt={promotion.title} fill priority className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-[#050705]/75 to-[#050705]" />
        <div className="relative mx-auto max-w-4xl">
          <Link href="/#promotions" className="text-sm font-black uppercase tracking-[0.2em] text-[#d6ff3f]">
            ← Ưu đãi
          </Link>
          <span className="mt-12 inline-flex rounded-full bg-[#d6ff3f] px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-black">
            {promotion.badge}
          </span>
          <h1 className="mt-5 text-5xl font-black md:text-7xl">{promotion.title}</h1>
          <p className="mt-6 text-xl leading-9 text-white/72">{promotion.description}</p>
          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6 text-lg leading-8 text-white/78">
            {promotion.content}
          </div>
          <h2 className="mt-10 text-3xl font-black">Cơ sở áp dụng</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {appliedBranches.map((branch) => (
              <Link key={branch.id} href={`/co-so/${branch.id}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="font-black">{branch.name}</p>
                <p className="mt-1 text-sm text-white/60">{branch.address}</p>
              </Link>
            ))}
          </div>
        </div>
      </article>
      <div id="booking" />
      <BookingModal branches={branches} promotions={promotions} />
      <MobileStickyActions branch={branches[0]} />
    </main>
  );
}
