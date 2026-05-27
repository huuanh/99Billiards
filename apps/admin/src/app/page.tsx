import Link from "next/link";
import { getBookings, getBranches, getPosts, getProducts, getPromotions } from "@99billiards/db";
import { AdminShell, Metric, Panel, StatusPill } from "@/components/admin-shell";
import { requirePermission } from "@/lib/auth";

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
  { label: "Thêm cơ sở", href: "/branches", note: "Cập nhật điểm chơi" },
  { label: "Upload ảnh", href: "/media", note: "Quản lý asset" },
  { label: "Tạo ưu đãi", href: "/promotions", note: "Marketing" },
  { label: "Xem booking", href: "/bookings", note: "Vận hành" },
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
  await requirePermission("dashboard");
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
        <>
          <Link
            href="/bookings?status=new"
            className="focus-ring min-h-9 rounded-md bg-[#d6ff3f] px-3 py-2 text-sm font-black text-black"
          >
            Xử lý booking
          </Link>
          <Link
            href="/products"
            className="focus-ring min-h-9 rounded-md border border-[#cfd5c8] bg-white px-3 py-2 text-sm font-black text-[#111713]"
          >
            Catalog
          </Link>
        </>
      }
    >
      <section className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <div className="rounded-lg border border-[#dfe3d8] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#007a53]">Tình trạng vận hành</p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black leading-tight">
                {newBookings.length ? `${newBookings.length} booking mới cần xử lý` : "Không có booking mới"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#657064]">
                Theo dõi dữ liệu public site, catalog và booking tại một nơi. Ưu tiên xử lý booking mới trước khi cập nhật nội dung CMS.
              </p>
            </div>
            <StatusPill label={newBookings.length ? "Cần xử lý" : "Ổn định"} tone={newBookings.length ? "warning" : "good"} />
          </div>
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-3 rounded-lg border border-[#dfe3d8] bg-[#0b120d] p-4 text-white shadow-sm md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          <MiniStat label="Cơ sở" value={branches.length} />
          <MiniStat label="Sản phẩm" value={products.length} />
          <MiniStat label="Nội dung" value={promotions.length + posts.length} />
          <MiniStat label="Booking" value={bookings.length} />
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-5">
        <Metric label="Cơ sở" value={branches.length} note="đang hiển thị" />
        <Metric label="Sản phẩm" value={products.length} note="published" />
        <Metric label="Ưu đãi" value={promotions.length} note="active" />
        <Metric label="Tin tức" value={posts.length} note="bài viết" />
        <Metric label="Booking mới" value={newBookings.length} note={`${bookings.length} tổng`} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
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
                    <tr key={booking._id || `${booking.phone}-${booking.bookingDate}`} className="hover:bg-[#fbfcf8]">
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
                  <span>
                    <span className="block">{action.label}</span>
                    <span className="mt-0.5 block text-xs font-bold text-[#657064]">{action.note}</span>
                  </span>
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

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/8 p-3">
      <p className="text-2xl font-black tabular-nums">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/45">{label}</p>
    </div>
  );
}
