"use server";

import {
  BookingModel,
  BranchModel,
  PostModel,
  ProductModel,
  PromotionModel,
  SiteSettingModel,
  connectDb,
} from "@99billiards/db";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function csv(formData: FormData, key: string) {
  return value(formData, key)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function revalidateAdminAndPublic(path: string) {
  revalidatePath("/");
  revalidatePath(path);
}

export async function createBranch(formData: FormData) {
  await requireAdmin();
  if (!(await connectDb())) return;
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
}

export async function updateBranch(formData: FormData) {
  await requireAdmin();
  if (!(await connectDb())) return;
  await BranchModel.findByIdAndUpdate(value(formData, "_id"), {
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
}

export async function deleteBranch(formData: FormData) {
  await requireAdmin();
  if (!(await connectDb())) return;
  await BranchModel.findByIdAndDelete(value(formData, "_id"));
  revalidateAdminAndPublic("/branches");
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  if (!(await connectDb())) return;
  await ProductModel.create({
    name: value(formData, "name"),
    category: value(formData, "category"),
    price: Number(value(formData, "price") || 0),
    image: value(formData, "image"),
    description: value(formData, "description"),
    featured: formData.get("featured") === "on",
    status: "published",
  });
  revalidateAdminAndPublic("/products");
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();
  if (!(await connectDb())) return;
  await ProductModel.findByIdAndUpdate(value(formData, "_id"), {
    name: value(formData, "name"),
    category: value(formData, "category"),
    price: Number(value(formData, "price") || 0),
    image: value(formData, "image"),
    description: value(formData, "description"),
    featured: formData.get("featured") === "on",
    status: value(formData, "status") || "published",
  });
  revalidateAdminAndPublic("/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  if (!(await connectDb())) return;
  await ProductModel.findByIdAndDelete(value(formData, "_id"));
  revalidateAdminAndPublic("/products");
}

export async function createPromotion(formData: FormData) {
  await requireAdmin();
  if (!(await connectDb())) return;
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
}

export async function updatePromotion(formData: FormData) {
  await requireAdmin();
  if (!(await connectDb())) return;
  await PromotionModel.findByIdAndUpdate(value(formData, "_id"), {
    title: value(formData, "title"),
    description: value(formData, "description"),
    content: value(formData, "content"),
    badge: value(formData, "badge"),
    image: value(formData, "image"),
    branchIds: csv(formData, "branchIds"),
    seoTitle: value(formData, "seoTitle"),
    seoDescription: value(formData, "seoDescription"),
    status: value(formData, "status") || "published",
  });
  revalidateAdminAndPublic("/promotions");
}

export async function deletePromotion(formData: FormData) {
  await requireAdmin();
  if (!(await connectDb())) return;
  await PromotionModel.findByIdAndDelete(value(formData, "_id"));
  revalidateAdminAndPublic("/promotions");
}

export async function createPost(formData: FormData) {
  await requireAdmin();
  if (!(await connectDb())) return;
  await PostModel.create({
    title: value(formData, "title"),
    excerpt: value(formData, "excerpt"),
    category: value(formData, "category"),
    image: value(formData, "image"),
    publishedAt: value(formData, "publishedAt") || new Date().toISOString().slice(0, 10),
    content: value(formData, "content"),
    seoTitle: value(formData, "seoTitle"),
    seoDescription: value(formData, "seoDescription"),
    status: "published",
  });
  revalidateAdminAndPublic("/posts");
}

export async function updatePost(formData: FormData) {
  await requireAdmin();
  if (!(await connectDb())) return;
  await PostModel.findByIdAndUpdate(value(formData, "_id"), {
    title: value(formData, "title"),
    excerpt: value(formData, "excerpt"),
    category: value(formData, "category"),
    image: value(formData, "image"),
    publishedAt: value(formData, "publishedAt") || new Date().toISOString().slice(0, 10),
    content: value(formData, "content"),
    seoTitle: value(formData, "seoTitle"),
    seoDescription: value(formData, "seoDescription"),
    status: value(formData, "status") || "published",
  });
  revalidateAdminAndPublic("/posts");
}

export async function deletePost(formData: FormData) {
  await requireAdmin();
  if (!(await connectDb())) return;
  await PostModel.findByIdAndDelete(value(formData, "_id"));
  revalidateAdminAndPublic("/posts");
}

export async function updateBookingStatus(formData: FormData) {
  await requireAdmin();
  if (!(await connectDb())) return;
  await BookingModel.findByIdAndUpdate(value(formData, "id"), {
    status: value(formData, "status"),
  });
  revalidateAdminAndPublic("/bookings");
}

export async function deleteBooking(formData: FormData) {
  await requireAdmin();
  if (!(await connectDb())) return;
  await BookingModel.findByIdAndDelete(value(formData, "id"));
  revalidateAdminAndPublic("/bookings");
}

export async function updateSiteSettings(formData: FormData) {
  await requireAdmin();
  if (!(await connectDb())) return;
  await SiteSettingModel.findOneAndUpdate(
    {},
    {
      siteName: value(formData, "siteName"),
      heroImage: value(formData, "heroImage"),
      heroCardImage: value(formData, "heroCardImage"),
      gaId: value(formData, "gaId"),
      metaPixelId: value(formData, "metaPixelId"),
      tiktokPixelId: value(formData, "tiktokPixelId"),
      defaultSeoTitle: value(formData, "defaultSeoTitle"),
      defaultSeoDescription: value(formData, "defaultSeoDescription"),
    },
    { upsert: true, new: true },
  );
  revalidateAdminAndPublic("/settings");
}
