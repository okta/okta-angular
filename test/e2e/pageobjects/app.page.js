import { waitForLoad } from '../util/waitUtil';

export class AppPage {
  get loginButton() { return $('#login-button') }
  get logoutButton() { return $('#logout-button') }

  async navigateTo() {
    return browser.url('http://localhost:8080');
  }

  async login() {
    await waitForLoad(this.loginButton);
    await this.loginButton.click();
  }

  async logout() {
    await waitForLoad(this.logoutButton);
    await this.logoutButton.click();
    await waitForLoad(this.loginButton);
  }

  async waitUntilLoggedIn() {
    await waitForLoad(this.logoutButton);
  }
}

export default new AppPage();
