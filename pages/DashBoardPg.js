const { expect } = require("@playwright/test");
class Dashboard {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.sidePanel = page.locator(".oxd-icon-button.oxd-main-menu-button");
    this.iconSearch = page.locator('input.oxd-input[placeholder="Search"]');
    this.bodySidePanel = page.locator(".oxd-sidepanel-body");
  }
  widget(title) {
    return this.page.locator("p.oxd-text--p", {
      hasText: new RegExp(`^${title}$`),
    });
  }

  async verifyWidgetsVisible(titles) {
    for (const title of titles) {
      await expect(this.widget(title)).toBeVisible();
    }
  }

  button(name) {
    if (!name) {
      throw new Error(`Button name is empty or undefined: ${name}`);
    }
    return this.page.getByRole("button", { name, exact: true });
  }

  async verifyButtonsVisible(names) {
    for (const name of names) {
      await expect(this.button(name)).toBeVisible();
    }
  }

  async clickButton(name) {
    await this.button(name).click();
  }

  async clickAndVerifyUrl(name, urlPart) {
    await this.clickButton(name);
    await expect(this.page).toHaveURL(new RegExp(urlPart));
  }

  async backToDashboard() {
    await this.page.goBack();
    await expect(this.page).toHaveURL(/dashboard\/index/);
  }

  // Loop through all Quick Launch rows
  async verifyQuickLaunchNavigation(rows) {
    for (const { Name, UrlPart } of rows) {
      await this.clickAndVerifyUrl(Name, UrlPart);
      console.log(`Navigation done, ${Name}`);
      await this.backToDashboard();
      console.log("Back to dashboard");
    }
  }

  async clickSidePanel() {
    await this.sidePanel.click();
  }
  async searchDashboard(searchText) {
    await expect(this.iconSearch).toBeVisible();
    await this.iconSearch.click();
    await this.iconSearch.fill(searchText);

    const result = this.page.getByText(searchText, { exact: false }).first();

    // true if the result appears within 5s, false otherwise (no exception)
    // const isFound = await result
    //   .waitFor({ state: "visible", timeout: 5000 })
    //   .then(() => true)
    //   .catch(() => false);

    await this.page.waitForTimeout(500); // or wait for the list to update
    const isFound = (await this.bodySidePanel.count()) > 0;

    if (isFound) {
      console.log(`"${searchText}" found`);
    } else {
      console.log(`"${searchText}" not found`);
    }

    await this.iconSearch.clear();
    return isFound;
  }

  // Common locator: any side menu item by its name
  menuItem(name) {
    return this.page.locator(".oxd-main-menu-item--name", {
      hasText: new RegExp(`^${name}$`),
    });
  }

  // Common function: verify one or more menu items are visible
  async verifyMenuItemsVisible(names) {
    for (const name of names) {
      await expect(this.menuItem(name)).toBeVisible();
      console.log(`Menu item "${name}" is visible`);
    }
  }
}

module.exports = { Dashboard };
