class LoginPage {
  get usernameInput() {
    return cy.get('input[name="username"]');
  }

  get passwordInput() {
    return cy.get('input[name="password"]');
  }

  get submitButton() {
    return cy.get('button[type="submit"]');
  }

  get fieldErrorMessages() {
    return cy.get(".oxd-input-field-error-message");
  }

  visit() {
    cy.visit("/web/index.php/auth/login");
  }

  typeUsername(username) {
    this.usernameInput.type(username);
  }

  typePassword(password) {
    this.passwordInput.type(password);
  }

  clickSubmit() {
    this.submitButton.click();
  }

  login(username, password) {
    this.typeUsername(username);
    this.typePassword(password);
    this.clickSubmit();
  }

  assertOnLoginPage() {
    cy.url().should("include", "/auth/login");
  }

  assertUsernameFieldVisible() {
    this.usernameInput.should("be.visible");
  }

  assertPasswordFieldIsMasked() {
    this.passwordInput.should("have.attr", "type", "password");
  }

  assertInvalidCredentialsError() {
    cy.contains("Invalid credentials").should("be.visible");
  }

  assertRequiredFieldErrors(expectedCount = 2) {
    this.fieldErrorMessages
      .should("have.length", expectedCount)
      .and("contain", "Required");
  }
}

export default new LoginPage();
