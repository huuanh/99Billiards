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
  price: number;
  image: string;
  featured?: boolean;
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
  category: string;
  publishedAt: string;
  image: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface SiteSettings {
  siteName: string;
  heroImage?: string;
  gaId?: string;
  metaPixelId?: string;
  tiktokPixelId?: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
}

const imageBase = "https://images.unsplash.com/photo-";
const mapEmbed =
  "https://www.google.com/maps?q=99%20Billiards%20Club%20Ha%20Noi&output=embed";

function gallery(seed: string) {
  return [
    `${imageBase}${seed}?auto=format&fit=crop&w=1600&q=80`,
    `${imageBase}1541305678321-60de370004b7?auto=format&fit=crop&w=1600&q=80`,
    `${imageBase}1517457373958-b7bdd4587205?auto=format&fit=crop&w=1600&q=80`,
  ];
}

export const branches: Branch[] = [
  {
    id: "cs1",
    code: "CS1",
    name: "99 Billiards Nguyễn Văn Giáp",
    district: "Nam Từ Liêm",
    address: "140 Nguyễn Văn Giáp, Nam Từ Liêm, Hà Nội",
    phone: "0923 699 999",
    hours: "24/24",
    status: "open",
    tables: 28,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=140%20Nguyen%20Van%20Giap%20Ha%20Noi",
    mapEmbedUrl: mapEmbed,
    image: `${imageBase}1616137466211-f939a420be84?auto=format&fit=crop&w=1400&q=80`,
    gallery: gallery("1616137466211-f939a420be84"),
    highlights: ["Không gian lớn", "Giải đấu phong trào", "Cafe & đồ ăn"],
    amenities: ["Bàn pool tiêu chuẩn", "Khu cafe", "Bãi xe", "Livestream", "Phục vụ 24/24"],
    description:
      "Cơ sở Nguyễn Văn Giáp là điểm hẹn lớn của cộng đồng 99 Billiards tại khu Nam Từ Liêm, phù hợp cho nhóm bạn, kèo giao lưu và các buổi chơi dài.",
    seoTitle: "99 Billiards Nguyễn Văn Giáp - Đặt bàn CS1",
    seoDescription: "Đặt bàn tại 99 Billiards Nguyễn Văn Giáp, Nam Từ Liêm. Không gian lớn, phục vụ 24/24, có cafe, đồ ăn và livestream.",
  },
  {
    id: "cs2",
    code: "CS2",
    name: "99 Billiards Hoàng Quốc Việt",
    district: "Cầu Giấy",
    address: "14 Hoàng Quốc Việt, Nghĩa Đô, Cầu Giấy, Hà Nội",
    phone: "0923 699 999",
    hours: "24/24",
    status: "open",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=14%20Hoang%20Quoc%20Viet%20Ha%20Noi",
    mapEmbedUrl: mapEmbed,
    image: `${imageBase}1596838132731-3301c3fd4317?auto=format&fit=crop&w=1400&q=80`,
    gallery: gallery("1596838132731-3301c3fd4317"),
    highlights: ["Khu Cầu Giấy", "Âm thanh mạnh", "Đặt bàn nhanh"],
    amenities: ["Bàn pool", "Âm thanh", "Cafe", "Điều hòa", "Nhận đặt nhóm"],
    description:
      "Cơ sở Hoàng Quốc Việt nằm ở khu Cầu Giấy, thuận tiện cho nhóm văn phòng, sinh viên và khách chơi buổi tối.",
  },
  {
    id: "cs3",
    code: "CS3",
    name: "99 Billiards Xuân Thủy",
    district: "Cầu Giấy",
    address: "99 Xuân Thủy, làng Vòng, Cầu Giấy, Hà Nội",
    phone: "0923 699 999",
    hours: "24/24",
    status: "busy",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=99%20Xuan%20Thuy%20Ha%20Noi",
    mapEmbedUrl: mapEmbed,
    image: `${imageBase}1543857778-c4a1a3e0b2eb?auto=format&fit=crop&w=1400&q=80`,
    gallery: gallery("1543857778-c4a1a3e0b2eb"),
    highlights: ["Vị trí sinh viên", "Nhiều tầng", "Kèo livestream"],
    amenities: ["Bàn pool", "Livestream", "Đồ uống", "Combo nhóm", "Mở xuyên đêm"],
    description:
      "Cơ sở Xuân Thủy có nhịp chơi sôi động, gần các trường đại học và thường là điểm hẹn của các kèo giao lưu.",
  },
  {
    id: "cs4",
    code: "CS4",
    name: "99 Billiards Nguyễn Lương Bằng",
    district: "Đống Đa",
    address: "88 Nguyễn Lương Bằng, Đống Đa, Hà Nội",
    phone: "0923 699 999",
    hours: "24/24",
    status: "open",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=88%20Nguyen%20Luong%20Bang%20Ha%20Noi",
    mapEmbedUrl: mapEmbed,
    image: `${imageBase}1601579113673-5b4119f09912?auto=format&fit=crop&w=1400&q=80`,
    gallery: gallery("1601579113673-5b4119f09912"),
    highlights: ["Trung tâm Đống Đa", "Ca đêm", "Dịch vụ nhanh"],
    amenities: ["Bàn pool", "Cafe", "Đồ ăn nhanh", "Điều hòa", "Gọi bàn nhanh"],
    description:
      "Cơ sở Nguyễn Lương Bằng phục vụ khu trung tâm Đống Đa, phù hợp cho khách đi theo nhóm nhỏ hoặc đặt bàn sau giờ làm.",
  },
  {
    id: "cs5",
    code: "CS5",
    name: "99 Billiards Định Công",
    district: "Hoàng Mai",
    address: "Tòa B, 96 Định Công, Phương Liệt, Hà Nội",
    phone: "0923 699 999",
    hours: "24/24",
    status: "open",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=96%20Dinh%20Cong%20Ha%20Noi",
    mapEmbedUrl: mapEmbed,
    image: `${imageBase}1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80`,
    gallery: gallery("1519681393784-d120267933ba"),
    highlights: ["Khu phía Nam", "Bãi xe tiện", "Combo nhóm"],
    amenities: ["Bãi xe", "Bàn pool", "Combo nhóm", "Cafe", "Mở khuya"],
    description:
      "Cơ sở Định Công phục vụ khách khu phía Nam Hà Nội, thuận tiện cho nhóm bạn đặt bàn chơi dài giờ.",
  },
  {
    id: "cs6",
    code: "CS6",
    name: "99 Billiards Khương Trung",
    district: "Thanh Xuân",
    address: "59 Khương Trung, Thanh Xuân, Hà Nội",
    phone: "0923 699 999",
    hours: "24/24",
    status: "open",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=59%20Khuong%20Trung%20Ha%20Noi",
    mapEmbedUrl: mapEmbed,
    image: `${imageBase}1593705683481-9148a70d97c7?auto=format&fit=crop&w=1400&q=80`,
    gallery: gallery("1593705683481-9148a70d97c7"),
    highlights: ["Cơ sở mới", "Âm thanh riêng", "Không gian rộng"],
    amenities: ["Âm thanh", "Bàn pool", "Cafe", "Đồ ăn", "Livestream"],
    description:
      "Cơ sở Khương Trung có không gian mới, phù hợp cho kèo đông người và các buổi chơi tối muộn.",
  },
  {
    id: "cs7",
    code: "CS7",
    name: "99 Billiards Võ Chí Công",
    district: "Tây Hồ",
    address: "99 Võ Chí Công, Hà Nội",
    phone: "0923 699 999",
    hours: "24/24",
    status: "coming-soon",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=99%20Vo%20Chi%20Cong%20Ha%20Noi",
    mapEmbedUrl: mapEmbed,
    image: `${imageBase}1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=80`,
    gallery: gallery("1517457373958-b7bdd4587205"),
    highlights: ["Khu Tây Hồ", "Sắp khai trương", "Đăng ký nhận ưu đãi"],
    amenities: ["Sắp khai trương", "Nhận đăng ký", "Ưu đãi mở bán"],
    description:
      "Cơ sở Võ Chí Công đang trong giai đoạn chuẩn bị, khách có thể theo dõi để nhận ưu đãi khai trương.",
  },
  {
    id: "cs8",
    code: "CS8",
    name: "99 Billiards 168 Nguyễn Văn Giáp",
    district: "Nam Từ Liêm",
    address: "168 Nguyễn Văn Giáp, Hà Nội",
    phone: "0923 699 999",
    hours: "24/24",
    status: "open",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=168%20Nguyen%20Van%20Giap%20Ha%20Noi",
    mapEmbedUrl: mapEmbed,
    image: `${imageBase}1504805572947-34fad45aed93?auto=format&fit=crop&w=1400&q=80`,
    gallery: gallery("1504805572947-34fad45aed93"),
    highlights: ["Cụm Nguyễn Văn Giáp", "Đông khách", "Livestream"],
    amenities: ["Bàn pool", "Livestream", "Cafe", "Đồ ăn", "Mở 24/24"],
    description:
      "Cơ sở 168 Nguyễn Văn Giáp mở rộng cụm Nam Từ Liêm, phù hợp cho khách cần nhiều lựa chọn bàn trong khung giờ cao điểm.",
  },
];

