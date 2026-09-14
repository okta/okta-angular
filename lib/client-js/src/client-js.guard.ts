/*
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

import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, GuardResult, RedirectCommand, Router } from '@angular/router';
import { CLIENT_JS_CONFIG, CLIENT_JS_ORCHESTRATOR, ClientJsRouteData } from './models/client-js.config';
import { toRelativeUri } from './to-relative-uri';

/**
 * Functional guard for canActivate/canActivateChild/canMatch.
 *
 * `orchestrator.getToken()` already resolves a matching credential, refreshes it if needed, or
 * performs a full re-authentication redirect if not - if a redirect occurs, the returned promise
 * never resolves because the page navigates away, same as the existing `okta-auth-js`-based
 * guards in this library. The guard only returns `false` (blocking navigation without redirecting)
 * in the default-off `avoidPrompting: true` case, where the orchestrator declines to redirect and
 * returns `null`.
 *
 * Per-route authorize params can be set via route data, mirroring how the `okta-auth-js` guards
 * read `route.data['okta']['acrValues']`:
 *
 * @example
 * { path: 'admin', canActivate: [tokenGuard], data: { clientJs: { params: { scopes: ['openid', 'admin'] } } } }
 */
export const tokenGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const orchestrator = inject(CLIENT_JS_ORCHESTRATOR);
  // `?.` is load-bearing despite `ActivatedRouteSnapshot.data` being non-optional: in `canMatch`
  // position the first argument is a `Route`, whose `data` is optional.
  const params = (route.data as ClientJsRouteData | undefined)?.clientJs?.params;
  return !!(await orchestrator.getToken(params));
};

/**
 * Functional guard for canActivate - the guard-based replacement for `OktaCallbackComponent` for
 * this SDK. Runs on the OAuth redirect-callback route; no rendered component is needed.
 *
 * `orchestrator.resumeFlow()` completes the authorization code exchange and stores the resulting
 * credential itself - this guard does no storage of its own, it just redirects once that's done.
 * It's called with no argument so it resolves the code/state query params from the real browser
 * URL (`window.location.href`), rather than from Angular's router-internal, relative
 * `RouterStateSnapshot.url`.
 *
 * The `context` returned by `orchestrator.resumeFlow()` is whatever `meta` object was passed to
 * `flow.start()` (or the orchestrator's `login_prompt_required` listener) when the flow began -
 * `originalUri` is a convention, not a guarantee, so consumers who pass their own `meta` shape
 * should write their own guard that reads `context` themselves instead of using this one. Because
 * it's external input it goes through the same same-origin reduction the `okta-auth-js` path
 * applies via `toRelativeUrl`; anything off-origin or non-string falls back to `/`.
 *
 * `resumeFlow()` throws on an OAuth error response from the authorization server or a `state`
 * mismatch, which is the single most likely thing to fail on this route. Pass
 * {@link ClientJsAuthConfig.onLoginCallbackError} to `provideClientJsAuth` to turn that into a
 * redirect to your own error route; without it the error is rethrown and surfaces as a router
 * `NavigationError`.
 */
export const loginCallbackGuard: CanActivateFn = async (): Promise<GuardResult> => {
  const orchestrator = inject(CLIENT_JS_ORCHESTRATOR);
  const router = inject(Router);
  const { onLoginCallbackError } = inject(CLIENT_JS_CONFIG, { optional: true }) ?? {};

  let context: Record<string, unknown>;
  try {
    context = await orchestrator.resumeFlow();
  } catch (error) {
    if (!onLoginCallbackError) {
      throw error;
    }
    return onLoginCallbackError(error);
  }

  return new RedirectCommand(router.parseUrl(toRelativeUri(context?.['originalUri'])));
};
