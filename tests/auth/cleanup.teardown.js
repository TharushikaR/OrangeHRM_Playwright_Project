// @ts-check
import { test as teardown, expect } from "@playwright/test";
import fs from "node:fs";
import { readRegistry, removeRegistry } from "../../utils/seed-registry";

const { Login_Session } = require("../../pages/LoginSessionPage");
const seedUsersPath = "playwright/.auth/seed-users.json";

teardown("Cleanup: delete seeded users and employee", async ({ page }) => {
  const registry = readRegistry();
  if (!registry) {
    console.log("Nothing to clean up");
    return;
  }

  const loginSession = new Login_Session(page);
  await page.goto("/web/index.php/auth/login", {waitUntil: "domcontentloaded",});
  await loginSession.LoginWithButton(
    process.env.ADMIN_USERNAME,
    process.env.ADMIN_PASSWORD,
  );
  await loginSession.VerifyVisibilityAfterLogin();

  // page.request shares the logged-in session cookies
  // Users first, then the employee they belong to
  if (registry.userIds.length) {
    const res = await page.request.delete("/web/index.php/api/v2/admin/users", {data: { ids: registry.userIds },});
    expect(res.ok(), `Delete users failed: ${res.status()}`).toBeTruthy();
  }

  if (registry.empNumber) {
    const res = await page.request.delete("/web/index.php/api/v2/pim/employees",
      {
        data: { ids: [registry.empNumber] },
      },
    );
    expect(res.ok(), `Delete employee failed: ${res.status()}`).toBeTruthy();
  }

  // Data is gone, so remove the now-stale files
  removeRegistry();
  fs.rmSync(seedUsersPath, { force: true });
  console.log(`Deleted ${registry.userIds.length} users and employee ${registry.employeeName}`,);
});
