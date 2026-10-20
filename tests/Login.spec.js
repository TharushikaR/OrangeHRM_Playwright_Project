// @ts-check
import { test, expect } from "@playwright/test";
const { Login_Session } = require("../pages/LoginSessionPage");
/** @type {import('@playwright/test').BrowserContext} */
let context;
/** @type {import('@playwright/test').Page} */
let page;
/** @type {Login_Session} */
let loginSession;

test.describe("OrangeHRM Login Functionality", () => {
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

  test("Login with valid Admin credentials", async ({}) => {
    await loginSession.LoginWithButton(
      process.env.ADMIN_USERNAME,
      process.env.ADMIN_PASSWORD,
    );
    await loginSession.VerifyVisibilityAfterLogin();
  });

  test("Login with valid ESS user credentials", async ({}) => {
    await loginSession.LoginWithButton(
      process.env.ESS_USERNAME,
      process.env.ESS_PASSWORD,
    );
    await loginSession.VerifyVisibilityAfterLogin();
  });

  test("Submit login using Enter key", async ({}) => {
    await loginSession.LoginEnterKey(
      process.env.ADMIN_USERNAME,
      process.env.ADMIN_PASSWORD,
    );
    await loginSession.VerifyVisibilityAfterLogin();
  });

  test("Username is case-insensitive with all are in lowercase", async ({}) => {
    await loginSession.LoginWithButton(
      (process.env.ADMIN_USERNAME ?? "Admin").toLowerCase(),
      process.env.ADMIN_PASSWORD,
    );
    await loginSession.VerifyVisibilityAfterLogin();
  });

  test("Username is case-insensitive with all are in uppercase", async ({}) => {
    await loginSession.LoginWithButton(
      (process.env.ADMIN_USERNAME ?? "Admin").toUpperCase(),
      process.env.ADMIN_PASSWORD,
    );
    await loginSession.VerifyVisibilityAfterLogin();
  });

  test("Login with valid username and invalid password", async ({}) => {
    await loginSession.LoginWithButton(
      process.env.ADMIN_USERNAME,
      process.env.INVALID_PASSWORD,
    );
    await expect(loginSession.errorAlert).toBeVisible();
  });

  test("Login with invalid username and valid password", async ({}) => {
    await loginSession.LoginWithButton(
      process.env.INVALID_USERNAME,
      process.env.ADMIN_PASSWORD,
    );
    await expect(loginSession.errorAlert).toBeVisible();
  });

  test("Login with both invalid credentials", async ({}) => {
    await loginSession.LoginWithButton(
      process.env.INVALID_USERNAME,
      process.env.INVALID_PASSWORD,
    );
    await expect(loginSession.errorAlert).toBeVisible();
  });

  test("Login with both fields empty", async ({}) => {
    await loginSession.LoginWithButton("", "");
    await expect(loginSession.userNameRequired).toBeVisible();
    await expect(loginSession.passwordRequired).toBeVisible();
  });

  test("Login with username only", async ({}) => {
    await loginSession.LoginWithButton(process.env.ADMIN_USERNAME, " ");
    await expect(loginSession.passwordRequired).toBeVisible();
  });

  test("Login with password only", async ({}) => {
    await loginSession.LoginWithButton(" ", process.env.ADMIN_PASSWORD);
    await expect(loginSession.userNameRequired).toBeVisible();
  });

  test("Login with disabled user account", async ({}) => {
    await loginSession.LoginWithButton(
      process.env.BLOCKED_USERNAME,
      process.env.BLOCKED_PASSWORD,
    );
    await expect(loginSession.accountDisabledAlert).toBeVisible();
  });

  test("Login with whitespace-only values for username", async ({}) => {
    await loginSession.LoginWithButton(" Admin", process.env.ADMIN_PASSWORD);
    await expect(loginSession.errorAlert).toBeVisible();
  });

  test("Login with whitespace-only values for password", async ({}) => {
    await loginSession.LoginWithButton(process.env.ADMIN_USERNAME, "admin123 ");
    await expect(loginSession.errorAlert).toBeVisible();
  });

  test("Double-click Login button", async ({}) => {
    await loginSession.LoginWithDoubleClick(
      process.env.ADMIN_USERNAME,
      process.env.ADMIN_PASSWORD,
    );
    await loginSession.VerifyVisibilityAfterLogin();
  });

  test("Login while already logged in (second tab)", async ({
    page,
    context,
  }) => {
    loginSession = new Login_Session(page);
    await loginSession.LoginWithButton(
      process.env.ADMIN_USERNAME,
      process.env.ADMIN_PASSWORD,
    );
    await loginSession.VerifyVisibilityAfterLogin();

    const secondTab = await context.newPage();
    await secondTab.goto("/web/index.php/auth/login", {
      waitUntil: "domcontentloaded",
    });

    await expect(secondTab).toHaveURL(/dashboard/);
    await expect(secondTab).not.toHaveURL(/login/);

    await secondTab.close();
  });

  test("Browser back after login", async ({ page }) => {
    await loginSession.LoginWithButton(
      process.env.ADMIN_USERNAME,
      process.env.ADMIN_PASSWORD,
    );
    await loginSession.VerifyVisibilityAfterLogin();
    await page.goBack({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/login/);
    await expect(page).not.toHaveURL(/dashboard/);
  });

  test("Password field masked with no show toggle leaks", async ({ page }) => {
    await loginSession.FillCredentials(
      process.env.ADMIN_USERNAME,
      process.env.ADMIN_PASSWORD,
    );
    const passwordField = await loginSession.inputPassword;
    await expect(passwordField).toHaveAttribute("type", "password");
    const fieldGroup = passwordField.locator(
      "xpath=ancestor::div[contains(@class,'oxd-input-group')][1]",
    );
    await expect(
      fieldGroup.locator(
        "button, [role='button'], [class*='eye'], [class*='toggle']",
      ),
    ).toHaveCount(0);
  });

  test("Tab order and focus", async ({ page }) => {
    const usernameField = loginSession.inputUsername;
    const passwordField = loginSession.inputPassword;
    const loginButton = loginSession.btnLogin;

    await expect(usernameField).toBeVisible();

    // Baseline styles BEFORE focus
    const passwordBlurStyles = await loginSession.getFocusStyles(passwordField);

    await usernameField.focus();
    await page.keyboard.press("Tab");
    await expect(passwordField).toBeFocused();

    // Let the CSS transition finish
    await page.waitForTimeout(300);

    const passwordFocusStyles =
      await loginSession.getFocusStyles(passwordField);
    expect(
      await loginSession.hasFocusIndicator(
        passwordBlurStyles,
        passwordFocusStyles,
      ),
    ).toBe(true);

    // Same pattern for the login button
    const loginBlurStyles = await loginSession.getFocusStyles(loginButton);
    await page.keyboard.press("Tab");
    await expect(loginButton).toBeFocused();
    await page.waitForTimeout(300);
    const loginFocusStyles = await loginSession.getFocusStyles(loginButton);
    expect(
      await loginSession.hasFocusIndicator(loginBlurStyles, loginFocusStyles),
    ).toBe(true);
  });
});
