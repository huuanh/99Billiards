import Link from "next/link";
import { AdminShell, Panel } from "@/components/admin-shell";

export default function UnauthorizedPage() {
  return (
    <AdminShell title="Không có quyền" subtitle="Tài khoản hiện tại không có quyền mở chức năng này.">
      <Panel title="Bị giới hạn truy cập">
        <p className="text-sm leading-6 text-[#596256]">
          Hãy liên hệ admin nếu cần mở thêm quyền cho tài khoản này.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex min-h-10 items-center rounded-md bg-[#111713] px-4 py-2 text-sm font-bold text-white"
        >
          Ve dashboard
        </Link>
      </Panel>
    </AdminShell>
  );
}
