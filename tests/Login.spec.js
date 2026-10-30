// @ts-check
import { test, expect } from "@playwright/test";
import fs from "node:fs";
const { Login_Session } = require("../pages/LoginSessionPage");
import {
  validVariants,
  errorCases,
  requiredCases,
} from "../testData/commonData";

const seedUsers = JSON.parse(
  fs.readFileSync("playwright/.auth/seed-users.json", "utf-8"),
);

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
    if (testInfo.retry) {
      console.log(
        `Retry attempt: ${testInfo.retry} -> ${testInfo.title} -> ${testInfo.project.name}`,
      );
    } else {
      console.log(
        `Finished: ${testInfo.title} -> ${testInfo.status} -> ${testInfo.project.name}`,
      );
    }
    await page.context().clearCookies();
  });

  test.describe("Admin", () => {
    test.use({ storageState: "playwright/.auth/admin.json" });
    test("Login with valid Admin credentials", async ({}) => {});

    test("Browser back after login", async ({ page }) => {
      await page.goBack();
      await expect(page).toHaveURL("about:blank");
      await expect(page).not.toHaveURL(/dashboard/);
    });
  });

  test.describe("ESS", () => {
    test.use({ storageState: "playwright/.auth/ess.json" });
    test("Login with valid ESS user credentials", async ({}) => {});
  });

  test("Submit login using Enter key", async ({}) => {
    await loginSession.LoginEnterKey(
      seedUsers.accounts[0].username,
      seedUsers.accounts[0].password,
    );
    await loginSession.VerifyVisibilityAfterLogin();
  });

  // ---- Valid login variants-----------
  for (const [title, transform] of validVariants) {
    test(String(title), async () => {
      const username =
        typeof transform === "function"
          ? transform(process.env.ADMIN_USERNAME ?? "Admin")
          : transform;
      await loginSession.LoginWithButton(
        String(username),
        process.env.ADMIN_PASSWORD,
      );
      await loginSession.VerifyVisibilityAfterLogin();
    });
  }

  // ---- Invalid credentials -> generic error alert------------
  for (const [title, user, pass] of errorCases) {
    test(`Login with ${title}`, async () => {
      await loginSession.LoginWithButton(user, pass);
      await expect(loginSession.errorAlert).toBeVisible();
    });
  }

  // ---- Required-field validation------------
  for (const [title, user, pass, messages] of requiredCases) {
    test(`Login with ${title}`, async () => {
      await loginSession.LoginWithButton(user, pass);
      for (const m of messages ?? []) {
        await expect(/** @type {any} */ (loginSession)[m]).toBeVisible();
      }
    });
  }

  test("Login with disabled user account", async ({}) => {
    await loginSession.LoginWithButton(
      seedUsers.accounts[2].username,
      seedUsers.accounts[2].password,
    );
    await expect(loginSession.accountDisabledAlert).toBeVisible();
  });

  test("Double-click Login button", async ({}) => {
    await loginSession.LoginWithDoubleClick(
      seedUsers.accounts[0].username,
      seedUsers.accounts[0].password,
    );
    await loginSession.VerifyVisibilityAfterLogin();
  });

  test("Login while already logged in (second tab)", async ({
    page,
    context,
  }) => {
    loginSession = new Login_Session(page);
    await loginSession.LoginWithButton(
      seedUsers.accounts[0].username,
      seedUsers.accounts[0].password,
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

  test("Password field masked with no show toggle leaks", async ({ page }) => {
    await loginSession.FillCredentials(
      seedUsers.accounts[0].username,
      seedUsers.accounts[0].password,
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
