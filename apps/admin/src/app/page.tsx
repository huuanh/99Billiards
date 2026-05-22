import Link from "next/link";
import { getBookings, getBranches, getPosts, getProducts, getPromotions } from "@99billiards/db";
import { AdminShell, Metric, Panel, StatusPill } from "@/components/admin-shell";

type BookingRow = {
  _id?: string;
  customerName?: string;
  phone?: string;
  branchId?: string;
  bookingDate?: string;
  bookingTime?: string;
  guestCount?: number;
  status?: string;
};

const quickActions = [
  { label: "Thêm cơ sở", href: "/branches" },
  { label: "Upload ảnh", href: "/media" },
  { label: "Tạo ưu đãi", href: "/promotions" },
  { label: "Xem booking", href: "/bookings" },
];

function statusLabel(status?: string) {
  if (status === "confirmed") return "Đã xác nhận";
  if (status === "cancelled") return "Đã hủy";
  if (status === "completed") return "Hoàn tất";
  return "Mới";
}

function statusTone(status?: string) {
  if (status === "confirmed") return "good" as const;
  if (status === "cancelled") return "danger" as const;
  if (status === "completed") return "neutral" as const;
  return "warning" as const;
}

export default async function AdminHome() {
  const [branches, products, promotions, posts, bookingsRaw] = await Promise.all([
    getBranches(),
    getProducts(),
    getPromotions(),
    getPosts(),
    getBookings(),
  ]);
  const bookings = bookingsRaw as BookingRow[];
  const newBookings = bookings.filter((booking) => !booking.status || booking.status === "new");
  const latestBookings = bookings.slice(0, 6);

  return (
    <AdminShell
      title="Dashboard"
      subtitle="Theo dõi nội dung, booking và tác vụ vận hành của hệ thống 99 Billiards."
      actions={
        <Link
          href="/bookings"
          className="focus-ring min-h-9 rounded-md bg-[#d6ff3f] px-3 py-2 text-sm font-black text-black"
        >
          Xử lý booking
        </Link>
      }
    >
      <div className="grid gap-3 md:grid-cols-5">
        <Metric label="Cơ sở" value={branches.length} note="đang hiển thị" />
        <Metric label="Sản phẩm" value={products.length} note="published" />
        <Metric label="Ưu đãi" value={promotions.length} note="active" />
        <Metric label="Tin tức" value={posts.length} note="bài viết" />
        <Metric label="Booking mới" value={newBookings.length} note={`${bookings.length} tổng`} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_340px]">
        <Panel
          title="Booking gần đây"
          subtitle="Danh sách yêu cầu đặt bàn mới nhất từ public website."
          aside={
            <Link href="/bookings" className="text-sm font-black text-[#007a53]">
              Mở bảng
            </Link>
          }
        >
          <div className="overflow-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-[#e7eadf] text-[11px] uppercase tracking-[0.14em] text-[#657064]">
                <tr>
                  <th className="px-3 py-2">Khách</th>
                  <th className="px-3 py-2">Điện thoại</th>
                  <th className="px-3 py-2">Cơ sở</th>
                  <th className="px-3 py-2">Lịch</th>
                  <th className="px-3 py-2">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef1e9]">
                {latestBookings.length ? (
                  latestBookings.map((booking) => (
                    <tr key={booking._id || `${booking.phone}-${booking.bookingDate}`}>
                      <td className="px-3 py-3 font-bold">{booking.customerName || "-"}</td>
                      <td className="px-3 py-3">{booking.phone || "-"}</td>
                      <td className="px-3 py-3 font-bold uppercase">{booking.branchId || "-"}</td>
                      <td className="px-3 py-3">
                        {booking.bookingDate || "-"} {booking.bookingTime || ""}
                      </td>
                      <td className="px-3 py-3">
                        <StatusPill
                          label={statusLabel(booking.status)}
                          tone={statusTone(booking.status)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-[#657064]">
                      Chưa có booking mới.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="grid gap-4">
          <Panel title="Tác vụ nhanh" subtitle="Các luồng quản trị hay dùng.">
            <div className="grid gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="focus-ring flex min-h-10 items-center justify-between rounded-md border border-[#dfe3d8] bg-[#f8faf5] px-3 py-2 text-sm font-black transition hover:border-[#b7c0af] hover:bg-white"
                >
                  <span>{action.label}</span>
                  <span className="text-[#657064]">›</span>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="Tình trạng CMS" subtitle="Những điểm cần chú ý trước khi publish.">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#657064]">Cơ sở đang quản lý</span>
                <strong>{branches.length}</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#657064]">Nội dung marketing</span>
                <strong>{promotions.length + posts.length}</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#657064]">Booking cần xử lý</span>
                <StatusPill label={`${newBookings.length}`} tone={newBookings.length ? "warning" : "good"} />
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </AdminShell>
  );
}
