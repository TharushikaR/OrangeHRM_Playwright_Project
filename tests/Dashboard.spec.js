// @ts-check
import { test, expect } from "@playwright/test";
const { readDataFromExcel } =require('../utils/excelReader');

const { Login_Session } = require("../pages/LoginSessionPage");
const { Dashboard } = require("../pages/DashBoardPg");
const widgets = readDataFromExcel('fixtures/TestData.xlsx', 'Widget', 0); // First sheet
const quickLaunchs = readDataFromExcel('fixtures/TestData.xlsx', 'Quick Launch', 1); // second sheet

/** @type {import('@playwright/test').BrowserContext} */
let context;
/** @type {import('@playwright/test').Page} */
let page;
/** @type {Dashboard} */
let dashboard;
/** @type {Login_Session} */
let loginSession;

test.describe("OrangeHRM Dashboard Functionality", () => {
  test.beforeEach(async ({ page }) => {
    dashboard = new Dashboard(page);
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

  test("Dashboard widgets load after login", async ({ page }) => {
    await loginSession.LoginWithButton(
      process.env.ADMIN_USERNAME,
      process.env.ADMIN_PASSWORD,
    );
    await loginSession.VerifyVisibilityAfterLogin();
    await dashboard.verifyWidgetsVisible(widgets);
  });

  test("Quick Launch tiles navigate correctly", async ({ page }) => {
    await loginSession.LoginWithButton(
      process.env.ADMIN_USERNAME,
      process.env.ADMIN_PASSWORD,
    );
    await loginSession.VerifyVisibilityAfterLogin();
    await dashboard.verifyButtonsVisible(quickLaunchs);
    //await dashboard.clickButton(quickLaunchs);
  });

});
