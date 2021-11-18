import { waitForLoad } from '../util/waitUtil';

class SessionTokenSignInPage {
  get username() { return $('#username') }
  get password() { return $('#password') }
  get submit() { return $('#submit') }

  async navigateTo() {
    return browser.url('/sessionToken-login');
  }

  async waitForLoad() {
    await waitForLoad(this.submit);
  }

  async signIn({ username, password }) {
    await this.username.setValue(username);
    await this.password.setValue(password);
    await this.submit.click();
  }
}

export default new SessionTokenSignInPage();
