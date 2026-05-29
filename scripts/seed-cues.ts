import { loadRootEnv } from "@99billiards/config/load-env";
import {
  ProductBrandModel,
  ProductCategoryModel,
  ProductModel,
  ProductSubcategoryModel,
  connectDb,
} from "@99billiards/db";

loadRootEnv();

const CATEGORIES = [
  { id: "co-pool", slug: "co-pool", name: "Cơ Pool", status: "active" as const, sortOrder: 1 },
  { id: "ngon-shafts", slug: "ngon-shafts", name: "Ngọn - Shafts", status: "active" as const, sortOrder: 2 },
  { id: "pha-nhay", slug: "pha-nhay", name: "Phá - Nhảy", status: "active" as const, sortOrder: 3 },
  { id: "phu-kien", slug: "phu-kien", name: "Phụ Kiện", status: "active" as const, sortOrder: 4 },
  { id: "ban-bi-a", slug: "ban-bi-a", name: "Bàn Bi-A / Pool Table", status: "active" as const, sortOrder: 5 },
];

// Keep "co-pool" as the default category id used by existing cue products below.
const CATEGORY = CATEGORIES[0];

const SUBCATEGORIES = [
  // Cơ Pool
  { id: "co-pool-universal", slug: "co-pool-universal", name: "Universal", categoryId: "co-pool", sortOrder: 1 },
  { id: "co-pool-mit-cues", slug: "co-pool-mit-cues", name: "Mit Cues", categoryId: "co-pool", sortOrder: 2 },
  { id: "co-pool-cuetec", slug: "co-pool-cuetec", name: "Cuetec", categoryId: "co-pool", sortOrder: 3 },
  { id: "co-pool-peri-cues", slug: "co-pool-peri-cues", name: "Peri Cues", categoryId: "co-pool", sortOrder: 4 },
  { id: "co-pool-evo-cues", slug: "co-pool-evo-cues", name: "Evo cues", categoryId: "co-pool", sortOrder: 5 },
  { id: "co-pool-mezz-cues", slug: "co-pool-mezz-cues", name: "Mezz Cues", categoryId: "co-pool", sortOrder: 6 },
  // Ngọn - Shafts
  { id: "ngon-cuetec", slug: "ngon-cuetec", name: "Ngọn Cuetec", categoryId: "ngon-shafts", sortOrder: 1 },
  { id: "ngon-rhino-full-carbon", slug: "ngon-rhino-full-carbon", name: "Ngọn Rhino Full Carbon", categoryId: "ngon-shafts", sortOrder: 2 },
  { id: "ngon-mit", slug: "ngon-mit", name: "Ngọn Mit", categoryId: "ngon-shafts", sortOrder: 3 },
  { id: "ngon-predator", slug: "ngon-predator", name: "Ngọn Predator", categoryId: "ngon-shafts", sortOrder: 4 },
  { id: "ngon-mezz", slug: "ngon-mezz", name: "Ngọn Mezz", categoryId: "ngon-shafts", sortOrder: 5 },
  { id: "ngon-david-loman", slug: "ngon-david-loman", name: "Ngọn David Loman", categoryId: "ngon-shafts", sortOrder: 6 },
  { id: "ngon-fury", slug: "ngon-fury", name: "Ngọn Fury", categoryId: "ngon-shafts", sortOrder: 7 },
  // Phá - Nhảy
  { id: "pha-nhay-evo-valkyrie", slug: "pha-nhay-evo-valkyrie", name: "Phá Nhảy Evo Valkyrie", categoryId: "pha-nhay", sortOrder: 1 },
  { id: "pha-evo-x-force", slug: "pha-evo-x-force", name: "Phá Evo X-Force", categoryId: "pha-nhay", sortOrder: 2 },
  { id: "nhay-evo-pegasus", slug: "nhay-evo-pegasus", name: "Nhảy Evo Pegasus", categoryId: "pha-nhay", sortOrder: 3 },
  { id: "pha-nhay-bk", slug: "pha-nhay-bk", name: "Phá Nhảy BK", categoryId: "pha-nhay", sortOrder: 4 },
  { id: "pha-nhay-omin", slug: "pha-nhay-omin", name: "Phá Nhảy Omin", categoryId: "pha-nhay", sortOrder: 5 },
  { id: "pha-nhay-rhino", slug: "pha-nhay-rhino", name: "Phá Nhảy Rhino", categoryId: "pha-nhay", sortOrder: 6 },
  // Phụ Kiện
  { id: "bao-co", slug: "bao-co", name: "Bao Cơ", categoryId: "phu-kien", sortOrder: 1 },
  { id: "dau-tay-tips", slug: "dau-tay-tips", name: "Đầu Tẩy - Tips", categoryId: "phu-kien", sortOrder: 2 },
  { id: "gang-tay-gloves", slug: "gang-tay-gloves", name: "Găng Tay - Gloves", categoryId: "phu-kien", sortOrder: 3 },
  { id: "lo-chalk", slug: "lo-chalk", name: "Lơ - Chalk", categoryId: "phu-kien", sortOrder: 4 },
  { id: "noi-extensions", slug: "noi-extensions", name: "Nối - Extensions", categoryId: "phu-kien", sortOrder: 5 },
  // Bàn Bi-A
  { id: "ban-mit-sumo-2021", slug: "ban-mit-sumo-2021", name: "Bàn Mit Sumo 2021", categoryId: "ban-bi-a", sortOrder: 1 },
  { id: "ban-rasson-9ft", slug: "ban-rasson-9ft", name: "Bàn Rasson 9FT", categoryId: "ban-bi-a", sortOrder: 2 },
  { id: "ban-predator-apex-9ft", slug: "ban-predator-apex-9ft", name: "Bàn Predator Apex 9FT Pool Table", categoryId: "ban-bi-a", sortOrder: 3 },
  { id: "phu-kien-theo-ban", slug: "phu-kien-theo-ban", name: "Phụ kiện theo bàn", categoryId: "ban-bi-a", sortOrder: 4 },
  { id: "ni-cpba", slug: "ni-cpba", name: "Nỉ CPBA", categoryId: "ban-bi-a", sortOrder: 5 },
  { id: "clb-doi-tac-dpcues", slug: "clb-doi-tac-dpcues", name: "Các CLB Billiards đối tác của DPCUES", categoryId: "ban-bi-a", sortOrder: 6 },
].map((sub) => ({ ...sub, type: "product-type" as const, status: "active" as const }));

