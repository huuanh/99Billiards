import { getBookings, getBranches, getPosts, getProducts, getPromotions } from "@99billiards/db";
import { AdminShell, Metric, Panel } from "@/components/admin-shell";
import Link from "next/link";

export default async function AdminHome() {
  const [branches, products, promotions, posts, bookings] = await Promise.all([
    getBranches(),
    getProducts(),
    getPromotions(),
    getPosts(),
    getBookings(),
  ]);

  return (
    <AdminShell title="Dashboard" subtitle="Tổng quan nhanh hệ thống website 99 Billiards.">
      <div className="grid gap-4 md:grid-cols-5">
        <Metric label="Cơ sở" value={branches.length} />
        <Metric label="Sản phẩm" value={products.length} />
        <Metric label="Ưu đãi" value={promotions.length} />
        <Metric label="Tin tức" value={posts.length} />
        <Metric label="Đặt bàn" value={bookings.length} />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {[
          ["Cơ sở", "/branches", "Quản lý danh sách chi nhánh, trạng thái mở cửa, địa chỉ và ảnh."],
          ["Sản phẩm", "/products", "Quản lý dịch vụ bàn, combo, đồ uống và đồ ăn."],
          ["Đặt bàn", "/bookings", "Theo dõi booking mới và đổi trạng thái xử lý."],
        ].map(([title, href, text]) => (
          <Panel key={href} title={title} subtitle={text}>
            <Link href={href} className="font-black text-emerald-700">
              Mở bảng quản lý
            </Link>
          </Panel>
        ))}
      </div>
    </AdminShell>
  );
}
