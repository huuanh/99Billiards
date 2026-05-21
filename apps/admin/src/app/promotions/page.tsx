import { getPromotions } from "@99billiards/db";
import type { Promotion } from "@99billiards/db/seed";
import { createPromotion, deletePromotion, updatePromotion } from "../actions";
import { AdminShell, Input, Panel, SaveButton, Select, Textarea } from "@/components/admin-shell";

interface AdminPromotion extends Promotion {
  _id?: string;
  status?: string;
}

export default async function PromotionsPage() {
  const promotions = (await getPromotions()) as AdminPromotion[];

  return (
    <AdminShell title="Ưu đãi" subtitle="Quản lý khuyến mãi theo toàn hệ thống hoặc từng cơ sở.">
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Panel title="Bảng ưu đãi" subtitle={`${promotions.length} ưu đãi đang hiển thị.`}>
          <div className="overflow-auto">
            <table className="w-full min-w-[780px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-black/45">
                <tr>
                  <th>Tiêu đề</th>
                  <th>Badge</th>
                  <th>Cơ sở áp dụng</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promotion) => (
                  <tr key={promotion.id} className="bg-[#f4f6ef]">
                    <td className="rounded-l-2xl p-3 font-bold">{promotion.title}</td>
                    <td className="p-3">{promotion.badge}</td>
                    <td className="p-3">{promotion.branchIds.join(", ")}</td>
                    <td className="p-3">{promotion.status || "published"}</td>
                    <td className="rounded-r-2xl p-3">
                      {promotion._id ? (
                        <div className="flex gap-2">
                          <details className="relative">
                            <summary className="cursor-pointer rounded-xl bg-white px-3 py-2 font-bold">
                              Sửa
                            </summary>
                            <form
                              action={updatePromotion}
                              className="absolute right-0 z-10 mt-2 grid w-96 gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-2xl"
                            >
                              <input type="hidden" name="_id" value={promotion._id} />
                              <Input name="title" label="Tiêu đề" defaultValue={promotion.title} />
                              <Input name="badge" label="Badge" defaultValue={promotion.badge} />
                              <Input name="image" label="Ảnh" defaultValue={promotion.image} />
                              <Input name="branchIds" label="Cơ sở" defaultValue={promotion.branchIds.join(", ")} />
                              <Textarea name="description" label="Mô tả" defaultValue={promotion.description} />
                              <Textarea name="content" label="Nội dung chi tiết" defaultValue={promotion.content} />
                              <Input name="seoTitle" label="SEO title" defaultValue={promotion.seoTitle} />
                              <Textarea name="seoDescription" label="SEO description" defaultValue={promotion.seoDescription} />
                              <Select name="status" label="Trạng thái" options={["published", "draft"]} defaultValue={promotion.status || "published"} />
                              <SaveButton label="Cập nhật" />
                            </form>
                          </details>
                          <form action={deletePromotion}>
                            <input type="hidden" name="_id" value={promotion._id} />
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

        <Panel title="Thêm ưu đãi" subtitle="Dùng branch id dạng cs1, cs2 để giới hạn cơ sở.">
          <form action={createPromotion} className="grid gap-4">
            <Input name="title" label="Tiêu đề" placeholder="Happy Hour trước 17h" />
            <Input name="badge" label="Badge" placeholder="-20%" />
            <Input name="image" label="Ảnh URL / R2 URL" placeholder="https://..." />
            <Input name="branchIds" label="Cơ sở áp dụng" placeholder="cs1, cs2, cs3" />
            <Textarea name="description" label="Mô tả" />
            <Textarea name="content" label="Nội dung chi tiết" />
            <Input name="seoTitle" label="SEO title" placeholder="Ưu đãi 99 Billiards..." />
            <Textarea name="seoDescription" label="SEO description" />
            <SaveButton />
          </form>
        </Panel>
      </div>
    </AdminShell>
  );
}
