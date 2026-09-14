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

import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, RedirectCommand, Router, withComponentInputBinding } from '@angular/router';
import {
  AuthorizationCodeFlow,
  AuthorizationCodeFlowOrchestrator,
  SessionLogoutFlow
} from '@okta/spa-platform';
import { provideClientJsAuth } from '@okta/okta-angular/client-js';

import { environment } from '../environments/environment';
import { routes } from './app.routes';

const { clientId, issuer, redirectUri, postLogoutRedirectUri, scopes } = environment.oidc;

/**
 * `AuthorizationCodeFlow` runs `new URL(redirectUri)` with no base, so a relative path throws
 * `TypeError: Invalid URL` at construction. The environment files keep these relative so the same
 * config works on any host/port; absolutising them is the app's job.
 */
const absolute = (path: string): string => new URL(path, window.location.origin).href;

const flow = new AuthorizationCodeFlow({
  issuer,
  clientId,
  scopes,
  redirectUri: absolute(redirectUri)
});

const orchestrator = new AuthorizationCodeFlowOrchestrator(flow, {
  // REQUIRED for a guard-driven app, despite reading like a tuning knob.
  //
  // `emitBeforeRedirect` defaults to TRUE. When true, `requestToken()` emits `login_prompt_required`
  // and then awaits a promise that only the event payload's `done()` callback resolves. The SDK's
  // `EventEmitter.emit()` is a no-op when nothing is listening, so with the default and no listener
  // the promise never settles: `getToken()` hangs, `tokenGuard` never returns, and the navigation
  // stalls forever with no error and no redirect to Okta.
  //
  // Setting it to false skips the emit and redirects immediately. The alternative is to keep the
  // default and register a listener that calls `done()` — see the commented block below, which is
  // the hook to use if you need to run something right before the page navigates away.
  emitBeforeRedirect: false
});

// Equivalent to the above. The redirect happens when `done()` is called, so this is where a
// confirmation prompt or an analytics ping would go:
//
// orchestrator.on('login_prompt_required', ({ done }) => done());
//
// At runtime, resolving with an object merges it into the flow's `meta` alongside `originalUri`, but
// `0.6.0` types `done` as `() => void`, so passing one needs a cast.

const signOutFlow = new SessionLogoutFlow({
  issuer,
  clientId,
  scopes,
  logoutRedirectUri: absolute(postLogoutRedirectUri)
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideClientJsAuth({
      orchestrator,
      signOutFlow,
      // `fetchClient` is deliberately omitted so this app exercises the
      // `new FetchClient(orchestrator)` default that `provideClientJsAuth` builds. Passing one
      // constructed from a *different* orchestrator is the bug that default exists to prevent.
      onLoginCallbackError: (error: unknown) => {
        // Runs inside `loginCallbackGuard`'s injection context, so `inject()` is legal here.
        console.error('[client-js] resumeFlow() rejected', error);
        return new RedirectCommand(inject(Router).parseUrl('/login/error'));
      }
    })
  ]
};
