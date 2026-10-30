// @ts-check
import { test as setup } from "@playwright/test";
import fs from "node:fs";
const { Login_Session } = require("../../pages/LoginSessionPage");

const authFileAdmin = "playwright/.auth/admin.json";
const authFileEss = "playwright/.auth/ess.json";

const seedUsers = JSON.parse(fs.readFileSync("playwright/.auth/seed-users.json", "utf-8"),);

const users = [
  {
    role: "Admin",
    username: seedUsers.admin,
    password: seedUsers.accounts[0].password,
    authFile: authFileAdmin,
  },
  {
    role: "ESS",
    username: seedUsers.ess,
    password: seedUsers.accounts[1].password,
    authFile: authFileEss,
  },
];

for (const u of users) {
  setup(`Authenticate as ${u.role}`, async ({ page }) => {
    if (!u.username || !u.password) {
      throw new Error(`Missing username or password for ${u.role}`);
    }
    
    const loginSession = new Login_Session(page);

    await page.goto("/web/index.php/auth/login", {waitUntil: "domcontentloaded",});
    await loginSession.LoginWithButton(u.username, u.password);
    await loginSession.VerifyVisibilityAfterLogin();

    await page.context().storageState({ path: u.authFile });
  });
}
