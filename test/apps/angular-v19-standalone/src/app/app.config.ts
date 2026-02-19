import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, Provider, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { OktaAuthConfigService, OktaAuthModule, OktaConfig } from '@okta/okta-angular';
import { environment } from '../environments/environment';
import { OktaAuth } from '@okta/okta-auth-js';

let oktaConfig: OktaConfig | undefined;
let providers: Provider[] = [];
if (environment.asyncOktaConfig) {
  const configInitializer = (configService: OktaAuthConfigService) => {
    return async () => {
      // Use asynchronous import of configuration
      // You can also load configuration with HTTP request here with HttpClient
      // eslint-disable-next-line node/no-unpublished-import, node/no-missing-import, import/no-unresolved
      const { environment: { oidc } } = await import('../environments/environment');
      const oktaAuth = new OktaAuth(oidc);
      oktaConfig = {
        oktaAuth
      };
      configService.setConfig(oktaConfig);
    };
  };
  providers = [
    {
    provide: APP_INITIALIZER,
    useFactory: configInitializer,
    deps: [OktaAuthConfigService],
    multi: true
  }];
} else {
  const oktaAuth = new OktaAuth(environment.oidc);
  oktaConfig = {
    oktaAuth
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    ...providers,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(OktaAuthModule.forRoot(oktaConfig),)
  ]
};
