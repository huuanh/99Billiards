import { expect, test } from "@playwright/test";
import mongoose from "mongoose";

async function cleanupBooking(id?: string) {
  if (!id || !process.env.MONGODB_URI) return;

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  await mongoose.connection.collection("bookings").deleteOne({ _id: new mongoose.Types.ObjectId(id) });
  await mongoose.disconnect();
}

test.describe("public website", () => {
  test("renders homepage and opens booking modal", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /chơi là cuốn/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /tìm cơ sở gần bạn/i })).toBeVisible();

    await page.getByRole("button", { name: /đặt bàn/i }).click();
    await expect(page.getByRole("heading", { name: /giữ bàn/i })).toBeVisible();
    await expect(page.getByLabel("Họ tên")).toBeVisible();
    await expect(page.getByLabel("Số điện thoại")).toBeVisible();
  });

  test("booking API accepts valid request", async ({ request }, testInfo) => {
    const response = await request.post("/api/bookings", {
      data: {
        customerName: "Playwright Test",
        phone: "0900000001",
        branchId: "cs1",
        guestCount: 3,
        bookingDate: "2026-05-22",
        bookingTime: "19:30",
        note: `E2E smoke test ${testInfo.project.name}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    await expect(response).toBeOK();
    const body = await response.json().catch(() => null);
    await cleanupBooking(body?.id);
  });

  test("renders SEO detail pages", async ({ page }) => {
    await page.goto("/co-so/cs1");
    await expect(page.getByRole("heading", { name: /võ nguyên giáp/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Gallery" })).toBeVisible();
    await expect(page.getByText("Tiện ích")).toBeVisible();

    await page.goto("/");
    const promotionHref = await page.locator('a[href^="/uu-dai/"]').first().getAttribute("href");
    if (promotionHref) {
      await page.goto(promotionHref);
      await expect(page.getByText("Cơ sở áp dụng")).toBeVisible();
    }

    await page.goto("/");
    const postHref = await page.locator('a[href^="/tin-tuc/"]').first().getAttribute("href");
    if (postHref) {
      await page.goto(postHref);
      await expect(page.getByRole("heading").first()).toBeVisible();
    }
  });
});
