import { AppPage } from './app.page';

class LazyPage extends AppPage {
  get appLazyLoad() { return $('app-lazy-load') }

  async navigateTo(query) {
    query = query || '';
    return browser.url('http://localhost:8080/lazy' + query);
  }

  async waitForLoad() {
    return browser.waitUntil(async () => 
      this.appLazyLoad
        .then(el => el.getText())
        .then(txt => txt.indexOf('Lazy Load') != -1), 5000, 'wait for lazy load');
  }

  async assertQueryParams(query) {
    await this.waitForLoad();
    await browser.getUrl().then(url => {
      expect(url).toContain(query);
    });
  }
}

export default new LazyPage();
