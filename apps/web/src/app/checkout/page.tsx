import type { Metadata } from "next";
import { CheckoutPageClient } from "@/components/checkout-page-client";
import { PublicHeader } from "@/components/public-header";

export const metadata: Metadata = {
  title: "Thanh toán - 99 Billiards",
};

export default function CheckoutPage() {
  return (
    <>
      <PublicHeader active="products" />
      <CheckoutPageClient />
    </>
  );
}
