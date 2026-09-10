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
import { CLIENT_JS_ORCHESTRATOR, CLIENT_JS_SIGN_OUT_FLOW } from './models/client-js.config';
import { navigate } from './navigate';

export interface SignOutOptions {
  /**
   * Revoke the tokens at the authorization server before redirecting to Okta's logout endpoint.
   * Defaults to `true`, matching `okta-auth-js`'s `signOut()`. When `false` the credential is only
   * dropped from local storage.
   */
  revokeTokens?: boolean;
}

/**
 * Clears the stored credential and performs RP-initiated logout at Okta.
 *
 * Call it from an injection context - a component method, a service, or a route guard. Requires a
 * {@link ClientJsAuthConfig.signOutFlow} on `provideClientJsAuth`; without one it throws, because
 * there's no way to build the logout URL.
 *
 * The order matters and is easy to get wrong by hand: the raw `id_token` has to be read *before*
 * the credential is dropped, since `SessionLogoutFlow.start()` needs it to build the
 * `end_session_endpoint` request.
 *
 * @example
 * export class HeaderComponent {
 *   readonly #injector = inject(Injector);
 *   logout() {
 *     runInInjectionContext(this.#injector, () => signOut());
 *   }
 * }
 */
export async function signOut({ revokeTokens = true }: SignOutOptions = {}): Promise<void> {
  const orchestrator = inject(CLIENT_JS_ORCHESTRATOR);
  const signOutFlow = inject(CLIENT_JS_SIGN_OUT_FLOW, { optional: true });

  if (!signOutFlow) {
    throw new Error(
      'No signOutFlow available. Pass a `SessionLogoutFlow` to provideClientJsAuth() to use signOut().'
    );
  }

  const credential = await orchestrator.selectCredential({});

  // Read the raw id_token before clearing the credential - it's required to build the logout URL.
  const idToken = credential?.token.idToken?.rawValue;

  if (credential) {
    // `revoke('ALL')` removes the credential from storage on top of revoking at the AS, so the two
    // branches are equivalent locally and differ only in whether the AS is told.
    await (revokeTokens ? credential.revoke('ALL') : credential.remove());
  }

  if (!idToken) {
    // Nothing to perform RP-initiated logout with. Local state is already cleared.
    return;
  }

  navigate(await signOutFlow.start(idToken));
}
