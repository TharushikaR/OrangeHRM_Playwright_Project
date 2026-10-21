const { expect } = require("@playwright/test");
class Dashboard {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
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
}

module.exports = { Dashboard };
