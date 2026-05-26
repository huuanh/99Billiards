import type { Metadata } from "next";
import { CheckoutPageClient } from "@/components/checkout-page-client";

export const metadata: Metadata = {
  title: "Thanh toan - 99 Billiards",
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