const BRANDS = [
  { id: "predator", slug: "predator", name: "Predator", status: "active" as const, sortOrder: 1 },
  { id: "mezz", slug: "mezz", name: "Mezz", status: "active" as const, sortOrder: 2 },
  { id: "lucasi", slug: "lucasi", name: "Lucasi", status: "active" as const, sortOrder: 3 },
  { id: "longoni", slug: "longoni", name: "Longoni", status: "active" as const, sortOrder: 4 },
  { id: "peri", slug: "peri", name: "Peri", status: "active" as const, sortOrder: 5 },
  { id: "leadsuper", slug: "leadsuper", name: "LeadSuper", status: "active" as const, sortOrder: 6 },
  { id: "mcdermott", slug: "mcdermott", name: "McDermott", status: "active" as const, sortOrder: 7 },
  { id: "schon", slug: "schon", name: "Schon", status: "active" as const, sortOrder: 8 },
  { id: "joss", slug: "joss", name: "Joss", status: "active" as const, sortOrder: 9 },
  { id: "ob-cues", slug: "ob-cues", name: "OB Cues", status: "active" as const, sortOrder: 10 },
  { id: "players", slug: "players", name: "Players", status: "active" as const, sortOrder: 11 },
  { id: "cuetec", slug: "cuetec", name: "Cuetec", status: "active" as const, sortOrder: 12 },
  { id: "jflowers", slug: "jflowers", name: "JFlowers", status: "active" as const, sortOrder: 13 },
  { id: "fury", slug: "fury", name: "Fury", status: "active" as const, sortOrder: 14 },
];

