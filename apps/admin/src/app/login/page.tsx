import Image from "next/image";
import Link from "next/link";
import { loginAdmin } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#071107] px-4 text-white">
      <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white p-6 text-[#0a100c] shadow-2xl">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.jpg"
            alt="99 Billiards Club"
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
            priority
          />
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em]">Billiards</p>
            <h1 className="text-2xl font-black">Dang nhap quan tri</h1>
          </div>
        </div>

        <form action={loginAdmin} className="mt-8 grid gap-4">
          <label className="grid gap-2 text-sm font-bold">
            Email
            <input
              name="email"
              type="email"
              required
              defaultValue="admin@99billiards.local"
              className="focus-ring rounded-2xl border border-black/10 bg-[#f4f6ef] px-4 py-3 outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Mat khau
            <input
              name="password"
              type="password"
              required
              className="focus-ring rounded-2xl border border-black/10 bg-[#f4f6ef] px-4 py-3 outline-none"
            />
          </label>
          <LoginError searchParams={searchParams} />
          <button className="focus-ring min-h-12 rounded-2xl bg-[#d6ff3f] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-black">
            Vao admin
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs font-black uppercase tracking-[0.16em] text-black/35">
          <span className="h-px flex-1 bg-black/10" />
          hoac
          <span className="h-px flex-1 bg-black/10" />
        </div>

        <Link
          href="/api/auth/google/start"
          className="focus-ring flex min-h-12 items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-black text-[#0a100c] transition hover:bg-[#f4f6ef]"
        >
          Dang nhap voi Google
        </Link>
      </section>
    </main>
  );
}

async function LoginError({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  if (!params?.error) return null;

  if (params.error === "google-config") {
    return (
      <p role="alert" className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800">
        Google login chua duoc cau hinh GOOGLE_CLIENT_ID va GOOGLE_CLIENT_SECRET.
      </p>
    );
  }

  if (params.error === "disabled") {
    return (
      <p role="alert" className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">
        Tai khoan da bi khoa.
      </p>
    );
  }

  return (
    <p role="alert" className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">
      Email hoac mat khau chua dung.
    </p>
  );
}
