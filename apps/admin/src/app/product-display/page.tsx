import { getProductPageSettings } from "@99billiards/db";
import type { ProductPageSettings } from "@99billiards/db/seed";
import { AdminActionForm } from "@/components/admin-action-form";
import { AdminShell, Input, Panel, SaveButton, Textarea } from "@/components/admin-shell";
import { ImageUploadField } from "@/components/image-upload-field";
import { updateProductPageSettings } from "../actions";
import { requirePermission } from "@/lib/auth";

const PRODUCT_PAGE_DEFAULTS = {
  heroEyebrow: "99 Billiards Store",
  heroTitle: "Đẳng cấp\ntrong từng",
  heroTitleAccent: "cú đánh",
  heroSubtitle:
    "Khám phá bộ sưu tập gậy billiards chính hãng từ các thương hiệu hàng đầu thế giới.",
  primaryCtaLabel: "Xem sản phẩm",
  primaryCtaHref: "#catalog",
  secondaryCtaLabel: "Liên hệ tư vấn",
  secondaryCtaHref: "#contact",
} as const;

export default async function ProductDisplayPage() {
  await requirePermission("products");
  const settings = (await getProductPageSettings()) as ProductPageSettings;

  return (
    <AdminShell title="Hiển thị trang sản phẩm" subtitle="Quản trị hero, CTA và SEO cho /products.">
      <Panel title="Nội dung /products" subtitle="Ảnh hero và copy sẽ hiển thị trên trang catalog public.">
        <AdminActionForm action={updateProductPageSettings}>
          <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
            <h3 className="text-base font-black">Hero</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input
                name="heroEyebrow"
                label="Eyebrow"
                defaultValue={settings.heroEyebrow || PRODUCT_PAGE_DEFAULTS.heroEyebrow}
              />
              <div>
                <Textarea
                  name="heroTitle"
                  label="Tieu de hero"
                  defaultValue={settings.heroTitle || PRODUCT_PAGE_DEFAULTS.heroTitle}
                />
                <p className="mt-1.5 text-xs font-medium text-[#5b6258]">
                  Nhấn Enter hoặc gõ <code className="rounded bg-[#eef2e6] px-1 py-0.5 text-[11px] text-[#2EB958]">\n</code> để xuống dòng. VD: <span className="font-bold">Đẳng cấp\ntrong từng</span> hoặc nhập thẳng 2 dòng đều cho kết quả như nhau.
                </p>
              </div>
              <div>
                <Input
                  name="heroTitleAccent"
                  label="Từ khóa nhấn mạnh (xuống dòng + tô xanh)"
                  defaultValue={settings.heroTitleAccent || PRODUCT_PAGE_DEFAULTS.heroTitleAccent}
                />
                <p className="mt-1.5 text-xs font-medium text-[#5b6258]">
                  Cụm này sẽ tự xuống dòng và tô màu xanh. Nếu đã có trong tiêu đề thì chỉ tô màu; nếu chưa thì nối thêm vào dòng kế tiếp.
                </p>
              </div>
              <div className="md:col-span-2">
                <Textarea
                  name="heroSubtitle"
                  label="Mô tả hero"
                  defaultValue={settings.heroSubtitle || PRODUCT_PAGE_DEFAULTS.heroSubtitle}
                />
              </div>
              <Input
                name="primaryCtaLabel"
                label="CTA chính"
                defaultValue={settings.primaryCtaLabel || PRODUCT_PAGE_DEFAULTS.primaryCtaLabel}
              />
              <Input
                name="primaryCtaHref"
                label="Link CTA chính"
                defaultValue={settings.primaryCtaHref || PRODUCT_PAGE_DEFAULTS.primaryCtaHref}
              />
              <Input
                name="secondaryCtaLabel"
                label="CTA phu"
                defaultValue={settings.secondaryCtaLabel || PRODUCT_PAGE_DEFAULTS.secondaryCtaLabel}
              />
              <Input
                name="secondaryCtaHref"
                label="Link CTA phu"
                defaultValue={settings.secondaryCtaHref || PRODUCT_PAGE_DEFAULTS.secondaryCtaHref}
              />
              <div className="md:col-span-2">
                <ImageUploadField name="heroImage" label="Ảnh hero" defaultValue={settings.heroImage} />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
            <h3 className="text-base font-black">Khoi goi y</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input name="promoTitle" label="Tieu de khoi goi y" defaultValue={settings.promoTitle} />
              <div className="md:col-span-2">
                <Textarea name="promoText" label="Nội dung gợi ý" defaultValue={settings.promoText} />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
            <h3 className="text-base font-black">SEO</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input name="seoTitle" label="SEO title" defaultValue={settings.seoTitle} />
              <div className="md:col-span-2">
                <Textarea name="seoDescription" label="SEO description" defaultValue={settings.seoDescription} />
              </div>
            </div>
          </section>

          <div className="sticky bottom-0 flex justify-end border-t border-[#dfe3d8] bg-[#f6f7f3]/95 py-4 backdrop-blur">
            <SaveButton label="Lưu hiển thị" />
          </div>
        </AdminActionForm>
      </Panel>
    </AdminShell>
  );
}
