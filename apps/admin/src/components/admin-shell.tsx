import Link from "next/link";
import Image from "next/image";
import { getNewBookingCount, getNewFranchiseLeadCount, getNewSalesOrderCount } from "@99billiards/db";
import { FontAwesomeIcon } from "@99billiards/ui";
import { logoutAdmin } from "@/app/login/actions";
import { type AdminPermission, hasPermission, requireAdmin, roleLabels } from "@/lib/auth";

const navItems = [
  { label: "Dashboard", href: "/", section: "Tổng quan", permission: "dashboard" },
  { label: "Cơ sở", href: "/branches", section: "CMS", permission: "branches" },
  { label: "Ưu đãi", href: "/promotions", section: "CMS", permission: "promotions" },
  { label: "Tin tức", href: "/posts", section: "CMS", permission: "posts" },
  { label: "Chuyên mục tin", href: "/post-categories", section: "CMS", permission: "posts" },
  { label: "Sản phẩm", href: "/products", section: "CMS sản phẩm", permission: "products" },
  { label: "Danh mục sản phẩm", href: "/product-categories", section: "CMS sản phẩm", permission: "products" },
  { label: "Danh mục con", href: "/product-subcategories", section: "CMS sản phẩm", permission: "products" },
  { label: "Nhãn hàng", href: "/product-brands", section: "CMS sản phẩm", permission: "products" },
  { label: "Hiển thị trang SP", href: "/product-display", section: "CMS sản phẩm", permission: "products" },
  { label: "Đặt bàn", href: "/bookings", section: "Vận hành", permission: "bookings" },
  { label: "Bán hàng", href: "/sales-orders", section: "Vận hành", permission: "sales" },
  { label: "Nhượng quyền", href: "/franchise-leads", section: "Vận hành", permission: "franchise" },
  { label: "Media", href: "/media", section: "Tài sản", permission: "media" },
  { label: "Users", href: "/users", section: "Hệ thống", permission: "users" },
  { label: "Settings", href: "/settings", section: "Hệ thống", permission: "settings" },
] satisfies Array<{ label: string; href: string; section: string; permission: AdminPermission }>;

// Badge "MỚI" vàng đứng cạnh label cho các nav có công việc chưa xử lý.
// Render inline ngay sau text, ở cả sidebar desktop lẫn drawer mobile.
function NavBadge({ count }: { count: number }) {
  if (!count) return null;
  const display = count > 99 ? "99+" : String(count);
  return (
    <span
      aria-label={`${count} mới`}
      className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#facc15] px-1.5 text-[10px] font-black leading-none text-black"
    >
      {display}
    </span>
  );
}

