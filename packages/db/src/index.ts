import mongoose, { Schema } from "mongoose";
import type { ProductPageSettings, SiteSettings } from "./seed";

declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: Promise<typeof mongoose> | undefined;
}

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  const isProductionRuntime =
    process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build";

  if (!uri) {
    if (isProductionRuntime) {
      throw new Error("MONGODB_URI is required in production");
    }
    return null;
  }

  if (!global.mongooseConnection) {
    global.mongooseConnection = mongoose
      .connect(uri, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
      .catch((error) => {
        console.warn(`MongoDB connection failed: ${error.message}`);
        global.mongooseConnection = undefined;
        if (isProductionRuntime) {
          throw error;
        }
        return null as unknown as typeof mongoose;
      });
  }

  const connection = await global.mongooseConnection;
  return connection?.connection?.readyState === 1 ? connection : null;
}

const branchSchema = new Schema(
  {
    id: String,
    code: String,
    name: String,
    district: String,
    address: String,
    phone: String,
    hours: String,
    status: String,
    tables: Number,
    mapUrl: String,
    mapEmbedUrl: String,
    image: String,
    gallery: [String],
    highlights: [String],
    amenities: [String],
    description: String,
    seoTitle: String,
    seoDescription: String,
    sortOrder: Number,
  },
  { timestamps: true },
);
branchSchema.index({ code: 1 }, { unique: true, sparse: true });
branchSchema.index({ district: 1, status: 1 });
branchSchema.index({ sortOrder: 1 });

const productSchema = new Schema(
  {
    id: String,
    name: String,
    category: String,
    categoryId: String,
    subcategoryId: String,
    subcategoryIds: [String],
    brand: String,
    brandId: String,
    price: Number,
    compareAtPrice: Number,
    image: String,
    gallery: [String],
    description: String,
    detailContent: String,
    detailContentFormat: { type: String, enum: ["plain", "tiptap"], default: "plain" },
    detailContentJson: Schema.Types.Mixed,
    detailContentText: String,
    warrantyPolicy: String,
    featured: Boolean,
    status: { type: String, default: "published" },
    stockStatus: { type: String, default: "in-stock" },
    tags: [String],
    specs: [String],
    sortOrder: Number,
  },
  { timestamps: true },
);
productSchema.index({ category: 1, status: 1 });
productSchema.index({ categoryId: 1, status: 1 });
productSchema.index({ subcategoryIds: 1 });
productSchema.index({ brandId: 1 });
productSchema.index({ name: "text", description: "text" });

const productCategorySchema = new Schema(
  {
    id: String,
    slug: String,
    name: String,
    description: String,
    image: String,
    status: { type: String, enum: ["active", "hidden"], default: "active" },
    sortOrder: Number,
  },
  { timestamps: true },
);
productCategorySchema.index({ slug: 1 }, { unique: true, sparse: true });
productCategorySchema.index({ status: 1, sortOrder: 1 });

const productSubcategorySchema = new Schema(
  {
    id: String,
    slug: String,
    name: String,
    type: { type: String, enum: ["product-type"], default: "product-type" },
    categoryId: String,
    description: String,
    image: String,
    status: { type: String, enum: ["active", "hidden"], default: "active" },
    sortOrder: Number,
  },
  { timestamps: true },
);
productSubcategorySchema.index({ slug: 1 }, { unique: true, sparse: true });
productSubcategorySchema.index({ categoryId: 1, type: 1, status: 1 });

const productBrandSchema = new Schema(
  {
    id: String,
    slug: String,
    name: String,
    logo: String,
    description: String,
    status: { type: String, enum: ["active", "hidden"], default: "active" },
    sortOrder: Number,
  },
  { timestamps: true },
);
productBrandSchema.index({ slug: 1 }, { unique: true, sparse: true });
productBrandSchema.index({ status: 1, sortOrder: 1 });

const promotionSchema = new Schema(
  {
    id: String,
    title: String,
    description: String,
    content: String,
    badge: String,
    image: String,
    branchIds: [String],
    seoTitle: String,
    seoDescription: String,
    status: { type: String, default: "published" },
  },
  { timestamps: true },
);
promotionSchema.index({ status: 1, createdAt: -1 });
promotionSchema.index({ branchIds: 1 });

const postSchema = new Schema(
  {
    id: String,
    title: String,
    excerpt: String,
    category: String,
    content: String,
    contentFormat: { type: String, enum: ["plain", "tiptap"], default: "plain" },
    contentJson: Schema.Types.Mixed,
    contentText: String,
    publishedAt: String,
    image: String,
    status: { type: String, default: "published" },
  },
  { timestamps: true },
);
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ title: "text", excerpt: "text", content: "text", contentText: "text" });

const postCategorySchema = new Schema(
  {
    id: String,
    slug: String,
    name: String,
    description: String,
    status: { type: String, enum: ["active", "hidden"], default: "active" },
    sortOrder: Number,
  },
  { timestamps: true },
);
postCategorySchema.index({ slug: 1 }, { unique: true, sparse: true });
postCategorySchema.index({ status: 1, sortOrder: 1 });

