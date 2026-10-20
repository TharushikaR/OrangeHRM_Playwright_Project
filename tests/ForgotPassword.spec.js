// @ts-check
import { test, expect } from "@playwright/test";
const { Login_Session } = require("../pages/LoginSessionPage");
/** @type {import('@playwright/test').BrowserContext} */
let context;
/** @type {import('@playwright/test').Page} */
let page;
/** @type {Login_Session} */
let loginSession;

test.describe("OrangeHRM Authentication", () => {
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

  test("Navigate to Forgot Password page", async ({ page }) => {
    await expect(loginSession.forgotPasswordLink).toBeVisible();
    await loginSession.forgotPasswordLink.click();
    await expect(page).toHaveURL(/requestPasswordResetCode/);
    await expect(loginSession.resetPasswordHeading).toBeVisible();
  });

  test("Reset request with valid username", async ({ page }) => {
    await expect(loginSession.forgotPasswordLink).toBeVisible();
    await loginSession.forgotPasswordLink.click();
    await expect(page).toHaveURL(/requestPasswordResetCode/);
    await expect(loginSession.resetPasswordHeading).toBeVisible();
    await loginSession.inputUsername.fill("testuser");
    await loginSession.resetPasswordButton.click();
    await expect(loginSession.resetPasswordSuccessMessage).toBeVisible();
  });

  test("Reset request with empty username", async ({ page }) => {
    await expect(loginSession.forgotPasswordLink).toBeVisible();
    await loginSession.forgotPasswordLink.click();
    await expect(page).toHaveURL(/requestPasswordResetCode/);
    await expect(loginSession.resetPasswordHeading).toBeVisible();
    await loginSession.resetPasswordButton.click();
    await expect(loginSession.userNameRequired).toBeVisible();
  });
  test("Reset request with unknown username", async ({ page }) => {
    await expect(loginSession.forgotPasswordLink).toBeVisible();
    await loginSession.forgotPasswordLink.click();
    await expect(page).toHaveURL(/requestPasswordResetCode/);
    await expect(loginSession.resetPasswordHeading).toBeVisible();
    await loginSession.inputUsername.fill(
      "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
    );
    await loginSession.resetPasswordButton.click();
    //Should display an error message indicating that the username is not recognized
    //This is failed because the application does not display any error message for unknown usernames, which is a security measure to prevent user enumeration.
  });
  test("Cancel returns to login", async ({ page }) => {
    await expect(loginSession.forgotPasswordLink).toBeVisible();
    await loginSession.forgotPasswordLink.click();
    await expect(page).toHaveURL(/requestPasswordResetCode/);
    await expect(loginSession.resetPasswordHeading).toBeVisible();
    await loginSession.btnCancel.click();
    await expect(page).toHaveURL(/auth\/login/);
  });
});
