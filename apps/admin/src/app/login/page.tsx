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
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#d6ff3f] text-xl font-black text-black">
            99
          </span>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em]">Billiards</p>
            <h1 className="text-2xl font-black">Đăng nhập quản trị</h1>
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
            Mật khẩu
            <input
              name="password"
              type="password"
              required
              className="focus-ring rounded-2xl border border-black/10 bg-[#f4f6ef] px-4 py-3 outline-none"
            />
          </label>
          <LoginError searchParams={searchParams} />
          <button className="focus-ring min-h-12 rounded-2xl bg-[#d6ff3f] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-black">
            Vào admin
          </button>
        </form>
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

  return (
    <p role="alert" className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">
      Email hoặc mật khẩu chưa đúng.
    </p>
  );
}
