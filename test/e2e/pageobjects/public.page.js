import { AppPage } from './app.page';
import { waitForLoad } from '../util/waitUtil';

class PublicPage extends AppPage {
  get publicArea() { return $('app-public') }
  get privateArea() { return $('app-secure') }

  async navigateTo(path) {
    path = path || '';
    await browser.url('/public' + path);
  }

  async waitForLoad() {
    await waitForLoad(this.publicArea, 'public area');
  }
}

export default new PublicPage();
