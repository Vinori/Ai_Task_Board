import { expect, test } from "@playwright/test";

test("главная страница загружается", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Обзор доски" }),
  ).toBeVisible();
});
