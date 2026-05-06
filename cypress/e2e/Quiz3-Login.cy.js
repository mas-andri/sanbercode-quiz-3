/// <reference types="cypress" />

describe("Login Feature Validation", () => {
  beforeEach(() => {
    cy.visit("/web/index.php/auth/login");
  });

  it("Verify login with valid credentials", () => {
    cy.login("Admin", "admin123");
    cy.url().should("include", "/dashboard");
  });

  it("Verify password field masks entered characters", () => {
    cy.get('input[name="password"]').should("have.attr", "type", "password");
  });

  it("Verify successful logout after login", () => {
    cy.login("Admin", "admin123");

    // Ensure login success first
    cy.url().should("include", "/dashboard");

    cy.logout();
    cy.wait(2000);

    // Validate logout success
    cy.url().should("include", "/auth/login");
    cy.get('input[name="username"]').should("be.visible");
  });

  it("Verify login with invalid username", () => {
    cy.login("WrongUser", "admin123");
    cy.contains("Invalid credentials").should("be.visible");
  });

  it("Verify login with invalid password", () => {
    cy.login("Admin", "WrongPass");
    cy.contains("Invalid credentials").should("be.visible");
  });

  it("Verify login with blank username and password", () => {
    cy.get('button[type="submit"]').click();
    cy.get(".oxd-input-field-error-message")
      .should("have.length", 2)
      .and("contain", "Required");
  });

  it("Verify unauthorized access to dashboard is blocked", () => {
    cy.visit("/web/index.php/dashboard/index");
    cy.url().should("include", "/auth/login");
  });

  it("Leading/Trailing spaces in Username", () => {
    cy.login("  Admin  ", "admin123");
    cy.contains("Invalid credentials").should("be.visible");
    cy.url().should("include", "/auth/login");
  });

  it("Leading/Trailing spaces in Password", () => {
    cy.login("Admin", "  admin123  ");
    cy.contains("Invalid credentials").should("be.visible");
    cy.url().should("include", "/auth/login");
  });
});
