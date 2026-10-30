const { expect } = require("@playwright/test");
class Admin {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.sidePanel = page.locator(".oxd-icon-button.oxd-main-menu-button");
    this.iconSearch = page.locator('input.oxd-input[placeholder="Search"]');
    this.bodySidePanel = page.locator(".oxd-sidepanel-body");
  }

}

module.exports = { Admin };
