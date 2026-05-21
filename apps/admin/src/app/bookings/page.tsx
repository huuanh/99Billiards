import { getBookings } from "@99billiards/db";
import { deleteBooking, updateBookingStatus } from "../actions";
import { AdminShell, Panel } from "@/components/admin-shell";

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

export default async function BookingsPage() {
  const bookings = (await getBookings()) as BookingRow[];

  return (
    <AdminShell title="Đặt bàn" subtitle="Theo dõi booking mới và cập nhật trạng thái xử lý.">
      <Panel title="Bảng đặt bàn" subtitle={`${bookings.length} yêu cầu đặt bàn.`}>
        <div className="overflow-auto">
          <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.18em] text-black/45">
              <tr>
                <th>Khách</th>
                <th>Điện thoại</th>
                <th>Cơ sở</th>
                <th>Ngày giờ</th>
                <th>Số khách</th>
                <th>Ưu đãi</th>
                <th>Ghi chú</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length ? (
                bookings.map((booking) => (
                  <tr key={booking._id} className="bg-[#f4f6ef]">
                    <td className="rounded-l-2xl p-3 font-bold">{booking.customerName}</td>
                    <td className="p-3">{booking.phone}</td>
                    <td className="p-3">{booking.branchId}</td>
                    <td className="p-3">
                      {booking.bookingDate} {booking.bookingTime}
                    </td>
                    <td className="p-3">{booking.guestCount}</td>
                    <td className="p-3">{booking.promotionId || "-"}</td>
                    <td className="p-3">{booking.note || "-"}</td>
                    <td className="rounded-r-2xl p-3">
                      <form action={updateBookingStatus} className="flex gap-2">
                        <input type="hidden" name="id" value={String(booking._id)} />
                        <select
                          name="status"
                          defaultValue={booking.status || "new"}
                          className="rounded-xl border border-black/10 px-3 py-2"
                        >
                          <option value="new">Mới</option>
                          <option value="confirmed">Đã xác nhận</option>
                          <option value="cancelled">Đã hủy</option>
                          <option value="completed">Hoàn tất</option>
                        </select>
                        <button className="rounded-xl bg-[#071107] px-3 py-2 font-bold text-white">
                          Lưu
                        </button>
                      </form>
                      <form action={deleteBooking} className="mt-2">
                        <input type="hidden" name="id" value={String(booking._id)} />
                        <button className="rounded-xl bg-red-50 px-3 py-2 font-bold text-red-700">
                          Xóa
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="rounded-2xl bg-[#f4f6ef] p-5 text-center">
                    Chưa có booking. Public form sẽ lưu tại đây khi có MongoDB.
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
