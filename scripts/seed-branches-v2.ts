import { loadRootEnv } from "@99billiards/config/load-env";
import { BranchModel, connectDb } from "@99billiards/db";

loadRootEnv();

const BRANCHES = [
  {
    id: "cs9",
    code: "CS9",
    name: "99 Billiards Bắc Từ Liêm",
    district: "Bắc Từ Liêm, Hà Nội",
    address: "234 Phạm Văn Đồng, Cổ Nhuế 1, Bắc Từ Liêm, Hà Nội",
    phone: "0923 699 909",
    hours: "08:00 - 02:00",
    status: "open" as const,
    tables: 14,
    lat: 21.0697,
    lng: 105.7745,
    mapUrl: "https://maps.google.com/?q=234+Pham+Van+Dong+Bac+Tu+Liem+Ha+Noi",
    image: "https://picsum.photos/seed/branch-bactuliem/1600/900",
    gallery: [
      "https://picsum.photos/seed/branch-bactuliem-2/1600/900",
      "https://picsum.photos/seed/branch-bactuliem-3/1600/900",
    ],
    highlights: ["14 bàn pool tiêu chuẩn", "Khu chill 2 tầng", "Gần đại học Ngoại Ngữ"],
    amenities: ["Wifi", "Free nước", "Cho thuê cơ", "Bãi đỗ xe máy lớn"],
    description:
      "Cơ sở Bắc Từ Liêm trên trục Phạm Văn Đồng — thuận tiện cho sinh viên và dân Cổ Nhuế – Nghĩa Đô.",
    seoTitle: "99 Billiards Bắc Từ Liêm - CLB billiards Phạm Văn Đồng",
    seoDescription:
      "Câu lạc bộ billiards 99 chi nhánh Bắc Từ Liêm với 14 bàn pool và khu chill 2 tầng.",
    sortOrder: 9,
  },
  {
    id: "cs10",
    code: "CS10",
    name: "99 Billiards Tây Hồ",
    district: "Tây Hồ, Hà Nội",
    address: "67 Xuân Diệu, Quảng An, Tây Hồ, Hà Nội",
    phone: "0923 699 910",
    hours: "10:00 - 02:00",
    status: "open" as const,
    tables: 10,
    lat: 21.0676,
    lng: 105.8264,
    mapUrl: "https://maps.google.com/?q=67+Xuan+Dieu+Tay+Ho+Ha+Noi",
    image: "https://picsum.photos/seed/branch-tayho/1600/900",
    gallery: [
      "https://picsum.photos/seed/branch-tayho-2/1600/900",
      "https://picsum.photos/seed/branch-tayho-3/1600/900",
    ],
    highlights: ["10 bàn pool cao cấp", "Lounge & cocktail bar", "View Hồ Tây"],
    amenities: ["Wifi", "Cocktail bar", "Cho thuê cơ", "Bãi đỗ ô tô", "Phòng VIP"],
    description:
      "Cơ sở Tây Hồ phong cách lounge — billiards kết hợp cocktail bar, view Hồ Tây, dành cho khách cao cấp.",
    seoTitle: "99 Billiards Tây Hồ - billiards lounge Xuân Diệu",
    seoDescription:
      "Câu lạc bộ billiards 99 chi nhánh Tây Hồ với 10 bàn pool cao cấp và cocktail lounge view Hồ Tây.",
    sortOrder: 10,
  },
  {
    id: "cs11",
    code: "CS11",
    name: "99 Billiards Hoàn Kiếm",
    district: "Hoàn Kiếm, Hà Nội",
    address: "45 Tràng Tiền, Hoàn Kiếm, Hà Nội",
    phone: "0923 699 911",
    hours: "09:00 - 01:00",
    status: "open" as const,
    tables: 8,
    lat: 21.0245,
    lng: 105.8542,
    mapUrl: "https://maps.google.com/?q=45+Trang+Tien+Hoan+Kiem+Ha+Noi",
    image: "https://picsum.photos/seed/branch-hoankiem/1600/900",
    gallery: [
      "https://picsum.photos/seed/branch-hoankiem-2/1600/900",
      "https://picsum.photos/seed/branch-hoankiem-3/1600/900",
    ],
    highlights: ["8 bàn boutique downtown", "Bàn snooker chuyên dụng", "Gần Hồ Gươm"],
    amenities: ["Wifi", "Cafe specialty", "Cho thuê cơ", "Phòng VIP"],
    description:
      "Cơ sở Hoàn Kiếm boutique giữa phố cổ — không gian nhỏ gọn, có cả bàn pool và snooker, gần Hồ Gươm.",
    seoTitle: "99 Billiards Hoàn Kiếm - boutique billiards phố cổ",
    seoDescription:
      "Câu lạc bộ billiards 99 chi nhánh Hoàn Kiếm với 8 bàn boutique và bàn snooker chuyên dụng.",
    sortOrder: 11,
  },
  {
    id: "cs12",
    code: "CS12",
    name: "99 Billiards Gia Lâm",
    district: "Gia Lâm, Hà Nội",
    address: "Lô 15 KĐT Vinhomes Ocean Park, Gia Lâm, Hà Nội",
    phone: "0923 699 912",
    hours: "08:00 - 02:00",
    status: "coming-soon" as const,
    tables: 18,
    lat: 21.0149,
    lng: 105.9325,
    mapUrl: "https://maps.google.com/?q=Vinhomes+Ocean+Park+Gia+Lam+Ha+Noi",
    image: "https://picsum.photos/seed/branch-gialam/1600/900",
    gallery: [
      "https://picsum.photos/seed/branch-gialam-2/1600/900",
      "https://picsum.photos/seed/branch-gialam-3/1600/900",
    ],
    highlights: ["18 bàn pool 9-ball", "Khu academy đào tạo", "Bãi đỗ xe rộng"],
    amenities: ["Wifi", "Free nước", "Cho thuê cơ", "Bãi đỗ ô tô", "Academy"],
    description:
      "Cơ sở Gia Lâm trong KĐT Vinhomes Ocean Park — sắp khai trương, có khu academy đào tạo billiards bài bản.",
    seoTitle: "99 Billiards Gia Lâm - billiards Vinhomes Ocean Park",
    seoDescription:
      "Cơ sở 99 Billiards Gia Lâm sắp khai trương trong KĐT Vinhomes Ocean Park với 18 bàn và khu academy.",
    sortOrder: 12,
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
