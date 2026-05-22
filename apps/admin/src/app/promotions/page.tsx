import { getPromotions } from "@99billiards/db";
import type { Promotion } from "@99billiards/db/seed";
import { createPromotion, deletePromotion, updatePromotion } from "../actions";
import { AdminShell, Input, Panel, SaveButton, Select, StatusPill, Textarea } from "@/components/admin-shell";
import { AdminActionForm } from "@/components/admin-action-form";
import { FormModal } from "@/components/admin-modal";
import { ImageUploadField } from "@/components/image-upload-field";

interface AdminPromotion extends Promotion {
  _id?: string;
  status?: string;
}

function PromotionForm({ promotion }: { promotion?: AdminPromotion }) {
  const isEditing = Boolean(promotion?._id);

  return (
    <AdminActionForm action={isEditing ? updatePromotion : createPromotion} closeModalOnSuccess>
      {promotion?._id ? <input type="hidden" name="_id" value={promotion._id} /> : null}

      <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
        <h3 className="text-base font-black">Thông tin ưu đãi</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input name="title" label="Tiêu đề" placeholder="Happy Hour trước 17h" defaultValue={promotion?.title} />
          <Input name="badge" label="Badge" placeholder="-20%" defaultValue={promotion?.badge} />
          <Input name="branchIds" label="Cơ sở áp dụng" placeholder="cs1, cs2, cs3" defaultValue={(promotion?.branchIds || []).join(", ")} />
          {isEditing ? (
            <Select
              name="status"
              label="Trạng thái"
              options={["published", "draft"]}
              defaultValue={promotion?.status || "published"}
            />
          ) : null}
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
  const promotions = (await getPromotions()) as AdminPromotion[];

  return (
    <AdminShell
      title="Ưu đãi"
      subtitle="Quản lý khuyến mãi theo toàn hệ thống hoặc từng cơ sở."
    >
      <Panel
        title="Bảng ưu đãi"
        subtitle={`${promotions.length} ưu đãi đang hiển thị.`}
        aside={
          <FormModal trigger="Thêm ưu đãi" title="Thêm ưu đãi" subtitle="Tạo promotion mới kèm ảnh đại diện." intent="primary">
            <PromotionForm />
          </FormModal>
        }
      >
        <div className="overflow-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
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
                  <td className="px-3 py-3">{promotion.branchIds.join(", ")}</td>
                  <td className="px-3 py-3">
                    <StatusPill label={promotion.status || "published"} tone={promotion.status === "draft" ? "warning" : "good"} />
                  </td>
                  <td className="px-3 py-3">
                    {promotion._id ? (
                      <div className="flex gap-2">
                        <FormModal trigger="Sửa" title={`Sửa ${promotion.title}`} subtitle="Cập nhật nội dung và ảnh ưu đãi.">
                          <PromotionForm promotion={promotion} />
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
