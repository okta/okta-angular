import { ApplicationConfig, EnvironmentProviders, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, Provider } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { OktaConfig, provideOktaAuth, OktaAuthConfigService, withOktaConfig } from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';
import { environment } from '../environments/environment';

let oktaConfig: OktaConfig | undefined;
let providers: (Provider|EnvironmentProviders)[] = [];

if (environment.asyncOktaConfig) {
  providers = [
    provideOktaAuth(),
    provideAppInitializer(async () => {
      const configService = inject(OktaAuthConfigService);
      // Use asynchronous import of configuration
      // You can also load configuration with HTTP request here with HttpClient
      // eslint-disable-next-line node/no-unpublished-import, node/no-missing-import, import/no-unresolved
      const { environment: { oidc } } = await import('../environments/environment');
      const oktaAuth = new OktaAuth(oidc);
      oktaConfig = {
        oktaAuth
      };
      configService.setConfig(oktaConfig);
    })
  ];
} else {
  const oktaAuth = new OktaAuth(environment.oidc);
  oktaConfig = {
    oktaAuth
  };
  providers = [provideOktaAuth(withOktaConfig(oktaConfig))];
}

export const appConfig: ApplicationConfig = {
  providers: [
    ...providers,
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
