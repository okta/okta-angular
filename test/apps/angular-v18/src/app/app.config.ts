/*!
 * Copyright (c) 2017-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import {
  Injector,
  APP_INITIALIZER,
  Provider,
  ApplicationConfig,
} from '@angular/core';
import {
  Routes,
  Router,
  provideRouter,
  withComponentInputBinding,
} from '@angular/router';

/**
 * Okta Library
 */
import { OktaAuth } from '@okta/okta-auth-js';
import {
  OktaCallbackComponent,
  OktaAuthConfigService,
  OktaConfig,
  provideOktaAuth,
  oktaCanActivate,
  oktaCanActivateChild,
  oktaCanMatch,
} from '@okta/okta-angular';

/**
 * App Components
 */
import { ProtectedComponent } from './protected.component';
import { SessionTokenLoginComponent } from './sessionToken-login.component';
import { PublicComponent } from './public.component';
import { HasGroupComponent } from './has-group.component';

import { environment } from '../environments/environment';

export function onNeedsAuthenticationGuard(
  oktaAuth: OktaAuth,
  injector: Injector
) {
  const router = injector.get(Router);
  router.navigate(['/sessionToken-login']);
}

const appRoutes: Routes = [
  {
    path: 'sessionToken-login',
    component: SessionTokenLoginComponent,
  },
  {
    path: 'login/callback',
    component: OktaCallbackComponent,
  },
  {
    path: 'protected',
    component: ProtectedComponent,
    canActivate: [oktaCanActivate],
    children: [
      {
        path: 'foo',
        component: ProtectedComponent,
        // protected by canActivate on parent route
      },
    ],
  },
  {
    path: 'protected-with-data',
    component: ProtectedComponent,
    canActivate: [oktaCanActivate],
    data: {
      onAuthRequired: onNeedsAuthenticationGuard,
    },
  },
  {
    path: 'public',
    component: PublicComponent,
    canActivateChild: [oktaCanActivateChild],
    children: [
      {
        path: 'private',
        component: ProtectedComponent,
      },
      {
        path: '2fa',
        component: ProtectedComponent,
        data: {
          okta: {
            acrValues: 'urn:okta:loa:2fa:any',
          },
        },
      },
      {
        path: '1fa',
        component: ProtectedComponent,
        data: {
          okta: {
            acrValues: 'urn:okta:loa:1fa:any',
          },
        },
      },
    ],
  },
  {
    path: 'lazy',
    loadChildren: () => import('./lazy-load/lazy-load.routes'),
    canMatch: [oktaCanMatch],
  },
  {
    path: 'group',
    component: HasGroupComponent,
  },
];

let providers: Provider[] = [];
let oktaConfig: OktaConfig | undefined;
if (environment.asyncOktaConfig) {
  const configInitializer = (configService: OktaAuthConfigService) => {
    return async () => {
      // Use asynchronous import of configuration
      // You can also load configuration with HTTP request here with HttpClient
      const {
        environment: { oidc },
      } = await import('../environments/environment');
      const oktaAuth = new OktaAuth(oidc);
      oktaConfig = {
        oktaAuth,
      };
      configService.setConfig(oktaConfig);
    };
  };
  providers = [
    {
      provide: APP_INITIALIZER,
      useFactory: configInitializer,
      deps: [OktaAuthConfigService],
      multi: true,
    },
  ];
} else {
  const oktaAuth = new OktaAuth(environment.oidc);
  oktaConfig = {
    oktaAuth,
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    ...providers,
    provideRouter(appRoutes, withComponentInputBinding()),
    provideOktaAuth(oktaConfig),
  ],
};
