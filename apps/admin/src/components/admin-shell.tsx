import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAdmin } from "@/app/login/actions";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Cơ sở", href: "/branches" },
  { label: "Sản phẩm", href: "/products" },
  { label: "Ưu đãi", href: "/promotions" },
  { label: "Tin tức", href: "/posts" },
  { label: "Đặt bàn", href: "/bookings" },
  { label: "Media", href: "/media" },
  { label: "Settings", href: "/settings" },
];

export async function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <main className="min-h-screen bg-[#f4f6ef] text-[#0a100c]">
      <aside className="fixed bottom-0 left-0 top-0 hidden w-72 border-r border-black/10 bg-[#071107] p-6 text-white lg:block">
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-2xl">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#d6ff3f] text-xl font-black text-black">
            99
          </span>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em]">Billiards</p>
            <p className="text-xs text-white/45">Admin CMS</p>
          </div>
        </Link>
        <nav className="mt-12 grid gap-2 text-sm font-bold text-white/70">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring min-h-11 rounded-2xl px-4 py-3 hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <section className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-black/10 bg-[#f4f6ef]/80 px-4 py-4 backdrop-blur-xl md:px-8">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                admin.99billiards.vn
              </p>
              <h1 className="text-3xl font-black">{title}</h1>
              <p className="mt-1 text-sm text-black/55">{subtitle}</p>
            </div>
            <div className="rounded-full bg-[#071107] px-4 py-2 text-sm font-bold text-white">
              {session.email}
            </div>
            <form action={logoutAdmin}>
              <button className="focus-ring min-h-11 rounded-full border border-black/10 px-4 py-2 text-sm font-bold">
                Đăng xuất
              </button>
            </form>
          </div>
        </header>

        <div className="p-4 md:p-8">{children}</div>
      </section>
    </main>
  );
}

export function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.4rem] bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-black/45">{label}</p>
      <p className="mt-3 text-4xl font-black">{value}</p>
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-2xl font-black">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-black/55">{subtitle}</p> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Input({
  name,
  label,
  placeholder,
  defaultValue,
}: {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string | number;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="rounded-2xl border border-black/10 bg-[#f4f6ef] px-4 py-3 outline-none focus:border-emerald-700"
      />
    </label>
  );
}

export function Textarea({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={3}
        className="rounded-2xl border border-black/10 bg-[#f4f6ef] px-4 py-3 outline-none focus:border-emerald-700"
      />
    </label>
  );
}

export function Select({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  options: string[];
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="rounded-2xl border border-black/10 bg-[#f4f6ef] px-4 py-3 outline-none focus:border-emerald-700"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SaveButton({ label = "Lưu" }: { label?: string }) {
  return (
    <button className="focus-ring min-h-11 rounded-2xl bg-[#d6ff3f] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-black">
      {label}
    </button>
  );
}
