import { getSiteSettings } from "@99billiards/db";
import { updateSiteSettings } from "../actions";
import { AdminActionForm } from "@/components/admin-action-form";
import { AdminShell, Input, Panel, SaveButton, Textarea } from "@/components/admin-shell";
import { ImageUploadField } from "@/components/image-upload-field";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <AdminShell
      title="Settings"
      subtitle="Quản lý ảnh homepage, SEO mặc định và tracking pixels cho landing."
    >
      <Panel title="Homepage & Tracking" subtitle="Upload ảnh trực tiếp, không cần nhập URL thủ công.">
        <AdminActionForm action={updateSiteSettings} className="grid max-w-4xl gap-5">
          <section className="grid gap-4 rounded-lg border border-[#dfe3d8] bg-[#f8faf5] p-4">
            <Input name="siteName" label="Tên website" defaultValue={settings.siteName} />
            <ImageUploadField name="heroImage" label="Ảnh hero homepage" defaultValue={settings.heroImage} />
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
              defaultValue={settings.defaultSeoTitle}
            />
            <Textarea
              name="defaultSeoDescription"
              label="SEO description mặc định"
              defaultValue={settings.defaultSeoDescription}
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
