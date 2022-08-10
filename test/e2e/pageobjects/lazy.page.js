import { AppPage } from './app.page';
import { waitForLoad } from '../util/waitUtil';

class LazyPage extends AppPage {
  get lazyArea() { return $('app-lazy-load') }

  async navigateTo(query) {
    query = query || '';
    return browser.url('http://localhost:8080/lazy' + query);
  }

  async waitForLoad() {
    await waitForLoad(this.lazyArea);
  }

  async assertQueryParams(query) {
    await this.waitForLoad();
    await browser.getUrl().then(url => {
      expect(url).toContain(query);
    });
  }
}

export default new LazyPage();
