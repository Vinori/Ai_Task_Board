import { expect, test } from "@playwright/test";
import {
  assertLoggedInAs,
  makeCredentials,
  signIn,
  signOut,
  signUp,
  type TestCredentials,
} from "./helpers/auth-ui";

/**
 * У каждого теста — новый `BrowserContext` без cookies. Чтобы действовать как
 * вошедший пользователь, в нужном кейсе вызываем {@link signIn}.
 *
 * Первый тест регистрирует пользователя; остальные используют те же `creds`,
 * но логин выполняют заново через модалку «Войти».
 */

test.describe("Регистрация и работа под пользователем", () => {
  test.describe.configure({ mode: "serial" });

  test.use({ viewport: { width: 1280, height: 720 } });

  let creds: TestCredentials;

  test("регистрация нового пользователя", async ({ page }) => {
    test.setTimeout(60_000);
    creds = makeCredentials();
    await signUp(page, creds);
    await assertLoggedInAs(page, creds.email);
    await signOut(page);
  });

  test("вход с теми же учётными данными", async ({ page }) => {
    test.setTimeout(60_000);
    await signIn(page, creds);
    await assertLoggedInAs(page, creds.email);
  });

  test("создание доски, колонки и карточки после входа", async ({ page }) => {
    test.setTimeout(120_000);

    const boardName = `E2E Альфа ${Date.now()}`;
    const columnTitle = "Бэклог приоритетов";
    const taskTitle = "Синхронизировать отчёт с CRM";
    const taskDescription =
      "Выгрузить актуальные сделки, сверить с Google Sheets, исправить расхождения.";

    await signIn(page, creds);

    await page.getByRole("link", { name: "К доске" }).click();
    await expect(page).toHaveURL(/#board/);

    const boardsNav = page.getByRole("navigation", { name: "Список досок" });
    await expect(
      boardsNav.getByRole("button", { name: "Создать доску" }),
    ).toBeEnabled({ timeout: 30_000 });

    await boardsNav.getByRole("button", { name: "Создать доску" }).click();
    const createBoardDialog = page.getByRole("dialog");
    await expect(
      createBoardDialog.getByRole("heading", { name: "Новая доска" }),
    ).toBeVisible();
    await createBoardDialog.getByLabel("Название").fill(boardName);
    await createBoardDialog.getByRole("button", { name: "Создать" }).click();
    await expect(createBoardDialog).toBeHidden({ timeout: 20_000 });

    const boardRegion = page.locator("#board");
    await expect(
      boardRegion.getByRole("button", { name: "Добавить колонку" }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(boardRegion.locator('[role="alert"]')).toHaveCount(0);

    await boardRegion.getByRole("button", { name: "Добавить колонку" }).click();
    const columnDialog = page.getByRole("dialog");
    await expect(
      columnDialog.getByRole("heading", { name: "Новая колонка" }),
    ).toBeVisible();
    await columnDialog.getByLabel("Название").fill(columnTitle);
    await columnDialog.getByRole("button", { name: "Добавить" }).click();
    await expect(columnDialog).toBeHidden({ timeout: 20_000 });

    const newColumn = boardRegion.locator("section").filter({
      has: page.getByRole("heading", { level: 2, name: columnTitle }),
    });
    await expect(newColumn).toBeVisible();
    await newColumn.getByRole("button", { name: /Добавить карточку/ }).click();

    const taskDialog = page.getByRole("dialog");
    await expect(
      taskDialog.getByRole("heading", { name: "Новая карточка" }),
    ).toBeVisible();
    await taskDialog.getByLabel("Название").fill(taskTitle);
    await taskDialog.getByLabel("Описание").fill(taskDescription);
    await taskDialog.getByRole("button", { name: "Создать" }).click();
    await expect(taskDialog).toBeHidden({ timeout: 20_000 });

    await expect(
      newColumn.getByText(taskTitle, { exact: true }),
    ).toBeVisible();
  });
});
