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
import { ActivatedRoute } from '@angular/router';
import { CLIENT_JS_ORCHESTRATOR, ClientJsRouteData } from '@okta/okta-angular/client-js';

/**
 * Reached through `tokenGuard` with per-route `AuthorizeParams` on the route's `data`. The client-js
 * equivalent of the `okta-auth-js` path's `data: { okta: { acrValues } }` step-up.
 */
@Component({
  selector: 'app-admin',
  imports: [JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div id="admin-message">Admin! Reached with per-route scopes.</div>
  Requested by the route: <pre id="admin-requested-container">{{ requestedScopes() | json }}</pre>
  Granted on the credential: <pre id="admin-scopes-container">{{ grantedScopes() | json }}</pre>
  `
})
export class AdminComponent implements OnInit {
  readonly grantedScopes = signal<string[] | null>(null);

  readonly #orchestrator = inject(CLIENT_JS_ORCHESTRATOR);

  /**
   * Read back off the route rather than restated here, so the route stays the single source of truth
   * and the same `ClientJsRouteData` type checks the read as well as the write.
   */
  readonly #routeData: ClientJsRouteData = inject(ActivatedRoute).snapshot.data;
  readonly requestedScopes = signal(this.#routeData.clientJs?.params?.scopes ?? null);

  async ngOnInit(): Promise<void> {
    // Queried with the route's own scopes, so this reads back the credential the guard just obtained.
    const credential = await this.#orchestrator.selectCredential({
      scopes: this.requestedScopes() ?? undefined
    });

    this.grantedScopes.set(credential?.token.scopes ?? null);
  }
}
