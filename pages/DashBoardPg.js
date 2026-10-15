class DashboardPg {
    constructor(page) {
        this.page = page;
        this.dashboardHeader = page.locator('h6.oxd-text.oxd-text--h6.oxd-topbar-header-breadcrumb-module');
        this.welcomeMessage = page.locator('p.oxd-userdropdown-name');
    }
}

module.exports = { DashboardPg };