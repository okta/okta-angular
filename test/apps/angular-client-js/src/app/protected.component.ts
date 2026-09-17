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
import { JsonPipe } from '@angular/common';
import { CLIENT_JS_ORCHESTRATOR } from '@okta/okta-angular/client-js';

/**
 * Reached only through `tokenGuard`, so a credential exists by the time this renders. Injects
 * `CLIENT_JS_ORCHESTRATOR` directly, which is why that token is public.
 */
@Component({
  selector: 'app-protected',
  imports: [JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div id="protected-message">Protected!</div>
  @if (error(); as message) {
    <p id="protected-error">{{ message }}</p>
  }
  Scopes: <pre id="scopes-container">{{ scopes() | json }}</pre>
  ID token claims: <pre id="claims-container">{{ claims() | json }}</pre>
  UserInfo: <pre id="userinfo-container">{{ userInfo() | json }}</pre>
  `
})
export class ProtectedComponent implements OnInit {
  readonly scopes = signal<string[] | null>(null);
  readonly claims = signal<unknown>(null);
  readonly userInfo = signal<unknown>(null);
  readonly error = signal<string | null>(null);

  readonly #orchestrator = inject(CLIENT_JS_ORCHESTRATOR);

  async ngOnInit(): Promise<void> {
    try {
      // `selectCredential()` reads storage without redirecting; `getToken()` would be wrong here.
      // An empty filter matches anything, so after a step-up this returns whichever credential
      // storage yields first - pass a filter if you need a specific one.
      const credential = await this.#orchestrator.selectCredential({});

      if (!credential) {
        this.error.set('No credential in storage.');
        return;
      }

      this.scopes.set(credential.token.scopes);

      // `idToken` is a `JWT` instance, so `.claims` is already parsed (`.rawValue` is the string).
      this.claims.set(credential.token.idToken?.claims ?? null);
      this.userInfo.set(await credential.userInfo());
    } catch (e) {
      // `userInfo()` is a network call. Without this the rejection would be invisible in the UI.
      this.error.set(`Reading the credential failed: ${String(e)}`);
    }
  }
}