const bookingSchema = new Schema(
  {
    customerName: String,
    phone: String,
    branchId: String,
    guestCount: Number,
    bookingDate: String,
    bookingTime: String,
    promotionId: String,
    note: String,
    status: { type: String, default: "new" },
  },
  { timestamps: true },
);
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ branchId: 1, bookingDate: 1, bookingTime: 1 });

const salesOrderSchema = new Schema(
  {
    orderCode: String,
    customerName: String,
    phone: String,
    email: String,
    address: String,
    province: String,
    district: String,
    ward: String,
    note: String,
    paymentMethod: { type: String, default: "cod" },
    items: [
      {
        productId: String,
        name: String,
        image: String,
        price: Number,
        quantity: Number,
        total: Number,
      },
    ],
    subtotal: Number,
    discountCode: String,
    discountTotal: { type: Number, default: 0 },
    total: Number,
    status: { type: String, default: "new" },
  },
  { timestamps: true },
);
salesOrderSchema.index({ status: 1, createdAt: -1 });
salesOrderSchema.index({ orderCode: 1 }, { unique: true, sparse: true });
salesOrderSchema.index({ phone: 1, createdAt: -1 });

const siteSettingSchema = new Schema(
  {
    siteName: String,
    heroImage: String,
    gaId: String,
    metaPixelId: String,
    tiktokPixelId: String,
    defaultSeoTitle: String,
    defaultSeoDescription: String,
  },
  { timestamps: true },
);

const mediaAssetSchema = new Schema(
  {
    filename: String,
    url: String,
    contentType: String,
    size: Number,
    source: { type: String, default: "r2" },
  },
  { timestamps: true },
);

const productPageSettingSchema = new Schema(
  {
    heroEyebrow: String,
    heroTitle: String,
    heroSubtitle: String,
    heroImage: String,
    primaryCtaLabel: String,
    primaryCtaHref: String,
    secondaryCtaLabel: String,
    secondaryCtaHref: String,
    promoTitle: String,
    promoText: String,
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true },
);
mediaAssetSchema.index({ createdAt: -1 });

const adminUserSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    name: String,
    picture: String,
    provider: { type: String, default: "google" },
    googleId: String,
    role: {
      type: String,
      enum: ["admin", "manager", "operator", "pending"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
    },
    lastLoginAt: Date,
  },
  { timestamps: true },
);
adminUserSchema.index({ email: 1 }, { unique: true });
adminUserSchema.index({ role: 1, status: 1 });

export const BranchModel = mongoose.models.Branch || mongoose.model("Branch", branchSchema);
export const ProductModel = mongoose.models.Product || mongoose.model("Product", productSchema);
export const ProductCategoryModel =
  mongoose.models.ProductCategory || mongoose.model("ProductCategory", productCategorySchema);
export const ProductSubcategoryModel =
  mongoose.models.ProductSubcategory || mongoose.model("ProductSubcategory", productSubcategorySchema);
export const ProductBrandModel =
  mongoose.models.ProductBrand || mongoose.model("ProductBrand", productBrandSchema);
export const PromotionModel =
  mongoose.models.Promotion || mongoose.model("Promotion", promotionSchema);
export const PostModel = mongoose.models.Post || mongoose.model("Post", postSchema);
export const PostCategoryModel =
  mongoose.models.PostCategory || mongoose.model("PostCategory", postCategorySchema);
export const BookingModel = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export const SalesOrderModel =
  mongoose.models.SalesOrder || mongoose.model("SalesOrder", salesOrderSchema);
export const SiteSettingModel =
  mongoose.models.SiteSetting || mongoose.model("SiteSetting", siteSettingSchema);
export const ProductPageSettingModel =
  mongoose.models.ProductPageSetting || mongoose.model("ProductPageSetting", productPageSettingSchema);
export const MediaAssetModel =
  mongoose.models.MediaAsset || mongoose.model("MediaAsset", mediaAssetSchema);
export const AdminUserModel =
  mongoose.models.AdminUser || mongoose.model("AdminUser", adminUserSchema);

function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function normalizeRows<T extends { _id?: unknown; id?: string; code?: string }>(rows: T[]) {
  return rows.map((row) => ({
    ...row,
    id: row.id || row.code?.toLowerCase() || String(row._id || ""),
    _id: row._id ? String(row._id) : undefined,
  }));
}

export async function getBranches() {
  if (!(await connectDb())) return [];
  const docs = await BranchModel.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
  return normalizeRows(plain(docs));
}

export async function getBranchById(id: string) {
  const rows = await getBranches();
  return rows.find((branch) => branch.id === id || branch.code?.toLowerCase() === id.toLowerCase()) || null;
}

