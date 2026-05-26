import { ApplicationConfig, EnvironmentProviders, inject, Provider, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { OktaAuthConfigService, OktaConfig, provideOktaAuth, withOktaConfig } from '@okta/okta-angular';
import { environment } from '../environments/environment';
import { OktaAuth } from '@okta/okta-auth-js';

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
    provideZonelessChangeDetection(),
    provideRouter(routes)
  ]
};
