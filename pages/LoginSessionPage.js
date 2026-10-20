const { expect } = require("@playwright/test");

class Login_Session {
  /** @param {import('@playwright/test').Page} page */
  /** @param {string} placeholder */
  constructor(page) {
    this.page = page;
    this.loginHeading = page.getByRole("heading", {
      name: "Login",
      exact: true,
    });
    this.inputUsername = page.locator('input[name="username"]');
    this.inputPassword = page.locator('input[name="password"]');
    this.btnLogin = page.locator('button[type="submit"]');
    this.btnCancel = page.getByRole("button", { name: "Cancel" });
    this.brandBanner = page.getByAltText("client brand banner");
    this.errorAlert = page
      .locator(".oxd-alert-content--error")
      .getByText("Invalid credentials");
    this.userNameRequired = page
      .locator(".oxd-input-field-error-message")
      .first();
    this.passwordRequired = page
      .locator(".oxd-input-field-error-message")
      .last();
    this.accountDisabledAlert = page.locator(".oxd-alert-content-text", {
      hasText: "Account disabled",
    });
    this.userDropdownIcon = page.locator(".oxd-userdropdown-icon");
    this.logoutButton = page.getByRole("menuitem", { name: "Logout" });
    this.forgotPasswordLink = page.getByText("Forgot your password?");
    this.resetPasswordHeading = page.getByRole("heading", {
      name: "Reset Password",
    });
    this.resetPasswordButton = page.getByRole("button", {
      name: "Reset Password",
    });
    this.resetPasswordSuccessMessage = page.getByRole("heading", {
      name: "Reset Password link sent successfully",
    });
    this.adminLink = page.getByRole("link", { name: "Admin" });
  }

  async FillCredentials(username, password) {
    await this.inputUsername.fill(username);
    await this.inputPassword.fill(password);
  }

  async LoginWithButton(username, password) {
    await this.FillCredentials(username, password);
    await this.btnLogin.click();
  }

  async LoginWithDoubleClick(username, password) {
    await this.FillCredentials(username, password);
    await this.btnLogin.dblclick();
  }

  async LoginEnterKey(username, password) {
    await this.FillCredentials(username, password);
    await this.page.keyboard.press("Enter");
  }

  async VerifyVisibilityAfterLogin() {
    await expect(this.brandBanner).toBeVisible();
    await expect(this.page).toHaveURL(/dashboard/);
  }

  // Reads the styles that normally make focus visible
  async getFocusStyles(locator) {
    return await locator.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        outlineStyle: s.outlineStyle,
        outlineWidth: s.outlineWidth,
        outlineColor: s.outlineColor,
        borderColor: s.borderColor,
        boxShadow: s.boxShadow,
        backgroundColor: s.backgroundColor,
      };
    });
  }

  async hasFocusIndicator(before, after) {
    return Object.keys(before).some((key) => before[key] !== after[key]);
  }

  async Logout() {
    await this.userDropdownIcon.click();
    await this.logoutButton.waitFor({ state: "visible" });
    await expect(this.logoutButton).toBeVisible();
    await this.logoutButton.click();
  }
}

module.exports = { Login_Session };
