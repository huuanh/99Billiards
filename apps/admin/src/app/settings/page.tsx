import { getSiteSettings } from "@99billiards/db";
import { updateSiteSettings } from "../actions";
import { AdminActionForm } from "@/components/admin-action-form";
import { AdminShell, Input, Panel, SaveButton, Textarea } from "@/components/admin-shell";
import { ImageUploadField } from "@/components/image-upload-field";
import { requirePermission } from "@/lib/auth";

const HOMEPAGE_DEFAULTS = {
  siteName: "99 Billiards Club",
  heroEyebrow: "Chuỗi billiards hiện đại tại Hà Nội",
  heroTitle: "Chơi là cuốn.\nLên cơ là tới.",
  heroTitleAccent: "",
  heroSubtitle:
    "99 Billiards gom trải nghiệm bàn chuẩn, cafe, đồ ăn, giải đấu và livestream kèo hot vào một hệ thống cơ sở luôn sáng đèn.",
  primaryCtaLabel: "Tìm cơ sở gần bạn",
  primaryCtaHref: "#branches",
  secondaryCtaLabel: "Đặt bàn ngay",
  secondaryCtaHref: "#booking",
  defaultSeoTitle: "99 Billiards - Chơi là cuốn",
  defaultSeoDescription:
    "Website chính thức của chuỗi 99 Billiards Club. Xem cơ sở, ưu đãi, sản phẩm và đặt bàn nhanh.",
} as const;

export default async function SettingsPage() {
  await requirePermission("settings");
  const settings = await getSiteSettings();

  return (
    <AdminShell
      title="Settings"
      subtitle="Quản lý ảnh homepage, SEO mặc định và tracking pixels cho landing."
    >
      <Panel title="Homepage & Tracking" subtitle="Chọn ảnh trong form, hệ thống upload khi bấm lưu.">
        <AdminActionForm action={updateSiteSettings} className="grid max-w-4xl gap-5">
          <section className="grid gap-4 rounded-lg border border-[#dfe3d8] bg-[#f8faf5] p-4">
            <Input
              name="siteName"
              label="Tên website"
              defaultValue={settings.siteName || HOMEPAGE_DEFAULTS.siteName}
            />
            <ImageUploadField name="heroImage" label="Ảnh hero homepage" defaultValue={settings.heroImage} />
          </section>

          <section className="grid gap-4 rounded-lg border border-[#dfe3d8] bg-[#f8faf5] p-4">
            <h3 className="text-base font-black">Hero homepage</h3>
            <p className="text-xs font-medium text-[#5b6258]">
              Để trống một ô và bấm lưu = dùng lại text mặc định gốc của site.
            </p>
            <Input
              name="heroEyebrow"
              label="Eyebrow"
              defaultValue={settings.heroEyebrow || HOMEPAGE_DEFAULTS.heroEyebrow}
            />
            <div>
              <Textarea
                name="heroTitle"
                label="Tiêu đề hero"
                defaultValue={settings.heroTitle || HOMEPAGE_DEFAULTS.heroTitle}
              />
              <p className="mt-1.5 text-xs font-medium text-[#5b6258]">
                Nhấn Enter hoặc gõ <code className="rounded bg-[#eef2e6] px-1 py-0.5 text-[11px] text-[#2EB958]">\n</code> để xuống dòng. VD: <span className="font-bold">Chơi là cuốn.\nLên cơ là tới.</span>
              </p>
            </div>
            <div>
              <Input
                name="heroTitleAccent"
                label="Từ khóa nhấn mạnh (xuống dòng + tô xanh)"
                placeholder="VD: Lên cơ là tới."
                defaultValue={settings.heroTitleAccent || HOMEPAGE_DEFAULTS.heroTitleAccent}
              />
              <p className="mt-1.5 text-xs font-medium text-[#5b6258]">
                Cụm này sẽ tự xuống dòng và tô màu xanh. Nếu đã có trong tiêu đề thì chỉ tô màu; nếu chưa thì nối thêm vào dòng kế tiếp.
              </p>
            </div>
            <Textarea
              name="heroSubtitle"
              label="Mô tả hero"
              defaultValue={settings.heroSubtitle || HOMEPAGE_DEFAULTS.heroSubtitle}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                name="primaryCtaLabel"
                label="CTA chính"
                defaultValue={settings.primaryCtaLabel || HOMEPAGE_DEFAULTS.primaryCtaLabel}
              />
              <Input
                name="primaryCtaHref"
                label="Link CTA chính"
                defaultValue={settings.primaryCtaHref || HOMEPAGE_DEFAULTS.primaryCtaHref}
              />
              <Input
                name="secondaryCtaLabel"
                label="CTA phụ"
                defaultValue={settings.secondaryCtaLabel || HOMEPAGE_DEFAULTS.secondaryCtaLabel}
              />
              <Input
                name="secondaryCtaHref"
                label="Link CTA phụ"
                defaultValue={settings.secondaryCtaHref || HOMEPAGE_DEFAULTS.secondaryCtaHref}
              />
            </div>
          </section>

          <section className="grid gap-4 rounded-lg border border-[#dfe3d8] bg-[#f8faf5] p-4 md:grid-cols-3">
            <Input name="gaId" label="Google Analytics ID" defaultValue={settings.gaId} />
            <Input name="metaPixelId" label="Meta Pixel ID" defaultValue={settings.metaPixelId} />
            <Input name="tiktokPixelId" label="TikTok Pixel ID" defaultValue={settings.tiktokPixelId} />
          </section>

          <section className="grid gap-4 rounded-lg border border-[#dfe3d8] bg-[#f8faf5] p-4">
            <Input
              name="defaultSeoTitle"
              label="SEO title mặc định"
              defaultValue={settings.defaultSeoTitle || HOMEPAGE_DEFAULTS.defaultSeoTitle}
            />
            <Textarea
              name="defaultSeoDescription"
              label="SEO description mặc định"
              defaultValue={settings.defaultSeoDescription || HOMEPAGE_DEFAULTS.defaultSeoDescription}
            />
          </section>

          <div className="flex justify-end">
            <SaveButton label="Lưu settings" />
          </div>
        </AdminActionForm>
      </Panel>
    </AdminShell>
  );
}
