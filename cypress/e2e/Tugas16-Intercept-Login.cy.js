/// <reference types="cypress" />

describe("Login Feature Validation", () => {
  let loginData;

  before(() => {
    cy.fixture("login").then((data) => {
      loginData = data;
    });
  });

  beforeEach(() => {
    cy.visit("/web/index.php/auth/login");
  });

  it("Verify login with valid credentials", () => {
    cy.intercept("POST", "**/web/index.php/auth/validate", (req) => {
      expect(req.body).to.include("Admin");
      req.continue();
    }).as("loginRequest");
    cy.intercept(
      "GET",
      "**/web/index.php/api/v2/dashboard/employees/action-summary",
    ).as("actionSummary");

    cy.login(loginData.validUser.username, loginData.validUser.password);

    cy.wait("@loginRequest").its("response.statusCode").should("eq", 302);
    cy.wait("@actionSummary").its("response.statusCode").should("eq", 200);

    cy.url().should("include", "/dashboard");
  });

  it("Verify password field masks entered characters", () => {
    cy.intercept("GET", "**/web/index.php/auth/login").as("loginPageLoad");

    cy.reload();

    cy.wait("@loginPageLoad").then(({ response }) => {
      cy.log(response);
      console.log(response);
      expect(response.statusCode).to.eq(200);
    });

    cy.get('input[name="password"]').should("have.attr", "type", "password");
  });

  it("Verify successful logout after login", () => {
    cy.intercept("POST", "**/web/index.php/auth/validate").as("loginRequest");
    cy.intercept("GET", "**/web/index.php/auth/logout").as("logoutRequest");

    cy.login(loginData.validUser.username, loginData.validUser.password);

    // Wait for the login request to complete and verify a successful response.
    cy.wait("@loginRequest").its("response.statusCode").should("eq", 302);
    cy.url().should("include", "/dashboard");

    cy.logout();
    cy.wait(2000);

    cy.wait("@logoutRequest").its("response.statusCode").should("eq", 302);
    cy.url().should("include", "/auth/login");

    cy.get('input[name="username"]').should("be.visible");
  });

  it("Verify login with invalid username", () => {
    cy.intercept("POST", "**/web/index.php/auth/validate").as(
      "invalidUsernameRequest",
    );

    cy.login(
      loginData.invalidUsername.username,
      loginData.invalidUsername.password,
    );

    // Wait for the server to respond to the failed login attempt
    cy.wait("@invalidUsernameRequest")
      .its("response.statusCode")
      .should("eq", 302);

    cy.url().should("include", "/auth/login");
    cy.contains("Invalid credentials").should("be.visible");
  });

  it("Verify login with invalid password", () => {
    cy.intercept("POST", "**/web/index.php/auth/validate").as(
      "invalidPasswordRequest",
    );

    cy.login(
      loginData.invalidPassword.username,
      loginData.invalidPassword.password,
    );

    // Wait for the server response
    cy.wait("@invalidPasswordRequest")
      .its("response.statusCode")
      .should("eq", 302);

    cy.url().should("include", "/auth/login");
    cy.contains("Invalid credentials").should("be.visible");
  });

  it("Verify login with blank username and password", () => {
    cy.intercept("POST", "**/web/index.php/auth/validate").as(
      "blankFieldsRequest",
    );

    // Click Submit without entering any credentials
    cy.get('button[type="submit"]').click();

    cy.get(".oxd-input-field-error-message")
      .should("have.length", 2)
      .and("contain", "Required");

    cy.get("@blankFieldsRequest").should("be.null");
  });

  it("Verify unauthorized access to dashboard is blocked", () => {
    cy.intercept("GET", "**/web/index.php/dashboard/index").as(
      "unauthorizedDashboardAccess",
    );

    // Try to directly navigate to the dashboard without being logged in
    cy.visit("/web/index.php/dashboard/index");

    cy.wait("@unauthorizedDashboardAccess")
      .its("response.statusCode")
      .should("eq", 302);

    cy.url().should("include", "/auth/login");
  });

  it("Leading/Trailing spaces in Username", () => {
    cy.intercept("POST", "**/web/index.php/auth/validate").as(
      "spacedUsernameRequest",
    );

    // Attempt login with spaces around the username
    cy.login(
      loginData.usernameWithSpaces.username,
      loginData.usernameWithSpaces.password,
    );

    // Wait for the server to respond to the login attempt
    cy.wait("@spacedUsernameRequest")
      .its("response.statusCode")
      .should("eq", 302);

    cy.contains("Invalid credentials").should("be.visible");
    cy.url().should("include", "/auth/login");
  });

  it("Leading/Trailing spaces in Password", () => {
    cy.intercept("POST", "**/web/index.php/auth/validate").as(
      "spacedPasswordRequest",
    );

    // Attempt login with spaces around the password
    cy.login(
      loginData.passwordWithSpaces.username,
      loginData.passwordWithSpaces.password,
    );

    // Wait for the server's response
    cy.wait("@spacedPasswordRequest")
      .its("response.statusCode")
      .should("eq", 302);

    cy.contains("Invalid credentials").should("be.visible");
    cy.url().should("include", "/auth/login");
  });
});
