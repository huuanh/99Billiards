import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBranchById, getBranches, getPromotions } from "@99billiards/db";
import type { Branch, Promotion } from "@99billiards/db/seed";
import { BookingModal } from "@/components/booking-modal";
import { MobileStickyActions } from "@/components/mobile-sticky-actions";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const branch = (await getBranchById(id)) as Branch | null;
  if (!branch) return {};

  return {
    title: branch.seoTitle || `${branch.name} - Đặt bàn 99 Billiards`,
    description: branch.seoDescription || branch.description,
    openGraph: {
      title: branch.seoTitle || branch.name,
      description: branch.seoDescription || branch.description,
      images: [branch.image],
    },
  };
}

export default async function BranchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [branch, branchesRaw, promotionsRaw] = await Promise.all([
    getBranchById(id),
    getBranches(),
    getPromotions(),
  ]);

  if (!branch) notFound();

  const branches = branchesRaw as Branch[];
  const promotions = promotionsRaw as Promotion[];
  const galleryImages: string[] = branch.gallery?.length ? branch.gallery : [branch.image];
  const amenities: string[] = branch.amenities || [];

  return (
    <main className="min-h-screen bg-[#050705] pb-20 text-[#f5f1e8] md:pb-0">
      <PublicHeader active="branches" />
      <section className="relative min-h-[78vh] px-4 py-28 md:px-6">
        <Image src={branch.image} alt={branch.name} fill priority className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#050705]/65 to-[#050705]" />
        <div className="relative mx-auto max-w-7xl">
          <Link href="/#branches" className="text-sm font-black uppercase tracking-[0.2em] text-[#d6ff3f]">
            ← Hệ thống cơ sở
          </Link>
          <p className="mt-12 text-xs font-black uppercase tracking-[0.35em] text-[#d6ff3f]">
            {branch.code} · {branch.district}
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black md:text-8xl">{branch.name}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">{branch.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`tel:${branch.phone.replaceAll(" ", "")}`} className="rounded-full bg-[#d6ff3f] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-black">
              Gọi đặt bàn
            </a>
            <a href="#booking" className="rounded-full border border-white/20 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white">
              Mở form đặt bàn
            </a>
            {branch.mapUrl ? (
              <a href={branch.mapUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white">
                Chỉ đường
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 md:grid-cols-3 md:px-6">
        {[
          ["Địa chỉ", branch.address],
          ["Giờ mở cửa", branch.hours],
          ["Hotline", branch.phone],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d6ff3f]">{label}</p>
            <p className="mt-3 text-xl font-black">{value}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <h2 className="text-4xl font-black md:text-6xl">Gallery</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {galleryImages.map((image: string, index: number) => (
            <div key={`${image}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-white/10">
              <Image src={image} alt={branch.name} fill className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:grid-cols-[0.8fr_1.2fr] md:px-6">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-3xl font-black">Tiện ích</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {amenities.map((item: string) => (
              <span key={item} className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/78">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04]">
          {branch.mapEmbedUrl ? (
            <iframe src={branch.mapEmbedUrl} title={`Bản đồ ${branch.name}`} className="h-[420px] w-full" loading="lazy" />
          ) : (
            <div className="grid h-[420px] place-items-center text-white/60">Chưa có bản đồ.</div>
          )}
        </div>
      </section>

      <PublicFooter
        kicker="Đặt bàn 99"
        title="Sẵn sàng cho ván kế tiếp?"
        body={`Liên hệ ${branch.name} để giữ bàn, hỏi lịch trống và nhận tư vấn ưu đãi phù hợp.`}
      />

      <div id="booking" />
      <BookingModal branches={branches} promotions={promotions} defaultBranchId={branch.id} />
      <MobileStickyActions branch={branch} />
    </main>
  );
}
