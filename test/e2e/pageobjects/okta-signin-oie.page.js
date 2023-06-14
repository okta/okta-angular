class OktaSignInPage {
    get username () { return $('[name="identifier"]'); }
    get password () { return $('[name="credentials.passcode"]'); }
    get submit () { return $('[data-type="save"]'); }
  
    async waitForLoad() {
      return browser.waitUntil(async () => this.submit.then(el => el.isDisplayed()), 5000, 'wait for signin btn');
    }
  
    async signIn({ username, password }) {
      await this.username.setValue(username);
      await this.password.setValue(password);
      await this.submit.click();
    }
  }
  
  export default new OktaSignInPage();
  