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

import { ChangeDetectionStrategy, Component, inject, Injector, input, runInInjectionContext, signal } from '@angular/core';
import { oktaFetch } from '@okta/okta-angular/client-js';

import { environment } from '../environments/environment';
import { Message, MessagesResponse, MessagesResult } from './message';

/**
 * `oktaFetch` needs an injection context. The resolver in app.routes.ts has one; a click handler does
 * not, and needs `runInInjectionContext`. See README.
 */
@Component({
  selector: 'app-messages',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <h2>Messages</h2>

  <h3>Resolved by a <code>ResolveFn</code></h3>
  @if (messages(); as result) {
    @if ('messages' in result) {
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
  @if (error()) {
    <p id="messages-error">{{ error() }}</p>
  }
  `
})
export class MessagesComponent {
  /** Delivered by `withComponentInputBinding()`; the name must match the route's `resolve` key. */
  readonly messages = input<MessagesResult | null>(null);

  readonly messagesUrl = environment.resourceServer.messagesUrl;
  readonly boomUrl = environment.resourceServer.boomUrl;

  readonly refreshed = signal<Message[] | null>(null);
  readonly error = signal('');

  readonly #injector = inject(Injector);

  /** A bare `oktaFetch()` here would throw NG0203 — the handler is not an injection context. */
  async load(url: string): Promise<void> {
    this.error.set('');
    this.refreshed.set(null);

    try {
      const response = await runInInjectionContext(this.#injector, () => oktaFetch(url));

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
