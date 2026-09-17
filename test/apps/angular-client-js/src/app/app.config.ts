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
import {
  provideRouter,
  RedirectCommand,
  Router,
  withComponentInputBinding,
  withNavigationErrorHandler,
  withRouterConfig
} from '@angular/router';
import {
  AuthorizationCodeFlow,
  AuthorizationCodeFlowOrchestrator,
  SessionLogoutFlow
} from '@okta/spa-platform';
import { provideClientJsAuth } from '@okta/okta-angular/client-js';

import { environment } from '../environments/environment';
import { routes } from './app.routes';

const { clientId, issuer, redirectUri, postLogoutRedirectUri, scopes } = environment.oidc;

// The environment files keep these relative; `AuthorizationCodeFlow` requires absolute. See README.
const absolute = (path: string): string => new URL(path, window.location.origin).href;

const flow = new AuthorizationCodeFlow({
  issuer,
  clientId,
  scopes,
  redirectUri: absolute(redirectUri)
});

// `emitBeforeRedirect: false` is required, not a tuning knob: with the default and no
// `login_prompt_required` listener, the first sign-in hangs instead of redirecting. See README.
const orchestrator = new AuthorizationCodeFlowOrchestrator(flow, { emitBeforeRedirect: false });

const signOutFlow = new SessionLogoutFlow({
  issuer,
  clientId,
  scopes,
  logoutRedirectUri: absolute(postLogoutRedirectUri)
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      // `urlUpdateStrategy: 'eager'` is load-bearing, not a preference. The orchestrator captures the
      // return URL by calling its `getOriginalUri` option, whose default reads `window.location.href`,
      // and it does so *inside* the guard. Under Angular's default `'deferred'` strategy the address
      // bar still holds the previous URL at that point, so signing in from a link would send you back
      // to where you came from instead of where you were going. Unlike the default entry point, which
      // passes the router's own `state.url`, the client-js path has no access to the pending
      // navigation - so the URL has to be committed before the guard runs.
      withRouterConfig({ urlUpdateStrategy: 'eager' }),
      // `tokenGuard` rejects when `getToken()` rejects; without a handler that surfaces only as an
      // unhandled rejection in the console.
      withNavigationErrorHandler(({ error }) => {
        console.error('[client-js] navigation failed', error);
        return new RedirectCommand(inject(Router).parseUrl('/login/error'));
      })
    ),
    provideClientJsAuth({
      orchestrator,
      signOutFlow,
      // `fetchClient` omitted on purpose: that exercises the `new FetchClient(orchestrator)` default.
      onLoginCallbackError: (error: unknown) => {
        console.error('[client-js] resumeFlow() rejected', error);
        return new RedirectCommand(inject(Router).parseUrl('/login/error'));
      }
    })
  ]
};
