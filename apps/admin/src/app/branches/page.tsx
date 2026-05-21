import { getBranches } from "@99billiards/db";
import type { Branch } from "@99billiards/db/seed";
import { createBranch, deleteBranch, updateBranch } from "../actions";
import { AdminShell, Input, Panel, SaveButton, Select, Textarea } from "@/components/admin-shell";

interface AdminBranch extends Branch {
  _id?: string;
}

export default async function BranchesPage() {
  const branches = (await getBranches()) as AdminBranch[];

  return (
    <AdminShell title="Cơ sở" subtitle="Quản lý danh sách chi nhánh và trạng thái vận hành.">
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Panel title="Bảng cơ sở" subtitle={`${branches.length} cơ sở đang hiển thị trên website.`}>
          <div className="overflow-auto">
            <table className="w-full min-w-[900px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-black/45">
                <tr>
                  <th>Mã</th>
                  <th>Tên cơ sở</th>
                  <th>Khu vực</th>
                  <th>Địa chỉ</th>
                  <th>Hotline</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch) => (
                  <tr key={branch.id} className="bg-[#f4f6ef]">
                    <td className="rounded-l-2xl p-3 font-black">{branch.code}</td>
                    <td className="p-3 font-bold">{branch.name}</td>
                    <td className="p-3">{branch.district}</td>
                    <td className="p-3">{branch.address}</td>
                    <td className="p-3">{branch.phone}</td>
                    <td className="p-3">{branch.status}</td>
                    <td className="rounded-r-2xl p-3">
                      {branch._id ? (
                        <div className="flex gap-2">
                          <details className="relative">
                            <summary className="cursor-pointer rounded-xl bg-white px-3 py-2 font-bold">
                              Sửa
                            </summary>
                            <form
                              action={updateBranch}
                              className="absolute right-0 z-10 mt-2 grid w-96 gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-2xl"
                            >
                              <input type="hidden" name="_id" value={branch._id} />
                              <Input name="code" label="Mã" defaultValue={branch.code} />
                              <Input name="name" label="Tên" defaultValue={branch.name} />
                              <Input name="district" label="Khu vực" defaultValue={branch.district} />
                              <Input name="address" label="Địa chỉ" defaultValue={branch.address} />
                              <Input name="phone" label="Hotline" defaultValue={branch.phone} />
                              <Input name="hours" label="Giờ" defaultValue={branch.hours} />
                              <Select name="status" label="Trạng thái" options={["open", "busy", "coming-soon"]} defaultValue={branch.status} />
                              <Input name="image" label="Ảnh" defaultValue={branch.image} />
                              <Input name="gallery" label="Gallery" defaultValue={(branch.gallery || []).join(", ")} />
                              <Input name="highlights" label="Điểm nổi bật" defaultValue={branch.highlights.join(", ")} />
                              <Input name="amenities" label="Tiện ích" defaultValue={(branch.amenities || []).join(", ")} />
                              <Input name="mapUrl" label="Maps URL" defaultValue={branch.mapUrl} />
                              <Input name="mapEmbedUrl" label="Maps Embed" defaultValue={branch.mapEmbedUrl} />
                              <Textarea name="description" label="Mô tả" defaultValue={branch.description} />
                              <Input name="seoTitle" label="SEO title" defaultValue={branch.seoTitle} />
                              <Textarea name="seoDescription" label="SEO description" defaultValue={branch.seoDescription} />
                              <SaveButton label="Cập nhật" />
                            </form>
                          </details>
                          <form action={deleteBranch}>
                            <input type="hidden" name="_id" value={branch._id} />
                            <button className="rounded-xl bg-red-50 px-3 py-2 font-bold text-red-700">
                              Xóa
                            </button>
                          </form>
                        </div>
                      ) : (
                        <span className="text-black/45">Seed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Thêm cơ sở" subtitle="Dữ liệu sẽ lưu thật khi cấu hình MongoDB.">
          <form action={createBranch} className="grid gap-4">
            <Input name="code" label="Mã cơ sở" placeholder="CS9" />
            <Input name="name" label="Tên cơ sở" placeholder="99 Billiards Hòa Lạc" />
            <Input name="district" label="Khu vực/quận" placeholder="Hòa Lạc" />
            <Input name="address" label="Địa chỉ" placeholder="Khu CNC Hòa Lạc" />
            <Input name="phone" label="Hotline" placeholder="0923 699 999" />
            <Input name="hours" label="Giờ mở cửa" placeholder="24/24" />
            <Select name="status" label="Trạng thái" options={["open", "busy", "coming-soon"]} />
            <Input name="image" label="Ảnh URL / R2 URL" placeholder="https://..." />
            <Input name="gallery" label="Gallery URLs" placeholder="url1, url2, url3" />
            <Input name="highlights" label="Điểm nổi bật" placeholder="Bàn chuẩn, Livestream, Cafe" />
            <Input name="amenities" label="Tiện ích" placeholder="Bãi xe, Cafe, Mở 24/24" />
            <Input name="mapUrl" label="Google Maps URL" placeholder="https://maps.google.com/..." />
            <Input name="mapEmbedUrl" label="Google Maps Embed URL" placeholder="https://www.google.com/maps?output=embed" />
            <Textarea name="description" label="Mô tả chi tiết" />
            <Input name="seoTitle" label="SEO title" placeholder="99 Billiards CS..." />
            <Textarea name="seoDescription" label="SEO description" />
            <SaveButton />
          </form>
        </Panel>
      </div>
    </AdminShell>
  );
}
