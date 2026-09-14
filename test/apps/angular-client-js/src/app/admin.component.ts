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
import { CLIENT_JS_ORCHESTRATOR } from '@okta/okta-angular/client-js';

/**
 * Reached through `tokenGuard` with per-route `AuthorizeParams` on the route's `data`. The client-js
 * equivalent of the `okta-auth-js` path's `data: { okta: { acrValues } }` step-up.
 */
@Component({
  selector: 'app-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div id="admin-message">Admin! Reached with per-route scopes.</div>
  Scopes on the credential backing this route:
  <pre id="admin-scopes-container">{{ scopes() }}</pre>
  `
})
export class AdminComponent implements OnInit {
  readonly scopes = signal('');

  readonly #orchestrator = inject(CLIENT_JS_ORCHESTRATOR);

  async ngOnInit(): Promise<void> {
    // Queried with the route's scopes, so this reads back the step-up credential specifically.
    const credential = await this.#orchestrator.selectCredential({
      scopes: ['openid', 'profile', 'email', 'groups']
    });

    this.scopes.set(JSON.stringify(credential?.token.scopes ?? null, null, 2));
  }
}
