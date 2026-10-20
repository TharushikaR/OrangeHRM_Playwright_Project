// @ts-check
import { defineConfig, devices } from "@playwright/test";
require("dotenv").config();

const timeNow = new Date();
/** @param {number} n */
const timePad = (n) => String(n).padStart(2, "0");
const timeStamp = `${timeNow.getFullYear()}_${timePad(timeNow.getMonth() + 1)}_${timePad(timeNow.getDate())}_${timePad(timeNow.getHours())}_${timePad(timeNow.getMinutes())}_${timePad(timeNow.getSeconds())}`;

export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results",
  timeout: 60 * 1000,
  expect: {
    timeout: 70000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 0 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["list"],
    [
      "html",
      { outputFolder: `Reports/html_report_${timeStamp}`, open: "never" },
    ],
    [
      "junit",
      { outputFile: `Reports/junit_results_${timeStamp}.xml`, open: "never" },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL:
      process.env.BASE_URL || "https://opensource-demo.orangehrmlive.com",
      actionTimeout: 0,
      navigationTimeout: 30000,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "en-US",
    timezoneId: "America/New_York",
  },

  /* Configure projects for major browsers */
  projects: [
    // {
    //   name: "chromium",
    //   use: { ...devices["Desktop Chrome"] },
    // },

    // {
    //   name: "Firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },

    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
