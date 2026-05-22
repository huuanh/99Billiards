import Link from "next/link";
import { logoutAdmin } from "@/app/login/actions";
import { requireAdmin } from "@/lib/auth";

const navItems = [
  { label: "Dashboard", href: "/", section: "Tổng quan" },
  { label: "Cơ sở", href: "/branches", section: "CMS" },
  { label: "Sản phẩm", href: "/products", section: "CMS" },
  { label: "Ưu đãi", href: "/promotions", section: "CMS" },
  { label: "Tin tức", href: "/posts", section: "CMS" },
  { label: "Đặt bàn", href: "/bookings", section: "Vận hành" },
  { label: "Media", href: "/media", section: "Tài sản" },
  { label: "Settings", href: "/settings", section: "Hệ thống" },
];

export async function AdminShell({
  title,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  await requireAdmin();
  const groupedNav = navItems.reduce<Record<string, typeof navItems>>((groups, item) => {
    groups[item.section] ||= [];
    groups[item.section].push(item);
    return groups;
  }, {});

  return (
    <main className="min-h-screen bg-[#f6f7f3] text-[#111713]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#dfe3d8] bg-[#0b120d] text-white lg:block">
        <div className="border-b border-white/10 px-5 py-4">
          <Link href="/" className="focus-ring flex items-center gap-3 rounded-lg">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#d6ff3f] text-lg font-black text-black">
              99
            </span>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em]">Billiards</p>
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Operations</p>
            </div>
          </Link>
        </div>

        <nav className="space-y-5 px-3 py-5">
          {Object.entries(groupedNav).map(([section, items]) => (
            <div key={section}>
              <p className="px-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
                {section}
              </p>
              <div className="mt-2 grid gap-1">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="focus-ring flex min-h-9 items-center justify-between rounded-md px-3 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
                  >
                    <span>{item.label}</span>
                    <span className="text-white/25">›</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <section className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-[#dfe3d8] bg-[#f6f7f3]/92 backdrop-blur-xl">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 md:px-6">
            <h1 className="min-w-0 truncate text-2xl font-black leading-tight md:text-3xl">{title}</h1>
            <form action={logoutAdmin}>
              <button className="focus-ring min-h-9 rounded-md bg-[#111713] px-3 py-2 text-sm font-bold text-white">
                Đăng xuất
              </button>
            </form>
          </div>
        </header>

        <div className="p-4 md:p-6">{children}</div>
      </section>
    </main>
  );
}

export function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note?: string;
}) {
  return (
    <div className="rounded-lg border border-[#dfe3d8] bg-white p-4 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#657064]">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-3xl font-black tabular-nums">{value}</p>
        {note ? <p className="text-xs font-bold text-[#657064]">{note}</p> : null}
      </div>
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  children,
  aside,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#dfe3d8] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#e7eadf] px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-black">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-[#657064]">{subtitle}</p> : null}
        </div>
        {aside}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Toolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-2 rounded-lg border border-[#dfe3d8] bg-[#f8faf5] p-3 md:flex-row md:items-center md:justify-between">
      {children}
    </div>
  );
}

export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "good" | "warning" | "danger";
}) {
  const tones = {
    neutral: "border-[#dfe3d8] bg-[#f8faf5] text-[#596256]",
    good: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    danger: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-md border px-2 py-1 text-xs font-black uppercase tracking-[0.1em] ${tones[tone]}`}
    >
      {label}
    </span>
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
    <label className="grid gap-1.5 text-sm font-bold text-[#2b332d]">
      {label}
      <input
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="min-h-10 rounded-md border border-[#cfd5c8] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#007a53] focus:ring-2 focus:ring-[#007a53]/15"
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
    <label className="grid gap-1.5 text-sm font-bold text-[#2b332d]">
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={3}
        className="rounded-md border border-[#cfd5c8] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#007a53] focus:ring-2 focus:ring-[#007a53]/15"
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
    <label className="grid gap-1.5 text-sm font-bold text-[#2b332d]">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="min-h-10 rounded-md border border-[#cfd5c8] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#007a53] focus:ring-2 focus:ring-[#007a53]/15"
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
    <button className="focus-ring min-h-10 rounded-md bg-[#d6ff3f] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-[#c6f02f]">
      {label}
    </button>
  );
}
