import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

export type TestCredentials = {
  email: string;
  password: string;
  /** Необязательная роль в форме регистрации */
  profileRoleDisplay: string;
};

/**
 * Новый пользователь на каждый прогон (один объект на блок `describe.serial`).
 */
export function makeCredentials(): TestCredentials {
  const id = `${Date.now()}_${Math.floor(Math.random() * 9999)}`;
  return {
    profileRoleDisplay: `Марина Плейтрайт_${id.slice(-4)}`,
    email: `marina.playwright.${id}@example.net`,
    password: `Qz9_Play_${id.slice(-6)}_A!`,
  };
}

export async function signUp(page: Page, creds: TestCredentials): Promise<void> {
  await page.goto("/");

  await page
    .locator("header")
    .getByRole("button", { name: "Регистрация" })
    .click();

  await expect(page.locator("#auth-email")).toBeVisible({ timeout: 15_000 });

  await page.locator("#auth-email").fill(creds.email);
  await page.locator("#auth-password").fill(creds.password);
  await page.locator("#auth-confirm").fill(creds.password);
  await page.locator("#auth-role").fill(creds.profileRoleDisplay);

  await page.getByRole("button", { name: "Создать аккаунт" }).click();

  try {
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
  } catch {
    const alertVisible = await page
      .getByRole("alert")
      .isVisible()
      .catch(() => false);
    const snippet = alertVisible
      ? await page.getByRole("alert").innerText()
      : "";
    throw new Error(
      `После регистрации не открылись /dashboard. Алерт (если есть): ${snippet}. ` +
        "В Supabase: Authentication → Providers → Email — отключите «Confirm email» " +
        "(или временно включите автоподтверждение) для успешной e2e-сессии сразу после signUp.",
    );
  }
}

/** Вызов после `signUp`: полный вход с «чистой» вкладкой (новый контекст). */
export async function signIn(
  page: Page,
  creds: Pick<TestCredentials, "email" | "password">,
): Promise<void> {
  await page.goto("/");
  await page.locator("header").getByRole("button", { name: "Войти" }).click();
  await expect(page.locator("#auth-email")).toBeVisible({ timeout: 15_000 });

  await page.locator("#auth-email").fill(creds.email);
  await page.locator("#auth-password").fill(creds.password);
  await page
    .locator("form")
    .getByRole("button", { name: "Войти", exact: true })
    .click();

  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
}

export async function assertLoggedInAs(page: Page, email: string): Promise<void> {
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Добро пожаловать",
  );
  await expect(page.getByRole("heading", { level: 1 })).toContainText(email);
}

export async function signOut(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Меню пользователя" }).click();
  await page.getByRole("menuitem", { name: "Выйти" }).click();
  await expect(page).toHaveURL(/\/$/);
}
