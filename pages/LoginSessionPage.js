class Login_Session {
  constructor(page) {
    this.page = page;
    this.inputUsername = page.locator('input[name="username"]');
    this.inputPassword = page.locator('input[name="password"]');
    this.btnLogin = page.locator('button[type="submit"]');
  }

  async Login(username, password) {
    await this.inputUsername.fill(username);
    await this.inputPassword.fill(password);
    await this.btnLogin.click();
  }
}

module.exports = { Login_Session };