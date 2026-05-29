import { loadRootEnv } from "@99billiards/config/load-env";
import { BranchModel, connectDb } from "@99billiards/db";

loadRootEnv();

const BRANCHES = [
  {
    id: "cs6",
    code: "CS6",
    name: "99 Billiards Hà Đông",
    district: "Hà Đông, Hà Nội",
    address: "215 Quang Trung, Phú La, Hà Đông, Hà Nội",
    phone: "0923 699 906",
    hours: "08:00 - 02:00",
    status: "open" as const,
    tables: 16,
    lat: 20.9696,
    lng: 105.7889,
    mapUrl: "https://maps.google.com/?q=215+Quang+Trung+Ha+Dong+Ha+Noi",
    image: "https://picsum.photos/seed/branch-hadong/1600/900",
    gallery: [
      "https://picsum.photos/seed/branch-hadong-2/1600/900",
      "https://picsum.photos/seed/branch-hadong-3/1600/900",
    ],
    highlights: ["16 bàn pool 9-ball", "Phòng VIP 2 bàn", "Bãi đỗ rộng"],
    amenities: ["Wifi", "Free nước", "Cho thuê cơ", "Bãi đỗ ô tô"],
    description:
      "Cơ sở Hà Đông rộng rãi, gần đại lộ Quang Trung, thuận tiện cho dân Hà Đông – Mỗ Lao – Văn Quán.",
    seoTitle: "99 Billiards Hà Đông - CLB billiards Quang Trung",
    seoDescription:
      "Câu lạc bộ billiards 99 chi nhánh Hà Đông với 16 bàn pool 9-ball và phòng VIP riêng.",
    sortOrder: 6,
  },
  {
    id: "cs7",
    code: "CS7",
    name: "99 Billiards Hoàng Mai",
    district: "Hoàng Mai, Hà Nội",
    address: "88 Tam Trinh, Mai Động, Hoàng Mai, Hà Nội",
    phone: "0923 699 907",
    hours: "09:00 - 01:00",
    status: "open" as const,
    tables: 12,
    lat: 20.9954,
    lng: 105.8638,
    mapUrl: "https://maps.google.com/?q=88+Tam+Trinh+Hoang+Mai+Ha+Noi",
    image: "https://picsum.photos/seed/branch-hoangmai/1600/900",
    gallery: [
      "https://picsum.photos/seed/branch-hoangmai-2/1600/900",
      "https://picsum.photos/seed/branch-hoangmai-3/1600/900",
    ],
    highlights: ["12 bàn pool tiêu chuẩn", "Cafe + đồ ăn nhanh", "Khu xem livestream"],
    amenities: ["Wifi", "Cafe & đồ ăn", "Cho thuê cơ", "Bãi đỗ xe máy"],
    description:
      "Cơ sở Hoàng Mai tập trung vào trải nghiệm chill: cafe – ăn nhẹ – billiards trong cùng không gian.",
    seoTitle: "99 Billiards Hoàng Mai - billiards & cafe Tam Trinh",
    seoDescription:
      "Câu lạc bộ billiards 99 chi nhánh Hoàng Mai với 12 bàn pool và khu cafe rộng.",
    sortOrder: 7,
  },
  {
    id: "cs8",
    code: "CS8",
    name: "99 Billiards Nam Từ Liêm",
    district: "Nam Từ Liêm, Hà Nội",
    address: "Số 5 Lê Đức Thọ, Mỹ Đình, Nam Từ Liêm, Hà Nội",
    phone: "0923 699 908",
    hours: "08:00 - 02:00",
    status: "coming-soon" as const,
    tables: 20,
    lat: 21.0289,
    lng: 105.7679,
    mapUrl: "https://maps.google.com/?q=5+Le+Duc+Tho+My+Dinh+Ha+Noi",
    image: "https://picsum.photos/seed/branch-mydinh/1600/900",
    gallery: [
      "https://picsum.photos/seed/branch-mydinh-2/1600/900",
      "https://picsum.photos/seed/branch-mydinh-3/1600/900",
    ],
    highlights: ["20 bàn (lớn nhất hệ thống)", "Khu giải đấu chuyên nghiệp", "2 phòng VIP"],
    amenities: ["Wifi", "Free nước", "Cho thuê cơ", "Phòng VIP", "Bãi đỗ ô tô lớn"],
    description:
      "Cơ sở Mỹ Đình sắp khai trương – flagship store với khu thi đấu chuyên nghiệp và 2 phòng VIP.",
    seoTitle: "99 Billiards Mỹ Đình - flagship Nam Từ Liêm",
    seoDescription:
      "Cơ sở 99 Billiards Mỹ Đình sắp khai trương với 20 bàn và khu giải đấu chuyên nghiệp.",
    sortOrder: 8,
  },
];

async function seedBranches() {
  const connection = await connectDb();
  if (!connection) {
    throw new Error("MONGODB_URI is missing. Add it to root .env first.");
  }

  let upserted = 0;
  for (const branch of BRANCHES) {
    const result = await BranchModel.updateOne(
      { id: branch.id },
      { $set: branch },
      { upsert: true },
    );
    if (result.upsertedCount > 0 || result.modifiedCount > 0) upserted++;
    console.log(`  - ${branch.code} ${branch.name}`);
  }

  await connection.disconnect();
  console.log(`Done. ${upserted}/${BRANCHES.length} branches upserted.`);
}

seedBranches().catch((error) => {
  console.error(error);
  process.exit(1);
});
