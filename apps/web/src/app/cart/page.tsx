import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart-page-client";

export const metadata: Metadata = {
  title: "Gio hang - 99 Billiards",
};

export default function CartPage() {
  return <CartPageClient />;
}