const CUES = [
  {
    id: "gay-predator-revo-12-4",
    name: "Predator Revo 12.4",
    brandId: "predator",
    price: 25500000,
    compareAtPrice: 28000000,
    description: "Ngọn Revo carbon fiber 12.4mm, độ rung thấp, đường bóng cực chuẩn cho pool 9-bi.",
    tags: ["pool", "carbon", "cao-cap"],
    specs: ["Ngọn 12.4mm", "Carbon fiber Revo", "Khớp Uni-Loc Radial"],
    featured: true,
  },
  {
    id: "gay-predator-roadline-3",
    name: "Predator Roadline 3",
    brandId: "predator",
    price: 12500000,
    compareAtPrice: 14000000,
    description: "Predator Roadline series, ngọn 314 tiêu chuẩn, phù hợp người chơi nâng cao.",
    tags: ["pool", "thi-dau"],
    specs: ["Ngọn 12.75mm", "314-3 shaft", "Khớp Uni-Loc"],
    featured: true,
  },
  {
    id: "gay-mezz-power-break-kai",
    name: "Mezz Power Break Kai",
    brandId: "mezz",
    price: 8900000,
    description: "Gậy phá bi Mezz Power Break Kai, đầu phenolic, lực phá mạnh, ổn định.",
    tags: ["pha-bi", "pool"],
    specs: ["Ngọn 13.5mm", "Đầu phenolic", "Khớp Wavy Joint"],
    featured: false,
  },
  {
    id: "gay-mezz-ex-pro",
    name: "Mezz EX Pro",
    brandId: "mezz",
    price: 6500000,
    description: "Mezz EX Pro dành cho người chơi trung cấp, cảm giác tốt, độ chính xác cao.",
    tags: ["pool", "trung-cap"],
    specs: ["Ngọn 12.5mm", "Shaft WX700", "Khớp Wavy Joint"],
    featured: false,
  },
  {
    id: "gay-lucasi-hybrid-lhc95",
    name: "Lucasi Hybrid LHC95",
    brandId: "lucasi",
    price: 4900000,
    compareAtPrice: 5400000,
    description: "Lucasi Hybrid LHC95, công nghệ Zero Flexpoint giảm rung, giá tốt cho người mới.",
    tags: ["pool", "nguoi-moi"],
    specs: ["Ngọn 12.75mm", "Zero Flexpoint Shaft", "Khớp Quick Release"],
    featured: false,
  },
  {
    id: "gay-lucasi-custom-lzc40",
    name: "Lucasi Custom LZC40",
    brandId: "lucasi",
    price: 3800000,
    description: "Lucasi Custom LZC40 thiết kế tinh tế, gỗ phong sấy kỹ, phù hợp tập luyện hằng ngày.",
    tags: ["pool", "tap-luyen"],
    specs: ["Ngọn 12.75mm", "Gỗ phong Bắc Mỹ", "Khớp Implex"],
    featured: false,
  },
  {
    id: "gay-longoni-carom-custom",
    name: "Longoni Carom Custom",
    brandId: "longoni",
    price: 18500000,
    description: "Gậy carom Longoni handmade tại Ý, ngọn S2 tiêu chuẩn 3 băng quốc tế.",
    tags: ["carom", "cao-cap", "3-bang"],
    specs: ["Ngọn 11.8mm", "Shaft S2", "Khớp Uni-Loc Radial"],
    featured: true,
  },
  {
    id: "gay-longoni-libra",
    name: "Longoni Libra",
    brandId: "longoni",
    price: 9200000,
    description: "Longoni Libra series dành cho carom 3 băng, gỗ ép cao cấp, cảm giác tay rất tốt.",
    tags: ["carom", "3-bang"],
    specs: ["Ngọn 11.8mm", "Shaft Luna Nera", "Khớp Wavy"],
    featured: false,
  },
  {
    id: "gay-predator-jump-air-2",
    name: "Predator Air II Jump",
    brandId: "predator",
    price: 5500000,
    description: "Gậy nhảy Predator Air II, 3 mảnh, nhẹ, dễ dàng nhảy bóng qua chướng ngại.",
    tags: ["nhay-bi", "pool"],
    specs: ["Ngọn 12.75mm", "Đầu phenolic cứng", "3 mảnh"],
    featured: false,
  },
  {
    id: "gay-mezz-snooker-mt-149",
    name: "Mezz Snooker MT-149",
    brandId: "mezz",
    price: 7800000,
    description: "Gậy snooker Mezz MT-149, ngọn 9.5mm chuẩn quốc tế, phù hợp người chơi nghiêm túc.",
    tags: ["snooker"],
    specs: ["Ngọn 9.5mm", "Ash shaft truyền thống", "Khớp ren mịn"],
    featured: false,
  },
];

