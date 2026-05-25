import { getBranches } from "@99billiards/db";
import type { Branch } from "@99billiards/db/seed";
import { createBranch, deleteBranch, updateBranch } from "../actions";
import { AdminShell, Input, Panel, SaveButton, Select, StatusPill, Textarea } from "@/components/admin-shell";
import { FormModal } from "@/components/admin-modal";
import { AdminActionForm } from "@/components/admin-action-form";
import { ImageUploadField } from "@/components/image-upload-field";
import { requirePermission } from "@/lib/auth";

interface AdminBranch extends Branch {
  _id?: string;
}

function BranchForm({ branch }: { branch?: AdminBranch }) {
  const isEditing = Boolean(branch?._id);

  return (
    <AdminActionForm action={isEditing ? updateBranch : createBranch} closeModalOnSuccess>
      {branch?._id ? <input type="hidden" name="_id" value={branch._id} /> : null}

      <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
        <h3 className="text-base font-black">Thông tin vận hành</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input name="code" label="Mã cơ sở" placeholder="CS9" defaultValue={branch?.code} />
          <Input name="name" label="Tên cơ sở" placeholder="99 Billiards Hòa Lạc" defaultValue={branch?.name} />
          <Input name="district" label="Khu vực/quận" placeholder="Hòa Lạc" defaultValue={branch?.district} />
          <Input name="phone" label="Hotline" placeholder="0923 699 999" defaultValue={branch?.phone} />
          <Input name="hours" label="Giờ mở cửa" placeholder="24/24" defaultValue={branch?.hours || "24/24"} />
          <Select
            name="status"
            label="Trạng thái"
            options={["open", "busy", "coming-soon"]}
            defaultValue={branch?.status || "open"}
          />
          <div className="md:col-span-2">
            <Input name="address" label="Địa chỉ" placeholder="Khu CNC Hòa Lạc" defaultValue={branch?.address} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
        <h3 className="text-base font-black">Ảnh cơ sở</h3>
        <div className="mt-4 grid gap-4">
          <ImageUploadField name="image" label="Ảnh đại diện" defaultValue={branch?.image} />
          <ImageUploadField
            name="gallery"
            label="Gallery"
            defaultValue={branch?.gallery || []}
            multiple
          />
        </div>
      </section>

      <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
        <h3 className="text-base font-black">Nội dung hiển thị</h3>
        <div className="mt-4 grid gap-4">
          <Input
            name="highlights"
            label="Điểm nổi bật"
            placeholder="Bàn chuẩn, Livestream, Cafe"
            defaultValue={(branch?.highlights || []).join(", ")}
          />
          <Input
            name="amenities"
            label="Tiện ích"
            placeholder="Bãi xe, Cafe, Mở 24/24"
            defaultValue={(branch?.amenities || []).join(", ")}
          />
          <Textarea name="description" label="Mô tả chi tiết" defaultValue={branch?.description} />
        </div>
      </section>

      <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
        <h3 className="text-base font-black">Bản đồ & SEO</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input name="mapUrl" label="Google Maps URL" placeholder="https://maps.google.com/..." defaultValue={branch?.mapUrl} />
          <Input
            name="mapEmbedUrl"
            label="Google Maps Embed URL"
            placeholder="https://www.google.com/maps?output=embed"
            defaultValue={branch?.mapEmbedUrl}
          />
          <Input name="seoTitle" label="SEO title" placeholder="99 Billiards CS..." defaultValue={branch?.seoTitle} />
          <Textarea name="seoDescription" label="SEO description" defaultValue={branch?.seoDescription} />
        </div>
      </section>

      <div className="sticky bottom-0 flex justify-end border-t border-[#dfe3d8] bg-[#f6f7f3]/95 py-4 backdrop-blur">
        <SaveButton label={isEditing ? "Cập nhật cơ sở" : "Tạo cơ sở"} />
      </div>
    </AdminActionForm>
  );
}

function branchStatus(branch: AdminBranch) {
  if (branch.status === "busy") return <StatusPill label="Đông bàn" tone="warning" />;
  if (branch.status === "coming-soon") return <StatusPill label="Sắp mở" tone="neutral" />;
  return <StatusPill label="Đang mở" tone="good" />;
}

export default async function BranchesPage() {
  await requirePermission("branches");
  const branches = (await getBranches()) as AdminBranch[];

  return (
    <AdminShell
      title="Cơ sở"
      subtitle="Quản lý danh sách chi nhánh, trạng thái vận hành, ảnh đại diện và gallery."
    >
      <Panel
        title="Bảng cơ sở"
        subtitle={`${branches.length} cơ sở đang hiển thị trên website.`}
        aside={
          <FormModal
            trigger="Thêm cơ sở"
            title="Thêm cơ sở"
            subtitle="Tạo cơ sở mới, chọn ảnh và upload khi bấm lưu."
            intent="primary"
          >
            <BranchForm />
          </FormModal>
        }
      >
        <div className="overflow-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="border-b border-[#e7eadf] text-[11px] uppercase tracking-[0.14em] text-[#657064]">
              <tr>
                <th className="px-3 py-2">Mã</th>
                <th className="px-3 py-2">Tên cơ sở</th>
                <th className="px-3 py-2">Khu vực</th>
                <th className="px-3 py-2">Địa chỉ</th>
                <th className="px-3 py-2">Hotline</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Ảnh</th>
                <th className="px-3 py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef1e9]">
              {branches.map((branch) => (
                <tr key={branch.id} className="align-middle hover:bg-[#fbfcf8]">
                  <td className="px-3 py-3 font-black uppercase">{branch.code}</td>
                  <td className="px-3 py-3 font-bold">{branch.name}</td>
                  <td className="px-3 py-3">{branch.district}</td>
                  <td className="max-w-[280px] px-3 py-3">
                    <p className="truncate">{branch.address}</p>
                  </td>
                  <td className="px-3 py-3">{branch.phone}</td>
                  <td className="px-3 py-3">{branchStatus(branch)}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      {branch.image ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={branch.image} alt="" className="h-10 w-14 rounded-md object-cover" />
                          <span className="text-xs font-bold text-[#657064]">
                            {(branch.gallery || []).length} gallery
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-[#657064]">Chưa có ảnh</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {branch._id ? (
                      <div className="flex gap-2">
                        <FormModal
                          trigger="Sửa"
                          title={`Sửa ${branch.code}`}
                          subtitle="Cập nhật thông tin, ảnh đại diện và gallery của cơ sở."
                        >
                          <BranchForm branch={branch} />
                        </FormModal>
                        <form action={deleteBranch}>
                          <input type="hidden" name="_id" value={branch._id} />
                          <button className="min-h-9 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                            Xóa
                          </button>
                        </form>
                      </div>
                    ) : (
                      <span className="text-[#657064]">Seed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AdminShell>
  );
}
