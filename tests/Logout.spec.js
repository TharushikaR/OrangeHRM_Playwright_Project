// @ts-check
import { test, expect } from '@playwright/test';
const {Login_Session} = require('../pages/Login_Session_Page');
/** @type {import('@playwright/test').BrowserContext} */
let context;
/** @type {import('@playwright/test').Page} */
let page;
/** @type {Login_Session} */
let loginSession;

test.describe('OrangeHRM Authentication', () => {


test.beforeEach(async ({ browser, baseURL }) => {

  // Open a fresh "incognito" context
    context = await browser.newContext({ baseURL });
    page = await context.newPage();

  // Clear cookies and local storage before each test
  //await page.context().clearCookies();
  //await page.evaluate(() => localStorage.clear());
  loginSession = new Login_Session(page);
  await page.goto('/web/index.php/auth/login');
});

test.afterEach(async () => {
    // Close the incognito context after each test
    await context.close();
  });


  test('Logout from user dropdown', async ({ page }) => {
    
  });

  test('Access protected URL after logout', async ({ page }) => {
   
  });



});