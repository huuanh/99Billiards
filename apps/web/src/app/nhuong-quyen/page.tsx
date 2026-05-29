import type { Metadata } from "next";
import { getBranches, getPromotions } from "@99billiards/db";
import type { Branch, Promotion } from "@99billiards/db/seed";
import { siteConfig } from "@99billiards/config";
import { BookingModal } from "@/components/booking-modal";
import { FranchiseForm } from "@/components/franchise-form";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";

export const metadata: Metadata = {
  title: "Nhượng quyền | 99 Billiards",
  description:
    "Hợp tác nhượng quyền cùng 99 Billiards – chuỗi billiards hiện đại. Mô hình đã kiểm chứng, hỗ trợ vận hành trọn gói, lợi nhuận bền vững. Đăng ký nhận tư vấn ngay.",
};

const STATS = [
  { value: "10+", label: "cơ sở đang vận hành" },
  { value: "10", label: "năm kinh nghiệm" },
  { value: "1M+", label: "lượt khách mỗi năm" },
  { value: "98%", label: "đối tác hài lòng" },
];

const BENEFITS = [
  {
    title: "Thương hiệu đã định hình",
    desc: "Kế thừa độ nhận diện và uy tín của 99 Billiards trên thị trường, rút ngắn thời gian xây dựng tệp khách.",
  },
  {
    title: "Lợi nhuận hấp dẫn",
    desc: "Mô hình kinh doanh đã được kiểm chứng với tỷ suất lợi nhuận ổn định và thời gian hoàn vốn nhanh.",
  },
  {
    title: "Vận hành chuẩn hóa",
    desc: "Chuyển giao trọn bộ quy trình vận hành, phần mềm quản lý và tài liệu hướng dẫn chi tiết.",
  },
  {
    title: "Hỗ trợ toàn diện",
    desc: "Đồng hành từ khảo sát mặt bằng, thiết kế thi công, đào tạo nhân sự tới marketing khai trương.",
  },
  {
    title: "Bảo vệ khu vực",
    desc: "Cam kết độc quyền khu vực kinh doanh, tránh cạnh tranh nội bộ giữa các đối tác trong hệ thống.",
  },
  {
    title: "Tăng trưởng bền vững",
    desc: "Liên tục cải tiến sản phẩm, dịch vụ và chiến lược marketing giúp đối tác phát triển dài hạn.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Đăng ký tư vấn",
    desc: "Để lại thông tin, đội ngũ chuyên gia liên hệ tư vấn về mô hình và chính sách nhượng quyền.",
  },
  {
    step: "02",
    title: "Khảo sát & ký kết",
    desc: "Cùng khảo sát mặt bằng, đánh giá tiềm năng và tiến hành ký hợp đồng hợp tác.",
  },
  {
    step: "03",
    title: "Setup & đào tạo",
    desc: "Triển khai thi công, lắp đặt thiết bị và đào tạo đội ngũ vận hành theo tiêu chuẩn.",
  },
  {
    step: "04",
    title: "Khai trương & vận hành",
    desc: "Hỗ trợ marketing khai trương và đồng hành vận hành để tối ưu hiệu quả kinh doanh.",
  },
];

export default async function FranchisePage() {
  const [branchesRaw, promotionsRaw] = await Promise.all([
    getBranches(),
    getPromotions(),
  ]);
  const branches = branchesRaw as Branch[];
  const promotions = promotionsRaw as Promotion[];

  return (
    <main className="min-h-screen overflow-x-clip bg-[#050705] text-[#f5f1e8]">
      <PublicHeader active="franchise" />

      {/* Hero */}
      <section className="felt-grid relative">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-32 md:px-6 md:pt-36 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.42em] text-[#2EB958]">
              Cơ hội hợp tác · Franchise
            </p>
            <h1 className="neon-text mt-5 max-w-3xl text-4xl font-black leading-[1.08] sm:text-5xl md:text-6xl">
              Nhượng quyền 99 Billiards
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72">
              Trở thành đối tác của chuỗi billiards hiện đại. Cùng chúng tôi kiến
              tạo không gian giải trí đẳng cấp và xây dựng nguồn thu nhập bền
              vững trên một mô hình đã được kiểm chứng.
            </p>

            <div className="mt-10 grid max-w-2xl grid-cols-2 border-y border-white/12 bg-black/25 text-center backdrop-blur-sm sm:grid-cols-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="border-r border-white/10 px-3 py-4 last:border-r-0"
                >
                  <p className="text-2xl font-black text-white md:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[11px] font-black uppercase tracking-[0.14em] text-white/48">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div id="dang-ky" className="scroll-mt-32">
            <FranchiseForm />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#07110b] px-4 py-20 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[#2EB958]">
            Vì sao chọn chúng tôi
          </p>
          <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-5xl">
            Lợi ích khi nhượng quyền 99 Billiards
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-3xl border border-white/10 bg-black/30 p-7 transition hover:border-[#2EB958]/50"
              >
                <h3 className="text-xl font-black leading-tight text-white">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-sm font-bold leading-6 text-white/62">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="felt-grid px-4 py-20 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[#2EB958]">
            Quy trình hợp tác
          </p>
          <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-5xl">
            4 bước trở thành đối tác
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((item) => (
              <div
                key={item.step}
                className="rounded-3xl border border-white/10 bg-black/30 p-7"
              >
                <span className="text-4xl font-black text-[#2EB958]/70">
                  {item.step}
                </span>
                <h3 className="mt-4 text-xl font-black leading-tight text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm font-bold leading-6 text-white/62">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 md:px-6">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-[#2EB958]/30 bg-gradient-to-br from-[#0c1f14] to-[#050705] px-6 py-14 text-center md:px-12">
          <h2 className="mx-auto max-w-3xl text-3xl font-black leading-tight md:text-5xl">
            Sẵn sàng đầu tư cùng 99 Billiards?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base font-bold leading-7 text-white/62">
            Để lại thông tin ngay hôm nay để nhận tư vấn miễn phí và bộ hồ sơ
            nhượng quyền chi tiết từ đội ngũ chuyên gia của chúng tôi.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#dang-ky"
              className="focus-ring rounded-full bg-[#2EB958] px-7 py-3.5 text-sm font-black uppercase tracking-[0.16em] text-[#071107] hover:bg-white"
            >
              Đăng ký tư vấn
            </a>
            <a
              href={`tel:${siteConfig.hotline.replaceAll(" ", "")}`}
              className="focus-ring rounded-full border border-white/15 px-7 py-3.5 text-sm font-black uppercase tracking-[0.16em] text-white/80 hover:border-[#2EB958] hover:text-[#2EB958]"
            >
              Gọi {siteConfig.hotline}
            </a>
          </div>
        </div>
      </section>

      <div id="booking" />
      <BookingModal branches={branches} promotions={promotions} />
      <PublicFooter />
    </main>
  );
}
