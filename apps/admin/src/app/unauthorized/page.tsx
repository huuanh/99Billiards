import Link from "next/link";
import { AdminShell, Panel } from "@/components/admin-shell";

export default function UnauthorizedPage() {
  return (
    <AdminShell title="Khong co quyen" subtitle="Tai khoan hien tai khong co quyen mo chuc nang nay.">
      <Panel title="Bi gioi han truy cap">
        <p className="text-sm leading-6 text-[#596256]">
          Hay lien he admin neu can mo them quyen cho tai khoan nay.
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
