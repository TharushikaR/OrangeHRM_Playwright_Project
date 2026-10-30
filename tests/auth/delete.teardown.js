// @ts-check
import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
const { Login_Session } = require("../../pages/LoginSessionPage");

const seedCleanupPath = "playwright/.auth/seed-cleanup.json";
const T = 60_000;
const opts = { timeout: T };

setup.use({ actionTimeout: T, navigationTimeout: T });
setup.setTimeout(3 * T);

setup("Delete all the data created during automation", async ({ page }) => {
  // validate everything the test depends on before opening a browser page
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminUsername || !adminPassword) {
    throw new Error("Missing ADMIN_USERNAME / ADMIN_PASSWORD in .env");
  }
  if (!fs.existsSync(seedCleanupPath)) {
    throw new Error(`Missing ${seedCleanupPath} - nothing to clean up`);
  }

  // Read inside the test so it only runs when the cleanup runs
  const { employeeName } = JSON.parse(fs.readFileSync(seedCleanupPath, "utf-8"),);
  if (!employeeName) {
    throw new Error(`"employeeName" is missing in ${seedCleanupPath}`);
  }

  // Locators defined
  const heading = (/** @type {string} */ name) => page.getByRole("heading", { name, exact: true });
  const employeeHint = page.locator(".oxd-autocomplete-text-input").getByPlaceholder("Type for hints...");
  const suggestion = page.locator(".oxd-autocomplete-dropdown").getByText(employeeName, { exact: true });
  const recordsInfo = page.locator("span.oxd-text--span", {hasText: "Records Found",});

  // 1. Login as admin
  const loginSession = new Login_Session(page);
  await page.goto("/web/index.php/auth/login", {waitUntil: "domcontentloaded",});
  await loginSession.LoginWithButton(adminUsername, adminPassword);
  await loginSession.VerifyVisibilityAfterLogin();

  // 2. Find the users created for the seeded employee
  await page.getByRole("link", { name: "Admin" }).click();
  await expect(heading("System Users")).toBeVisible(opts);

  await employeeHint.fill(employeeName);
  await suggestion.click();
  await page.getByRole("button", { name: "Search", exact: true }).click();

  // 3. Select all results and delete
  await page.locator(".oxd-checkbox-input").click(opts);
  await page.getByRole("button", { name: "Delete Selected" }).click(opts);
  await page.getByRole("button", { name: "Yes, Delete" }).click(opts);

  // 4. Verify they are gone
  await expect(recordsInfo).toHaveText("No Records Found", opts);

  // 5. Close the browser context (also closes its pages) and logout
  await loginSession.Logout();
  await page.context().close();
});
