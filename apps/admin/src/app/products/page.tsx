import { getAdminProducts, getProductBrands, getProductCategories, getProductSubcategories } from "@99billiards/db";
import type { Product, ProductBrand, ProductCategory, ProductSubcategory } from "@99billiards/db/seed";
import { FontAwesomeIcon, formatCurrency } from "@99billiards/ui";
import { AdminActionForm } from "@/components/admin-action-form";
import { FormModal } from "@/components/admin-modal";
import { AdminShell, Input, Panel, SaveButton, Select, StatusPill, Textarea } from "@/components/admin-shell";
import { ImageUploadField } from "@/components/image-upload-field";
import { PostContentEditor } from "@/components/post-content-editor";
import { createProduct, deleteProduct, updateProduct } from "../actions";
import { requirePermission } from "@/lib/auth";

interface AdminProduct extends Product {
  _id?: string;
}

interface AdminProductCategory extends ProductCategory {
  _id?: string;
}

interface AdminProductSubcategory extends ProductSubcategory {
  _id?: string;
}

interface AdminProductBrand extends ProductBrand {
  _id?: string;
}

function optionLabel(id: string | undefined, names: Map<string, string>) {
  if (!id) return "";
  return names.get(id) || id;
}

function ProductForm({
  product,
  categories,
  subcategories,
  brands,
}: {
  product?: AdminProduct;
  categories: AdminProductCategory[];
  subcategories: AdminProductSubcategory[];
  brands: AdminProductBrand[];
}) {
  const isEditing = Boolean(product?._id);
  const categoryOptions = ["", ...categories.map((category) => category.id)];
  const subcategoryOptions = ["", ...subcategories.map((subcategory) => subcategory.id)];
  const brandOptions = ["", ...brands.map((brand) => brand.id)];

  return (
    <AdminActionForm action={isEditing ? updateProduct : createProduct} closeModalOnSuccess>
      {product?._id ? <input type="hidden" name="_id" value={product._id} /> : null}

      <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
        <h3 className="text-base font-black">Thông tin sản phẩm</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input name="name" label="Tên sản phẩm" placeholder="Cuetec Truewood Mappa Burl" defaultValue={product?.name} />
          <Input name="id" label="Slug URL" placeholder="cuetec-truewood-mappa-burl" defaultValue={product?.id} />
          <Select name="categoryId" label="Danh mục sản phẩm" options={categoryOptions} defaultValue={product?.categoryId || ""} />
          <Select
            name="subcategoryId"
            label="Danh mục con (không bắt buộc)"
            options={subcategoryOptions}
            defaultValue={product?.subcategoryId || ""}
          />
          <Select name="brandId" label="Nhãn hàng" options={brandOptions} defaultValue={product?.brandId || ""} />
          <Input name="price" label="Giá" placeholder="2990000" defaultValue={product?.price} />
          <Input name="compareAtPrice" label="Giá niêm yết" placeholder="3600000" defaultValue={product?.compareAtPrice} />
          <Input name="sortOrder" label="Thứ tự hiển thị" placeholder="10" defaultValue={product?.sortOrder} />
          <Select name="status" label="Trạng thái" options={["draft", "published"]} defaultValue={product?.status || "draft"} />
          <Select
            name="stockStatus"
            label="Tình trạng hàng"
            options={["in-stock", "out-of-stock", "preorder"]}
            defaultValue={product?.stockStatus || "in-stock"}
          />
          <label className="flex items-center gap-2 rounded-md border border-[#dfe3d8] bg-[#f8faf5] px-3 py-2 text-sm font-bold">
            <input name="featured" type="checkbox" defaultChecked={product?.featured} /> Nổi bật
          </label>
          <Input name="tags" label="Tags" placeholder="carbon, cue" defaultValue={(product?.tags || []).join(", ")} />
          <div className="md:col-span-2">
            <Textarea name="specs" label="Thông số sản phẩm" defaultValue={(product?.specs || []).join("\n")} />
          </div>
          <div className="md:col-span-2">
            <Textarea name="warrantyPolicy" label="Chính sách bảo hành" defaultValue={product?.warrantyPolicy} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
        <h3 className="text-base font-black">Mô tả chi tiết</h3>
        <div className="mt-4">
          <PostContentEditor
            defaultFormat={product?.detailContentFormat || "tiptap"}
            defaultContent={product?.detailContentText || product?.detailContent || product?.description || ""}
            defaultContentJson={product?.detailContentJson}
          />
        </div>
      </section>

      <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
        <h3 className="text-base font-black">Ảnh sản phẩm</h3>
        <div className="mt-4 grid gap-4">
          <ImageUploadField name="image" label="Ảnh đại diện" defaultValue={product?.image} />
          <ImageUploadField name="gallery" label="Gallery ảnh chi tiết" defaultValue={product?.gallery || []} multiple />
        </div>
      </section>

      <div className="sticky bottom-0 flex justify-end border-t border-[#dfe3d8] bg-[#f6f7f3]/95 py-4 backdrop-blur">
        <SaveButton label={isEditing ? "Cập nhật sản phẩm" : "Tạo sản phẩm"} />
      </div>
    </AdminActionForm>
  );
}

