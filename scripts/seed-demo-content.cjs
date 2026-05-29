/**
 * Seed demo content into local MongoDB:
 *   - 3 post categories
 *   - 5 branches (cơ sở)
 *   - 3 promotions (ưu đãi)
 *   - 5 posts (tin tức)
 *
 * Images use https://picsum.photos/seed/<seed>/<w>/<h> — stable, always renders.
 * Run with:  node scripts/seed-demo-content.cjs
 */

const path = require("path");
const { MongoClient } = require(path.join(__dirname, "..", "node_modules", "mongodb"));

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/99billiards";
const DB_NAME = "99billiards";

const img = (seed, w = 1600, h = 900) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const now = new Date();

const postCategories = [
  { id: "tin-tuc", slug: "tin-tuc", name: "Tin tức", description: "Tin tức về billiards và CLB 99", status: "active", sortOrder: 1 },
  { id: "huong-dan", slug: "huong-dan", name: "Hướng dẫn", description: "Mẹo chơi, hướng dẫn kỹ thuật", status: "active", sortOrder: 2 },
  { id: "su-kien", slug: "su-kien", name: "Sự kiện", description: "Giải đấu, sự kiện cộng đồng", status: "active", sortOrder: 3 },
];

const branches = [
  {
    id: "cs1",
    code: "CS1",
    name: "99 Billiards Cầu Giấy",
    district: "Cầu Giấy, Hà Nội",
    address: "128 Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy, Hà Nội",
    phone: "0923 699 901",
    hours: "08:00 - 02:00",
    status: "open",
    tables: 18,
    lat: 21.0306,
    lng: 105.7822,
    image: img("branch-caugiay"),
    gallery: [img("branch-caugiay-2"), img("branch-caugiay-3")],
    highlights: ["18 bàn pool 9-ball", "Khu VIP riêng", "Khu livestream"],
    amenities: ["Wifi", "Free nước", "Cho thuê cơ", "Bãi đỗ ô tô"],
    description: "Cơ sở lớn nhất của 99 Billiards tại Cầu Giấy, không gian cao cấp, phù hợp cho cả luyện tập và thi đấu.",
    mapUrl: "https://maps.google.com/?q=128+Tran+Thai+Tong+Ha+Noi",
    seoTitle: "99 Billiards Cầu Giấy - CLB billiards cao cấp",
    seoDescription: "Câu lạc bộ billiards 99 chi nhánh Cầu Giấy với 18 bàn 9-ball tiêu chuẩn.",
    sortOrder: 1,
  },
  {
    id: "cs2",
    code: "CS2",
    name: "99 Billiards Đống Đa",
    district: "Đống Đa, Hà Nội",
    address: "45 Phạm Ngọc Thạch, Đống Đa, Hà Nội",
    phone: "0923 699 902",
    hours: "09:00 - 01:00",
    status: "open",
    tables: 12,
    lat: 21.0067,
    lng: 105.8332,
    image: img("branch-dongda"),
    gallery: [img("branch-dongda-2")],
    highlights: ["12 bàn carom 3 băng", "Cơ Predator có sẵn"],
    amenities: ["Wifi", "Đồ ăn nhẹ", "Khu hút thuốc riêng"],
    description: "Không gian ấm cúng dành cho người chơi carom chuyên nghiệp.",
    mapUrl: "https://maps.google.com/?q=45+Pham+Ngoc+Thach+Ha+Noi",
    seoTitle: "99 Billiards Đống Đa",
    seoDescription: "Chi nhánh Đống Đa chuyên carom 3 băng.",
    sortOrder: 2,
  },
  {
    id: "cs3",
    code: "CS3",
    name: "99 Billiards Hai Bà Trưng",
    district: "Hai Bà Trưng, Hà Nội",
    address: "212 Bà Triệu, Hai Bà Trưng, Hà Nội",
    phone: "0923 699 903",
    hours: "08:30 - 24:00",
    status: "open",
    tables: 10,
    lat: 21.0096,
    lng: 105.8473,
    image: img("branch-haibatrung"),
    gallery: [img("branch-haibatrung-2")],
    highlights: ["10 bàn pool + snooker", "Phòng dạy 1-1"],
    amenities: ["Wifi", "Quầy bar", "Lớp dạy cơ bản"],
    description: "Phù hợp người mới bắt đầu, có HLV thường trực hỗ trợ.",
    mapUrl: "https://maps.google.com/?q=212+Ba+Trieu+Ha+Noi",
    seoTitle: "99 Billiards Hai Bà Trưng",
    seoDescription: "Chi nhánh Hai Bà Trưng - học billiards với HLV.",
    sortOrder: 3,
  },
  {
    id: "cs4",
    code: "CS4",
    name: "99 Billiards Thanh Xuân",
    district: "Thanh Xuân, Hà Nội",
    address: "88 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    phone: "0923 699 904",
    hours: "10:00 - 02:00",
    status: "open",
    tables: 14,
    lat: 20.9923,
    lng: 105.8045,
    image: img("branch-thanhxuan"),
    gallery: [img("branch-thanhxuan-2")],
    highlights: ["14 bàn 9-ball", "Tổ chức giải đấu hàng tháng"],
    amenities: ["Wifi", "Live stream", "Cho thuê phòng VIP"],
    description: "Trung tâm tổ chức giải đấu pool 9-ball thường niên của 99 Billiards.",
    mapUrl: "https://maps.google.com/?q=88+Nguyen+Trai+Ha+Noi",
    seoTitle: "99 Billiards Thanh Xuân",
    seoDescription: "Sân thi đấu pool 9-ball của 99 Billiards.",
    sortOrder: 4,
  },
  {
    id: "cs5",
    code: "CS5",
    name: "99 Billiards Long Biên",
    district: "Long Biên, Hà Nội",
    address: "27 Ngọc Lâm, Long Biên, Hà Nội",
    phone: "0923 699 905",
    hours: "09:00 - 24:00",
    status: "coming-soon",
    tables: 16,
    lat: 21.0436,
    lng: 105.8746,
    image: img("branch-longbien"),
    gallery: [img("branch-longbien-2")],
    highlights: ["Sắp khai trương 06/2026", "16 bàn thi đấu chuẩn quốc tế"],
    amenities: ["Bãi đỗ rộng", "Khu cafe", "Phòng họp"],
    description: "Cơ sở mới nhất của 99 Billiards, dự kiến khai trương tháng 06/2026.",
    mapUrl: "https://maps.google.com/?q=27+Ngoc+Lam+Ha+Noi",
    seoTitle: "99 Billiards Long Biên - Sắp khai trương",
    seoDescription: "Cơ sở 99 Billiards Long Biên sắp khai trương.",
    sortOrder: 5,
  },
];