const DEFAULT_IMAGE = "/cue-default.webp";

// 3 sản phẩm cho mỗi category còn lại (ngoài Cơ Pool đã có cues ở trên).
const EXTRA_PRODUCTS: {
  id: string;
  name: string;
  categoryId: string;
  subcategoryId?: string;
  brandId?: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  tags: string[];
  specs: string[];
  featured?: boolean;
}[] = [
  // Cơ Pool (thêm 3)
  {
    id: "gay-cuetec-cynergy-15k",
    name: "Cuetec Cynergy 15K",
    categoryId: "co-pool",
    subcategoryId: "co-pool-cuetec",
    brandId: "cuetec",
    price: 16500000,
    compareAtPrice: 18000000,
    description: "Cuetec Cynergy 15K full carbon, ngọn 11.8mm, độ rung cực thấp, cho người chơi nâng cao.",
    tags: ["pool", "carbon", "cao-cap"],
    specs: ["Ngọn 11.8mm", "Carbon fiber 15K", "Khớp Cuetec Quick Release"],
    featured: true,
  },
  {
    id: "gay-peri-carbon-z",
    name: "Peri Carbon Z",
    categoryId: "co-pool",
    subcategoryId: "co-pool-peri-cues",
    brandId: "peri",
    price: 9500000,
    description: "Peri Carbon Z, ngọn carbon đen, lực đánh ổn định, giá hợp lý cho người chơi pool.",
    tags: ["pool", "carbon"],
    specs: ["Ngọn 12.4mm", "Carbon shaft", "Khớp Uni-Loc"],
    featured: false,
  },
  {
    id: "gay-mezz-excelsior-ec7",
    name: "Mezz Excelsior EC7",
    categoryId: "co-pool",
    subcategoryId: "co-pool-mezz-cues",
    brandId: "mezz",
    price: 11200000,
    description: "Mezz Excelsior EC7, thiết kế cổ điển, cảm giác tự nhiên, ngọn WX700 nổi tiếng.",
    tags: ["pool", "trung-cap"],
    specs: ["Ngọn 12.5mm", "WX700 Shaft", "Khớp Wavy Joint"],
    featured: false,
  },

  // Ngọn - Shafts (3)
  {
    id: "shaft-cuetec-cynergy-11-8",
    name: "Ngọn Cuetec Cynergy 11.8mm",
    categoryId: "ngon-shafts",
    subcategoryId: "ngon-cuetec",
    brandId: "cuetec",
    price: 8500000,
    description: "Ngọn rời Cuetec Cynergy 11.8mm carbon, lắp được hầu hết cán pool phổ biến.",
    tags: ["ngon", "carbon", "pool"],
    specs: ["Đường kính 11.8mm", "Carbon fiber", "Khớp Cuetec Quick Release"],
    featured: true,
  },
  {
    id: "shaft-predator-revo-12-4",
    name: "Ngọn Predator Revo 12.4mm",
    categoryId: "ngon-shafts",
    subcategoryId: "ngon-predator",
    brandId: "predator",
    price: 18000000,
    compareAtPrice: 19500000,
    description: "Predator Revo 12.4mm — ngọn carbon huyền thoại, độ rung gần như bằng 0.",
    tags: ["ngon", "carbon", "cao-cap"],
    specs: ["Đường kính 12.4mm", "Carbon Revo", "Khớp Uni-Loc Radial"],
    featured: false,
  },
  {
    id: "shaft-mezz-ignite-12-2",
    name: "Ngọn Mezz Ignite 12.2mm",
    categoryId: "ngon-shafts",
    subcategoryId: "ngon-mezz",
    brandId: "mezz",
    price: 12000000,
    description: "Mezz Ignite 12.2mm full carbon, đường bóng chuẩn, lắp đa khớp.",
    tags: ["ngon", "carbon"],
    specs: ["Đường kính 12.2mm", "Carbon fiber", "Khớp United Joint"],
    featured: false,
  },

  // Phá - Nhảy (3)
  {
    id: "pha-nhay-evo-valkyrie-pro",
    name: "Phá Nhảy Evo Valkyrie Pro",
    categoryId: "pha-nhay",
    subcategoryId: "pha-nhay-evo-valkyrie",
    price: 4500000,
    compareAtPrice: 5000000,
    description: "Gậy phá nhảy 2-in-1 Evo Valkyrie Pro, đầu phenolic, lực phá mạnh và nhảy bi gọn.",
    tags: ["pha-bi", "nhay-bi"],
    specs: ["Ngọn 13mm", "Đầu phenolic", "Tháo rời thành gậy nhảy"],
    featured: true,
  },
  {
    id: "pha-nhay-bk-rush",
    name: "Phá Nhảy BK Rush",
    categoryId: "pha-nhay",
    subcategoryId: "pha-nhay-bk",
    price: 3800000,
    description: "BK Rush — gậy phá Predator BK Rush, ngọn Rush carbon, ổn định và mạnh.",
    tags: ["pha-bi"],
    specs: ["Ngọn 13.25mm", "Rush carbon shaft", "Khớp Uni-Loc"],
    featured: false,
  },
  {
    id: "nhay-evo-pegasus-mk2",
    name: "Nhảy Evo Pegasus MK2",
    categoryId: "pha-nhay",
    subcategoryId: "nhay-evo-pegasus",
    price: 3200000,
    description: "Gậy nhảy bi 3 mảnh Evo Pegasus MK2, nhẹ, cân bằng tốt, nhảy bi dễ dàng.",
    tags: ["nhay-bi"],
    specs: ["3 mảnh", "Ngọn 12.75mm", "Đầu phenolic"],
    featured: false,
  },

  // Phụ Kiện (3)
  {
    id: "bao-co-predator-2x4",
    name: "Bao Cơ Predator Roadline 2x4",
    categoryId: "phu-kien",
    subcategoryId: "bao-co",
    brandId: "predator",
    price: 2500000,
    compareAtPrice: 2800000,
    description: "Bao đựng cơ Predator Roadline chứa 2 cán 4 ngọn, vải dày chống sốc.",
    tags: ["bao-co", "phu-kien"],
    specs: ["2 cán 4 ngọn", "Vải cứng chống sốc", "Khóa kéo YKK"],
    featured: false,
  },
  {
    id: "dau-tay-kamui-black-soft",
    name: "Đầu tẩy Kamui Black Soft",
    categoryId: "phu-kien",
    subcategoryId: "dau-tay-tips",
    price: 450000,
    description: "Đầu tẩy Kamui Black Soft 14mm, da ép nhiều lớp, độ bám cao, hàng chính hãng Nhật.",
    tags: ["dau-tay", "tip"],
    specs: ["Đường kính 14mm", "Độ cứng Soft", "Da ép nhiều lớp"],
    featured: true,
  },
  {
    id: "lo-master-blue-12-vien",
    name: "Lơ Master Blue (12 viên)",
    categoryId: "phu-kien",
    subcategoryId: "lo-chalk",
    price: 250000,
    description: "Hộp 12 viên lơ Master Blue tiêu chuẩn, dùng cho mọi loại đầu tẩy.",
    tags: ["lo", "chalk"],
    specs: ["12 viên/hộp", "Màu xanh truyền thống", "Sản xuất tại Mỹ"],
    featured: false,
  },

  // Bàn Bi-A (3)
  {
    id: "ban-mit-sumo-2021-9ft",
    name: "Bàn Mit Sumo 2021 9FT",
    categoryId: "ban-bi-a",
    subcategoryId: "ban-mit-sumo-2021",
    price: 165000000,
    description: "Bàn pool Mit Sumo 2021 9FT, đá slate Ý 3 mảnh 25mm, nỉ Simonis 860.",
    tags: ["ban-pool", "9ft"],
    specs: ["Kích thước 9FT", "Slate Ý 25mm", "Nỉ Simonis 860"],
    featured: true,
  },
  {
    id: "ban-rasson-magnum-9ft",
    name: "Bàn Rasson Magnum 9FT",
    categoryId: "ban-bi-a",
    subcategoryId: "ban-rasson-9ft",
    price: 220000000,
    description: "Bàn Rasson Magnum 9FT, chuẩn thi đấu WPA, dùng cho giải pool quốc tế.",
    tags: ["ban-pool", "9ft", "thi-dau"],
    specs: ["Chuẩn WPA", "Slate Ý 3 mảnh", "Nỉ Simonis"],
    featured: false,
  },
  {
    id: "ban-predator-apex-9ft",
    name: "Bàn Predator Apex 9FT Pool Table",
    categoryId: "ban-bi-a",
    subcategoryId: "ban-predator-apex-9ft",
    brandId: "predator",
    price: 285000000,
    compareAtPrice: 310000000,
    description: "Bàn Predator Apex 9FT, flagship của Predator, công nghệ Arcos II cushion.",
    tags: ["ban-pool", "9ft", "cao-cap"],
    specs: ["Arcos II Cushion", "Slate 30mm", "Nỉ tournament"],
    featured: true,
  },
];

