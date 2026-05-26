"use server";

import {
  BookingModel,
  BranchModel,
  MediaAssetModel,
  PostCategoryModel,
  PostModel,
  ProductCategoryModel,
  ProductBrandModel,
  ProductModel,
  ProductPageSettingModel,
  ProductSubcategoryModel,
  PromotionModel,
  SalesOrderModel,
  SiteSettingModel,
  AdminUserModel,
  connectDb,
} from "@99billiards/db";
import { deleteObjectByPublicUrl, uploadObject } from "@99billiards/db/r2";
import { requirePermission, type AdminRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface AdminActionState {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
}

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function csv(formData: FormData, key: string) {
  return value(formData, key)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function listValues(formData: FormData, key: string) {
  return value(formData, key)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function multiValues(formData: FormData, key: string) {
  const values = formData
    .getAll(key)
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  if (values.length > 1) return values;
  return values.length === 1 && values[0].includes(",") ? csvValue(values[0]) : values;
}

const maxImageFileSize = 10 * 1024 * 1024;
const maxImagePayloadSize = 25 * 1024 * 1024;

function sanitizeFilename(filename: string) {
  const cleaned = filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned || "image";
}

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueUrls(urls: string[]) {
  return Array.from(new Set(urls.map((url) => url.trim()).filter(Boolean)));
}

function imageFiles(formData: FormData, key: string) {
  return formData
    .getAll(`${key}Files`)
    .filter((file): file is File => file instanceof File && file.size > 0);
}

function validateImagePayload(formData: FormData, keys: string[]) {
  const files = keys.flatMap((key) => imageFiles(formData, key));
  const oversizedFile = files.find((file) => file.size > maxImageFileSize);
  if (oversizedFile) {
    return `Ảnh "${oversizedFile.name}" vượt giới hạn 10MB.`;
  }

  const totalSize = files.reduce((total, file) => total + file.size, 0);
  if (totalSize > maxImagePayloadSize) {
    return "Tổng dung lượng ảnh mỗi lần lưu tối đa 25MB.";
  }

  return "";
}

async function uploadImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("INVALID_IMAGE_TYPE");
  }

  if (file.size > maxImageFileSize) {
    throw new Error("IMAGE_TOO_LARGE");
  }

  const filename = sanitizeFilename(file.name);
  const key = `uploads/${Date.now()}-${crypto.randomUUID()}-${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const publicUrl = await uploadObject(key, buffer, file.type || "application/octet-stream");

  await MediaAssetModel.create({
    filename: file.name,
    url: publicUrl,
    contentType: file.type,
    size: file.size,
    source: "r2",
  });

  return publicUrl;
}

async function resolveImageField(formData: FormData, key: string, uploadedUrls: string[]) {
  const retained = csv(formData, key).slice(0, 1);
  const files = imageFiles(formData, key);
  const uploaded: string[] = [];

  for (const file of files) {
    uploaded.push(await uploadImageFile(file));
  }

  uploadedUrls.push(...uploaded);
  return uploaded.length ? uploaded[uploaded.length - 1] : retained[0] || "";
}

async function resolveGalleryField(formData: FormData, key: string, uploadedUrls: string[]) {
  const retained = csv(formData, key);
  const uploaded: string[] = [];

  for (const file of imageFiles(formData, key)) {
    uploaded.push(await uploadImageFile(file));
  }

  uploadedUrls.push(...uploaded);
  return uniqueUrls([...retained, ...uploaded]);
}

async function cleanupRemovedMedia(previousUrls: string[], nextUrls: string[] = []) {
  const next = new Set(uniqueUrls(nextUrls));
  const removedUrls = uniqueUrls(previousUrls).filter((url) => !next.has(url));

  await Promise.all(
    removedUrls.map(async (url) => {
      try {
        const deleted = await deleteObjectByPublicUrl(url);
        if (deleted) {
          await MediaAssetModel.deleteMany({ url });
        }
      } catch (error) {
        console.warn(`Could not delete media asset ${url}`, error);
      }
    }),
  );
}

async function cleanupUploadedOnFailure(urls: string[]) {
  if (!urls.length) return;
  await cleanupRemovedMedia(urls);
}

function revalidateAdminAndPublic(path: string) {
  revalidatePath("/");
  revalidatePath(path);
}

async function requireDbConnection() {
  if (!(await connectDb())) {
    throw new Error("MongoDB is required for admin mutations");
  }
}

function fieldError(message: string, fieldErrors: Record<string, string>): AdminActionState {
  return { ok: false, message, fieldErrors };
}

function success(message: string): AdminActionState {
  return { ok: true, message, fieldErrors: {} };
}

function requiredFields(formData: FormData, fields: Record<string, string>) {
  const fieldErrors: Record<string, string> = {};
  for (const [key, label] of Object.entries(fields)) {
    if (!value(formData, key)) {
      fieldErrors[key] = `${label} là bắt buộc.`;
    }
  }
  return fieldErrors;
}

function numberValue(formData: FormData, key: string, label: string) {
  const rawValue = value(formData, key);
  const normalized = rawValue.replace(/[,.](?=\d{3}\b)/g, "").replace(",", ".");
  const parsed = Number(normalized);

  if (!rawValue || Number.isNaN(parsed) || parsed < 0) {
    return { value: 0, error: `${label} phai la so hop le.` };
  }

  return { value: parsed, error: "" };
}

function isDateValue(input: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(input) && !Number.isNaN(Date.parse(`${input}T00:00:00`));
}

type TiptapJsonNode = {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: TiptapJsonNode[];
};

function csvValue(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function collectTiptapImageUrls(node: unknown): string[] {
  if (!node || typeof node !== "object") return [];
  const tiptapNode = node as TiptapJsonNode;
  const src = tiptapNode.type === "image" && typeof tiptapNode.attrs?.src === "string" ? tiptapNode.attrs.src : "";
  return [
    ...(src && !src.startsWith("blob:") && !src.startsWith("data:") ? [src] : []),
    ...((tiptapNode.content || []).flatMap(collectTiptapImageUrls)),
  ];
}

function replaceInlineImageUrls(node: unknown, uploadMap: Map<string, string>): unknown {
  if (!node || typeof node !== "object") return node;
  const tiptapNode = node as TiptapJsonNode;
  const attrs = tiptapNode.attrs ? { ...tiptapNode.attrs } : undefined;

  if (tiptapNode.type === "image" && attrs) {
    const uploadId = typeof attrs.uploadId === "string" ? attrs.uploadId : "";
    if (uploadId && uploadMap.has(uploadId)) {
      attrs.src = uploadMap.get(uploadId);
      delete attrs.uploadId;
    }
  }

  return {
    ...tiptapNode,
    ...(attrs ? { attrs } : {}),
    ...(tiptapNode.content ? { content: tiptapNode.content.map((child) => replaceInlineImageUrls(child, uploadMap)) } : {}),
  };
}

function hasUnresolvedInlineImage(node: unknown): boolean {
  if (!node || typeof node !== "object") return false;
  const tiptapNode = node as TiptapJsonNode;
  const src = tiptapNode.type === "image" && typeof tiptapNode.attrs?.src === "string" ? tiptapNode.attrs.src : "";
  return src.startsWith("blob:") || (tiptapNode.content || []).some(hasUnresolvedInlineImage);
}

async function uploadInlinePostImages(formData: FormData, uploadedUrls: string[]) {
  const ids = csvValue(value(formData, "contentInlineImageIds"));
  const files = imageFiles(formData, "contentInlineImages");
  const uploadMap = new Map<string, string>();

  for (const [index, file] of files.entries()) {
    const id = ids[index];
    if (!id) continue;
    const url = await uploadImageFile(file);
    uploadedUrls.push(url);
    uploadMap.set(id, url);
  }

  return uploadMap;
}

async function resolvePostContent(formData: FormData, uploadedUrls: string[]) {
  const contentFormat = value(formData, "contentFormat") === "tiptap" ? "tiptap" : "plain";
  const content = value(formData, "content");

  if (contentFormat === "plain") {
    return {
      ok: true as const,
      value: {
        contentFormat,
        content,
        contentText: content,
        contentJson: undefined,
      },
    };
  }

  try {
    const contentJson = JSON.parse(value(formData, "contentJson") || "{}") as unknown;
    const contentText = value(formData, "contentText") || content;

    if (!contentJson || typeof contentJson !== "object" || (contentJson as { type?: unknown }).type !== "doc") {
      return { ok: false as const, message: "Nội dung rich editor chưa hợp lệ." };
    }

    const uploadMap = await uploadInlinePostImages(formData, uploadedUrls);
    const resolvedContentJson = replaceInlineImageUrls(contentJson, uploadMap);
    if (hasUnresolvedInlineImage(resolvedContentJson)) {
      return { ok: false as const, message: "Ảnh trong bài viết chưa upload được. Vui lòng chọn lại ảnh." };
    }

    return {
      ok: true as const,
      value: {
        contentFormat,
        content: contentText,
        contentText,
        contentJson: resolvedContentJson,
      },
    };
  } catch {
    return { ok: false as const, message: "Nội dung rich editor chưa hợp lệ." };
  }
}

function mutationError(error: unknown): AdminActionState {
  console.error("Admin mutation failed", error);
  if (error instanceof Error && error.message === "INVALID_IMAGE_TYPE") {
    return { ok: false, message: "Chi ho tro upload file anh." };
  }
  if (error instanceof Error && error.message === "IMAGE_TOO_LARGE") {
    return { ok: false, message: "Ảnh tối đa 10MB." };
  }
  if (error instanceof Error && error.message.includes("E11000")) {
    return { ok: false, message: "Mã hoặc slug đã tồn tại. Vui lòng dùng giá trị khác." };
  }
  return { ok: false, message: "Lưu dữ liệu chưa thành công. Vui lòng kiểm tra lại thông tin." };
}

export async function createBranch(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePermission("branches");
  await requireDbConnection();

  const fieldErrors = requiredFields(formData, {
    code: "Mã cơ sở",
    name: "Tên cơ sở",
    district: "Khu vực",
    address: "Địa chỉ",
  });
  if (Object.keys(fieldErrors).length) return fieldError("Vui lòng điền các trường bắt buộc.", fieldErrors);
  const imagePayloadError = validateImagePayload(formData, ["image", "gallery", "contentInlineImages"]);
  if (imagePayloadError) return fieldError(imagePayloadError, { image: imagePayloadError });

  const uploadedUrls: string[] = [];

  try {
    const image = await resolveImageField(formData, "image", uploadedUrls);
    const gallery = await resolveGalleryField(formData, "gallery", uploadedUrls);

    await BranchModel.create({
      code: value(formData, "code"),
      name: value(formData, "name"),
      district: value(formData, "district"),
      address: value(formData, "address"),
      phone: value(formData, "phone"),
      hours: value(formData, "hours") || "24/24",
      status: value(formData, "status") || "open",
      image,
      gallery,
      highlights: csv(formData, "highlights"),
      amenities: csv(formData, "amenities"),
      description: value(formData, "description"),
      mapUrl: value(formData, "mapUrl"),
      mapEmbedUrl: value(formData, "mapEmbedUrl"),
      seoTitle: value(formData, "seoTitle"),
      seoDescription: value(formData, "seoDescription"),
    });
    revalidateAdminAndPublic("/branches");
    return success("Đã tạo cơ sở mới.");
  } catch (error) {
    await cleanupUploadedOnFailure(uploadedUrls);
    return mutationError(error);
  }
}

export async function updateBranch(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePermission("branches");
  await requireDbConnection();

  const id = value(formData, "_id");
  if (!id) return fieldError("Thiếu ID bản ghi.", { _id: "Thiếu ID bản ghi." });

  const fieldErrors = requiredFields(formData, {
    code: "Mã cơ sở",
    name: "Tên cơ sở",
    district: "Khu vực",
    address: "Địa chỉ",
  });
  if (Object.keys(fieldErrors).length) return fieldError("Vui lòng điền các trường bắt buộc.", fieldErrors);
  const imagePayloadError = validateImagePayload(formData, ["image", "gallery"]);
  if (imagePayloadError) return fieldError(imagePayloadError, { image: imagePayloadError });

  const existing = await BranchModel.findById(id).lean();
  const uploadedUrls: string[] = [];

  try {
    const image = await resolveImageField(formData, "image", uploadedUrls);
    const gallery = await resolveGalleryField(formData, "gallery", uploadedUrls);

    await BranchModel.findByIdAndUpdate(id, {
      code: value(formData, "code"),
      name: value(formData, "name"),
      district: value(formData, "district"),
      address: value(formData, "address"),
      phone: value(formData, "phone"),
      hours: value(formData, "hours") || "24/24",
      status: value(formData, "status") || "open",
      image,
      gallery,
      highlights: csv(formData, "highlights"),
      amenities: csv(formData, "amenities"),
      description: value(formData, "description"),
      mapUrl: value(formData, "mapUrl"),
      mapEmbedUrl: value(formData, "mapEmbedUrl"),
      seoTitle: value(formData, "seoTitle"),
      seoDescription: value(formData, "seoDescription"),
    });

    await cleanupRemovedMedia(
      [String(existing?.image || ""), ...((existing?.gallery as string[] | undefined) || [])],
      [image, ...gallery],
    );
    revalidateAdminAndPublic("/branches");
    return success("Đã cập nhật cơ sở.");
  } catch (error) {
    await cleanupUploadedOnFailure(uploadedUrls);
    return mutationError(error);
  }
}

export async function deleteBranch(formData: FormData) {
  await requirePermission("branches");
  await requireDbConnection();

  const existing = await BranchModel.findById(value(formData, "_id")).lean();
  await BranchModel.findByIdAndDelete(value(formData, "_id"));
  await cleanupRemovedMedia([
    String(existing?.image || ""),
    ...((existing?.gallery as string[] | undefined) || []),
  ]);
  revalidateAdminAndPublic("/branches");
}

export async function createProduct(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePermission("products");
  await requireDbConnection();

  const fieldErrors = requiredFields(formData, {
    name: "Tên sản phẩm",
  });
  const price = numberValue(formData, "price", "Giá");
  if (price.error) fieldErrors.price = price.error;
  if (Object.keys(fieldErrors).length) return fieldError("Vui lòng kiểm tra thông tin sản phẩm.", fieldErrors);
  const imagePayloadError = validateImagePayload(formData, ["image", "gallery"]);
  if (imagePayloadError) return fieldError(imagePayloadError, { image: imagePayloadError });

  const uploadedUrls: string[] = [];

  try {
    const image = await resolveImageField(formData, "image", uploadedUrls);
    const gallery = await resolveGalleryField(formData, "gallery", uploadedUrls);
    const id = value(formData, "id") || slugify(value(formData, "name"));
    const detailContent = await resolvePostContent(formData, uploadedUrls);
    if (!detailContent.ok) {
      await cleanupUploadedOnFailure(uploadedUrls);
      return fieldError(detailContent.message, { content: detailContent.message });
    }

    await ProductModel.create({
      id,
      name: value(formData, "name"),
      category: value(formData, "categoryId"),
      categoryId: value(formData, "categoryId"),
      subcategoryId: value(formData, "subcategoryId"),
      subcategoryIds: value(formData, "subcategoryId") ? [value(formData, "subcategoryId")] : [],
      brand: value(formData, "brandId"),
      brandId: value(formData, "brandId"),
      price: price.value,
      compareAtPrice: numberValue(formData, "compareAtPrice", "Giá niêm yết").value || undefined,
      image,
      gallery,
      description: value(formData, "description") || detailContent.value.contentText.slice(0, 220),
      detailContent: detailContent.value.content,
      detailContentFormat: detailContent.value.contentFormat,
      detailContentText: detailContent.value.contentText,
      ...(detailContent.value.contentFormat === "tiptap" ? { detailContentJson: detailContent.value.contentJson } : {}),
      warrantyPolicy: value(formData, "warrantyPolicy"),
      featured: formData.get("featured") === "on",
      status: value(formData, "status") || "draft",
      stockStatus: value(formData, "stockStatus") || "in-stock",
      tags: csv(formData, "tags"),
      specs: listValues(formData, "specs"),
      sortOrder: Number(value(formData, "sortOrder") || 0),
    });
    revalidateAdminAndPublic("/products");
    return success("Đã tạo sản phẩm mới.");
  } catch (error) {
    await cleanupUploadedOnFailure(uploadedUrls);
    return mutationError(error);
  }
}

export async function updateProduct(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePermission("products");
  await requireDbConnection();

  const id = value(formData, "_id");
  if (!id) return fieldError("Thiếu ID bản ghi.", { _id: "Thiếu ID bản ghi." });

  const fieldErrors = requiredFields(formData, {
    name: "Tên sản phẩm",
  });
  const price = numberValue(formData, "price", "Giá");
  if (price.error) fieldErrors.price = price.error;
  if (Object.keys(fieldErrors).length) return fieldError("Vui lòng kiểm tra thông tin sản phẩm.", fieldErrors);
  const imagePayloadError = validateImagePayload(formData, ["image", "gallery", "contentInlineImages"]);
  if (imagePayloadError) return fieldError(imagePayloadError, { image: imagePayloadError });

  const existing = await ProductModel.findById(id).lean();
  const uploadedUrls: string[] = [];

  try {
    const image = await resolveImageField(formData, "image", uploadedUrls);
    const gallery = await resolveGalleryField(formData, "gallery", uploadedUrls);
    const detailContent = await resolvePostContent(formData, uploadedUrls);
    if (!detailContent.ok) {
      await cleanupUploadedOnFailure(uploadedUrls);
      return fieldError(detailContent.message, { content: detailContent.message });
    }

    await ProductModel.findByIdAndUpdate(id, {
      $set: {
        id: value(formData, "id") || String(existing?.id || "") || slugify(value(formData, "name")),
        name: value(formData, "name"),
        category: value(formData, "categoryId"),
        categoryId: value(formData, "categoryId"),
        subcategoryId: value(formData, "subcategoryId"),
        subcategoryIds: value(formData, "subcategoryId") ? [value(formData, "subcategoryId")] : [],
        brand: value(formData, "brandId"),
        brandId: value(formData, "brandId"),
        price: price.value,
        compareAtPrice: numberValue(formData, "compareAtPrice", "Giá niêm yết").value || undefined,
        image,
        gallery,
        description: value(formData, "description") || detailContent.value.contentText.slice(0, 220),
        detailContent: detailContent.value.content,
        detailContentFormat: detailContent.value.contentFormat,
        detailContentText: detailContent.value.contentText,
        ...(detailContent.value.contentFormat === "tiptap" ? { detailContentJson: detailContent.value.contentJson } : {}),
        warrantyPolicy: value(formData, "warrantyPolicy"),
        featured: formData.get("featured") === "on",
        status: value(formData, "status") || "published",
        stockStatus: value(formData, "stockStatus") || "in-stock",
        tags: csv(formData, "tags"),
        specs: listValues(formData, "specs"),
        sortOrder: Number(value(formData, "sortOrder") || 0),
      },
      ...(detailContent.value.contentFormat === "plain" ? { $unset: { detailContentJson: "" } } : {}),
    });

    await cleanupRemovedMedia(
      [
        String(existing?.image || ""),
        ...((existing?.gallery as string[] | undefined) || []),
        ...collectTiptapImageUrls(existing?.detailContentJson),
      ],
      [image, ...gallery, ...collectTiptapImageUrls(detailContent.value.contentJson)],
    );
    revalidateAdminAndPublic("/products");
    return success("Đã cập nhật sản phẩm.");
  } catch (error) {
    await cleanupUploadedOnFailure(uploadedUrls);
    return mutationError(error);
  }
}

export async function deleteProduct(formData: FormData) {
  await requirePermission("products");
  await requireDbConnection();

  const existing = await ProductModel.findById(value(formData, "_id")).lean();
  await ProductModel.findByIdAndDelete(value(formData, "_id"));
  await cleanupRemovedMedia([
    String(existing?.image || ""),
    ...((existing?.gallery as string[] | undefined) || []),
    ...collectTiptapImageUrls(existing?.detailContentJson),
  ]);
  revalidateAdminAndPublic("/products");
}

export async function createProductCategory(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePermission("products");
  await requireDbConnection();

  const fieldErrors = requiredFields(formData, { name: "Tên danh mục" });
  if (Object.keys(fieldErrors).length) return fieldError("Vui lòng điền thông tin danh mục.", fieldErrors);
  const imagePayloadError = validateImagePayload(formData, ["image"]);
  if (imagePayloadError) return fieldError(imagePayloadError, { image: imagePayloadError });

  const name = value(formData, "name");
  const slug = value(formData, "slug") || slugify(name);
  if (!slug) return fieldError("Slug danh mục chưa hợp lệ.", { slug: "Slug danh mục chưa hợp lệ." });

  const uploadedUrls: string[] = [];
  try {
    const image = await resolveImageField(formData, "image", uploadedUrls);
    await ProductCategoryModel.create({
      name,
      slug,
      id: slug,
      description: value(formData, "description"),
      image,
      status: value(formData, "status") || "active",
      sortOrder: Number(value(formData, "sortOrder") || 0),
    });
    revalidateAdminAndPublic("/product-categories");
    revalidateAdminAndPublic("/products");
    return success("Đã tạo danh mục sản phẩm.");
  } catch (error) {
    await cleanupUploadedOnFailure(uploadedUrls);
    return mutationError(error);
  }
}

export async function updateProductCategory(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePermission("products");
  await requireDbConnection();

  const id = value(formData, "_id");
  if (!id) return fieldError("Thiếu ID bản ghi.", { _id: "Thiếu ID bản ghi." });
  const fieldErrors = requiredFields(formData, { name: "Tên danh mục" });
  if (Object.keys(fieldErrors).length) return fieldError("Vui lòng điền thông tin danh mục.", fieldErrors);
  const imagePayloadError = validateImagePayload(formData, ["image"]);
  if (imagePayloadError) return fieldError(imagePayloadError, { image: imagePayloadError });

  const name = value(formData, "name");
  const slug = value(formData, "slug") || slugify(name);
  if (!slug) return fieldError("Slug danh mục chưa hợp lệ.", { slug: "Slug danh mục chưa hợp lệ." });

  const existing = await ProductCategoryModel.findById(id).lean();
  const uploadedUrls: string[] = [];
  try {
    const image = await resolveImageField(formData, "image", uploadedUrls);
    await ProductCategoryModel.findByIdAndUpdate(id, {
      name,
      slug,
      id: slug,
      description: value(formData, "description"),
      image,
      status: value(formData, "status") || "active",
      sortOrder: Number(value(formData, "sortOrder") || 0),
    });
    await cleanupRemovedMedia([String(existing?.image || "")], [image]);
    revalidateAdminAndPublic("/product-categories");
    revalidateAdminAndPublic("/products");
    return success("Đã cập nhật danh mục sản phẩm.");
  } catch (error) {
    await cleanupUploadedOnFailure(uploadedUrls);
    return mutationError(error);
  }
}

export async function deleteProductCategory(formData: FormData) {
  await requirePermission("products");
  await requireDbConnection();

  const id = value(formData, "_id");
  const existing = await ProductCategoryModel.findById(id).lean();
  if (!existing) return;

  const linkedProducts = await ProductModel.countDocuments({ categoryId: String(existing.id || existing.slug || "") });
  if (linkedProducts > 0) {
    await ProductCategoryModel.findByIdAndUpdate(id, { status: "hidden" });
  } else {
    await ProductCategoryModel.findByIdAndDelete(id);
    await cleanupRemovedMedia([String(existing.image || "")]);
  }

  revalidateAdminAndPublic("/product-categories");
  revalidateAdminAndPublic("/products");
}

export async function createProductSubcategory(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePermission("products");
  await requireDbConnection();

  const fieldErrors = requiredFields(formData, { name: "Tên danh mục con" });
  if (Object.keys(fieldErrors).length) return fieldError("Vui lòng điền thông tin danh mục con.", fieldErrors);

  const name = value(formData, "name");
  const slug = value(formData, "slug") || slugify(name);
  if (!slug) return fieldError("Slug danh mục con chưa hợp lệ.", { slug: "Slug danh mục con chưa hợp lệ." });

  try {
    await ProductSubcategoryModel.create({
      name,
      slug,
      id: slug,
      type: "product-type",
      categoryId: value(formData, "categoryId"),
      description: value(formData, "description"),
      status: value(formData, "status") || "active",
      sortOrder: Number(value(formData, "sortOrder") || 0),
    });
    revalidateAdminAndPublic("/product-subcategories");
    revalidateAdminAndPublic("/products");
    return success("Đã tạo danh mục con.");
  } catch (error) {
    return mutationError(error);
  }
}

export async function updateProductSubcategory(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePermission("products");
  await requireDbConnection();

  const id = value(formData, "_id");
  if (!id) return fieldError("Thiếu ID bản ghi.", { _id: "Thiếu ID bản ghi." });
  const fieldErrors = requiredFields(formData, { name: "Tên danh mục con" });
  if (Object.keys(fieldErrors).length) return fieldError("Vui lòng điền thông tin danh mục con.", fieldErrors);

  const name = value(formData, "name");
  const slug = value(formData, "slug") || slugify(name);
  if (!slug) return fieldError("Slug danh mục con chưa hợp lệ.", { slug: "Slug danh mục con chưa hợp lệ." });

  try {
    await ProductSubcategoryModel.findByIdAndUpdate(id, {
      name,
      slug,
      id: slug,
      type: "product-type",
      categoryId: value(formData, "categoryId"),
      description: value(formData, "description"),
      status: value(formData, "status") || "active",
      sortOrder: Number(value(formData, "sortOrder") || 0),
    });
    revalidateAdminAndPublic("/product-subcategories");
    revalidateAdminAndPublic("/products");
    return success("Đã cập nhật danh mục con.");
  } catch (error) {
    return mutationError(error);
  }
}

export async function deleteProductSubcategory(formData: FormData) {
  await requirePermission("products");
  await requireDbConnection();

  const id = value(formData, "_id");
  const existing = await ProductSubcategoryModel.findById(id).lean();
  if (!existing) return;

  const key = String(existing.id || existing.slug || "");
  const linkedProducts = await ProductModel.countDocuments({
    $or: [{ subcategoryId: key }, { subcategoryIds: key }],
  });
  if (linkedProducts > 0) {
    await ProductSubcategoryModel.findByIdAndUpdate(id, { status: "hidden" });
  } else {
    await ProductSubcategoryModel.findByIdAndDelete(id);
  }

  revalidateAdminAndPublic("/product-subcategories");
  revalidateAdminAndPublic("/products");
}

export async function createProductBrand(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePermission("products");
  await requireDbConnection();

  const fieldErrors = requiredFields(formData, { name: "Tên nhãn hàng" });
  if (Object.keys(fieldErrors).length) return fieldError("Vui lòng điền thông tin nhãn hàng.", fieldErrors);
  const imagePayloadError = validateImagePayload(formData, ["logo"]);
  if (imagePayloadError) return fieldError(imagePayloadError, { logo: imagePayloadError });

  const name = value(formData, "name");
  const slug = value(formData, "slug") || slugify(name);
  if (!slug) return fieldError("Slug nhãn hàng chưa hợp lệ.", { slug: "Slug nhãn hàng chưa hợp lệ." });

  const uploadedUrls: string[] = [];
  try {
    const logo = await resolveImageField(formData, "logo", uploadedUrls);
    await ProductBrandModel.create({
      name,
      slug,
      id: slug,
      logo,
      description: value(formData, "description"),
      status: value(formData, "status") || "active",
      sortOrder: Number(value(formData, "sortOrder") || 0),
    });
    revalidateAdminAndPublic("/product-brands");
    revalidateAdminAndPublic("/products");
    return success("Đã tạo nhãn hàng.");
  } catch (error) {
    await cleanupUploadedOnFailure(uploadedUrls);
    return mutationError(error);
  }
}

export async function updateProductBrand(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePermission("products");
  await requireDbConnection();

  const id = value(formData, "_id");
  if (!id) return fieldError("Thiếu ID bản ghi.", { _id: "Thiếu ID bản ghi." });
  const fieldErrors = requiredFields(formData, { name: "Tên nhãn hàng" });
  if (Object.keys(fieldErrors).length) return fieldError("Vui lòng điền thông tin nhãn hàng.", fieldErrors);
  const imagePayloadError = validateImagePayload(formData, ["logo"]);
  if (imagePayloadError) return fieldError(imagePayloadError, { logo: imagePayloadError });

  const name = value(formData, "name");
  const slug = value(formData, "slug") || slugify(name);
  if (!slug) return fieldError("Slug nhãn hàng chưa hợp lệ.", { slug: "Slug nhãn hàng chưa hợp lệ." });

  const existing = await ProductBrandModel.findById(id).lean();
  const uploadedUrls: string[] = [];
  try {
    const logo = await resolveImageField(formData, "logo", uploadedUrls);
    await ProductBrandModel.findByIdAndUpdate(id, {
      name,
      slug,
      id: slug,
      logo,
      description: value(formData, "description"),
      status: value(formData, "status") || "active",
      sortOrder: Number(value(formData, "sortOrder") || 0),
    });
    await cleanupRemovedMedia([String(existing?.logo || "")], [logo]);
    revalidateAdminAndPublic("/product-brands");
    revalidateAdminAndPublic("/products");
    return success("Đã cập nhật nhãn hàng.");
  } catch (error) {
    await cleanupUploadedOnFailure(uploadedUrls);
    return mutationError(error);
  }
}

export async function deleteProductBrand(formData: FormData) {
  await requirePermission("products");
  await requireDbConnection();

  const id = value(formData, "_id");
  const existing = await ProductBrandModel.findById(id).lean();
  if (!existing) return;

  const key = String(existing.id || existing.slug || "");
  const linkedProducts = await ProductModel.countDocuments({ brandId: key });
  if (linkedProducts > 0) {
    await ProductBrandModel.findByIdAndUpdate(id, { status: "hidden" });
  } else {
    await ProductBrandModel.findByIdAndDelete(id);
    await cleanupRemovedMedia([String(existing.logo || "")]);
  }

  revalidateAdminAndPublic("/product-brands");
  revalidateAdminAndPublic("/products");
}

export async function updateProductPageSettings(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePermission("products");
  await requireDbConnection();

  const fieldErrors = requiredFields(formData, {
    heroTitle: "Tieu de hero",
    heroSubtitle: "Mô tả hero",
  });
  if (Object.keys(fieldErrors).length) return fieldError("Vui lòng kiểm tra nội dung hiển thị.", fieldErrors);
  const imagePayloadError = validateImagePayload(formData, ["heroImage"]);
  if (imagePayloadError) return fieldError(imagePayloadError, { heroImage: imagePayloadError });

  const existing = await ProductPageSettingModel.findOne().sort({ updatedAt: -1 }).lean();
  const uploadedUrls: string[] = [];
  try {
    const heroImage = await resolveImageField(formData, "heroImage", uploadedUrls);
    await ProductPageSettingModel.findOneAndUpdate(
      {},
      {
        heroEyebrow: value(formData, "heroEyebrow"),
        heroTitle: value(formData, "heroTitle"),
        heroSubtitle: value(formData, "heroSubtitle"),
        heroImage,
        primaryCtaLabel: value(formData, "primaryCtaLabel"),
        primaryCtaHref: value(formData, "primaryCtaHref"),
        secondaryCtaLabel: value(formData, "secondaryCtaLabel"),
        secondaryCtaHref: value(formData, "secondaryCtaHref"),
        promoTitle: value(formData, "promoTitle"),
        promoText: value(formData, "promoText"),
        seoTitle: value(formData, "seoTitle"),
        seoDescription: value(formData, "seoDescription"),
      },
      { upsert: true, new: true },
    );
    await cleanupRemovedMedia([String(existing?.heroImage || "")], [heroImage]);
    revalidateAdminAndPublic("/product-display");
    revalidateAdminAndPublic("/products");
    return success("Đã lưu hiển thị trang sản phẩm.");
  } catch (error) {
    await cleanupUploadedOnFailure(uploadedUrls);
    return mutationError(error);
  }
}

export async function createPromotion(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePermission("promotions");
  await requireDbConnection();

  const fieldErrors = requiredFields(formData, {
    title: "Tieu de",
    description: "Mô tả",
  });
  if (Object.keys(fieldErrors).length) return fieldError("Vui lòng điền thông tin ưu đãi.", fieldErrors);
  const imagePayloadError = validateImagePayload(formData, ["image"]);
  if (imagePayloadError) return fieldError(imagePayloadError, { image: imagePayloadError });

  const uploadedUrls: string[] = [];

  try {
    const image = await resolveImageField(formData, "image", uploadedUrls);

    await PromotionModel.create({
      title: value(formData, "title"),
      description: value(formData, "description"),
      content: value(formData, "content"),
      badge: value(formData, "badge"),
      image,
      branchIds: multiValues(formData, "branchIds"),
      seoTitle: value(formData, "seoTitle"),
      seoDescription: value(formData, "seoDescription"),
      status: value(formData, "status") || "draft",
    });
    revalidateAdminAndPublic("/promotions");
    return success("Đã tạo ưu đãi mới.");
  } catch (error) {
    await cleanupUploadedOnFailure(uploadedUrls);
    return mutationError(error);
  }
}

export async function updatePromotion(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePermission("promotions");
  await requireDbConnection();

  const id = value(formData, "_id");
  if (!id) return fieldError("Thiếu ID bản ghi.", { _id: "Thiếu ID bản ghi." });

  const fieldErrors = requiredFields(formData, {
    title: "Tieu de",
    description: "Mô tả",
  });
  if (Object.keys(fieldErrors).length) return fieldError("Vui lòng điền thông tin ưu đãi.", fieldErrors);
  const imagePayloadError = validateImagePayload(formData, ["image"]);
  if (imagePayloadError) return fieldError(imagePayloadError, { image: imagePayloadError });

  const existing = await PromotionModel.findById(id).lean();
  const uploadedUrls: string[] = [];

  try {
    const image = await resolveImageField(formData, "image", uploadedUrls);

    await PromotionModel.findByIdAndUpdate(id, {
      title: value(formData, "title"),
      description: value(formData, "description"),
      content: value(formData, "content"),
      badge: value(formData, "badge"),
      image,
      branchIds: multiValues(formData, "branchIds"),
      seoTitle: value(formData, "seoTitle"),
      seoDescription: value(formData, "seoDescription"),
      status: value(formData, "status") || "published",
    });

    await cleanupRemovedMedia([String(existing?.image || "")], [image]);
    revalidateAdminAndPublic("/promotions");
    return success("Đã cập nhật ưu đãi.");
  } catch (error) {
    await cleanupUploadedOnFailure(uploadedUrls);
    return mutationError(error);
  }
}

export async function deletePromotion(formData: FormData) {
  await requirePermission("promotions");
  await requireDbConnection();

  const existing = await PromotionModel.findById(value(formData, "_id")).lean();
  await PromotionModel.findByIdAndDelete(value(formData, "_id"));
  await cleanupRemovedMedia([String(existing?.image || "")]);
  revalidateAdminAndPublic("/promotions");
}

async function ensurePostCategoryName(categoryName: string) {
  const category = await PostCategoryModel.findOne({
    name: categoryName,
    status: "active",
  }).lean();
  if (category) return true;

  const categoryCount = await PostCategoryModel.countDocuments();
  if (categoryCount === 0) {
    return Boolean(categoryName);
  }

  return false;
}

export async function createPostCategory(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePermission("posts");
  await requireDbConnection();

  const fieldErrors = requiredFields(formData, {
    name: "Tên chuyên mục",
  });
  if (Object.keys(fieldErrors).length) return fieldError("Vui lòng điền thông tin chuyên mục.", fieldErrors);

  const name = value(formData, "name");
  const slug = value(formData, "slug") || slugify(name);
  if (!slug) return fieldError("Slug chuyên mục chưa hợp lệ.", { slug: "Slug chuyên mục chưa hợp lệ." });

  try {
    await PostCategoryModel.create({
      name,
      slug,
      id: slug,
      description: value(formData, "description"),
      status: value(formData, "status") || "active",
      sortOrder: Number(value(formData, "sortOrder") || 0),
    });
    revalidateAdminAndPublic("/post-categories");
    revalidateAdminAndPublic("/posts");
    return success("Đã tạo chuyên mục mới.");
  } catch (error) {
    return mutationError(error);
  }
}

export async function updatePostCategory(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePermission("posts");
  await requireDbConnection();

  const id = value(formData, "_id");
  if (!id) return fieldError("Thiếu ID bản ghi.", { _id: "Thiếu ID bản ghi." });

  const fieldErrors = requiredFields(formData, {
    name: "Tên chuyên mục",
  });
  if (Object.keys(fieldErrors).length) return fieldError("Vui lòng điền thông tin chuyên mục.", fieldErrors);

  const name = value(formData, "name");
  const slug = value(formData, "slug") || slugify(name);
  if (!slug) return fieldError("Slug chuyên mục chưa hợp lệ.", { slug: "Slug chuyên mục chưa hợp lệ." });

  const existing = await PostCategoryModel.findById(id).lean();

  try {
    await PostCategoryModel.findByIdAndUpdate(id, {
      name,
      slug,
      id: slug,
      description: value(formData, "description"),
      status: value(formData, "status") || "active",
      sortOrder: Number(value(formData, "sortOrder") || 0),
    });

    const previousName = String(existing?.name || "");
    if (previousName && previousName !== name) {
      await PostModel.updateMany({ category: previousName }, { $set: { category: name } });
    }

    revalidateAdminAndPublic("/post-categories");
    revalidateAdminAndPublic("/posts");
    return success("Đã cập nhật chuyên mục.");
  } catch (error) {
    return mutationError(error);
  }
}

export async function deletePostCategory(formData: FormData) {
  await requirePermission("posts");
  await requireDbConnection();

  const id = value(formData, "_id");
  const existing = await PostCategoryModel.findById(id).lean();
  if (!existing) return;

  const linkedPosts = await PostModel.countDocuments({ category: String(existing.name || "") });
  if (linkedPosts > 0) {
    await PostCategoryModel.findByIdAndUpdate(id, { status: "hidden" });
  } else {
    await PostCategoryModel.findByIdAndDelete(id);
  }

  revalidateAdminAndPublic("/post-categories");
  revalidateAdminAndPublic("/posts");
}

export async function createPost(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePermission("posts");
  await requireDbConnection();

  const fieldErrors = requiredFields(formData, {
    title: "Tieu de",
    category: "Chuyên mục",
  });
  const publishedAt = value(formData, "publishedAt") || new Date().toISOString().slice(0, 10);
  if (!isDateValue(publishedAt)) fieldErrors.publishedAt = "Ngay dang phai co dang YYYY-MM-DD.";
  if (Object.keys(fieldErrors).length) return fieldError("Vui lòng kiểm tra thông tin bài viết.", fieldErrors);
  if (!(await ensurePostCategoryName(value(formData, "category")))) {
    return fieldError("Chuyên mục không hợp lệ hoặc đang ẩn.", { category: "Vui lòng chọn chuyên mục có sẵn." });
  }
  const imagePayloadError = validateImagePayload(formData, ["image", "contentInlineImages"]);
  if (imagePayloadError) return fieldError(imagePayloadError, { image: imagePayloadError });

  const uploadedUrls: string[] = [];

  try {
    const postContent = await resolvePostContent(formData, uploadedUrls);
    if (!postContent.ok) {
      await cleanupUploadedOnFailure(uploadedUrls);
      return fieldError(postContent.message, { content: postContent.message });
    }
    const image = await resolveImageField(formData, "image", uploadedUrls);

    await PostModel.create({
      title: value(formData, "title"),
      excerpt: value(formData, "excerpt"),
      category: value(formData, "category"),
      image,
      publishedAt,
      content: postContent.value.content,
      contentFormat: postContent.value.contentFormat,
      contentText: postContent.value.contentText,
      ...(postContent.value.contentFormat === "tiptap" ? { contentJson: postContent.value.contentJson } : {}),
      seoTitle: value(formData, "seoTitle"),
      seoDescription: value(formData, "seoDescription"),
      status: value(formData, "status") || "draft",
    });
    revalidateAdminAndPublic("/posts");
    return success("Đã tạo bài viết mới.");
  } catch (error) {
    await cleanupUploadedOnFailure(uploadedUrls);
    return mutationError(error);
  }
}

export async function updatePost(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePermission("posts");
  await requireDbConnection();

  const id = value(formData, "_id");
  if (!id) return fieldError("Thiếu ID bản ghi.", { _id: "Thiếu ID bản ghi." });

  const fieldErrors = requiredFields(formData, {
    title: "Tieu de",
    category: "Chuyên mục",
  });
  const publishedAt = value(formData, "publishedAt") || new Date().toISOString().slice(0, 10);
  if (!isDateValue(publishedAt)) fieldErrors.publishedAt = "Ngay dang phai co dang YYYY-MM-DD.";
  if (Object.keys(fieldErrors).length) return fieldError("Vui lòng kiểm tra thông tin bài viết.", fieldErrors);
  if (!(await ensurePostCategoryName(value(formData, "category")))) {
    return fieldError("Chuyên mục không hợp lệ hoặc đang ẩn.", { category: "Vui lòng chọn chuyên mục có sẵn." });
  }
  const imagePayloadError = validateImagePayload(formData, ["image", "contentInlineImages"]);
  if (imagePayloadError) return fieldError(imagePayloadError, { image: imagePayloadError });

  const existing = await PostModel.findById(id).lean();
  const uploadedUrls: string[] = [];

  try {
    const postContent = await resolvePostContent(formData, uploadedUrls);
    if (!postContent.ok) {
      await cleanupUploadedOnFailure(uploadedUrls);
      return fieldError(postContent.message, { content: postContent.message });
    }
    const image = await resolveImageField(formData, "image", uploadedUrls);

    await PostModel.findByIdAndUpdate(id, {
      $set: {
        title: value(formData, "title"),
        excerpt: value(formData, "excerpt"),
        category: value(formData, "category"),
        image,
        publishedAt,
        content: postContent.value.content,
        contentFormat: postContent.value.contentFormat,
        contentText: postContent.value.contentText,
        ...(postContent.value.contentFormat === "tiptap" ? { contentJson: postContent.value.contentJson } : {}),
        seoTitle: value(formData, "seoTitle"),
        seoDescription: value(formData, "seoDescription"),
        status: value(formData, "status") || "published",
      },
      ...(postContent.value.contentFormat === "plain" ? { $unset: { contentJson: "" } } : {}),
    });

    await cleanupRemovedMedia(
      [String(existing?.image || ""), ...collectTiptapImageUrls(existing?.contentJson)],
      [image, ...collectTiptapImageUrls(postContent.value.contentJson)],
    );
    revalidateAdminAndPublic("/posts");
    return success("Đã cập nhật bài viết.");
  } catch (error) {
    await cleanupUploadedOnFailure(uploadedUrls);
    return mutationError(error);
  }
}

export async function deletePost(formData: FormData) {
  await requirePermission("posts");
  await requireDbConnection();

  const existing = await PostModel.findById(value(formData, "_id")).lean();
  await PostModel.findByIdAndDelete(value(formData, "_id"));
  await cleanupRemovedMedia([String(existing?.image || ""), ...collectTiptapImageUrls(existing?.contentJson)]);
  revalidateAdminAndPublic("/posts");
}

export async function updateBookingStatus(formData: FormData) {
  await requirePermission("bookings");
  await requireDbConnection();
  await BookingModel.findByIdAndUpdate(value(formData, "id"), {
    status: value(formData, "status"),
  });
  revalidateAdminAndPublic("/bookings");
}

export async function deleteBooking(formData: FormData) {
  await requirePermission("bookings");
  await requireDbConnection();
  await BookingModel.findByIdAndDelete(value(formData, "id"));
  revalidateAdminAndPublic("/bookings");
}

export async function updateSalesOrderStatus(formData: FormData) {
  await requirePermission("sales");
  await requireDbConnection();
  await SalesOrderModel.findByIdAndUpdate(value(formData, "id"), {
    status: value(formData, "status"),
  });
  revalidatePath("/sales-orders");
}

export async function deleteSalesOrder(formData: FormData) {
  await requirePermission("sales");
  await requireDbConnection();
  await SalesOrderModel.findByIdAndDelete(value(formData, "id"));
  revalidatePath("/sales-orders");
}

export async function updateSiteSettings(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePermission("settings");
  await requireDbConnection();

  const fieldErrors = requiredFields(formData, {
    siteName: "Ten website",
    defaultSeoTitle: "SEO title mac dinh",
  });
  if (Object.keys(fieldErrors).length) return fieldError("Vui lòng kiểm tra settings.", fieldErrors);
  const imagePayloadError = validateImagePayload(formData, ["heroImage"]);
  if (imagePayloadError) return fieldError(imagePayloadError, { heroImage: imagePayloadError });

  const existing = await SiteSettingModel.findOne().sort({ updatedAt: -1 }).lean();
  const uploadedUrls: string[] = [];

  try {
    const heroImage = await resolveImageField(formData, "heroImage", uploadedUrls);

    await SiteSettingModel.findOneAndUpdate(
      {},
      {
        $set: {
          siteName: value(formData, "siteName"),
          heroImage,
          gaId: value(formData, "gaId"),
          metaPixelId: value(formData, "metaPixelId"),
          tiktokPixelId: value(formData, "tiktokPixelId"),
          defaultSeoTitle: value(formData, "defaultSeoTitle"),
          defaultSeoDescription: value(formData, "defaultSeoDescription"),
        },
        $unset: { heroCardImage: "" },
      },
      { upsert: true, new: true },
    );

    await cleanupRemovedMedia(
      [String(existing?.heroImage || ""), String(existing?.heroCardImage || "")],
      [heroImage],
    );
    revalidateAdminAndPublic("/settings");
    return success("Đã lưu settings.");
  } catch (error) {
    await cleanupUploadedOnFailure(uploadedUrls);
    return mutationError(error);
  }
}

export async function updateAdminUserRole(formData: FormData) {
  const session = await requirePermission("users");
  await requireDbConnection();

  const id = value(formData, "_id");
  const role = value(formData, "role") as AdminRole;
  const allowedRoles: AdminRole[] = ["admin", "manager", "operator", "pending"];
  if (!id || !allowedRoles.includes(role)) return;

  await AdminUserModel.findByIdAndUpdate(id, { role });
  revalidatePath("/users");

  const updatedUser = await AdminUserModel.findById(id).lean();
  if (updatedUser?.email && String(updatedUser.email).toLowerCase() === session.email.toLowerCase()) {
    revalidatePath("/");
  }
}

export async function updateAdminUserStatus(formData: FormData) {
  const session = await requirePermission("users");
  await requireDbConnection();

  const id = value(formData, "_id");
  const status = value(formData, "status") === "disabled" ? "disabled" : "active";
  if (!id) return;

  const target = await AdminUserModel.findById(id).lean();
  if (target?.email && String(target.email).toLowerCase() === session.email.toLowerCase() && status === "disabled") {
    return;
  }

  await AdminUserModel.findByIdAndUpdate(id, { status });
  revalidatePath("/users");
}