export const products: Product[] = [
  { id: "p1", name: "Giờ bàn Pool tiêu chuẩn", category: "Dịch vụ bàn", price: 70000, featured: true, image: `${imageBase}1551009175-15bdf9dcb580?auto=format&fit=crop&w=900&q=80` },
  { id: "p2", name: "Giờ bàn VIP", category: "Dịch vụ bàn", price: 120000, featured: true, image: `${imageBase}1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80` },
  { id: "p3", name: "Combo đêm 4 người", category: "Combo", price: 299000, featured: true, image: `${imageBase}1532635241-17e820acc59f?auto=format&fit=crop&w=900&q=80` },
  { id: "p4", name: "Bạc xỉu 99", category: "Đồ uống", price: 39000, image: `${imageBase}1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80` },
  { id: "p5", name: "Nước ép nhiệt đới", category: "Đồ uống", price: 49000, image: `${imageBase}1622597467836-f3285f2131b8?auto=format&fit=crop&w=900&q=80` },
  { id: "p6", name: "Mì bò trứng 99", category: "Đồ ăn", price: 59000, image: `${imageBase}1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80` },
];

export const promotions: Promotion[] = [
  {
    id: "pr1",
    title: "Happy Hour trước 17h",
    description: "Giảm đến 20% giờ bàn cho khách đặt trước trong khung giờ thấp điểm.",
    content:
      "Ưu đãi Happy Hour áp dụng cho khách đặt bàn trước trong khung giờ thấp điểm. Phù hợp cho nhóm muốn luyện cơ, chơi thư giãn sau giờ học hoặc hẹn đồng nghiệp trước giờ cao điểm.",
    badge: "-20%",
    image: `${imageBase}1606167668584-b7d220189edc?auto=format&fit=crop&w=1200&q=80`,
    branchIds: ["cs1", "cs2", "cs3"],
    seoTitle: "Happy Hour 99 Billiards - Ưu đãi trước 17h",
    seoDescription: "Giảm đến 20% giờ bàn tại 99 Billiards cho khách đặt trước trong khung giờ thấp điểm.",
  },
  {
    id: "pr2",
    title: "Sinh viên lên cơ",
    description: "Ưu đãi riêng cho nhóm học sinh, sinh viên khi xuất trình thẻ.",
    content:
      "Sinh viên lên cơ là ưu đãi dành cho nhóm bạn trẻ muốn chơi thường xuyên với chi phí dễ chịu. Khách chỉ cần đặt bàn và xuất trình thẻ hợp lệ tại cơ sở áp dụng.",
    badge: "Student",
    image: `${imageBase}1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80`,
    branchIds: ["cs2", "cs3"],
  },
  {
    id: "pr3",
    title: "Kèo đêm 99",
    description: "Combo chơi khuya kèm đồ uống cho nhóm bạn sau 22h.",
    content:
      "Kèo đêm 99 dành cho nhóm bạn thích không khí muộn, nhiều thời gian chơi và cần combo đồ uống đi kèm. Nên đặt trước để giữ bàn đẹp.",
    badge: "Night",
    image: `${imageBase}1544148103-0773bf10d330?auto=format&fit=crop&w=1200&q=80`,
    branchIds: ["cs4", "cs6"],
  },
];

