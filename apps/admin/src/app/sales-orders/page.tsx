import Link from "next/link";
import { getSalesOrders } from "@99billiards/db";
import type { SalesOrder } from "@99billiards/db/seed";
import { FontAwesomeIcon, formatCurrency } from "@99billiards/ui";
import { deleteSalesOrder, updateSalesOrderStatus } from "../actions";
import { AdminShell, Panel, StatusPill, Toolbar } from "@/components/admin-shell";
import { requirePermission } from "@/lib/auth";

interface SalesOrderRow extends SalesOrder {
  _id: string;
}

const statuses = [
  { value: "all", label: "Tất cả" },
  { value: "new", label: "Moi" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "shipping", label: "Đang giao" },
  { value: "completed", label: "Hoan tat" },
  { value: "cancelled", label: "Đã hủy" },
];

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function statusLabel(status?: string) {
  if (status === "confirmed") return "Đã xác nhận";
  if (status === "shipping") return "Đang giao";
  if (status === "completed") return "Hoan tat";
  if (status === "cancelled") return "Đã hủy";
  return "Moi";
}

function statusTone(status?: string) {
  if (status === "confirmed" || status === "shipping") return "good" as const;
  if (status === "cancelled") return "danger" as const;
  if (status === "completed") return "neutral" as const;
  return "warning" as const;
}

function matchesSearch(order: SalesOrderRow, query: string) {
  if (!query) return true;
  return [
    order.orderCode,
    order.customerName,
    order.phone,
    order.email,
    order.address,
    order.items?.map((item) => item.name).join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query.toLowerCase());
}

export default async function SalesOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("sales");
  const params = searchParams ? await searchParams : {};
  const activeStatus = getParam(params.status) || "all";
  const query = getParam(params.q) || "";
  const orders = (await getSalesOrders()) as SalesOrderRow[];
  const filteredOrders = orders.filter((order) => {
    const status = order.status || "new";
    return (activeStatus === "all" || status === activeStatus) && matchesSearch(order, query);
  });
  const counts = statuses.reduce<Record<string, number>>((total, status) => {
    total[status.value] =
      status.value === "all"
        ? orders.length
        : orders.filter((order) => (order.status || "new") === status.value).length;
    return total;
  }, {});

  return (
    <AdminShell title="Bán hàng" subtitle="Theo dõi đơn hàng từ website, xác nhận COD và cập nhật trạng thái giao hàng.">
      <Panel
        title="Đơn hàng website"
        subtitle={`${filteredOrders.length} kết quả trên ${orders.length} đơn hàng.`}
        aside={<StatusPill label={`${counts.new || 0} mới`} tone={counts.new ? "warning" : "good"} />}
      >
        <Toolbar>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <Link
                key={status.value}
                href={`/sales-orders?status=${status.value}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
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
          <form className="flex min-w-0 flex-col gap-2 sm:flex-row" action="/sales-orders">
            <input type="hidden" name="status" value={activeStatus} />
            <input
              name="q"
              defaultValue={query}
              placeholder="Tìm mã đơn, tên, SĐT..."
              className="min-h-9 w-full rounded-md border border-[#cfd5c8] bg-white px-3 py-2 text-sm outline-none focus:border-[#007a53] sm:w-72"
            />
            <button className="focus-ring min-h-9 rounded-md bg-[#111713] px-3 py-2 text-sm font-bold text-white">
              <span className="inline-flex items-center gap-2">
                <FontAwesomeIcon icon="magnifying-glass" className="h-3.5 w-3.5" />
                Loc
              </span>
            </button>
          </form>
        </Toolbar>

        <div className="overflow-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="border-b border-[#e7eadf] text-[11px] uppercase tracking-[0.14em] text-[#657064]">
              <tr>
                <th className="px-3 py-2">Đơn hàng</th>
                <th className="px-3 py-2">Khach</th>
                <th className="px-3 py-2">Địa chỉ</th>
                <th className="px-3 py-2">Sản phẩm</th>
                <th className="px-3 py-2">Tổng tiền</th>
                <th className="px-3 py-2">Thanh toán</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Thao tac</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef1e9]">
              {filteredOrders.length ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="align-top hover:bg-[#fbfcf8]">
                    <td className="px-3 py-3">
                      <p className="font-black">{order.orderCode || String(order._id).slice(-8)}</p>
                      <p className="mt-1 text-xs text-[#657064]">{order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "-"}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-black">{order.customerName}</p>
                      <p className="mt-1 text-xs font-bold text-[#657064]">{order.phone}</p>
                      {order.email ? <p className="mt-1 text-xs text-[#657064]">{order.email}</p> : null}
                    </td>
                    <td className="max-w-[260px] px-3 py-3 text-[#4f594f]">
                      <p className="font-bold">{order.address}</p>
                      <p className="mt-1 text-xs text-[#657064]">
                        {[order.ward, order.district, order.province].filter(Boolean).join(", ") || "-"}
                      </p>
                      {order.note ? <p className="mt-2 line-clamp-2 text-xs">{order.note}</p> : null}
                    </td>
                    <td className="max-w-[320px] px-3 py-3">
                      <div className="grid gap-2">
                        {(order.items || []).map((item) => (
                          <div key={`${order._id}-${item.productId}`} className="flex justify-between gap-3">
                            <span className="font-bold">{item.name} x{item.quantity}</span>
                            <span className="text-[#657064]">{formatCurrency(item.total)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-black">{formatCurrency(order.total || 0)}</td>
                    <td className="px-3 py-3 font-bold uppercase">{order.paymentMethod || "cod"}</td>
                    <td className="px-3 py-3">
                      <StatusPill label={statusLabel(order.status)} tone={statusTone(order.status)} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-2">
                        <form action={updateSalesOrderStatus} className="flex gap-2">
                          <input type="hidden" name="id" value={String(order._id)} />
                          <select
                            name="status"
                            defaultValue={order.status || "new"}
                            className="min-h-9 rounded-md border border-[#cfd5c8] bg-white px-2 py-1 text-sm"
                          >
                            <option value="new">Moi</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="shipping">Đang giao</option>
                            <option value="completed">Hoan tat</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                          <button className="min-h-9 rounded-md bg-[#111713] px-3 py-1 text-sm font-bold text-white">
                            <span className="inline-flex items-center gap-2">
                              <FontAwesomeIcon icon="floppy-disk" className="h-3.5 w-3.5" />
                              Lưu
                            </span>
                          </button>
                        </form>
                        <form action={deleteSalesOrder}>
                          <input type="hidden" name="id" value={String(order._id)} />
                          <button className="min-h-9 rounded-md border border-red-200 bg-red-50 px-3 py-1 text-sm font-bold text-red-700">
                            <span className="inline-flex items-center gap-2">
                              <FontAwesomeIcon icon="trash" className="h-3.5 w-3.5" />
                              Xóa đơn
                            </span>
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-[#657064]">
                    Không có đơn hàng phù hợp bộ lọc hiện tại.
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
