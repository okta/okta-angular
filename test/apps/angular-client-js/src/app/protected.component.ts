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

import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CLIENT_JS_ORCHESTRATOR } from '@okta/okta-angular/client-js';

/**
 * Reached only through `tokenGuard`, so a credential is guaranteed to exist by the time this renders.
 *
 * Injects `CLIENT_JS_ORCHESTRATOR` directly rather than going through one of the library's helpers:
 * the tokens `provideClientJsAuth` registers are part of the public API precisely so the underlying
 * SDK objects stay reachable for anything the four helper functions don't cover.
 */
@Component({
  selector: 'app-protected',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div id="protected-message">Protected!</div>
  Scopes: <pre id="scopes-container">{{ scopes() }}</pre>
  ID token claims: <pre id="claims-container">{{ claims() }}</pre>
  UserInfo: <pre id="userinfo-container">{{ user() }}</pre>
  <router-outlet></router-outlet>
  `
})
export class ProtectedComponent implements OnInit {
  readonly claims = signal('');
  readonly user = signal('');
  readonly scopes = signal('');

  readonly #orchestrator = inject(CLIENT_JS_ORCHESTRATOR);

  async ngOnInit(): Promise<void> {
    // `selectCredential()` reads storage without ever redirecting, which is what makes it usable
    // from a component. `getToken()` would be wrong here — it can trigger a full-page redirect.
    const credential = await this.#orchestrator.selectCredential({});

    if (!credential) {
      this.claims.set('no credential in storage');
      return;
    }

    this.scopes.set(JSON.stringify(credential.token.scopes, null, 2));

    // `token.idToken` is a `JWT` instance, not the raw string — `.claims` is already parsed. The raw
    // string is `.rawValue`, which is what `signOut()` needs for the logout URL.
    this.claims.set(JSON.stringify(credential.token.idToken?.claims ?? null, null, 2));

    // Network call to the `/userinfo` endpoint, cached on the credential after the first call.
    const info = await credential.userInfo();
    this.user.set(JSON.stringify(info, null, 2));
  }
}