export async function getProducts() {
  if (!(await connectDb())) return [];
  const docs = await ProductModel.find({ status: "published" }).sort({ sortOrder: 1, createdAt: -1 }).lean();
  return normalizeRows(plain(docs));
}

export async function getAdminProducts() {
  if (!(await connectDb())) return [];
  const docs = await ProductModel.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
  return normalizeRows(plain(docs));
}

export async function getProductById(id: string) {
  const rows = await getProducts();
  return (
    rows.find(
      (product) =>
        product.id === id ||
        product._id === id ||
        String(product.name || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") === id,
    ) || null
  );
}

export async function getProductCategories({ includeHidden = false } = {}) {
  if (!(await connectDb())) return [];

  const filter = includeHidden ? {} : { status: "active" };
  const docs = await ProductCategoryModel.find(filter).sort({ sortOrder: 1, name: 1 }).lean();
  return normalizeRows(plain(docs));
}

export async function getProductSubcategories({ includeHidden = false } = {}) {
  if (!(await connectDb())) return [];

  const filter = includeHidden ? {} : { status: "active" };
  const docs = await ProductSubcategoryModel.find(filter).sort({ sortOrder: 1, name: 1 }).lean();
  return normalizeRows(plain(docs));
}

export async function getProductBrands({ includeHidden = false } = {}) {
  if (!(await connectDb())) return [];

  const filter = includeHidden ? {} : { status: "active" };
  const docs = await ProductBrandModel.find(filter).sort({ sortOrder: 1, name: 1 }).lean();
  return normalizeRows(plain(docs));
}

export async function getProductPageSettings() {
  if (!(await connectDb())) return {} as ProductPageSettings;

  const doc = await ProductPageSettingModel.findOne().sort({ updatedAt: -1 }).lean();
  return doc ? plain(doc) : ({} as ProductPageSettings);
}

export async function getPromotions() {
  if (!(await connectDb())) return [];
  const docs = await PromotionModel.find({ status: "published" }).sort({ createdAt: -1 }).lean();
  return normalizeRows(plain(docs));
}

export async function getAdminPromotions() {
  if (!(await connectDb())) return [];
  const docs = await PromotionModel.find().sort({ createdAt: -1 }).lean();
  return normalizeRows(plain(docs));
}

export async function getPromotionById(id: string) {
  const rows = await getPromotions();
  return rows.find((promotion) => promotion.id === id) || null;
}

export async function getPosts() {
  if (!(await connectDb())) return [];
  const docs = await PostModel.find({ status: "published" }).sort({ publishedAt: -1 }).lean();
  return normalizeRows(plain(docs));
}

export async function getAdminPosts() {
  if (!(await connectDb())) return [];
  const docs = await PostModel.find().sort({ publishedAt: -1, createdAt: -1 }).lean();
  return normalizeRows(plain(docs));
}

export async function getPostCategories({ includeHidden = false } = {}) {
  if (!(await connectDb())) return [];

  const filter = includeHidden ? {} : { status: "active" };
  const docs = await PostCategoryModel.find(filter).sort({ sortOrder: 1, name: 1 }).lean();
  if (docs.length) return normalizeRows(plain(docs));

  const distinctCategories = await PostModel.distinct("category", { category: { $type: "string", $ne: "" } });
  if (distinctCategories.length) {
    return distinctCategories
      .sort((first, second) => String(first).localeCompare(String(second), "vi"))
      .map((name, index) => ({
        id: String(name).toLowerCase().replace(/\s+/g, "-"),
        slug: String(name).toLowerCase().replace(/\s+/g, "-"),
        name: String(name),
        status: "active",
        sortOrder: index + 1,
      }));
  }

  return [];
}

export async function getPostById(id: string) {
  const rows = await getPosts();
  return rows.find((post) => post.id === id) || null;
}

export async function getAdminPostById(id: string) {
  const rows = await getAdminPosts();
  return rows.find((post) => post.id === id || post._id === id) || null;
}

export async function getBookings() {
  if (!(await connectDb())) return [];
  return plain(await BookingModel.find().sort({ createdAt: -1 }).lean());
}

export async function getSalesOrders() {
  if (!(await connectDb())) return [];
  return plain(await SalesOrderModel.find().sort({ createdAt: -1 }).lean());
}

export async function getSiteSettings() {
  if (!(await connectDb())) {
    return {
      gaId: process.env.NEXT_PUBLIC_GA_ID || "",
      metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
      tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "",
    } as SiteSettings;
  }

  const doc = await SiteSettingModel.findOne().sort({ updatedAt: -1 }).lean();
  return doc ? plain(doc) : {};
}

export async function getMediaAssets() {
  if (!(await connectDb())) return [];
  return plain(await MediaAssetModel.find().sort({ createdAt: -1 }).limit(100).lean());
}

export async function getAdminUsers() {
  if (!(await connectDb())) return [];
  return plain(await AdminUserModel.find().sort({ createdAt: -1 }).lean());
}