const promotions = [
  {
    id: "pr1",
    title: "Giảm 30% giờ vàng",
    description: "Khung giờ 14:00 - 17:00 các ngày trong tuần, áp dụng tại tất cả chi nhánh.",
    content:
      "Đặt bàn trong khung giờ 14:00 - 17:00 thứ Hai đến thứ Sáu để nhận ưu đãi 30% tổng hóa đơn bàn. Áp dụng cho cả nhóm 1-6 người. Không gộp với khuyến mại khác.",
    badge: "Giờ vàng",
    image: img("promo-happyhour"),
    branchIds: ["cs1", "cs2", "cs3", "cs4"],
    seoTitle: "Khuyến mãi giờ vàng 99 Billiards",
    seoDescription: "Giảm 30% giờ chơi billiards khung 14h-17h.",
    status: "published",
  },
  {
    id: "pr2",
    title: "Combo nhóm 4 người - tặng nước",
    description: "Đặt bàn nhóm 4 người trở lên được tặng 1 phần nước cho mỗi thành viên.",
    content:
      "Combo dành riêng cho nhóm bạn: đặt bàn từ 4 người trở lên, mỗi thành viên được tặng 1 ly nước miễn phí (trà, cafe đen hoặc nước ngọt). Ưu đãi tự động áp dụng tại quầy.",
    badge: "Combo nhóm",
    image: img("promo-combo"),
    branchIds: ["cs1", "cs3", "cs4"],
    seoTitle: "Combo nhóm 4 người 99 Billiards",
    seoDescription: "Đặt bàn nhóm 4 người được tặng nước.",
    status: "published",
  },
  {
    id: "pr3",
    title: "Mua cơ Predator giảm 15%",
    description: "Áp dụng cho toàn bộ dòng cơ Predator Revo, Roadline và Air II trong tháng.",
    content:
      "Toàn bộ cơ Predator giảm trực tiếp 15% trong tháng 06/2026. Bao gồm Predator Revo 12.4, Roadline 3, Air II Jump. Áp dụng tại showroom Cầu Giấy và đặt online.",
    badge: "Hot sale",
    image: img("promo-predator"),
    branchIds: ["cs1"],
    seoTitle: "Khuyến mãi cơ Predator giảm 15%",
    seoDescription: "Giảm 15% cơ Predator chính hãng tại 99 Billiards.",
    status: "published",
  },
];

