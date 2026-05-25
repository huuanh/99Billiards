import { getAdminUsers } from "@99billiards/db";
import { updateAdminUserRole, updateAdminUserStatus } from "../actions";
import { AdminShell, Panel, StatusPill } from "@/components/admin-shell";
import { requirePermission, roleLabels, type AdminRole } from "@/lib/auth";

type AdminUserRow = {
  _id: string;
  email: string;
  name?: string;
  picture?: string;
  role?: AdminRole;
  status?: "active" | "disabled";
  lastLoginAt?: string;
  createdAt?: string;
};

const roles: AdminRole[] = ["admin", "manager", "operator", "pending"];

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function UsersPage() {
  await requirePermission("users");
  const users = (await getAdminUsers()) as AdminUserRow[];

  return (
    <AdminShell title="Users" subtitle="Quan tri tai khoan Google va phan quyen admin.">
      <Panel
        title="Danh sach user"
        subtitle="User moi dang nhap Google se o trang thai cho phan quyen."
      >
        <div className="overflow-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-[#e7eadf] text-[11px] uppercase tracking-[0.14em] text-[#657064]">
              <tr>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Quyen</th>
                <th className="px-3 py-2">Trang thai</th>
                <th className="px-3 py-2">Dang nhap gan nhat</th>
                <th className="px-3 py-2">Thao tac</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef1e9]">
              {users.length ? (
                users.map((user) => (
                  <tr key={user._id} className="align-middle hover:bg-[#fbfcf8]">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        {user.picture ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.picture} alt="" className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#111713] text-sm font-black text-white">
                            {(user.name || user.email || "?").slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-black">{user.name || user.email}</p>
                          <p className="text-xs font-bold text-[#657064]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <StatusPill label={roleLabels[user.role || "pending"]} tone={user.role === "pending" ? "warning" : "good"} />
                    </td>
                    <td className="px-3 py-3">
                      <StatusPill
                        label={user.status === "disabled" ? "Khoa" : "Active"}
                        tone={user.status === "disabled" ? "danger" : "good"}
                      />
                    </td>
                    <td className="px-3 py-3 text-[#596256]">{formatDate(user.lastLoginAt)}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <form action={updateAdminUserRole} className="flex gap-2">
                          <input type="hidden" name="_id" value={user._id} />
                          <select
                            name="role"
                            defaultValue={user.role || "pending"}
                            className="min-h-9 rounded-md border border-[#cfd5c8] bg-white px-2 py-1 text-sm"
                          >
                            {roles.map((role) => (
                              <option key={role} value={role}>
                                {roleLabels[role]}
                              </option>
                            ))}
                          </select>
                          <button className="min-h-9 rounded-md bg-[#111713] px-3 py-1 text-sm font-bold text-white">
                            Luu
                          </button>
                        </form>
                        <form action={updateAdminUserStatus}>
                          <input type="hidden" name="_id" value={user._id} />
                          <input
                            type="hidden"
                            name="status"
                            value={user.status === "disabled" ? "active" : "disabled"}
                          />
                          <button className="min-h-9 rounded-md border border-[#cfd5c8] bg-white px-3 py-1 text-sm font-bold text-[#111713]">
                            {user.status === "disabled" ? "Mo khoa" : "Khoa"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center text-[#657064]">
                    Chua co user Google nao.
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
