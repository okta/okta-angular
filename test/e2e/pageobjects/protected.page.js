import { AppPage } from './app.page';

class ProtectedPage extends AppPage {
  get userInfo() { return $('#userinfo-container') }

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

  async assertUserInfo(username) {
    await this.waitForLoad();
    await this.userInfo.then(el => el.getText()).then(txt => {
      expect(txt).toContain(username);
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
