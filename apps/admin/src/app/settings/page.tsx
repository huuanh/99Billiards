import { getSiteSettings } from "@99billiards/db";
import { updateSiteSettings } from "../actions";
import { AdminShell, Input, Panel, SaveButton, Textarea } from "@/components/admin-shell";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <AdminShell
      title="Settings"
      subtitle="Quản lý ảnh homepage, SEO mặc định và tracking pixels cho landing."
    >
      <Panel title="SEO & Tracking" subtitle="Các ID tracking có thể để trống khi chưa chạy ads.">
        <form action={updateSiteSettings} className="grid max-w-3xl gap-4">
          <Input name="siteName" label="Tên website" defaultValue={settings.siteName} />
          <Input
            name="heroImage"
            label="Ảnh hero homepage"
            defaultValue={settings.heroImage}
          />
          <Input
            name="heroCardImage"
            label="Ảnh card hero homepage"
            defaultValue={settings.heroCardImage}
          />
          <Input name="gaId" label="Google Analytics ID" defaultValue={settings.gaId} />
          <Input name="metaPixelId" label="Meta Pixel ID" defaultValue={settings.metaPixelId} />
          <Input name="tiktokPixelId" label="TikTok Pixel ID" defaultValue={settings.tiktokPixelId} />
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
          <SaveButton label="Lưu settings" />
        </form>
      </Panel>
    </AdminShell>
  );
}