const posts = [
  {
    id: "post-khai-truong-long-bien",
    title: "99 Billiards chuẩn bị khai trương cơ sở Long Biên",
    excerpt: "Chi nhánh mới với 16 bàn chuẩn quốc tế dự kiến đi vào hoạt động cuối tháng 06/2026.",
    category: "Tin tức",
    image: img("post-longbien"),
    publishedAt: "2026-05-20",
    content:
      "99 Billiards chính thức công bố kế hoạch khai trương chi nhánh thứ 5 tại Long Biên, Hà Nội. Cơ sở mới được đầu tư 16 bàn pool 9-ball nhập khẩu Đài Loan, hệ thống ánh sáng LED chuyên dụng và khu vực live stream phục vụ các giải đấu cộng đồng. Dự kiến đi vào hoạt động cuối tháng 06/2026.",
    contentFormat: "plain",
    contentText:
      "99 Billiards chính thức công bố kế hoạch khai trương chi nhánh thứ 5 tại Long Biên, Hà Nội...",
    seoTitle: "99 Billiards khai trương cơ sở Long Biên",
    seoDescription: "Cơ sở Long Biên dự kiến hoạt động 06/2026.",
    status: "published",
  },
  {
    id: "post-giai-9ball-thang-6",
    title: "Giải đấu Pool 9-Ball tháng 6 - 99 Billiards Open",
    excerpt: "Tổng giải thưởng 50 triệu, đăng ký mở từ ngày 01/06 tại chi nhánh Thanh Xuân.",
    category: "Sự kiện",
    image: img("post-9ball"),
    publishedAt: "2026-05-18",
    content:
      "Giải đấu Pool 9-Ball thường niên của 99 Billiards trở lại với tổng giải thưởng 50 triệu đồng. Vòng loại diễn ra từ 10-12/06, chung kết 15/06 tại chi nhánh Thanh Xuân. BTC mở đăng ký cho 64 cơ thủ nghiệp dư và 16 cơ thủ chuyên nghiệp. Phí tham dự 300k/người.",
    contentFormat: "plain",
    contentText: "Giải đấu Pool 9-Ball thường niên của 99 Billiards trở lại...",
    seoTitle: "Giải Pool 9-Ball 99 Billiards Open tháng 6",
    seoDescription: "Đăng ký giải pool 9-ball với tổng thưởng 50 triệu.",
    status: "published",
  },
  {
    id: "post-huong-dan-chon-co",
    title: "Hướng dẫn chọn cơ phù hợp cho người mới chơi",
    excerpt: "Chọn cơ đúng giúp tiến bộ nhanh hơn. Các tiêu chí cơ bản về trọng lượng, độ dài và đầu cơ.",
    category: "Hướng dẫn",
    image: img("post-chonco"),
    publishedAt: "2026-05-15",
    content:
      "Cây cơ là người bạn đồng hành quan trọng nhất của cơ thủ. Với người mới chơi, cơ nên có trọng lượng 18-19oz, đầu cơ 12.5-13mm và độ dài tiêu chuẩn 58 inch. Trục cơ maple Bắc Mỹ là lựa chọn phổ thông, giá hợp lý. Tránh mua cơ quá rẻ vì sẽ ảnh hưởng đến cảm giác đánh.",
    contentFormat: "plain",
    contentText: "Cây cơ là người bạn đồng hành quan trọng nhất của cơ thủ...",
    seoTitle: "Hướng dẫn chọn cơ billiards cho người mới",
    seoDescription: "Tiêu chí chọn cơ pool cho người mới chơi.",
    status: "published",
  },
  {
    id: "post-bao-duong-co",
    title: "Mẹo bảo dưỡng cơ billiards tại nhà",
    excerpt: "5 thói quen đơn giản giúp cây cơ luôn ổn định, kéo dài tuổi thọ lên 5-7 năm.",
    category: "Hướng dẫn",
    image: img("post-baoduong"),
    publishedAt: "2026-05-10",
    content:
      "Lau khô cơ sau mỗi buổi chơi, không để cơ tựa vào tường vì dễ cong, thay lơ đầu cơ định kỳ 2-3 tháng/lần, bọc lơ và mài đầu cơ với giấy nhám 600 grit, bảo quản nơi khô thoáng tránh nắng trực tiếp. Tuân thủ 5 mẹo trên giúp cây cơ giữ form và độ chuẩn xác trong 5-7 năm.",
    contentFormat: "plain",
    contentText: "Lau khô cơ sau mỗi buổi chơi, không để cơ tựa vào tường...",
    seoTitle: "Bảo dưỡng cơ billiards đúng cách",
    seoDescription: "5 mẹo bảo dưỡng cơ pool tại nhà.",
    status: "published",
  },
  {
    id: "post-ket-qua-giai-thang-5",
    title: "Tổng kết giải Carom 3 băng tháng 5",
    excerpt: "Nguyễn Văn A vô địch với điểm trung bình 1.85, phá kỷ lục giải đấu nội bộ.",
    category: "Tin tức",
    image: img("post-carom"),
    publishedAt: "2026-05-05",
    content:
      "Giải Carom 3 băng nội bộ 99 Billiards tháng 5 đã khép lại với chiến thắng thuyết phục của cơ thủ Nguyễn Văn A. Anh đạt điểm trung bình 1.85, vượt qua kỷ lục cũ 1.72 do chính anh thiết lập năm 2025. Á quân là cơ thủ Trần Văn B với 1.62, hạng ba thuộc về Lê Văn C.",
    contentFormat: "plain",
    contentText: "Giải Carom 3 băng nội bộ 99 Billiards tháng 5 đã khép lại...",
    seoTitle: "Kết quả giải Carom 3 băng tháng 5",
    seoDescription: "Tổng kết giải carom nội bộ 99 Billiards.",
    status: "published",
  },
];

