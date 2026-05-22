import { expect, test } from "@playwright/test";

const adminEmail = process.env.ADMIN_EMAIL || "admin@99billiards.local";
const adminPassword = process.env.ADMIN_PASSWORD || "99billiards";

test.describe("admin cms", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/branches");
    await expect(page.getByRole("heading", { name: "Đăng nhập quản trị" })).toBeVisible();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(adminEmail);
    await page.getByLabel("Mật khẩu").fill(adminPassword);
    await page.getByRole("button", { name: "Vào admin" }).click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("shows dashboard and table modules", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await page.locator('a[href="/branches"]').first().click();
    await expect(page.getByRole("heading", { name: "Cơ sở", exact: true })).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("shows booking management table", async ({ page }) => {
    await page.goto("/bookings");

    await expect(page.getByRole("heading", { name: "Đặt bàn", exact: true })).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("shows media upload screen", async ({ page }) => {
    await page.goto("/media");

    await expect(page.getByRole("heading", { name: "Media", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Upload ảnh" })).toBeVisible();
    await expect(page.getByText("R2_BUCKET")).toBeVisible();
  });

  test("shows settings CMS for tracking", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(page.getByLabel("Google Analytics ID")).toBeVisible();
    await expect(page.getByLabel("Meta Pixel ID")).toBeVisible();
    await expect(page.getByLabel("TikTok Pixel ID")).toBeVisible();
  });
});
