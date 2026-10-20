// @ts-check
import { test, expect } from "@playwright/test";
const { Login_Session } = require("../pages/LoginSessionPage");
/** @type {import('@playwright/test').BrowserContext} */
let context;
/** @type {import('@playwright/test').Page} */
let page;
/** @type {Login_Session} */
let loginSession;

test.describe("OrangeHRM Logout Functionality", () => {
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

  test("Logout from user dropdown", async ({ page }) => {
    await loginSession.LoginWithButton(
      process.env.ADMIN_USERNAME,
      process.env.ADMIN_PASSWORD,
    );
    await loginSession.VerifyVisibilityAfterLogin();
    await loginSession.Logout();
    await expect(page).toHaveURL(/auth\/login/);
  });

  test("Access protected URL after logout - Part I", async ({ page }) => {
    await loginSession.LoginWithButton(
      process.env.ADMIN_USERNAME,
      process.env.ADMIN_PASSWORD,
    );
    await loginSession.VerifyVisibilityAfterLogin();
    await loginSession.Logout();
    await page.goBack();
    await expect(page).toHaveURL(/auth\/login/);
  });
  
  test("Access protected URL after logout - Part II", async ({ page }) => {
    await loginSession.LoginWithButton(
      process.env.ADMIN_USERNAME,
      process.env.ADMIN_PASSWORD,
    );
    await loginSession.VerifyVisibilityAfterLogin();
    await loginSession.Logout();
    await page.goto("/web/index.php/pim/viewEmployeeList");
    await expect(page).toHaveURL(/auth\/login/);
  });
});