function stamped(rows) {
  return rows.map((r) => ({ ...r, createdAt: now, updatedAt: now }));
}

(async () => {
  const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    // Post categories
    for (const cat of postCategories) {
      await db.collection("postcategories").updateOne(
        { id: cat.id },
        { $set: { ...cat, updatedAt: now }, $setOnInsert: { createdAt: now } },
        { upsert: true },
      );
    }
    console.log(`Post categories: upserted ${postCategories.length}`);

    // Branches
    for (const b of branches) {
      await db.collection("branches").updateOne(
        { code: b.code },
        { $set: { ...b, updatedAt: now }, $setOnInsert: { createdAt: now } },
        { upsert: true },
      );
    }
    console.log(`Branches: upserted ${branches.length}`);

    // Promotions
    for (const p of promotions) {
      await db.collection("promotions").updateOne(
        { id: p.id },
        { $set: { ...p, updatedAt: now }, $setOnInsert: { createdAt: now } },
        { upsert: true },
      );
    }
    console.log(`Promotions: upserted ${promotions.length}`);

    // Posts
    for (const p of posts) {
      await db.collection("posts").updateOne(
        { id: p.id },
        { $set: { ...p, updatedAt: now }, $setOnInsert: { createdAt: now } },
        { upsert: true },
      );
    }
    console.log(`Posts: upserted ${posts.length}`);

    console.log("\nDone.");
  } catch (e) {
    console.error("Seed failed:", e);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
})();
