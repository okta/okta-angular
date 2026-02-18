import { enableProdMode } from '@angular/core';

import { AppModule } from './app/app.module';
// eslint-disable-next-line node/no-unpublished-import, node/no-missing-import
import { environment } from './environments/environment';
import { platformBrowser } from '@angular/platform-browser';

if (environment.production) {
  enableProdMode();
}

platformBrowser().bootstrapModule(AppModule)
  .catch(err => console.error(err));
