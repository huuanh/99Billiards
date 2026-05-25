import { loadRootEnv } from "@99billiards/config/load-env";
import {
  BranchModel,
  PostCategoryModel,
  PostModel,
  ProductModel,
  PromotionModel,
  SiteSettingModel,
  connectDb,
} from "./index";

loadRootEnv();

const seedBranchCodes = ["CS1", "CS2", "CS3", "CS4", "CS5", "CS6", "CS7", "CS8"];
const seedBranchIds = ["cs1", "cs2", "cs3", "cs4", "cs5", "cs6", "cs7", "cs8"];
const seedProductIds = ["p1", "p2", "p3", "p4", "p5", "p6"];
const seedPromotionIds = ["pr1", "pr2", "pr3"];
const seedPostIds = ["n1", "n2", "n3"];
const seedPostCategoryIds = ["giai-dau", "co-so", "livestream"];

async function clearSeedData() {
  const connection = await connectDb();
  if (!connection) {
    throw new Error("MONGODB_URI is missing. Add it to root .env first.");
  }

  const results = await Promise.all([
    BranchModel.deleteMany({ $or: [{ id: { $in: seedBranchIds } }, { code: { $in: seedBranchCodes } }] }),
    ProductModel.deleteMany({ id: { $in: seedProductIds } }),
    PromotionModel.deleteMany({ id: { $in: seedPromotionIds } }),
    PostModel.deleteMany({ id: { $in: seedPostIds } }),
    PostCategoryModel.deleteMany({ id: { $in: seedPostCategoryIds } }),
    SiteSettingModel.deleteMany({ siteName: "99 Billiards" }),
  ]);

  await connection.disconnect();
  const deleted = results.reduce((total, result) => total + result.deletedCount, 0);
  console.log(`Cleared ${deleted} known seed documents from MongoDB.`);
}

clearSeedData().catch((error) => {
  console.error(error);
  process.exit(1);
});
