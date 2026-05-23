import { getPostCategories } from "@99billiards/db";
import type { PostCategory } from "@99billiards/db/seed";
import { AdminActionForm } from "@/components/admin-action-form";
import { FormModal } from "@/components/admin-modal";
import { AdminShell, Input, Panel, SaveButton, Select, StatusPill, Textarea } from "@/components/admin-shell";
import { createPostCategory, deletePostCategory, updatePostCategory } from "../actions";

interface AdminPostCategory extends PostCategory {
  _id?: string;
  createdAt?: string;
}

function CategoryForm({ category }: { category?: AdminPostCategory }) {
  const isEditing = Boolean(category?._id);

  return (
    <AdminActionForm action={isEditing ? updatePostCategory : createPostCategory} closeModalOnSuccess>
      {category?._id ? <input type="hidden" name="_id" value={category._id} /> : null}

      <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
        <h3 className="text-base font-black">Thông tin chuyên mục</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input name="name" label="Tên chuyên mục" placeholder="Livestream" defaultValue={category?.name} />
          <Input name="slug" label="Slug" placeholder="livestream" defaultValue={category?.slug} />
          <Input name="sortOrder" label="Thứ tự" placeholder="1" defaultValue={category?.sortOrder || 0} />
          <Select
            name="status"
            label="Trạng thái"
            options={["active", "hidden"]}
            defaultValue={category?.status || "active"}
          />
          <div className="md:col-span-2">
            <Textarea name="description" label="Mô tả" defaultValue={category?.description} />
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 flex justify-end border-t border-[#dfe3d8] bg-[#f6f7f3]/95 py-4 backdrop-blur">
        <SaveButton label={isEditing ? "Cập nhật chuyên mục" : "Tạo chuyên mục"} />
      </div>
    </AdminActionForm>
  );
}

export default async function PostCategoriesPage() {
  const categories = (await getPostCategories({ includeHidden: true })) as AdminPostCategory[];

  return (
    <AdminShell title="Chuyên mục tin tức" subtitle="Quản lý danh mục dùng cho bài viết.">
      <Panel
        title="Bảng chuyên mục"
        subtitle={`${categories.length} chuyên mục đang có trong CMS.`}
        aside={
          <FormModal
            trigger="Thêm chuyên mục"
            title="Thêm chuyên mục"
            subtitle="Tạo danh mục để gán cho bài viết."
            intent="primary"
          >
            <CategoryForm />
          </FormModal>
        }
      >
        <div className="overflow-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-[#e7eadf] text-[11px] uppercase tracking-[0.14em] text-[#657064]">
              <tr>
                <th className="px-3 py-2">Tên</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Mô tả</th>
                <th className="px-3 py-2">Thứ tự</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef1e9]">
              {categories.map((category) => (
                <tr key={category._id || category.slug} className="hover:bg-[#fbfcf8]">
                  <td className="px-3 py-3 font-bold">{category.name}</td>
                  <td className="px-3 py-3">
                    <code className="rounded-md bg-[#f4f6ef] px-2 py-1 text-xs font-bold">{category.slug}</code>
                  </td>
                  <td className="max-w-[360px] px-3 py-3 text-[#596256]">{category.description || "-"}</td>
                  <td className="px-3 py-3 font-bold tabular-nums">{category.sortOrder || 0}</td>
                  <td className="px-3 py-3">
                    <StatusPill
                      label={category.status || "active"}
                      tone={category.status === "hidden" ? "warning" : "good"}
                    />
                  </td>
                  <td className="px-3 py-3">
                    {category._id ? (
                      <div className="flex gap-2">
                        <FormModal
                          trigger="Sửa"
                          title={`Sửa ${category.name}`}
                          subtitle="Cập nhật tên, slug và trạng thái chuyên mục."
                        >
                          <CategoryForm category={category} />
                        </FormModal>
                        <form action={deletePostCategory}>
                          <input type="hidden" name="_id" value={category._id} />
                          <button className="min-h-9 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                            Xóa
                          </button>
                        </form>
                      </div>
                    ) : (
                      <span className="text-[#657064]">Từ bài viết</span>
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
