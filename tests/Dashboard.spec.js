// @ts-check
import { test } from "@playwright/test";
const { readDataFromExcel } = require("../utils/excelReader");
const { Login_Session } = require("../pages/LoginSessionPage");
const { Dashboard } = require("../pages/DashBoardPg");
const widgets = readDataFromExcel("testData/TestData.xlsx", "Widget", 0); // First sheet
const quickLaunchs = readDataFromExcel("testData/TestData.xlsx","Quick Launch",1,); // second sheet
const qlURL = readDataFromExcel("testData/TestData.xlsx", "UrlPart", 2);
const menuItems = readDataFromExcel("testData/TestData.xlsx", "Menu Items", 3);
const QLNavigation = quickLaunchs.map((Name, i) => ({Name,UrlPart: qlURL[i],}));

// /** @type {import('@playwright/test').BrowserContext} */
// let context;
// /** @type {import('@playwright/test').Page} */
// let page;
/** @type {Dashboard} */
let dashboard;
/** @type {Login_Session} */
let loginSession;

test.describe("OrangeHRM Dashboard Functionality", () => {
  test.use({ storageState: "playwright/.auth/admin.json" });
  test.beforeEach(async ({ page }) => {
    dashboard = new Dashboard(page);
    loginSession = new Login_Session(page);
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

  test("Dashboard widgets load after login", async ({}) => {
    await dashboard.verifyWidgetsVisible(widgets);
  });

  test("Quick Launch tiles navigate correctly", async ({}) => {
    await dashboard.verifyButtonsVisible(quickLaunchs);
    await dashboard.verifyQuickLaunchNavigation(QLNavigation);
  });

  test("Dashboard side panel working properly", async ({}) => {
    await dashboard.clickSidePanel(); //collapse
    await dashboard.clickSidePanel(); //expand
  });

  test("Verify search functionality on dashboard side panel", async ({}) => {
    await dashboard.searchDashboard("Time");
    await dashboard.searchDashboard("x");
    //CHECK AGAIN
  });

  test("Verify icons on dashboard side panel", async ({}) => {
    await dashboard.verifyMenuItemsVisible(menuItems);
  });
});
