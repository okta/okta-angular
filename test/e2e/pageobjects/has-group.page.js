import { AppPage } from './app.page';

class HasGroupPage extends AppPage {
  get inGroupContent() { return $('#in-group') }
  get notInGroupContent() { return $('#not-in-group') }

  async navigateTo() {
    return browser.url('/group');
  }
}

export default new HasGroupPage();
