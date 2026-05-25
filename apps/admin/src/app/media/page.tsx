import { AdminShell, Panel } from "@/components/admin-shell";
import { MediaUploader } from "@/components/media-uploader";
import { getMediaAssets } from "@99billiards/db";
import { requirePermission } from "@/lib/auth";

interface MediaAssetRow {
  _id: string;
  filename?: string;
  url: string;
  contentType?: string;
  size?: number;
  createdAt?: string;
}

export default async function MediaPage() {
  await requirePermission("media");
  const assets = (await getMediaAssets()) as MediaAssetRow[];

  return (
    <AdminShell title="Media" subtitle="Upload ảnh lên Cloudflare R2 và lấy public URL.">
      <div className="grid gap-6 xl:grid-cols-[520px_1fr]">
        <Panel title="Upload ảnh" subtitle="Dùng cho ảnh cơ sở, sản phẩm, ưu đãi và tin tức.">
          <MediaUploader />
        </Panel>

        <Panel title="Dùng ảnh trong CMS" subtitle="Các form CMS hiện upload ảnh khi bấm lưu.">
          <div className="space-y-3 text-sm leading-6 text-black/70">
            <p><strong>Homepage:</strong> vào Settings, chọn ảnh hero và bấm lưu.</p>
            <p><strong>Cơ sở:</strong> chọn ảnh đại diện/gallery trong form rồi bấm lưu.</p>
            <p><strong>Sản phẩm / Ưu đãi / Tin tức:</strong> chọn ảnh trong form rồi bấm lưu.</p>
          </div>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Cấu hình R2" subtitle="R2 chỉ hoạt động khi env đã đủ các biến dưới đây.">
          <div className="grid gap-3 text-sm">
            {[
              "R2_ACCOUNT_ID",
              "R2_ACCESS_KEY_ID",
              "R2_SECRET_ACCESS_KEY",
              "R2_BUCKET",
              "R2_PUBLIC_BASE_URL",
            ].map((key) => (
              <div key={key} className="flex items-center justify-between rounded-2xl bg-[#f4f6ef] p-3">
                <code className="font-bold">{key}</code>
                <span className={process.env[key] ? "text-emerald-700" : "text-red-700"}>
                  {process.env[key] ? "set" : "missing"}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Media library" subtitle="Danh sách ảnh đã upload. Copy URL để gắn vào các form ảnh trong CMS.">
          <div className="grid gap-3">
            {assets.length ? (
              assets.map((asset) => (
                <div key={asset._id} className="grid gap-3 rounded-2xl bg-[#f4f6ef] p-3 md:grid-cols-[120px_1fr]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.url} alt={asset.filename || "Media"} className="aspect-video w-full rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="font-black">{asset.filename}</p>
                    <input readOnly value={asset.url} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm" />
                    <p className="mt-2 text-xs text-black/50">{asset.contentType} · {asset.size || 0} bytes</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-[#f4f6ef] p-4 text-sm text-black/60">
                Chưa có ảnh nào trong library. Upload ảnh đầu tiên ở form bên trên.
              </p>
            )}
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}
