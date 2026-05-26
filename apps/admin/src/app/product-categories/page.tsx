import { getProductCategories } from "@99billiards/db";
import type { ProductCategory } from "@99billiards/db/seed";
import { FontAwesomeIcon } from "@99billiards/ui";
import { AdminActionForm } from "@/components/admin-action-form";
import { FormModal } from "@/components/admin-modal";
import { AdminShell, Input, Panel, SaveButton, Select, StatusPill, Textarea } from "@/components/admin-shell";
import { ImageUploadField } from "@/components/image-upload-field";
import { createProductCategory, deleteProductCategory, updateProductCategory } from "../actions";
import { requirePermission } from "@/lib/auth";

interface AdminProductCategory extends ProductCategory {
  _id?: string;
}

function CategoryForm({ category }: { category?: AdminProductCategory }) {
  const isEditing = Boolean(category?._id);

  return (
    <AdminActionForm action={isEditing ? updateProductCategory : createProductCategory} closeModalOnSuccess>
      {category?._id ? <input type="hidden" name="_id" value={category._id} /> : null}
      <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
        <h3 className="text-base font-black">Danh muc san pham</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input name="name" label="Ten danh muc" placeholder="Co Pool" defaultValue={category?.name} />
          <Input name="slug" label="Slug" placeholder="co-pool" defaultValue={category?.slug} />
          <Input name="sortOrder" label="Thu tu" placeholder="1" defaultValue={category?.sortOrder} />
          <Select name="status" label="Trang thai" options={["active", "hidden"]} defaultValue={category?.status || "active"} />
          <div className="md:col-span-2">
            <Textarea name="description" label="Mo ta" defaultValue={category?.description} />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField name="image" label="Anh danh muc" defaultValue={category?.image} />
          </div>
        </div>
      </section>
      <div className="sticky bottom-0 flex justify-end border-t border-[#dfe3d8] bg-[#f6f7f3]/95 py-4 backdrop-blur">
        <SaveButton label={isEditing ? "Cap nhat danh muc" : "Tao danh muc"} />
      </div>
    </AdminActionForm>
  );
}

export default async function ProductCategoriesPage() {
  await requirePermission("products");
  const categories = (await getProductCategories({ includeHidden: true })) as AdminProductCategory[];

  return (
    <AdminShell title="Danh muc san pham" subtitle="Quan ly nhom lon tren catalog /products.">
      <Panel
        title="Danh sach danh muc"
        subtitle={`${categories.length} danh muc.`}
        aside={
          <FormModal trigger="Them danh muc" title="Them danh muc san pham" intent="primary">
            <CategoryForm />
          </FormModal>
        }
      >
        <div className="overflow-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-[#e7eadf] text-[11px] uppercase tracking-[0.14em] text-[#657064]">
              <tr>
                <th className="px-3 py-2">Anh</th>
                <th className="px-3 py-2">Ten</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Thu tu</th>
                <th className="px-3 py-2">Trang thai</th>
                <th className="px-3 py-2">Thao tac</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef1e9]">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-[#fbfcf8]">
                  <td className="px-3 py-3">
                    {category.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={category.image} alt="" className="h-10 w-14 rounded-md object-cover" />
                    ) : (
                      <span className="text-xs text-[#657064]">Chua co</span>
                    )}
                  </td>
                  <td className="px-3 py-3 font-bold">{category.name}</td>
                  <td className="px-3 py-3">{category.slug}</td>
                  <td className="px-3 py-3">{category.sortOrder || 0}</td>
                  <td className="px-3 py-3">
                    <StatusPill label={category.status || "active"} tone={category.status === "hidden" ? "warning" : "good"} />
                  </td>
                  <td className="px-3 py-3">
                    {category._id ? (
                      <div className="flex gap-2">
                        <FormModal trigger="Sua" title={`Sua ${category.name}`}>
                          <CategoryForm category={category} />
                        </FormModal>
                        <form action={deleteProductCategory}>
                          <input type="hidden" name="_id" value={category._id} />
                          <button className="min-h-9 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                            <span className="inline-flex items-center gap-2">
                              <FontAwesomeIcon icon="trash" className="h-3.5 w-3.5" />
                              Xoa
                            </span>
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
