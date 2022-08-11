import { waitForLoad } from '../util/waitUtil';

export class AppPage {
  get loginButton() { return $('#login-button') }
  get logoutButton() { return $('#logout-button') }

  async navigateTo() {
    return browser.url('http://localhost:8080');
  }

  async login() {
    await waitForLoad(this.loginButton, 'login button');
    await this.loginButton.click();
  }

  async logout() {
    await waitForLoad(this.logoutButton, 'logout button');
    await this.logoutButton.click();
    await waitForLoad(this.loginButton, 'login button');
  }

  async waitUntilLoggedIn() {
    await waitForLoad(this.logoutButton, 'logout button');
  }
}

export default new AppPage();
