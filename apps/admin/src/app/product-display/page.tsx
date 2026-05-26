import { getProductPageSettings } from "@99billiards/db";
import type { ProductPageSettings } from "@99billiards/db/seed";
import { AdminActionForm } from "@/components/admin-action-form";
import { AdminShell, Input, Panel, SaveButton, Textarea } from "@/components/admin-shell";
import { ImageUploadField } from "@/components/image-upload-field";
import { updateProductPageSettings } from "../actions";
import { requirePermission } from "@/lib/auth";

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
              <Input name="heroEyebrow" label="Eyebrow" defaultValue={settings.heroEyebrow} />
              <Input name="heroTitle" label="Tieu de hero" defaultValue={settings.heroTitle} />
              <div className="md:col-span-2">
                <Textarea name="heroSubtitle" label="Mô tả hero" defaultValue={settings.heroSubtitle} />
              </div>
              <Input name="primaryCtaLabel" label="CTA chính" defaultValue={settings.primaryCtaLabel} />
              <Input name="primaryCtaHref" label="Link CTA chính" defaultValue={settings.primaryCtaHref} />
              <Input name="secondaryCtaLabel" label="CTA phu" defaultValue={settings.secondaryCtaLabel} />
              <Input name="secondaryCtaHref" label="Link CTA phu" defaultValue={settings.secondaryCtaHref} />
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
