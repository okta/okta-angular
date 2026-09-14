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

import { ChangeDetectionStrategy, Component, inject, Injector, input, OnInit, runInInjectionContext, signal } from '@angular/core';
import { oktaFetch } from '@okta/okta-angular/client-js';

import { environment } from '../environments/environment';
import { Message, MessagesResponse } from './message';

/**
 * Every place `oktaFetch` can legally be called, in one component.
 *
 * `oktaFetch` calls `inject()` internally, so it inherits Angular's injection-context rule: it is
 * only valid while Angular is constructing something, or inside a router guard/resolver. That rule
 * has no React analogue (a hook can be called anywhere in a render pass) and is the roughest edge on
 * this API, so it's worth seeing all three positions side by side.
 *
 * Note what `oktaFetch` does *not* need: no "am I signed in?" check first. The underlying
 * `FetchClient` resolves a credential, silently refreshes it if it's expiring, or performs a
 * full-page redirect to Okta if it can't — all before the request goes out.
 */
@Component({
  selector: 'app-messages',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <h2>Messages</h2>

  <h3>1. Resolved by a <code>ResolveFn</code> (see app.routes.ts)</h3>
  @if (messages(); as resolved) {
    <ul id="resolved-messages">
      @for (message of resolved; track message.id) {
        <li>{{ message.date }} — {{ message.text }}</li>
      }
    </ul>
  } @else {
    <p id="resolved-messages-empty">Nothing resolved. Is the mock API running on :8000?</p>
  }

  <h3>2. Called from a field initializer</h3>
  <p id="field-initializer-status">{{ status() }}</p>

  <h3>3. Called from a click handler</h3>
  <button id="refresh-button" (click)="refresh()">Refresh via runInInjectionContext</button>
  <button id="boom-button" (click)="boom()">Request /api/boom (500)</button>
  @if (refreshed(); as fresh) {
    <ul id="refreshed-messages">
      @for (message of fresh; track message.id) {
        <li>{{ message.date }} — {{ message.text }}</li>
      }
    </ul>
  }
  @if (error()) {
    <p id="messages-error">{{ error() }}</p>
  }
  `
})
export class MessagesComponent implements OnInit {
  /**
   * The resolver's value, delivered as an input by `withComponentInputBinding()`. The input name has
   * to match the `resolve` key in the route definition.
   */
  readonly messages = input<Message[] | null>(null);

  readonly refreshed = signal<Message[] | null>(null);
  readonly status = signal('requesting…');
  readonly error = signal('');

  readonly #injector = inject(Injector);

  /**
   * A field initializer runs while Angular is constructing the component, which *is* an injection
   * context — so a bare `oktaFetch()` call is legal here. Only the call has to happen during
   * construction; awaiting the promise later is fine.
   *
   * `.catch()` is attached eagerly rather than in `ngOnInit`: if the request rejects before anything
   * awaits the promise, an un-attached handler surfaces as an unhandled rejection.
   */
  readonly #duringConstruction: Promise<Response | Error> =
    oktaFetch(environment.resourceServer.messagesUrl).catch((e: unknown) => e as Error);

  async ngOnInit(): Promise<void> {
    const result = await this.#duringConstruction;

    this.status.set(result instanceof Error
      ? `failed: ${result.message}`
      : `HTTP ${result.status} ${result.ok ? '(authorized)' : '(rejected by the resource server)'}`);
  }

  /**
   * A DOM event handler is NOT an injection context — the component was constructed long ago. A bare
   * `oktaFetch(...)` on this line throws:
   *
   *   NG0203: oktaFetch() can only be used within an injection context
   *
   * `runInInjectionContext` with an `Injector` captured at construction time is the escape hatch.
   */
  async refresh(): Promise<void> {
    this.error.set('');

    try {
      const response = await runInInjectionContext(
        this.#injector,
        () => oktaFetch(environment.resourceServer.messagesUrl)
      );

      if (!response.ok) {
        this.error.set(`Resource server said HTTP ${response.status}.`);
        return;
      }

      const body = await response.json() as MessagesResponse;
      this.refreshed.set(body.messages);
    } catch (e) {
      this.error.set(`Request failed: ${String(e)}`);
    }
  }

  /**
   * Deterministic failure path: `/api/boom` always answers 500, so the error branch is reachable
   * without breaking anything. A 500 is a *resolved* fetch, not a rejection — hence the `response.ok`
   * check above rather than relying on `catch`.
   */
  async boom(): Promise<void> {
    this.error.set('');
    this.refreshed.set(null);

    try {
      const response = await runInInjectionContext(
        this.#injector,
        () => oktaFetch(environment.resourceServer.boomUrl)
      );
      this.error.set(`Resource server said HTTP ${response.status}.`);
    } catch (e) {
      this.error.set(`Request failed: ${String(e)}`);
    }
  }
}
