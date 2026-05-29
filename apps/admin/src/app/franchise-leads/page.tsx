import Link from "next/link";
import { getFranchiseLeads } from "@99billiards/db";
import { deleteFranchiseLead, updateFranchiseLeadStatus } from "../actions";
import { AdminShell, Panel, StatusPill, Toolbar } from "@/components/admin-shell";
import { FRANCHISE_LEAD_WORKFLOW, StatusActions } from "@/components/status-actions";
import { requirePermission } from "@/lib/auth";

type FranchiseLeadRow = {
  _id: string;
  customerName?: string;
  phone?: string;
  area?: string;
  capital?: string;
  note?: string;
  status?: string;
  createdAt?: string;
};

const statuses = [
  { value: "all", label: "Tất cả" },
  { value: "new", label: "Mới" },
  { value: "contacted", label: "Đã liên hệ" },
  { value: "completed", label: "Hoàn tất" },
  { value: "cancelled", label: "Đã hủy" },
];

function statusLabel(status?: string) {
  if (status === "contacted" || status === "confirmed") return "Đã liên hệ";
  if (status === "cancelled") return "Đã hủy";
  if (status === "completed") return "Hoàn tất";
  return "Mới";
}

function statusTone(status?: string) {
  if (status === "contacted" || status === "confirmed") return "good" as const;
  if (status === "cancelled") return "danger" as const;
  if (status === "completed") return "neutral" as const;
  return "warning" as const;
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function matchesSearch(lead: FranchiseLeadRow, query: string) {
  if (!query) return true;
  const haystack = [lead.customerName, lead.phone, lead.area, lead.capital, lead.note]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export default async function FranchiseLeadsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("franchise");
  const params = searchParams ? await searchParams : {};
  const activeStatus = getParam(params.status) || "all";
  const query = getParam(params.q) || "";
  const leads = (await getFranchiseLeads()) as FranchiseLeadRow[];

  const filteredLeads = leads.filter((lead) => {
    const status = lead.status || "new";
    return (activeStatus === "all" || status === activeStatus) && matchesSearch(lead, query);
  });

  const counts = statuses.reduce<Record<string, number>>((total, status) => {
    total[status.value] =
      status.value === "all"
        ? leads.length
        : leads.filter((lead) => (lead.status || "new") === status.value).length;
    return total;
  }, {});

  return (
    <AdminShell
      title="Nhượng quyền"
      subtitle="Theo dõi đăng ký tư vấn nhượng quyền từ public website và cập nhật xử lý cho từng khách."
      actions={
        <Link
          href="/franchise-leads?status=new"
          className="focus-ring min-h-9 rounded-md bg-[#2EB958] px-3 py-2 text-sm font-black text-black"
        >
          Lead mới
        </Link>
      }
    >
      <Panel
        title="Bảng đăng ký nhượng quyền"
        subtitle={`${filteredLeads.length} kết quả trên ${leads.length} đăng ký.`}
        aside={<StatusPill label={`${counts.new || 0} mới`} tone={counts.new ? "warning" : "good"} />}
      >
        <Toolbar>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <Link
                key={status.value}
                href={`/franchise-leads?status=${status.value}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
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

          <form className="flex min-w-0 flex-col gap-2 sm:flex-row" action="/franchise-leads">
            <input type="hidden" name="status" value={activeStatus} />
            <input
              name="q"
              defaultValue={query}
              placeholder="Tìm tên, SĐT, khu vực..."
              className="min-h-9 w-full rounded-md border border-[#cfd5c8] bg-white px-3 py-2 text-sm outline-none focus:border-[#007a53] sm:w-72"
            />
            <button className="focus-ring min-h-9 rounded-md bg-[#111713] px-3 py-2 text-sm font-bold text-white">
              Lọc
            </button>
          </form>
        </Toolbar>

        <div className="overflow-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-[#e7eadf] text-[11px] uppercase tracking-[0.14em] text-[#657064]">
              <tr>
                <th className="px-3 py-2">Khách</th>
                <th className="px-3 py-2">Khu vực</th>
                <th className="px-3 py-2">Vốn dự kiến</th>
                <th className="px-3 py-2">Ghi chú</th>
                <th className="px-3 py-2">Thời gian</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef1e9]">
              {filteredLeads.length ? (
                filteredLeads.map((lead) => (
                  <tr key={lead._id} className="align-top hover:bg-[#fbfcf8]">
                    <td className="px-3 py-3">
                      <p className="font-black">{lead.customerName || "-"}</p>
                      <p className="mt-1 text-xs font-bold text-[#657064]">{lead.phone || "-"}</p>
                    </td>
                    <td className="px-3 py-3 font-bold">{lead.area || "-"}</td>
                    <td className="px-3 py-3">{lead.capital || "-"}</td>
                    <td className="max-w-[240px] px-3 py-3 text-[#4f594f]">
                      <p className="line-clamp-3">{lead.note || "-"}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-[#657064]">{formatDate(lead.createdAt)}</td>
                    <td className="px-3 py-3">
                      <StatusPill label={statusLabel(lead.status)} tone={statusTone(lead.status)} />
                    </td>
                    <td className="px-3 py-3">
                      <StatusActions
                        id={String(lead._id)}
                        status={lead.status || "new"}
                        workflow={FRANCHISE_LEAD_WORKFLOW}
                        updateAction={updateFranchiseLeadStatus}
                        deleteAction={deleteFranchiseLead}
                        deleteConfirmMessage={
                          lead.customerName
                            ? `Bạn chắc chắn muốn xóa đăng ký của "${lead.customerName}"?`
                            : "Bạn chắc chắn muốn xóa đăng ký này?"
                        }
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-[#657064]">
                    Không có đăng ký phù hợp bộ lọc hiện tại.
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