async function seedCues() {
  const connection = await connectDb();
  if (!connection) {
    throw new Error("MONGODB_URI is missing. Add it to root .env first.");
  }

  // Drop obsolete categories that lingered from earlier seeds.
  await ProductCategoryModel.deleteMany({ id: { $in: ["gay", "dich-vu"] } });

  for (const category of CATEGORIES) {
    await ProductCategoryModel.updateOne(
      { id: category.id },
      { $set: category },
      { upsert: true },
    );
  }

  for (const subcategory of SUBCATEGORIES) {
    await ProductSubcategoryModel.updateOne(
      { id: subcategory.id },
      { $set: subcategory },
      { upsert: true },
    );
  }

  for (const brand of BRANDS) {
    await ProductBrandModel.updateOne(
      { id: brand.id },
      { $set: brand },
      { upsert: true },
    );
  }

  let inserted = 0;
  for (const cue of CUES) {
    const result = await ProductModel.updateOne(
      { id: cue.id },
      {
        // Fields that should be refreshed every run (catalog metadata).
        $set: {
          id: cue.id,
          name: cue.name,
          category: CATEGORY.id,
          categoryId: CATEGORY.id,
          brand: cue.brandId,
          brandId: cue.brandId,
          price: cue.price,
          compareAtPrice: cue.compareAtPrice,
          description: cue.description,
          detailContent: cue.description,
          detailContentFormat: "plain",
          detailContentText: cue.description,
          featured: cue.featured,
          status: "published",
          stockStatus: "in-stock",
          tags: cue.tags,
          specs: cue.specs,
          sortOrder: 0,
        },
        // Media is owned by the admin UI after first insert — only set on initial create
        // so re-running this seed does NOT wipe images uploaded via the admin panel.
        $setOnInsert: {
          image: DEFAULT_IMAGE,
          gallery: [],
        },
      },
      { upsert: true },
    );
    if (result.upsertedCount > 0 || result.modifiedCount > 0) inserted++;
    console.log(`  - ${cue.name}`);
  }

  let extraInserted = 0;
  for (const product of EXTRA_PRODUCTS) {
    const result = await ProductModel.updateOne(
      { id: product.id },
      {
        $set: {
          id: product.id,
          name: product.name,
          category: product.categoryId,
          categoryId: product.categoryId,
          subcategoryId: product.subcategoryId,
          brand: product.brandId,
          brandId: product.brandId,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          description: product.description,
          detailContent: product.description,
          detailContentFormat: "plain",
          detailContentText: product.description,
          featured: product.featured ?? false,
          status: "published",
          stockStatus: "in-stock",
          tags: product.tags,
          specs: product.specs,
          sortOrder: 0,
        },
        $setOnInsert: {
          image: DEFAULT_IMAGE,
          gallery: [],
        },
      },
      { upsert: true },
    );
    if (result.upsertedCount > 0 || result.modifiedCount > 0) extraInserted++;
    console.log(`  + ${product.name}`);
  }

  await connection.disconnect();
  console.log(
    `Done. ${inserted}/${CUES.length} cue products + ${extraInserted}/${EXTRA_PRODUCTS.length} extra products upserted.`,
  );
}

seedCues().catch((error) => {
  console.error(error);
  process.exit(1);
});
