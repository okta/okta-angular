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

import { ResolveFn, Routes } from '@angular/router';
import { ClientJsRouteData, loginCallbackGuard, oktaFetch, tokenGuard } from '@okta/okta-angular/client-js';

import { environment } from '../environments/environment';
import { AdminComponent } from './admin.component';
import { LoginErrorComponent } from './login-error.component';
import { MessagesResponse, MessagesResult } from './message';
import { MessagesComponent } from './messages.component';
import { ProtectedComponent } from './protected.component';
import { PublicComponent } from './public.component';

/**
 * A `ResolveFn` runs in an injection context, so `oktaFetch` can be called directly. Failures are
 * returned as data rather than rethrown, since a rejected resolver aborts the whole navigation.
 */
const messagesResolver: ResolveFn<MessagesResult> = async () => {
  try {
    const response = await oktaFetch(environment.resourceServer.messagesUrl);

    if (!response.ok) {
      return { error: `Resource server answered HTTP ${response.status}.` };
    }

    return await response.json() as MessagesResponse;
  } catch (e) {
    // A CORS preflight rejection lands here as a bare "Failed to fetch"/"Network failure", with the
    // actual reason only in the browser console — hence logging it as well as rendering it.
    console.error('[client-js] messagesResolver: oktaFetch rejected', e);
    return { error: `oktaFetch rejected: ${String(e)} — check the console and the :8000 log.` };
  }
};

export const routes: Routes = [
  // The app shell renders the intro, so `/` needs no component of its own. `pathMatch: 'full'` keeps
  // this empty path from being tried as a prefix of every other URL.
  { path: '', pathMatch: 'full', children: [] },
  {
    // Redirects before anything renders; `children: []` gives the router something to resolve to.
    path: 'login/callback',
    canActivate: [loginCallbackGuard],
    children: []
  },
  {
    path: 'login/error',
    component: LoginErrorComponent
  },
  {
    path: 'protected',
    component: ProtectedComponent,
    canActivate: [tokenGuard],
    children: [
      {
        // Inherits the parent's `canActivate` — no guard of its own.
        path: 'child',
        component: ProtectedComponent
      }
    ]
  },
  {
    // Step-up: the extra `groups` scope misses the credential stored for the default scopes, so
    // `getToken()` starts a fresh authorize request.
    path: 'admin',
    component: AdminComponent,
    canActivate: [tokenGuard],
    data: {
      clientJs: {
        params: { scopes: ['openid', 'profile', 'email', 'groups'] }
      }
    } satisfies ClientJsRouteData
  },
  {
    path: 'messages',
    component: MessagesComponent,
    canActivate: [tokenGuard],
    resolve: { messages: messagesResolver }
  },
  {
    // The parent renders for everyone; `canActivateChild` guards only what is nested under it.
    path: 'public',
    component: PublicComponent,
    canActivateChild: [tokenGuard],
    children: [
      {
        path: 'private',
        component: ProtectedComponent
      }
    ]
  },
  {
    // `tokenGuard` unchanged in `canMatch` position, where it receives a `Route` rather than an
    // `ActivatedRouteSnapshot`.
    path: 'lazy',
    loadComponent: () => import('./lazy-load/lazy-load.component').then(c => c.LazyLoadComponent),
    canMatch: [tokenGuard]
  }
];
