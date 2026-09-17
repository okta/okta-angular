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

import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { CLIENT_JS_FETCH_CLIENT } from '@okta/okta-angular/client-js';

import { environment } from '../environments/environment';
import { Message, MessagesResponse, MessagesResult } from './message';

@Component({
  selector: 'app-messages',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <h2>Messages</h2>

  <h3>Resolved by a <code>ResolveFn</code></h3>
  @if (messages(); as result) {
    @if (result.ok) {
      <ul id="resolved-messages">
        @for (message of result.messages; track message.id) {
          <li>{{ message.date }} — {{ message.text }}</li>
        }
      </ul>
    } @else {
      <p id="resolved-messages-error">{{ result.error }}</p>
    }
  }

  <h3>Fetched from a click handler</h3>
  <button id="refresh-button" (click)="load(messagesUrl)">Refresh</button>
  <button id="boom-button" (click)="load(boomUrl)">Request /api/boom (500)</button>
  @if (refreshed(); as fresh) {
    <ul id="refreshed-messages">
      @for (message of fresh; track message.id) {
        <li>{{ message.date }} — {{ message.text }}</li>
      }
    </ul>
  }
  @if (error(); as message) {
    <p id="messages-error">{{ message }}</p>
  }
  `
})
export class MessagesComponent {
  /** Delivered by `withComponentInputBinding()`; the name must match the route's `resolve` key. */
  readonly messages = input<MessagesResult | null>(null);

  readonly messagesUrl = environment.resourceServer.messagesUrl;
  readonly boomUrl = environment.resourceServer.boomUrl;

  readonly refreshed = signal<Message[] | null>(null);
  readonly error = signal<string | null>(null);

  /**
   * `oktaFetch()` is just `inject(CLIENT_JS_FETCH_CLIENT).fetch()`, so it only works where injection
   * works - a field initializer or a `ResolveFn`, not a click handler. Injecting the token here and
   * keeping the client is the ordinary Angular answer; reaching for `runInInjectionContext` in the
   * handler would work too, but there is no reason to.
   */
  readonly #fetchClient = inject(CLIENT_JS_FETCH_CLIENT);

  async load(url: string): Promise<void> {
    this.error.set(null);
    this.refreshed.set(null);

    try {
      const response = await this.#fetchClient.fetch(url, { cache: 'no-store' });

      // A 500 is a *resolved* fetch, not a rejection, so status is checked rather than caught.
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
}
