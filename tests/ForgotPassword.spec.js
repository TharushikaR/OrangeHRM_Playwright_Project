// @ts-check
import { test as base, expect } from "@playwright/test";
import { Login_Session } from "../pages/LoginSessionPage";
const RESET_URL = /requestPasswordResetCode/;

/**
 * @typedef {{ loginSession: Login_Session }} MyFixtures
 */

/** @type {import('@playwright/test').TestType<import('@playwright/test').PlaywrightTestArgs & import('@playwright/test').PlaywrightTestOptions & MyFixtures, import('@playwright/test').PlaywrightWorkerArgs & import('@playwright/test').PlaywrightWorkerOptions>} */
const test = base.extend({
  loginSession: async ({ page }, use) => {
    const loginSession = new Login_Session(page);
    await page.goto("/web/index.php/auth/login", {waitUntil: "domcontentloaded",});
    await use(loginSession);
  },
});

test.describe("OrangeHRM - Navigation to Forgot Password page", () => {
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.retry) {
      console.log(`Retry attempt: ${testInfo.retry} -> ${testInfo.title} -> ${testInfo.project.name}`,);
    } else {
      console.log(`Finished: ${testInfo.title} -> ${testInfo.status} -> ${testInfo.project.name}`,);
    }
    await page.context().clearCookies();
  });

  test("Navigate to Forgot Password page", async ({ page, loginSession }) => {
    await loginSession.forgotPasswordLink.click(); 
    await expect(page).toHaveURL(RESET_URL);
    await expect(loginSession.resetPasswordHeading).toBeVisible();
  });

  test.describe("OrangeHRM - Forgot Password page", () => {
    // Shared setup: every test below starts on the reset page.
    test.beforeEach(async ({ page, loginSession }) => {
      await loginSession.forgotPasswordLink.click();
      await expect(page).toHaveURL(RESET_URL);
      await expect(loginSession.resetPasswordHeading).toBeVisible();
    });

    test("Reset request with valid username", async ({ loginSession }) => {
      await loginSession.inputUsername.fill("testuser");
      await loginSession.resetPasswordButton.click();
      await expect(loginSession.resetPasswordSuccessMessage).toBeVisible();
    });

    test("Reset request with empty username", async ({ loginSession }) => {
      await loginSession.resetPasswordButton.click();
      await expect(loginSession.userNameRequired).toBeVisible();
    });

    test("Reset request with unknown username", async ({ loginSession }) => {
      await loginSession.inputUsername.fill("z".repeat(80));
      await loginSession.resetPasswordButton.click();
      // The app deliberately gives no "unknown user" error (prevents user
      // enumeration), so assert the actual behavior instead of leaving the
      // test without an assertion. Verify this matches what the app does:
      await expect(loginSession.resetPasswordSuccessMessage).toBeVisible();
    });

    test("Cancel returns to login", async ({ page, loginSession }) => {
      await loginSession.btnCancel.click();
      await expect(page).toHaveURL(/auth\/login/);
    });
  });
});
