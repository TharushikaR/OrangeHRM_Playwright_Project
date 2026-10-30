// @ts-check
import { test as setup, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import fs from "node:fs";
import path from "node:path";
import { writeRegistry } from "../../utils/seed-registry";

const { Login_Session } = require("../../pages/LoginSessionPage");

const seedUsersPath = path.resolve("playwright/.auth/seed-users.json");
const T = 60_000;
const opts = { timeout: T };
const commonPassword = "admin123";

// Timeout setup
setup.use({ actionTimeout: T, navigationTimeout: T });
setup.setTimeout(5 * T);

setup("Seed: Creating a New Employee and Three User Accounts", async ({ page }) => {
  // validate the env values the test really depends on
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminUsername || !adminPassword) {
    throw new Error("Missing ADMIN_USERNAME / ADMIN_PASSWORD in .env");
  }

  // Generated inside the test so it only runs when the setup runs
  const employee = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  };
  const escapedName = `${employee.firstName} ${employee.lastName}`.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Account details
  const accounts = [
    { username: `AUTH_USERNAME_${employee.firstName}`, password: commonPassword, role: "Admin", status: "Enabled" },
    { username: `ESS_USERNAME_${employee.firstName}`, password: commonPassword, role: "ESS", status: "Enabled" },
    { username: `BLOCKED_USERNAME_${employee.firstName}`, password: commonPassword, role: "ESS", status: "Disabled" },
  ];

  // start a fresh cleanup registry (overwrites leftovers from any previous run)
  /** @type {{ employeeName: string, empNumber: number | null, userIds: number[] }} */
  const registry = { employeeName: `${employee.firstName} ${employee.lastName}`, empNumber: null, userIds: [] }; 
  writeRegistry(registry); 

  // Locators
  const addButton = page.locator(".orangehrm-paper-container > .orangehrm-header-container > button");
  /** @param {string} name */
  const heading = (name) => page.getByRole("heading", { name, exact: true });
  const saveButton = page.getByRole("button", { name: "Save", exact: true });
  const employeeHint = page.locator(".oxd-autocomplete-text-input").getByPlaceholder("Type for hints...");
  const suggestion = page.locator(".oxd-autocomplete-dropdown").getByText(escapedName, { exact: true });

  /**
   * @param {string} label
   * @param {string} value
   */
  const selectOption = async (label, value) => {
    await page.locator(".oxd-input-group", { hasText: label }).locator(".oxd-select-text").click();
    await page.getByRole("listbox").getByRole("option", { name: value, exact: true }).click();
  };

  // 1. Login as admin
  const loginSession = new Login_Session(page);
  await page.goto("/web/index.php/auth/login", { waitUntil: "domcontentloaded" });
  await loginSession.LoginWithButton(adminUsername, adminPassword);
  await loginSession.VerifyVisibilityAfterLogin();

  // 2. Create the employee
  await page.getByRole("link", { name: "PIM" }).click();
  await expect(heading("Employee Information")).toBeVisible(opts);
  await addButton.click();
  await expect(heading("Add Employee")).toBeVisible(opts);

  await page.getByPlaceholder("First Name").fill(employee.firstName);
  await page.getByPlaceholder("Last Name").fill(employee.lastName);
  await saveButton.click();
  // Wait for the real success signal (redirect to the new employee's page)
  // instead of blanket waitForLoadState calls. 
  await page.waitForURL("**/pim/viewPersonalDetails/**", opts);
  registry.empNumber = Number(page.url().match(/empNumber\/(\d+)/)?.[1]); 
  writeRegistry(registry); 

  // 3. Create the user accounts
  await page.getByRole("link", { name: "Admin" }).click();
  await expect(heading("System Users")).toBeVisible(opts);

  for (const acc of accounts) {
    await addButton.click();
    await expect(heading("Add User")).toBeVisible(opts);

    await employeeHint.fill(escapedName);
    await suggestion.click();

    await selectOption("User Role", acc.role);
    await selectOption("Status", acc.status);

    await page.locator(".oxd-input-group", { hasText: "Username" }).locator("input").fill(acc.username);
    const passwords = page.locator('input[type="password"]');
    await passwords.first().fill(acc.password);
    await passwords.last().fill(acc.password);

    // capture the created user's id from the API response while saving
    const [createResponse] = await Promise.all([ 
      page.waitForResponse((r) => r.url().includes("/api/v2/admin/users") && r.request().method() === "POST",opts,),saveButton.click(),
    ]);
    registry.userIds.push((await createResponse.json()).data.id); 
    writeRegistry(registry);

    // Save redirects back to the list: that is the success signal
    await expect(heading("System Users")).toBeVisible(opts);
    console.log(`Created ${acc.username} -> ${employee.firstName} ${employee.lastName}`);
  }

  // 4. Single final verification for all 3 accounts
  await employeeHint.fill(employee.firstName);
  await suggestion.click();
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator("span.oxd-text--span", { hasText: "Records Found" })).toHaveText(/\(3\) Records Found/,opts,);

  // 5. Write the seed file only after everything succeeded
  fs.mkdirSync(path.dirname(seedUsersPath), { recursive: true });
  fs.writeFileSync(seedUsersPath,
    JSON.stringify(
      { admin: accounts.find((a) => a.role === "Admin")?.username,
        ess: accounts.find((a) => a.role === "ESS" && a.status === "Enabled")?.username,
        accounts,
      },null,2,),"utf-8",);
});