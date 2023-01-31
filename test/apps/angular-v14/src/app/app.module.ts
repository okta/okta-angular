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

/*eslint import/no-unresolved: [2, { ignore: ['@okta/okta-angular$'] }]*/
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
} from '@okta/okta-angular';

/**
 * App Components
 */
import { ProtectedComponent } from './protected.component';
import { AppComponent } from './app.component';
import { SessionTokenLoginComponent } from './sessionToken-login.component';
import { PublicComponent } from './public.component';
import { HasGroupComponent } from './has-group.component';

// eslint-disable-next-line node/no-unpublished-import, node/no-missing-import, import/no-unresolved
import { environment } from '../environments/environment';

export function onNeedsAuthenticationGuard(oktaAuth: OktaAuth, injector: Injector) {
  const router = injector.get(Router);
  router.navigate(['/sessionToken-login']);
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
  },
  {
    path: 'lazy',
    loadChildren: () => import('./lazy-load/lazy-load.module').then(mod => mod.LazyLoadModule),
    canLoad: [ OktaAuthGuard ]
  },
  {
    path: 'group',
    component: HasGroupComponent,
  },
];

const oktaAuth = new OktaAuth(environment.oidc);

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    OktaAuthModule.forRoot({ oktaAuth })
  ],
  declarations: [
    AppComponent,
    ProtectedComponent,
    SessionTokenLoginComponent,
    PublicComponent,
    HasGroupComponent,
  ],
  bootstrap: [ AppComponent ]
})

export class AppModule { }