export default async function ProductsPage() {
  await requirePermission("products");
  const [products, categories, subcategories, brands] = await Promise.all([
    getAdminProducts() as Promise<AdminProduct[]>,
    getProductCategories({ includeHidden: true }) as Promise<AdminProductCategory[]>,
    getProductSubcategories({ includeHidden: true }) as Promise<AdminProductSubcategory[]>,
    getProductBrands({ includeHidden: true }) as Promise<AdminProductBrand[]>,
  ]);
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const subcategoryNames = new Map(subcategories.map((subcategory) => [subcategory.id, subcategory.name]));
  const brandNames = new Map(brands.map((brand) => [brand.id, brand.name]));

  return (
    <AdminShell title="Sản phẩm" subtitle="Quản lý catalog sản phẩm, nhãn hàng, giá và hiển thị trên trang /products.">
      <Panel
        title="Bang sản phẩm"
        subtitle={`${products.length} sản phẩm trong CMS.`}
        aside={
          <FormModal
            trigger="Thêm sản phẩm"
            title="Thêm sản phẩm"
            subtitle="Gắn danh mục, danh mục con hoặc nhãn hàng để trang /products lọc đúng như catalog."
            intent="primary"
          >
            <ProductForm categories={categories} subcategories={subcategories} brands={brands} />
          </FormModal>
        }
      >
        <div className="overflow-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="border-b border-[#e7eadf] text-[11px] uppercase tracking-[0.14em] text-[#657064]">
              <tr>
                <th className="px-3 py-2">Anh</th>
                <th className="px-3 py-2">Ten</th>
                <th className="px-3 py-2">Danh mục</th>
                <th className="px-3 py-2">Danh mục con</th>
                <th className="px-3 py-2">Nhãn hàng</th>
                <th className="px-3 py-2">Giá</th>
                <th className="px-3 py-2">Nổi bật</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Thao tac</th>
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
                  <td className="px-3 py-3">{optionLabel(product.categoryId, categoryNames) || product.category}</td>
                  <td className="px-3 py-3">{optionLabel(product.subcategoryId, subcategoryNames) || "-"}</td>
                  <td className="px-3 py-3">{optionLabel(product.brandId, brandNames) || product.brand || "-"}</td>
                  <td className="px-3 py-3">{formatCurrency(product.price)}</td>
                  <td className="px-3 py-3">{product.featured ? "Có" : "Không"}</td>
                  <td className="px-3 py-3">
                    <StatusPill label={product.status || "published"} tone={product.status === "draft" ? "warning" : "good"} />
                  </td>
                  <td className="px-3 py-3">
                    {product._id ? (
                      <div className="flex gap-2">
                        <FormModal trigger="Sửa" title={`Sửa ${product.name}`} subtitle="Cập nhật catalog, giá, nhãn hàng và ảnh sản phẩm.">
                          <ProductForm product={product} categories={categories} subcategories={subcategories} brands={brands} />
                        </FormModal>
                        <form action={deleteProduct}>
                          <input type="hidden" name="_id" value={product._id} />
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
