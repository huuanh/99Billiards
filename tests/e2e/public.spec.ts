import { expect, test } from "@playwright/test";

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

  test("booking API accepts valid request", async ({ request }) => {
    const response = await request.post("/api/bookings", {
      data: {
        customerName: "Playwright Test",
        phone: "0900000001",
        branchId: "cs1",
        guestCount: 3,
        bookingDate: "2026-05-22",
        bookingTime: "19:30",
        note: "E2E smoke test",
      },
    });

    expect(response.ok()).toBeTruthy();
    await expect(response).toBeOK();
  });

  test("renders SEO detail pages", async ({ page }) => {
    await page.goto("/co-so/cs1");
    await expect(page.getByRole("heading", { name: /nguyễn văn giáp/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Gallery" })).toBeVisible();
    await expect(page.getByText("Tiện ích")).toBeVisible();

    await page.goto("/uu-dai/pr1");
    await expect(page.getByRole("heading", { name: /happy hour/i })).toBeVisible();
    await expect(page.getByText("Cơ sở áp dụng")).toBeVisible();

    await page.goto("/tin-tuc/n1");
    await expect(page.getByRole("heading", { name: /99 open/i })).toBeVisible();
  });
});
