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
import { HomeComponent } from './home.component';
import { LoginErrorComponent } from './login-error.component';
import { Message, MessagesResponse } from './message';
import { MessagesComponent } from './messages.component';
import { ProtectedComponent } from './protected.component';
import { PublicComponent } from './public.component';

/**
 * `oktaFetch` in its third valid position: a `ResolveFn` runs in an injection context, so it can be
 * called directly here just like inside a guard.
 *
 * Failures resolve to `null` rather than rejecting. A rejected resolver aborts the whole navigation,
 * which would make `/messages` unreachable whenever the mock API isn't running — not a useful demo.
 * Note this only swallows *resource server* failures: if no credential can be resolved, `oktaFetch`
 * redirects to Okta before the request is ever made, and this `catch` is never reached.
 */
const messagesResolver: ResolveFn<Message[] | null> = async () => {
  try {
    const response = await oktaFetch(environment.resourceServer.messagesUrl);

    if (!response.ok) {
      return null;
    }

    const body = await response.json() as MessagesResponse;
    return body.messages;
  } catch {
    return null;
  }
};

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    // `loginCallbackGuard` redirects before anything renders, so there is nothing to show. `children:
    // []` satisfies the router's requirement that a route resolve to *something*.
    path: 'login/callback',
    canActivate: [loginCallbackGuard],
    children: []
  },
  {
    // Where `onLoginCallbackError` sends the user. Reachable directly for a look at the UI.
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
    // Step-up: the extra `groups` scope makes `selectCredential()` miss the credential stored for the
    // default scope set, so `getToken()` starts a fresh authorize request for the wider scope.
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
    // `tokenGuard` unchanged in `canMatch` position. Here the argument the guard receives is a
    // `Route`, not an `ActivatedRouteSnapshot` — its `data` is optional, which is why the guard reads
    // `route.data` with `?.`.
    path: 'lazy',
    loadComponent: () => import('./lazy-load/lazy-load.component').then(c => c.LazyLoadComponent),
    canMatch: [tokenGuard]
  }
];
