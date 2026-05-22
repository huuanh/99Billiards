import Link from "next/link";
import { getBookings, getBranches } from "@99billiards/db";
import { deleteBooking, updateBookingStatus } from "../actions";
import { AdminShell, Panel, StatusPill, Toolbar } from "@/components/admin-shell";

type BookingRow = {
  _id: string;
  customerName?: string;
  phone?: string;
  branchId?: string;
  bookingDate?: string;
  bookingTime?: string;
  guestCount?: number;
  promotionId?: string;
  note?: string;
  status?: string;
};

type BranchRow = {
  id?: string;
  code?: string;
  name?: string;
};

const statuses = [
  { value: "all", label: "Tất cả" },
  { value: "new", label: "Mới" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "completed", label: "Hoàn tất" },
  { value: "cancelled", label: "Đã hủy" },
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

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function matchesSearch(booking: BookingRow, query: string) {
  if (!query) return true;
  const haystack = [
    booking.customerName,
    booking.phone,
    booking.branchId,
    booking.bookingDate,
    booking.bookingTime,
    booking.note,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const activeStatus = getParam(params.status) || "all";
  const query = getParam(params.q) || "";
  const [bookingsRaw, branchesRaw] = await Promise.all([getBookings(), getBranches()]);
  const bookings = bookingsRaw as BookingRow[];
  const branches = branchesRaw as BranchRow[];
  const branchMap = new Map(
    branches.map((branch) => [
      branch.id || branch.code?.toLowerCase() || "",
      branch.name || branch.code || branch.id || "",
    ]),
  );

  const filteredBookings = bookings.filter((booking) => {
    const status = booking.status || "new";
    return (activeStatus === "all" || status === activeStatus) && matchesSearch(booking, query);
  });

  const counts = statuses.reduce<Record<string, number>>((total, status) => {
    total[status.value] =
      status.value === "all"
        ? bookings.length
        : bookings.filter((booking) => (booking.status || "new") === status.value).length;
    return total;
  }, {});

  return (
    <AdminShell
      title="Đặt bàn"
      subtitle="Theo dõi booking mới, lọc nhanh theo trạng thái và cập nhật xử lý cho từng khách."
      actions={
        <Link
          href="/bookings?status=new"
          className="focus-ring min-h-9 rounded-md bg-[#d6ff3f] px-3 py-2 text-sm font-black text-black"
        >
          Booking mới
        </Link>
      }
    >
      <Panel
        title="Bảng đặt bàn"
        subtitle={`${filteredBookings.length} kết quả trên ${bookings.length} booking.`}
        aside={<StatusPill label={`${counts.new || 0} mới`} tone={counts.new ? "warning" : "good"} />}
      >
        <Toolbar>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <Link
                key={status.value}
                href={`/bookings?status=${status.value}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className={`focus-ring min-h-9 rounded-md border px-3 py-2 text-sm font-black ${
                  activeStatus === status.value
                    ? "border-[#111713] bg-[#111713] text-white"
                    : "border-[#dfe3d8] bg-white text-[#2b332d]"
                }`}
              >
                {status.label} ({counts[status.value] || 0})
              </Link>
            ))}
          </div>

          <form className="flex min-w-0 flex-col gap-2 sm:flex-row" action="/bookings">
            <input type="hidden" name="status" value={activeStatus} />
            <input
              name="q"
              defaultValue={query}
              placeholder="Tìm tên, SĐT, cơ sở..."
              className="min-h-9 w-full rounded-md border border-[#cfd5c8] bg-white px-3 py-2 text-sm outline-none focus:border-[#007a53] sm:w-72"
            />
            <button className="focus-ring min-h-9 rounded-md bg-[#111713] px-3 py-2 text-sm font-bold text-white">
              Lọc
            </button>
          </form>
        </Toolbar>

        <div className="overflow-auto">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead className="border-b border-[#e7eadf] text-[11px] uppercase tracking-[0.14em] text-[#657064]">
              <tr>
                <th className="px-3 py-2">Khách</th>
                <th className="px-3 py-2">Cơ sở</th>
                <th className="px-3 py-2">Lịch hẹn</th>
                <th className="px-3 py-2">Số khách</th>
                <th className="px-3 py-2">Ưu đãi</th>
                <th className="px-3 py-2">Ghi chú</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef1e9]">
              {filteredBookings.length ? (
                filteredBookings.map((booking) => (
                  <tr key={booking._id} className="align-top hover:bg-[#fbfcf8]">
                    <td className="px-3 py-3">
                      <p className="font-black">{booking.customerName || "-"}</p>
                      <p className="mt-1 text-xs font-bold text-[#657064]">{booking.phone || "-"}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-bold uppercase">{booking.branchId || "-"}</p>
                      <p className="mt-1 max-w-[180px] truncate text-xs text-[#657064]">
                        {branchMap.get(booking.branchId || "") || "Chưa khớp cơ sở"}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-bold">{booking.bookingDate || "-"}</p>
                      <p className="mt-1 text-xs text-[#657064]">{booking.bookingTime || "-"}</p>
                    </td>
                    <td className="px-3 py-3 font-bold">{booking.guestCount || "-"}</td>
                    <td className="px-3 py-3">{booking.promotionId || "-"}</td>
                    <td className="max-w-[240px] px-3 py-3 text-[#4f594f]">
                      <p className="line-clamp-3">{booking.note || "-"}</p>
                    </td>
                    <td className="px-3 py-3">
                      <StatusPill label={statusLabel(booking.status)} tone={statusTone(booking.status)} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-2">
                        <form action={updateBookingStatus} className="flex gap-2">
                          <input type="hidden" name="id" value={String(booking._id)} />
                          <select
                            name="status"
                            defaultValue={booking.status || "new"}
                            className="min-h-9 rounded-md border border-[#cfd5c8] bg-white px-2 py-1 text-sm"
                          >
                            <option value="new">Mới</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="cancelled">Đã hủy</option>
                            <option value="completed">Hoàn tất</option>
                          </select>
                          <button className="min-h-9 rounded-md bg-[#111713] px-3 py-1 text-sm font-bold text-white">
                            Lưu
                          </button>
                        </form>
                        <form action={deleteBooking}>
                          <input type="hidden" name="id" value={String(booking._id)} />
                          <button className="min-h-9 rounded-md border border-red-200 bg-red-50 px-3 py-1 text-sm font-bold text-red-700">
                            Xóa booking
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-[#657064]">
                    Không có booking phù hợp bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </AdminShell>
  );
}
