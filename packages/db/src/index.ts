import mongoose, { Schema } from "mongoose";
import { branches, postCategories, posts, products, promotions, siteSettings } from "./seed";

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
    price: Number,
    image: String,
    description: String,
    branchIds: [String],
    featured: Boolean,
    status: { type: String, default: "published" },
  },
  { timestamps: true },
);
productSchema.index({ category: 1, status: 1 });
productSchema.index({ branchIds: 1 });
productSchema.index({ name: "text", description: "text" });

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
export const PromotionModel =
  mongoose.models.Promotion || mongoose.model("Promotion", promotionSchema);
export const PostModel = mongoose.models.Post || mongoose.model("Post", postSchema);
export const PostCategoryModel =
  mongoose.models.PostCategory || mongoose.model("PostCategory", postCategorySchema);
export const BookingModel = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export const SiteSettingModel =
  mongoose.models.SiteSetting || mongoose.model("SiteSetting", siteSettingSchema);
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
  if (!(await connectDb())) return branches;
  const docs = await BranchModel.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
  return normalizeRows(plain(docs));
}

export async function getBranchById(id: string) {
  const rows = await getBranches();
  return rows.find((branch) => branch.id === id || branch.code?.toLowerCase() === id.toLowerCase()) || null;
}

export async function getProducts() {
  if (!(await connectDb())) return products;
  const docs = await ProductModel.find({ status: "published" }).sort({ createdAt: -1 }).lean();
  return normalizeRows(plain(docs));
}

export async function getAdminProducts() {
  if (!(await connectDb())) return products;
  const docs = await ProductModel.find().sort({ createdAt: -1 }).lean();
  return normalizeRows(plain(docs));
}

export async function getPromotions() {
  if (!(await connectDb())) return promotions;
  const docs = await PromotionModel.find({ status: "published" }).sort({ createdAt: -1 }).lean();
  return normalizeRows(plain(docs));
}

export async function getAdminPromotions() {
  if (!(await connectDb())) return promotions;
  const docs = await PromotionModel.find().sort({ createdAt: -1 }).lean();
  return normalizeRows(plain(docs));
}

export async function getPromotionById(id: string) {
  const rows = await getPromotions();
  return rows.find((promotion) => promotion.id === id) || null;
}

export async function getPosts() {
  if (!(await connectDb())) return posts;
  const docs = await PostModel.find({ status: "published" }).sort({ publishedAt: -1 }).lean();
  return normalizeRows(plain(docs));
}

export async function getAdminPosts() {
  if (!(await connectDb())) return posts;
  const docs = await PostModel.find().sort({ publishedAt: -1, createdAt: -1 }).lean();
  return normalizeRows(plain(docs));
}

export async function getPostCategories({ includeHidden = false } = {}) {
  if (!(await connectDb())) return includeHidden ? postCategories : postCategories.filter((category) => category.status !== "hidden");

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

  return includeHidden ? postCategories : postCategories.filter((category) => category.status !== "hidden");
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

export async function getSiteSettings() {
  if (!(await connectDb())) {
    return {
      ...siteSettings,
      gaId: process.env.NEXT_PUBLIC_GA_ID || siteSettings.gaId,
      metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || siteSettings.metaPixelId,
      tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || siteSettings.tiktokPixelId,
    };
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
