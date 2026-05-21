import { loadRootEnv } from "@99billiards/config/load-env";
import {
  BranchModel,
  PostModel,
  ProductModel,
  PromotionModel,
  SiteSettingModel,
  MediaAssetModel,
  connectDb,
} from "./index";
import { branches, posts, products, promotions, siteSettings } from "./seed";

loadRootEnv();

async function seed() {
  const connection = await connectDb();
  if (!connection) {
    throw new Error("MONGODB_URI is missing. Add it to root .env first.");
  }

  await Promise.all([
    BranchModel.deleteMany({}),
    ProductModel.deleteMany({}),
    PromotionModel.deleteMany({}),
    PostModel.deleteMany({}),
    SiteSettingModel.deleteMany({}),
    MediaAssetModel.deleteMany({}),
  ]);

  await BranchModel.insertMany(branches.map((item, index) => ({ ...item, sortOrder: index })));
  await ProductModel.insertMany(products);
  await PromotionModel.insertMany(promotions);
  await PostModel.insertMany(posts);
  await SiteSettingModel.create(siteSettings);

  await connection.disconnect();
  console.log("Seeded 99 Billiards content into MongoDB.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
