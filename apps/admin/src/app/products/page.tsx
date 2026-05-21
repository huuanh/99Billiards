import { getProducts } from "@99billiards/db";
import type { Product } from "@99billiards/db/seed";
import { formatCurrency } from "@99billiards/ui";
import { createProduct, deleteProduct, updateProduct } from "../actions";
import { AdminShell, Input, Panel, SaveButton, Select, Textarea } from "@/components/admin-shell";

interface AdminProduct extends Product {
  _id?: string;
  status?: string;
  description?: string;
}

export default async function ProductsPage() {
  const products = (await getProducts()) as AdminProduct[];

  return (
    <AdminShell title="Sản phẩm" subtitle="Quản lý dịch vụ bàn, combo, đồ uống và đồ ăn.">
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Panel title="Bảng sản phẩm" subtitle={`${products.length} sản phẩm đang hiển thị.`}>
          <div className="overflow-auto">
            <table className="w-full min-w-[780px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-black/45">
                <tr>
                  <th>Tên</th>
                  <th>Nhóm</th>
                  <th>Giá</th>
                  <th>Nổi bật</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="bg-[#f4f6ef]">
                    <td className="rounded-l-2xl p-3 font-bold">{product.name}</td>
                    <td className="p-3">{product.category}</td>
                    <td className="p-3">{formatCurrency(product.price)}</td>
                    <td className="p-3">{product.featured ? "Có" : "Không"}</td>
                    <td className="p-3">{product.status || "published"}</td>
                    <td className="rounded-r-2xl p-3">
                      {product._id ? (
                        <div className="flex gap-2">
                          <details className="relative">
                            <summary className="cursor-pointer rounded-xl bg-white px-3 py-2 font-bold">
                              Sửa
                            </summary>
                            <form
                              action={updateProduct}
                              className="absolute right-0 z-10 mt-2 grid w-96 gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-2xl"
                            >
                              <input type="hidden" name="_id" value={product._id} />
                              <Input name="name" label="Tên" defaultValue={product.name} />
                              <Input name="category" label="Nhóm" defaultValue={product.category} />
                              <Input name="price" label="Giá" defaultValue={product.price} />
                              <Input name="image" label="Ảnh" defaultValue={product.image} />
                              <Textarea name="description" label="Mô tả" defaultValue={product.description} />
                              <Select name="status" label="Trạng thái" options={["published", "draft"]} defaultValue={product.status || "published"} />
                              <label className="flex items-center gap-2 text-sm font-bold">
                                <input name="featured" type="checkbox" defaultChecked={product.featured} /> Nổi bật
                              </label>
                              <SaveButton label="Cập nhật" />
                            </form>
                          </details>
                          <form action={deleteProduct}>
                            <input type="hidden" name="_id" value={product._id} />
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

        <Panel title="Thêm sản phẩm" subtitle="Sản phẩm mới sẽ xuất hiện ở public web.">
          <form action={createProduct} className="grid gap-4">
            <Input name="name" label="Tên sản phẩm" placeholder="Combo đêm 4 người" />
            <Input name="category" label="Nhóm" placeholder="Combo" />
            <Input name="price" label="Giá" placeholder="299000" />
            <Input name="image" label="Ảnh URL / R2 URL" placeholder="https://..." />
            <Textarea name="description" label="Mô tả" />
            <label className="flex items-center gap-2 text-sm font-bold">
              <input name="featured" type="checkbox" /> Nổi bật
            </label>
            <SaveButton />
          </form>
        </Panel>
      </div>
    </AdminShell>
  );
}
