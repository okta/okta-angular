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

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';

/**
 * Okta Library
 */
import { OktaAuth } from '@okta/okta-auth-js';
import {
  OktaAuthGuard,
  OktaAuthModule,
  OktaCallbackComponent,
  OKTA_CONFIG
} from '@okta/okta-angular';

/**
 * App Components
 */
import { ProtectedComponent } from './protected.component';
import { AppComponent } from './app.component';
import { SessionTokenLoginComponent } from './sessionToken-login.component';
import { PublicComponent } from './public.component';

export function onNeedsAuthenticationGuard(oktaAuth: OktaAuth, injector: Injector) {
  const router = injector.get(Router);
  router.navigate(['/sessionToken-login']);
}

export function onNeedsGlobalAuthenticationGuard(oktaAuth: OktaAuth) {
  oktaAuth.signInWithRedirect({ originalUri: '/' });
}

const appRoutes: Routes = [
  {
    path: 'sessionToken-login',
    component: SessionTokenLoginComponent
  },
  {
    path: 'login/callback',
    component: OktaCallbackComponent
  },
  {
    path: 'protected',
    component: ProtectedComponent,
    canActivate: [ OktaAuthGuard ],
    children: [
      {
        path: 'foo',
        component: ProtectedComponent
        // protected by canActivate on parent route
      }
    ]
  },
  {
    path: 'protected-with-data',
    component: ProtectedComponent,
    canActivate: [ OktaAuthGuard ],
    data: {
      onAuthRequired: onNeedsAuthenticationGuard
    }
  },
  {
    path: 'public',
    component: PublicComponent,
    canActivateChild: [ OktaAuthGuard ],
    children: [
      {
        path: 'private',
        component: ProtectedComponent
      }
    ]
  }
];

const redirectUri = window.location.origin + '/login/callback';

const config = {
  issuer: process.env.ISSUER,
  redirectUri,
  clientId: process.env.CLIENT_ID,
  testing: {
    disableHttpsCheck: false
  }
};

if (process.env.OKTA_TESTING_DISABLEHTTPSCHECK) {
  config.testing = {
    disableHttpsCheck: true
  };
}

const oktaAuth = new OktaAuth(config);

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    OktaAuthModule
  ],
  declarations: [
    AppComponent,
    ProtectedComponent,
    SessionTokenLoginComponent,
    PublicComponent
  ],
  providers: [{
    provide: OKTA_CONFIG,
    useValue: {
      oktaAuth,
      onAuthRequired: onNeedsGlobalAuthenticationGuard,
    }
  }],
  bootstrap: [ AppComponent ]
})

export class AppModule { }
