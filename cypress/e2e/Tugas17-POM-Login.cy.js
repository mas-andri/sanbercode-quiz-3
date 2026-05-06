/// <reference types="cypress" />

import LoginPage from "../support/PageObject/LoginPage";
import DashboardPage from "../support/PageObject/DashboardPage";

describe("Login Feature Validation", () => {
  let loginData;

  before(() => {
    cy.fixture("login").then((data) => {
      loginData = data;
    });
  });

  beforeEach(() => {
    LoginPage.visit();
  });

  it("Verify login with valid credentials", () => {
    LoginPage.login(loginData.validUser.username, loginData.validUser.password);

    DashboardPage.assertOnDashboardPage();
  });

  it("Verify password field masks entered characters", () => {
    LoginPage.assertPasswordFieldIsMasked();
  });

  it("Verify successful logout after login", () => {
    LoginPage.login(loginData.validUser.username, loginData.validUser.password);
    DashboardPage.assertOnDashboardPage();

    cy.logout();
    cy.wait(1000);

    LoginPage.assertOnLoginPage();
    LoginPage.assertUsernameFieldVisible();
  });

  it("Verify login with invalid username", () => {
    LoginPage.login(
      loginData.invalidUsername.username,
      loginData.invalidUsername.password,
    );

    LoginPage.assertInvalidCredentialsError();
  });

  it("Verify login with invalid password", () => {
    LoginPage.login(
      loginData.invalidPassword.username,
      loginData.invalidPassword.password,
    );

    LoginPage.assertInvalidCredentialsError();
  });

  it("Verify login with blank username and password", () => {
    LoginPage.clickSubmit();

    LoginPage.assertRequiredFieldErrors(2);
  });

  it("Verify unauthorized access to dashboard is blocked", () => {
    DashboardPage.visit();

    LoginPage.assertOnLoginPage();
  });

  it("Leading/Trailing spaces in Username", () => {
    LoginPage.login(
      loginData.usernameWithSpaces.username,
      loginData.usernameWithSpaces.password,
    );

    LoginPage.assertInvalidCredentialsError();
    LoginPage.assertOnLoginPage();
  });

  it("Leading/Trailing spaces in Password", () => {
    LoginPage.login(
      loginData.passwordWithSpaces.username,
      loginData.passwordWithSpaces.password,
    );

    LoginPage.assertInvalidCredentialsError();
    LoginPage.assertOnLoginPage();
  });
});
