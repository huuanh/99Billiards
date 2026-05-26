export interface Branch {
  id: string;
  code: string;
  name: string;
  district: string;
  address: string;
  phone: string;
  hours: string;
  status: "open" | "coming-soon" | "busy";
  tables?: number;
  mapUrl?: string;
  mapEmbedUrl?: string;
  image: string;
  gallery: string[];
  highlights: string[];
  amenities: string[];
  description: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  categoryId?: string;
  subcategoryId?: string;
  subcategoryIds?: string[];
  brand?: string;
  brandId?: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  gallery?: string[];
  description?: string;
  detailContent?: string;
  detailContentFormat?: "plain" | "tiptap";
  detailContentJson?: unknown;
  detailContentText?: string;
  warrantyPolicy?: string;
  featured?: boolean;
  status?: "published" | "draft";
  stockStatus?: "in-stock" | "out-of-stock" | "preorder";
  tags?: string[];
  specs?: string[];
  sortOrder?: number;
}

export interface ProductCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  status?: "active" | "hidden";
  sortOrder?: number;
}

export interface ProductSubcategory {
  id: string;
  slug: string;
  name: string;
  type?: "product-type";
  categoryId?: string;
  description?: string;
  image?: string;
  status?: "active" | "hidden";
  sortOrder?: number;
}

export interface ProductBrand {
  id: string;
  slug: string;
  name: string;
  logo?: string;
  description?: string;
  status?: "active" | "hidden";
  sortOrder?: number;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  content: string;
  badge: string;
  image: string;
  branchIds: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  contentFormat?: "plain" | "tiptap";
  contentJson?: unknown;
  contentText?: string;
  category: string;
  publishedAt: string;
  image: string;
  status?: "published" | "draft";
  seoTitle?: string;
  seoDescription?: string;
}

export interface PostCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  status?: "active" | "hidden";
  sortOrder?: number;
}

export interface SiteSettings {
  siteName?: string;
  heroImage?: string;
  gaId?: string;
  metaPixelId?: string;
  tiktokPixelId?: string;
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
}

export interface ProductPageSettings {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  heroEyebrow?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  promoTitle?: string;
  promoText?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface SalesOrderItem {
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface SalesOrder {
  _id?: string;
  orderCode?: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  province?: string;
  district?: string;
  ward?: string;
  note?: string;
  paymentMethod?: "cod";
  items: SalesOrderItem[];
  subtotal: number;
  discountCode?: string;
  discountTotal?: number;
  total: number;
  status?: "new" | "confirmed" | "shipping" | "completed" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
}

export const branches: Branch[] = [];
export const products: Product[] = [];
export const productCategories: ProductCategory[] = [];
export const productSubcategories: ProductSubcategory[] = [];
export const productBrands: ProductBrand[] = [];
export const promotions: Promotion[] = [];
export const posts: Post[] = [];
export const postCategories: PostCategory[] = [];
export const siteSettings: SiteSettings = {};
export const productPageSettings: ProductPageSettings = {};