export const posts: Post[] = [
  {
    id: "n1",
    title: "99 Open: sân chơi mới cho cộng đồng pool Hà Nội",
    excerpt: "Một lịch đấu dày, nhiều kèo căng và khán giả theo dõi liên tục trên social.",
    content:
      "99 Open là chuỗi hoạt động giúp cộng đồng cơ thủ phong trào có thêm sân chơi đều đặn. Không khí tại club tập trung vào trải nghiệm thi đấu, giao lưu và các trận livestream dễ theo dõi.",
    category: "Giải đấu",
    publishedAt: "2026-05-12",
    image: `${imageBase}1541305678321-60de370004b7?auto=format&fit=crop&w=1200&q=80`,
    seoTitle: "99 Open - Giải đấu pool phong trào tại Hà Nội",
    seoDescription: "Tin tức giải đấu, kèo giao lưu và hoạt động cộng đồng tại 99 Billiards Club.",
  },
  {
    id: "n2",
    title: "CS6 Khương Trung hoàn thiện hệ thống âm thanh",
    excerpt: "Không gian mới được tinh chỉnh để phục vụ cả trải nghiệm chơi và livestream.",
    content:
      "Cơ sở Khương Trung được đầu tư thêm âm thanh và không gian vận hành để phục vụ tốt hơn các nhóm chơi, khách xem kèo và hoạt động livestream tại club.",
    category: "Cơ sở",
    publishedAt: "2026-04-28",
    image: `${imageBase}1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80`,
  },
  {
    id: "n3",
    title: "Lịch livestream kèo hot cuối tuần",
    excerpt: "Theo dõi fanpage và TikTok 99 Billiards Club để không bỏ lỡ các trận đáng xem.",
    content:
      "Các trận livestream cuối tuần thường được cập nhật trên fanpage và TikTok của 99 Billiards Club. Khách có thể theo dõi lịch để đến xem trực tiếp hoặc đặt bàn gần khung giờ diễn ra kèo.",
    category: "Livestream",
    publishedAt: "2026-04-20",
    image: `${imageBase}1551817958-20204d6ab1da?auto=format&fit=crop&w=1200&q=80`,
  },
];

export const siteSettings: SiteSettings = {
  siteName: "99 Billiards",
  heroImage: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=2200&q=80",
  defaultSeoTitle: "99 Billiards - Chuỗi billiards hiện đại tại Hà Nội",
  defaultSeoDescription:
    "Xem cơ sở, ưu đãi, tin tức và đặt bàn nhanh tại hệ thống 99 Billiards Club.",
  gaId: "",
  metaPixelId: "",
  tiktokPixelId: "",
};
