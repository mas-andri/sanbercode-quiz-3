class DashboardPage {
  get userDropdownToggle() {
    return cy.get(".oxd-userdropdown-tab");
  }

  get logoutMenuItem() {
    return cy.contains("Logout");
  }

  logout() {
    this.userDropdownToggle.should("be.visible").click();
    cy.wait(1000);
    this.logoutMenuItem.should("be.visible").click();
  }

  assertOnDashboardPage() {
    cy.url().should("include", "/dashboard");
  }

  visit() {
    cy.visit("/web/index.php/dashboard/index");
  }
}

export default new DashboardPage();
