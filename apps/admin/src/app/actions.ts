"use server";

import {
  BookingModel,
  BranchModel,
  MediaAssetModel,
  PostModel,
  ProductModel,
  PromotionModel,
  SiteSettingModel,
  connectDb,
} from "@99billiards/db";
import { deleteObjectByPublicUrl } from "@99billiards/db/r2";
import { requireAdmin } from "@/lib/auth";
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

function uniqueUrls(urls: string[]) {
  return Array.from(new Set(urls.map((url) => url.trim()).filter(Boolean)));
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
      fieldErrors[key] = `${label} la bat buoc.`;
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

function mutationError(error: unknown): AdminActionState {
  console.error("Admin mutation failed", error);
  if (error instanceof Error && error.message.includes("E11000")) {
    return { ok: false, message: "Ma hoac slug da ton tai. Vui long dung gia tri khac." };
  }
  return { ok: false, message: "Luu du lieu chua thanh cong. Vui long kiem tra lai thong tin." };
}

export async function createBranch(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  await requireDbConnection();

  const fieldErrors = requiredFields(formData, {
    code: "Ma co so",
    name: "Ten co so",
    district: "Khu vuc",
    address: "Dia chi",
  });
  if (Object.keys(fieldErrors).length) return fieldError("Vui long dien cac truong bat buoc.", fieldErrors);

  try {
    await BranchModel.create({
      code: value(formData, "code"),
      name: value(formData, "name"),
      district: value(formData, "district"),
      address: value(formData, "address"),
      phone: value(formData, "phone"),
      hours: value(formData, "hours") || "24/24",
      status: value(formData, "status") || "open",
      image: value(formData, "image"),
      gallery: csv(formData, "gallery"),
      highlights: csv(formData, "highlights"),
      amenities: csv(formData, "amenities"),
      description: value(formData, "description"),
      mapUrl: value(formData, "mapUrl"),
      mapEmbedUrl: value(formData, "mapEmbedUrl"),
      seoTitle: value(formData, "seoTitle"),
      seoDescription: value(formData, "seoDescription"),
    });
    revalidateAdminAndPublic("/branches");
    return success("Da tao co so moi.");
  } catch (error) {
    return mutationError(error);
  }
}

export async function updateBranch(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  await requireDbConnection();

  const id = value(formData, "_id");
  if (!id) return fieldError("Thieu ID ban ghi.", { _id: "Thieu ID ban ghi." });

  const fieldErrors = requiredFields(formData, {
    code: "Ma co so",
    name: "Ten co so",
    district: "Khu vuc",
    address: "Dia chi",
  });
  if (Object.keys(fieldErrors).length) return fieldError("Vui long dien cac truong bat buoc.", fieldErrors);

  const existing = await BranchModel.findById(id).lean();
  const image = value(formData, "image");
  const gallery = csv(formData, "gallery");

  try {
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
    return success("Da cap nhat co so.");
  } catch (error) {
    return mutationError(error);
  }
}

export async function deleteBranch(formData: FormData) {
  await requireAdmin();
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
  await requireAdmin();
  await requireDbConnection();

  const fieldErrors = requiredFields(formData, {
    name: "Ten san pham",
    category: "Nhom",
  });
  const price = numberValue(formData, "price", "Gia");
  if (price.error) fieldErrors.price = price.error;
  if (Object.keys(fieldErrors).length) return fieldError("Vui long kiem tra thong tin san pham.", fieldErrors);

  try {
    await ProductModel.create({
      name: value(formData, "name"),
      category: value(formData, "category"),
      price: price.value,
      image: value(formData, "image"),
      description: value(formData, "description"),
      featured: formData.get("featured") === "on",
      status: "published",
    });
    revalidateAdminAndPublic("/products");
    return success("Da tao san pham moi.");
  } catch (error) {
    return mutationError(error);
  }
}

export async function updateProduct(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  await requireDbConnection();

  const id = value(formData, "_id");
  if (!id) return fieldError("Thieu ID ban ghi.", { _id: "Thieu ID ban ghi." });

  const fieldErrors = requiredFields(formData, {
    name: "Ten san pham",
    category: "Nhom",
  });
  const price = numberValue(formData, "price", "Gia");
  if (price.error) fieldErrors.price = price.error;
  if (Object.keys(fieldErrors).length) return fieldError("Vui long kiem tra thong tin san pham.", fieldErrors);

  const existing = await ProductModel.findById(id).lean();
  const image = value(formData, "image");

  try {
    await ProductModel.findByIdAndUpdate(id, {
      name: value(formData, "name"),
      category: value(formData, "category"),
      price: price.value,
      image,
      description: value(formData, "description"),
      featured: formData.get("featured") === "on",
      status: value(formData, "status") || "published",
    });

    await cleanupRemovedMedia([String(existing?.image || "")], [image]);
    revalidateAdminAndPublic("/products");
    return success("Da cap nhat san pham.");
  } catch (error) {
    return mutationError(error);
  }
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  await requireDbConnection();

  const existing = await ProductModel.findById(value(formData, "_id")).lean();
  await ProductModel.findByIdAndDelete(value(formData, "_id"));
  await cleanupRemovedMedia([String(existing?.image || "")]);
  revalidateAdminAndPublic("/products");
}

export async function createPromotion(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  await requireDbConnection();

  const fieldErrors = requiredFields(formData, {
    title: "Tieu de",
    description: "Mo ta",
  });
  if (Object.keys(fieldErrors).length) return fieldError("Vui long dien thong tin uu dai.", fieldErrors);

  try {
    await PromotionModel.create({
      title: value(formData, "title"),
      description: value(formData, "description"),
      content: value(formData, "content"),
      badge: value(formData, "badge"),
      image: value(formData, "image"),
      branchIds: csv(formData, "branchIds"),
      seoTitle: value(formData, "seoTitle"),
      seoDescription: value(formData, "seoDescription"),
      status: "published",
    });
    revalidateAdminAndPublic("/promotions");
    return success("Da tao uu dai moi.");
  } catch (error) {
    return mutationError(error);
  }
}

export async function updatePromotion(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  await requireDbConnection();

  const id = value(formData, "_id");
  if (!id) return fieldError("Thieu ID ban ghi.", { _id: "Thieu ID ban ghi." });

  const fieldErrors = requiredFields(formData, {
    title: "Tieu de",
    description: "Mo ta",
  });
  if (Object.keys(fieldErrors).length) return fieldError("Vui long dien thong tin uu dai.", fieldErrors);

  const existing = await PromotionModel.findById(id).lean();
  const image = value(formData, "image");

  try {
    await PromotionModel.findByIdAndUpdate(id, {
      title: value(formData, "title"),
      description: value(formData, "description"),
      content: value(formData, "content"),
      badge: value(formData, "badge"),
      image,
      branchIds: csv(formData, "branchIds"),
      seoTitle: value(formData, "seoTitle"),
      seoDescription: value(formData, "seoDescription"),
      status: value(formData, "status") || "published",
    });

    await cleanupRemovedMedia([String(existing?.image || "")], [image]);
    revalidateAdminAndPublic("/promotions");
    return success("Da cap nhat uu dai.");
  } catch (error) {
    return mutationError(error);
  }
}

export async function deletePromotion(formData: FormData) {
  await requireAdmin();
  await requireDbConnection();

  const existing = await PromotionModel.findById(value(formData, "_id")).lean();
  await PromotionModel.findByIdAndDelete(value(formData, "_id"));
  await cleanupRemovedMedia([String(existing?.image || "")]);
  revalidateAdminAndPublic("/promotions");
}

export async function createPost(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  await requireDbConnection();

  const fieldErrors = requiredFields(formData, {
    title: "Tieu de",
    category: "Chuyen muc",
  });
  const publishedAt = value(formData, "publishedAt") || new Date().toISOString().slice(0, 10);
  if (!isDateValue(publishedAt)) fieldErrors.publishedAt = "Ngay dang phai co dang YYYY-MM-DD.";
  if (Object.keys(fieldErrors).length) return fieldError("Vui long kiem tra thong tin bai viet.", fieldErrors);

  try {
    await PostModel.create({
      title: value(formData, "title"),
      excerpt: value(formData, "excerpt"),
      category: value(formData, "category"),
      image: value(formData, "image"),
      publishedAt,
      content: value(formData, "content"),
      seoTitle: value(formData, "seoTitle"),
      seoDescription: value(formData, "seoDescription"),
      status: "published",
    });
    revalidateAdminAndPublic("/posts");
    return success("Da tao bai viet moi.");
  } catch (error) {
    return mutationError(error);
  }
}

export async function updatePost(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  await requireDbConnection();

  const id = value(formData, "_id");
  if (!id) return fieldError("Thieu ID ban ghi.", { _id: "Thieu ID ban ghi." });

  const fieldErrors = requiredFields(formData, {
    title: "Tieu de",
    category: "Chuyen muc",
  });
  const publishedAt = value(formData, "publishedAt") || new Date().toISOString().slice(0, 10);
  if (!isDateValue(publishedAt)) fieldErrors.publishedAt = "Ngay dang phai co dang YYYY-MM-DD.";
  if (Object.keys(fieldErrors).length) return fieldError("Vui long kiem tra thong tin bai viet.", fieldErrors);

  const existing = await PostModel.findById(id).lean();
  const image = value(formData, "image");

  try {
    await PostModel.findByIdAndUpdate(id, {
      title: value(formData, "title"),
      excerpt: value(formData, "excerpt"),
      category: value(formData, "category"),
      image,
      publishedAt,
      content: value(formData, "content"),
      seoTitle: value(formData, "seoTitle"),
      seoDescription: value(formData, "seoDescription"),
      status: value(formData, "status") || "published",
    });

    await cleanupRemovedMedia([String(existing?.image || "")], [image]);
    revalidateAdminAndPublic("/posts");
    return success("Da cap nhat bai viet.");
  } catch (error) {
    return mutationError(error);
  }
}

export async function deletePost(formData: FormData) {
  await requireAdmin();
  await requireDbConnection();

  const existing = await PostModel.findById(value(formData, "_id")).lean();
  await PostModel.findByIdAndDelete(value(formData, "_id"));
  await cleanupRemovedMedia([String(existing?.image || "")]);
  revalidateAdminAndPublic("/posts");
}

export async function updateBookingStatus(formData: FormData) {
  await requireAdmin();
  await requireDbConnection();
  await BookingModel.findByIdAndUpdate(value(formData, "id"), {
    status: value(formData, "status"),
  });
  revalidateAdminAndPublic("/bookings");
}

export async function deleteBooking(formData: FormData) {
  await requireAdmin();
  await requireDbConnection();
  await BookingModel.findByIdAndDelete(value(formData, "id"));
  revalidateAdminAndPublic("/bookings");
}

export async function updateSiteSettings(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  await requireDbConnection();

  const fieldErrors = requiredFields(formData, {
    siteName: "Ten website",
    defaultSeoTitle: "SEO title mac dinh",
  });
  if (Object.keys(fieldErrors).length) return fieldError("Vui long kiem tra settings.", fieldErrors);

  const existing = await SiteSettingModel.findOne().sort({ updatedAt: -1 }).lean();
  const heroImage = value(formData, "heroImage");
  const heroCardImage = value(formData, "heroCardImage");

  try {
    await SiteSettingModel.findOneAndUpdate(
      {},
      {
        siteName: value(formData, "siteName"),
        heroImage,
        heroCardImage,
        gaId: value(formData, "gaId"),
        metaPixelId: value(formData, "metaPixelId"),
        tiktokPixelId: value(formData, "tiktokPixelId"),
        defaultSeoTitle: value(formData, "defaultSeoTitle"),
        defaultSeoDescription: value(formData, "defaultSeoDescription"),
      },
      { upsert: true, new: true },
    );

    await cleanupRemovedMedia(
      [String(existing?.heroImage || ""), String(existing?.heroCardImage || "")],
      [heroImage, heroCardImage],
    );
    revalidateAdminAndPublic("/settings");
    return success("Da luu settings.");
  } catch (error) {
    return mutationError(error);
  }
}
