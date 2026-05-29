import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart-page-client";
import { PublicHeader } from "@/components/public-header";

export const metadata: Metadata = {
  title: "Giỏ hàng - 99 Billiards",
};

export default function CartPage() {
  return (
    <>
      <PublicHeader active="products" />
      <CartPageClient />
    </>
  );
}
