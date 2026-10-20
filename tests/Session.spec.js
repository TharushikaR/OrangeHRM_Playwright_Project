// @ts-check
import { test, expect } from "@playwright/test";
const { Login_Session } = require("../pages/LoginSessionPage");
/** @type {import('@playwright/test').BrowserContext} */
let context;
/** @type {import('@playwright/test').Page} */
let page;
/** @type {Login_Session} */
let loginSession;

test.describe("OrangeHRM Session Management", () => {
  test.beforeEach(async ({ page }) => {
    loginSession = new Login_Session(page);
    await page.goto("/web/index.php/auth/login", {
      waitUntil: "domcontentloaded",
    });
  });

  test.afterEach(async ({ page }, testInfo) => {
    console.log(
      `Finished: ${testInfo.title} -> ${testInfo.status} -> ${testInfo.project.name}`,
    );
    await page.context().clearCookies();
  });

  test("Direct URL access without login", async ({ page }) => {
    await page.goto("/web/index.php/pim/viewEmployeeList");
    await expect(page).toHaveURL(/auth\/login/);
  });

  test("Logout in one tab, action in another", async ({
    page,
    context,
  }) => {
    const page2 = await context.newPage();

    const loginSession1 = new Login_Session(page);
    const loginSession2 = new Login_Session(page2);

    await Promise.all([
      page.goto("/web/index.php/auth/login", { waitUntil: "domcontentloaded" }),
      page2.goto("/web/index.php/auth/login", {
        waitUntil: "domcontentloaded",
      }),
    ]);

    await Promise.all([
      loginSession1.LoginWithButton(
        process.env.ADMIN_USERNAME,
        process.env.ADMIN_PASSWORD,
      ),
      loginSession2.LoginWithButton(
        process.env.ADMIN_USERNAME,
        process.env.ADMIN_PASSWORD,
      ),
    ]);

    await Promise.all([
      loginSession1.VerifyVisibilityAfterLogin(),
      loginSession2.VerifyVisibilityAfterLogin(),
    ]);

    await page.bringToFront();
    await loginSession1.Logout();
    await page2.bringToFront();
    await loginSession2.adminLink.click();
    await expect(page2).toHaveURL(/auth\/login/);
    await expect(page2).not.toHaveURL(/dashboard/);
  });
});
