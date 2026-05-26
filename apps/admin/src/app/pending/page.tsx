import { logoutAdmin } from "../login/actions";
import { requireAdmin, roleLabels } from "@/lib/auth";

export default async function PendingPage() {
  const session = await requireAdmin();

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f7f3] px-4 text-[#111713]">
      <section className="w-full max-w-lg rounded-lg border border-[#dfe3d8] bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#657064]">
          {roleLabels[session.role]}
        </p>
        <h1 className="mt-3 text-3xl font-black">Đang chờ admin phân quyền</h1>
        <p className="mt-3 text-sm leading-6 text-[#596256]">
          Tai khoan {session.email} đã đăng nhập thành công, nhưng chưa có quyền truy cập admin.
          Vui lòng đợi admin cấp role trong mục Users.
        </p>
        <form action={logoutAdmin} className="mt-6">
          <button className="focus-ring min-h-10 rounded-md bg-[#111713] px-4 py-2 text-sm font-bold text-white">
            Đăng xuất
          </button>
        </form>
      </section>
    </main>
  );
}
