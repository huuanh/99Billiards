import { getProductCategories, getProductSubcategories } from "@99billiards/db";
import type { ProductCategory, ProductSubcategory } from "@99billiards/db/seed";
import { FontAwesomeIcon } from "@99billiards/ui";
import { AdminActionForm } from "@/components/admin-action-form";
import { FormModal } from "@/components/admin-modal";
import { AdminShell, Input, Panel, SaveButton, Select, StatusPill, Textarea } from "@/components/admin-shell";
import { createProductSubcategory, deleteProductSubcategory, updateProductSubcategory } from "../actions";
import { requirePermission } from "@/lib/auth";

interface AdminProductCategory extends ProductCategory {
  _id?: string;
}

interface AdminProductSubcategory extends ProductSubcategory {
  _id?: string;
}

function SubcategoryForm({
  subcategory,
  categories,
}: {
  subcategory?: AdminProductSubcategory;
  categories: AdminProductCategory[];
}) {
  const isEditing = Boolean(subcategory?._id);
  const categoryOptions = ["", ...categories.map((category) => category.id)];

  return (
    <AdminActionForm action={isEditing ? updateProductSubcategory : createProductSubcategory} closeModalOnSuccess>
      {subcategory?._id ? <input type="hidden" name="_id" value={subcategory._id} /> : null}
      <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
        <h3 className="text-base font-black">Danh muc con / loai san pham</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input name="name" label="Ten" placeholder="Cuetec" defaultValue={subcategory?.name} />
          <Input name="slug" label="Slug" placeholder="cuetec" defaultValue={subcategory?.slug} />
          <input type="hidden" name="type" value="product-type" />
          <Select
            name="categoryId"
            label="Danh muc cha"
            options={categoryOptions}
            defaultValue={subcategory?.categoryId || ""}
          />
          <Input name="sortOrder" label="Thu tu" placeholder="1" defaultValue={subcategory?.sortOrder} />
          <Select name="status" label="Trang thai" options={["active", "hidden"]} defaultValue={subcategory?.status || "active"} />
          <div className="md:col-span-2">
            <Textarea name="description" label="Mo ta" defaultValue={subcategory?.description} />
          </div>
        </div>
      </section>
      <div className="sticky bottom-0 flex justify-end border-t border-[#dfe3d8] bg-[#f6f7f3]/95 py-4 backdrop-blur">
        <SaveButton label={isEditing ? "Cap nhat danh muc con" : "Tao danh muc con"} />
      </div>
    </AdminActionForm>
  );
}

export default async function ProductSubcategoriesPage() {
  await requirePermission("products");
  const [subcategories, categories] = await Promise.all([
    getProductSubcategories({ includeHidden: true }) as Promise<AdminProductSubcategory[]>,
    getProductCategories({ includeHidden: true }) as Promise<AdminProductCategory[]>,
  ]);
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <AdminShell title="Danh muc con" subtitle="Quan ly loai san pham nam duoi danh muc lon.">
      <Panel
        title="Danh muc con / loai san pham"
        subtitle={`${subcategories.length} muc.`}
        aside={
          <FormModal trigger="Them muc" title="Them danh muc con" intent="primary">
            <SubcategoryForm categories={categories} />
          </FormModal>
        }
      >
        <div className="overflow-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-[#e7eadf] text-[11px] uppercase tracking-[0.14em] text-[#657064]">
              <tr>
                <th className="px-3 py-2">Ten</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Danh muc cha</th>
                <th className="px-3 py-2">Thu tu</th>
                <th className="px-3 py-2">Trang thai</th>
                <th className="px-3 py-2">Thao tac</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef1e9]">
              {subcategories.map((subcategory) => (
                <tr key={subcategory.id} className="hover:bg-[#fbfcf8]">
                  <td className="px-3 py-3 font-bold">{subcategory.name}</td>
                  <td className="px-3 py-3">{subcategory.slug}</td>
                  <td className="px-3 py-3">{categoryNames.get(subcategory.categoryId || "") || "-"}</td>
                  <td className="px-3 py-3">{subcategory.sortOrder || 0}</td>
                  <td className="px-3 py-3">
                    <StatusPill label={subcategory.status || "active"} tone={subcategory.status === "hidden" ? "warning" : "good"} />
                  </td>
                  <td className="px-3 py-3">
                    {subcategory._id ? (
                      <div className="flex gap-2">
                        <FormModal trigger="Sua" title={`Sua ${subcategory.name}`}>
                          <SubcategoryForm subcategory={subcategory} categories={categories} />
                        </FormModal>
                        <form action={deleteProductSubcategory}>
                          <input type="hidden" name="_id" value={subcategory._id} />
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