export async function AdminShell({
  title,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  const allowedNavItems = navItems.filter((item) => hasPermission(session, item.permission));
  const homeHref = allowedNavItems[0]?.href || "/pending";
  const groupedNav = allowedNavItems.reduce<Record<string, typeof navItems>>((groups, item) => {
    groups[item.section] ||= [];
    groups[item.section].push(item);
    return groups;
  }, {});

  // Đếm việc chưa xử lý song song. Nếu user không có quyền xem thì set 0 (không hiện badge).
  const canSeeBookings = hasPermission(session, "bookings");
  const canSeeSales = hasPermission(session, "sales");
  const canSeeFranchise = hasPermission(session, "franchise");
  const [newBookingCount, newSalesOrderCount, newFranchiseLeadCount] = await Promise.all([
    canSeeBookings ? getNewBookingCount() : Promise.resolve(0),
    canSeeSales ? getNewSalesOrderCount() : Promise.resolve(0),
    canSeeFranchise ? getNewFranchiseLeadCount() : Promise.resolve(0),
  ]);

  function badgeFor(href: string) {
    if (href === "/bookings") return newBookingCount;
    if (href === "/sales-orders") return newSalesOrderCount;
    if (href === "/franchise-leads") return newFranchiseLeadCount;
    return 0;
  }

  return (
    <main className="min-h-screen bg-[#f4f6f1] text-[#111713]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[#dfe3d8] bg-[#0b120d] text-white lg:block">
        <div className="border-b border-white/10 px-5 py-5">
          <Link href={homeHref} className="focus-ring flex items-center gap-3 rounded-lg">
            <Image
              src="/logo.jpg"
              alt="99 Billiards Club"
              width={40}
              height={40}
              className="h-10 w-10 rounded-lg object-cover"
              priority
            />
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em]">99 Admin</p>
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                {roleLabels[session.role]}
              </p>
            </div>
          </Link>
        </div>

        <nav className="h-[calc(100vh-82px)] space-y-5 overflow-auto px-3 py-5">
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
                    className="focus-ring flex min-h-10 items-center justify-between rounded-md px-3 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
                  >
                    <span className="inline-flex items-center">
                      {item.label}
                      <NavBadge count={badgeFor(item.href)} />
                    </span>
                    <span className="text-white/25">&gt;</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <section className="lg:pl-72">
        <header className="sticky top-0 z-20 bg-[#f4f6f1]/94 backdrop-blur-xl">
          <div className="relative flex min-h-14 items-center justify-between border-b border-[#283044] bg-[#171b29] px-4 py-2 text-white lg:hidden">
            <details>
              <summary className="focus-ring grid h-10 w-10 cursor-pointer list-none place-items-center rounded-md border border-white/10 text-white/80 [&::-webkit-details-marker]:hidden">
                <span className="grid gap-1">
                  <span className="block h-0.5 w-4 rounded-full bg-current" />
                  <span className="block h-0.5 w-4 rounded-full bg-current" />
                  <span className="block h-0.5 w-4 rounded-full bg-current" />
                </span>
              </summary>
              <div className="absolute left-4 right-4 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-lg border border-white/10 bg-[#171b29] shadow-2xl">
                <nav className="max-h-[72vh] overflow-auto px-2 py-2">
                  {Object.entries(groupedNav).map(([section, items]) => (
                    <div key={section} className="py-2">
                      <p className="px-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{section}</p>
                      <div className="mt-1 grid gap-1">
                        {items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="focus-ring flex min-h-10 items-center justify-between rounded-md px-3 py-2 text-sm font-bold text-white/82 hover:bg-white/10"
                          >
                            <span className="relative inline-flex">
                              {item.label}
                              <NavBadge count={badgeFor(item.href)} />
                            </span>
                            <span className="text-white/25">&gt;</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>
            </details>

            <span className="text-sm font-black uppercase tracking-[0.08em]">
              99 <span className="text-[#2EB958]">Admin</span>
            </span>

            <details>
              <summary className="focus-ring cursor-pointer list-none rounded-full [&::-webkit-details-marker]:hidden">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-700 text-sm font-black">
                  {(session.name || session.email || "A").slice(0, 1).toUpperCase()}
                </span>
              </summary>
              <div className="absolute right-4 top-[calc(100%+0.5rem)] z-40 w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-white/10 bg-[#171b29] shadow-2xl">
                <div className="border-b border-white/10 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">
                    {roleLabels[session.role]}
                  </p>
                  <p className="mt-1 truncate text-sm font-bold text-white/80">{session.email}</p>
                </div>
                <div className="grid gap-2 p-3">
                  {actions ? <div className="grid gap-2 [&>a]:justify-center [&>a]:text-center">{actions}</div> : null}
                  <form action={logoutAdmin}>
                    <button className="focus-ring min-h-10 w-full rounded-md bg-white px-3 py-2 text-sm font-black text-[#111713]">
                      <span className="inline-flex items-center justify-center gap-2">
                        <FontAwesomeIcon icon="arrow-left" className="h-3.5 w-3.5" />
                        Đăng xuất
                      </span>
                    </button>
                  </form>
                </div>
              </div>
            </details>
          </div>

          <div className="flex min-h-14 items-center justify-between gap-3 border-b border-[#dfe3d8] px-4 py-3 md:px-6">
            <div className="min-w-0">
              <h1 className="min-w-0 truncate text-2xl font-black leading-tight md:text-3xl">{title}</h1>
            </div>
            <details className="relative hidden lg:block">
              <summary className="focus-ring flex cursor-pointer list-none items-center gap-3 rounded-md px-2 py-1 text-right [&::-webkit-details-marker]:hidden">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black text-[#111713]">{session.name || "Admin"}</span>
                  <span className="block truncate text-xs font-bold text-[#657064]">{session.email}</span>
                </span>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#111713] text-sm font-black text-white">
                  {(session.name || session.email || "A").slice(0, 1).toUpperCase()}
                </span>
              </summary>
              <div className="absolute right-0 top-[calc(100%+0.6rem)] z-30 w-72 overflow-hidden rounded-lg border border-[#dfe3d8] bg-white shadow-2xl">
                <div className="border-b border-[#e7eadf] px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#007a53]">
                    {roleLabels[session.role]}
                  </p>
                  <p className="mt-1 truncate text-sm font-black text-[#111713]">{session.name || session.email}</p>
                  <p className="truncate text-xs font-bold text-[#657064]">{session.email}</p>
                </div>
                <div className="grid gap-2 p-3">
                  {actions ? <div className="grid gap-2 [&>a]:justify-center [&>a]:text-center">{actions}</div> : null}
                  <form action={logoutAdmin}>
                    <button className="focus-ring min-h-10 w-full rounded-md bg-[#111713] px-3 py-2 text-sm font-bold text-white">
                      <span className="inline-flex items-center justify-center gap-2">
                        <FontAwesomeIcon icon="arrow-left" className="h-3.5 w-3.5" />
                        Đăng xuất
                      </span>
                    </button>
                  </form>
                </div>
              </div>
            </details>
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
    <div className="rounded-lg border border-[#dfe3d8] bg-white p-4 shadow-sm transition hover:border-[#cbd3c4]">
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
    <section className="min-w-0 rounded-lg border border-[#dfe3d8] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#e7eadf] px-4 py-4 md:flex-row md:items-center md:justify-between">
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
    <div className="mb-4 flex flex-col gap-3 rounded-lg border border-[#dfe3d8] bg-[#f8faf5] p-3 md:flex-row md:items-center md:justify-between">
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
    <button className="focus-ring min-h-10 rounded-md bg-[#2EB958] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-[#c6f02f]">
      <span className="inline-flex items-center gap-2">
        <FontAwesomeIcon icon="floppy-disk" className="h-4 w-4" />
        {label}
      </span>
    </button>
  );
}
