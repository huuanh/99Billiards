import { getProducts } from "@99billiards/db";
import type { Product } from "@99billiards/db/seed";
import { formatCurrency } from "@99billiards/ui";
import { createProduct, deleteProduct, updateProduct } from "../actions";
import { AdminShell, Input, Panel, SaveButton, Select, StatusPill, Textarea } from "@/components/admin-shell";
import { AdminActionForm } from "@/components/admin-action-form";
import { FormModal } from "@/components/admin-modal";
import { ImageUploadField } from "@/components/image-upload-field";

interface AdminProduct extends Product {
  _id?: string;
  status?: string;
  description?: string;
}

function ProductForm({ product }: { product?: AdminProduct }) {
  const isEditing = Boolean(product?._id);

  return (
    <AdminActionForm action={isEditing ? updateProduct : createProduct} closeModalOnSuccess>
      {product?._id ? <input type="hidden" name="_id" value={product._id} /> : null}

      <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
        <h3 className="text-base font-black">Thông tin sản phẩm</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input name="name" label="Tên sản phẩm" placeholder="Combo đêm 4 người" defaultValue={product?.name} />
          <Input name="category" label="Nhóm" placeholder="Combo" defaultValue={product?.category} />
          <Input name="price" label="Giá" placeholder="299000" defaultValue={product?.price} />
          {isEditing ? (
            <Select
              name="status"
              label="Trạng thái"
              options={["published", "draft"]}
              defaultValue={product?.status || "published"}
            />
          ) : null}
          <label className="flex items-center gap-2 rounded-md border border-[#dfe3d8] bg-[#f8faf5] px-3 py-2 text-sm font-bold">
            <input name="featured" type="checkbox" defaultChecked={product?.featured} /> Nổi bật
          </label>
          <div className="md:col-span-2">
            <Textarea name="description" label="Mô tả" defaultValue={product?.description} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
        <h3 className="text-base font-black">Ảnh sản phẩm</h3>
        <div className="mt-4">
          <ImageUploadField name="image" label="Ảnh đại diện" defaultValue={product?.image} />
        </div>
      </section>

      <div className="sticky bottom-0 flex justify-end border-t border-[#dfe3d8] bg-[#f6f7f3]/95 py-4 backdrop-blur">
        <SaveButton label={isEditing ? "Cập nhật sản phẩm" : "Tạo sản phẩm"} />
      </div>
    </AdminActionForm>
  );
}

export default async function ProductsPage() {
  const products = (await getProducts()) as AdminProduct[];

  return (
    <AdminShell
      title="Sản phẩm"
      subtitle="Quản lý dịch vụ bàn, combo, đồ uống và đồ ăn."
    >
      <Panel
        title="Bảng sản phẩm"
        subtitle={`${products.length} sản phẩm đang hiển thị.`}
        aside={
          <FormModal trigger="Thêm sản phẩm" title="Thêm sản phẩm" subtitle="Chọn ảnh và upload khi bấm lưu." intent="primary">
            <ProductForm />
          </FormModal>
        }
      >
        <div className="overflow-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-[#e7eadf] text-[11px] uppercase tracking-[0.14em] text-[#657064]">
              <tr>
                <th className="px-3 py-2">Ảnh</th>
                <th className="px-3 py-2">Tên</th>
                <th className="px-3 py-2">Nhóm</th>
                <th className="px-3 py-2">Giá</th>
                <th className="px-3 py-2">Nổi bật</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef1e9]">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-[#fbfcf8]">
                  <td className="px-3 py-3">
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image} alt="" className="h-10 w-14 rounded-md object-cover" />
                    ) : (
                      <span className="text-xs text-[#657064]">Chưa có</span>
                    )}
                  </td>
                  <td className="px-3 py-3 font-bold">{product.name}</td>
                  <td className="px-3 py-3">{product.category}</td>
                  <td className="px-3 py-3">{formatCurrency(product.price)}</td>
                  <td className="px-3 py-3">{product.featured ? "Có" : "Không"}</td>
                  <td className="px-3 py-3">
                    <StatusPill label={product.status || "published"} tone={product.status === "draft" ? "warning" : "good"} />
                  </td>
                  <td className="px-3 py-3">
                    {product._id ? (
                      <div className="flex gap-2">
                        <FormModal trigger="Sửa" title={`Sửa ${product.name}`} subtitle="Cập nhật thông tin và ảnh sản phẩm.">
                          <ProductForm product={product} />
                        </FormModal>
                        <form action={deleteProduct}>
                          <input type="hidden" name="_id" value={product._id} />
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
