import Link from "next/link";

export function HeaderBookingButton() {
  return (
    <Link
      href="/products"
      className="focus-ring inline-flex h-11 items-center rounded-full bg-[#2EB958] px-4 text-xs font-black uppercase tracking-[0.16em] text-[#071107] hover:bg-white lg:hidden"
    >
      Mua ngay
    </Link>
  );
}
