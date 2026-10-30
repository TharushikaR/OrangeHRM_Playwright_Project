// @ts-check
import { test, expect } from "@playwright/test";
const { Admin } = require("../pages/AdminPg");


// /** @type {import('@playwright/test').BrowserContext} */
// let context;
// /** @type {import('@playwright/test').Page} */
// let page;
/** @type {Admin} */
let admin;

test.describe("OrangeHRM - Admin - User Management", () => {
  test.beforeEach(async ({ page }) => {
    admin = new Admin(page);
    await page.goto("/web/index.php/auth/login", {waitUntil: "domcontentloaded",});
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.retry) {
      console.log(`Retry attempt: ${testInfo.retry} -> ${testInfo.title} -> ${testInfo.project.name}`,);
    } else {
      console.log(`Finished: ${testInfo.title} -> ${testInfo.status} -> ${testInfo.project.name}`,);
    }
    await page.context().clearCookies();
  });
  
  });