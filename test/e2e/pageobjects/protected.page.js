import { AppPage } from './app.page';

class ProtectedPage extends AppPage {
  get userInfo() { return $('#userinfo-container') }
  get claims() { return $('#claims-container') }

  async navigateTo(query) {
    query = query || '';
    return browser.url('http://localhost:8080/protected' + query);
  }

  async waitForLoad() {
    return browser.waitUntil(async () => 
      this.userInfo
        .then(el => el.getText())
        .then(txt => !!txt.trim().length), 5000, 'wait for user info');
  }

  async waitForClaims() {
    return browser.waitUntil(async () => 
      this.claims
        .then(el => el.getText())
        .then(txt => !!txt.trim().length), 5000, 'wait for claims');
  }

  async assertUserInfo(username) {
    await this.waitForLoad();
    await this.userInfo.then(el => el.getText()).then(txt => {
      expect(txt).toContain(username);
    });
  }

  async assertClaim(key, value) {
    await this.waitForClaims();
    await this.claims.then(el => el.getText()).then(txt => {
      const claims = JSON.parse(txt);
      if (!value) {
        expect(claims[key]).not.toBeDefined();
      } else {
        expect(claims[key]).toBeDefined();
        expect(claims[key]).toEqual(value);
      }
    });
  }

  async assertQueryParams(query) {
    await this.waitForLoad();
    await browser.getUrl().then(url => {
      expect(url).toContain(query);
    });
  }
}

export default new ProtectedPage();
