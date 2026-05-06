import LoginPage from "./PageObject/LoginPage";
import DashboardPage from "./PageObject/DashboardPage";

Cypress.Commands.add("login", (username, password) => {
  LoginPage.login(username, password);
});

Cypress.Commands.add("logout", () => {
  DashboardPage.logout();
});
