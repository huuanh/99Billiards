import { getProductBrands } from "@99billiards/db";
import type { ProductBrand } from "@99billiards/db/seed";
import { FontAwesomeIcon } from "@99billiards/ui";
import { AdminActionForm } from "@/components/admin-action-form";
import { FormModal } from "@/components/admin-modal";
import { AdminShell, Input, Panel, SaveButton, Select, StatusPill, Textarea } from "@/components/admin-shell";
import { ImageUploadField } from "@/components/image-upload-field";
import { createProductBrand, deleteProductBrand, updateProductBrand } from "../actions";
import { requirePermission } from "@/lib/auth";

interface AdminProductBrand extends ProductBrand {
  _id?: string;
}

function BrandForm({ brand }: { brand?: AdminProductBrand }) {
  const isEditing = Boolean(brand?._id);

  return (
    <AdminActionForm action={isEditing ? updateProductBrand : createProductBrand} closeModalOnSuccess>
      {brand?._id ? <input type="hidden" name="_id" value={brand._id} /> : null}
      <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
        <h3 className="text-base font-black">Nhãn hàng</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input name="name" label="Tên nhãn hàng" placeholder="Cuetec" defaultValue={brand?.name} />
          <Input name="slug" label="Slug" placeholder="cuetec" defaultValue={brand?.slug} />
          <Input name="sortOrder" label="Thứ tự" placeholder="1" defaultValue={brand?.sortOrder} />
          <Select name="status" label="Trạng thái" options={["active", "hidden"]} defaultValue={brand?.status || "active"} />
          <div className="md:col-span-2">
            <Textarea name="description" label="Mô tả" defaultValue={brand?.description} />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField name="logo" label="Logo nhãn hàng" defaultValue={brand?.logo} />
          </div>
        </div>
      </section>
      <div className="sticky bottom-0 flex justify-end border-t border-[#dfe3d8] bg-[#f6f7f3]/95 py-4 backdrop-blur">
        <SaveButton label={isEditing ? "Cập nhật nhãn hàng" : "Tạo nhãn hàng"} />
      </div>
    </AdminActionForm>
  );
}

export default async function ProductBrandsPage() {
  await requirePermission("products");
  const brands = (await getProductBrands({ includeHidden: true })) as AdminProductBrand[];

  return (
    <AdminShell title="Nhãn hàng" subtitle="Quản lý logo, tên và mô tả nhãn hàng trong catalog sản phẩm.">
      <Panel
        title="Danh sách nhãn hàng"
        subtitle={`${brands.length} nhãn hàng.`}
        aside={
          <FormModal trigger="Thêm nhãn hàng" title="Thêm nhãn hàng" intent="primary">
            <BrandForm />
          </FormModal>
        }
      >
        <div className="overflow-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-[#e7eadf] text-[11px] uppercase tracking-[0.14em] text-[#657064]">
              <tr>
                <th className="px-3 py-2">Logo</th>
                <th className="px-3 py-2">Ten</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Thứ tự</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Thao tac</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef1e9]">
              {brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-[#fbfcf8]">
                  <td className="px-3 py-3">
                    {brand.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={brand.logo} alt="" className="h-10 w-14 rounded-md object-contain" />
                    ) : (
                      <span className="text-xs text-[#657064]">Chưa có</span>
                    )}
                  </td>
                  <td className="px-3 py-3 font-bold">{brand.name}</td>
                  <td className="px-3 py-3">{brand.slug}</td>
                  <td className="px-3 py-3">{brand.sortOrder || 0}</td>
                  <td className="px-3 py-3">
                    <StatusPill label={brand.status || "active"} tone={brand.status === "hidden" ? "warning" : "good"} />
                  </td>
                  <td className="px-3 py-3">
                    {brand._id ? (
                      <div className="flex gap-2">
                        <FormModal trigger="Sửa" title={`Sửa ${brand.name}`}>
                          <BrandForm brand={brand} />
                        </FormModal>
                        <form action={deleteProductBrand}>
                          <input type="hidden" name="_id" value={brand._id} />
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
