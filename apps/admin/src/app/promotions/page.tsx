import { getAdminPromotions, getBranches } from "@99billiards/db";
import type { Branch, Promotion } from "@99billiards/db/seed";
import { AdminActionForm } from "@/components/admin-action-form";
import { FormModal } from "@/components/admin-modal";
import { AdminShell, Input, Panel, SaveButton, Select, StatusPill, Textarea } from "@/components/admin-shell";
import { BranchMultiSelect } from "@/components/branch-multi-select";
import { ImageUploadField } from "@/components/image-upload-field";
import { createPromotion, deletePromotion, updatePromotion } from "../actions";

interface AdminPromotion extends Promotion {
  _id?: string;
  status?: "published" | "draft";
}

interface AdminBranch extends Branch {
  _id?: string;
}

function branchSummary(branchIds: string[] | undefined, branchNames: Map<string, string>) {
  const ids = branchIds || [];
  if (!ids.length) return "Toàn hệ thống";
  return ids.map((id) => branchNames.get(id) || id).join(", ");
}

function PromotionForm({ promotion, branches }: { promotion?: AdminPromotion; branches: AdminBranch[] }) {
  const isEditing = Boolean(promotion?._id);

  return (
    <AdminActionForm action={isEditing ? updatePromotion : createPromotion} closeModalOnSuccess>
      {promotion?._id ? <input type="hidden" name="_id" value={promotion._id} /> : null}

      <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
        <h3 className="text-base font-black">Thông tin ưu đãi</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input name="title" label="Tiêu đề" placeholder="Happy Hour trước 17h" defaultValue={promotion?.title} />
          <Input name="badge" label="Badge" placeholder="-20%" defaultValue={promotion?.badge} />
          <Select
            name="status"
            label="Trạng thái"
            options={["draft", "published"]}
            defaultValue={promotion?.status || "draft"}
          />
          <div className="md:col-span-2">
            <BranchMultiSelect branches={branches} defaultValues={promotion?.branchIds || []} />
          </div>
          <div className="md:col-span-2">
            <Textarea name="description" label="Mô tả" defaultValue={promotion?.description} />
          </div>
          <div className="md:col-span-2">
            <Textarea name="content" label="Nội dung chi tiết" defaultValue={promotion?.content} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
        <h3 className="text-base font-black">Ảnh ưu đãi</h3>
        <div className="mt-4">
          <ImageUploadField name="image" label="Ảnh đại diện" defaultValue={promotion?.image} />
        </div>
      </section>

      <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
        <h3 className="text-base font-black">SEO</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input name="seoTitle" label="SEO title" placeholder="Ưu đãi 99 Billiards..." defaultValue={promotion?.seoTitle} />
          <Textarea name="seoDescription" label="SEO description" defaultValue={promotion?.seoDescription} />
        </div>
      </section>

      <div className="sticky bottom-0 flex justify-end border-t border-[#dfe3d8] bg-[#f6f7f3]/95 py-4 backdrop-blur">
        <SaveButton label={isEditing ? "Cập nhật ưu đãi" : "Tạo ưu đãi"} />
      </div>
    </AdminActionForm>
  );
}

export default async function PromotionsPage() {
  const [promotions, branches] = await Promise.all([
    getAdminPromotions() as Promise<AdminPromotion[]>,
    getBranches() as Promise<AdminBranch[]>,
  ]);
  const branchNames = new Map(branches.map((branch) => [branch.id, branch.name]));

  return (
    <AdminShell
      title="Ưu đãi"
      subtitle="Quản lý khuyến mãi theo toàn hệ thống hoặc từng cơ sở."
    >
      <Panel
        title="Bảng ưu đãi"
        subtitle={`${promotions.length} ưu đãi trong CMS.`}
        aside={
          <FormModal
            trigger="Thêm ưu đãi"
            title="Thêm ưu đãi"
            subtitle="Ưu đãi mới mặc định là draft, chọn cơ sở áp dụng trước khi publish."
            intent="primary"
          >
            <PromotionForm branches={branches} />
          </FormModal>
        }
      >
        <div className="overflow-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-[#e7eadf] text-[11px] uppercase tracking-[0.14em] text-[#657064]">
              <tr>
                <th className="px-3 py-2">Ảnh</th>
                <th className="px-3 py-2">Tiêu đề</th>
                <th className="px-3 py-2">Badge</th>
                <th className="px-3 py-2">Cơ sở</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef1e9]">
              {promotions.map((promotion) => (
                <tr key={promotion.id} className="hover:bg-[#fbfcf8]">
                  <td className="px-3 py-3">
                    {promotion.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={promotion.image} alt="" className="h-10 w-14 rounded-md object-cover" />
                    ) : (
                      <span className="text-xs text-[#657064]">Chưa có</span>
                    )}
                  </td>
                  <td className="px-3 py-3 font-bold">{promotion.title}</td>
                  <td className="px-3 py-3">{promotion.badge}</td>
                  <td className="max-w-[320px] px-3 py-3 text-[#596256]">{branchSummary(promotion.branchIds, branchNames)}</td>
                  <td className="px-3 py-3">
                    <StatusPill label={promotion.status || "published"} tone={promotion.status === "draft" ? "warning" : "good"} />
                  </td>
                  <td className="px-3 py-3">
                    {promotion._id ? (
                      <div className="flex gap-2">
                        <FormModal trigger="Sửa" title={`Sửa ${promotion.title}`} subtitle="Cập nhật nội dung, cơ sở áp dụng và ảnh ưu đãi.">
                          <PromotionForm promotion={promotion} branches={branches} />
                        </FormModal>
                        <form action={deletePromotion}>
                          <input type="hidden" name="_id" value={promotion._id} />
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
