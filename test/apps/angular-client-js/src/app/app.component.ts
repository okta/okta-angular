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

import { ChangeDetectionStrategy, Component, inject, Injector, OnInit, runInInjectionContext, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CLIENT_JS_ORCHESTRATOR, signOut } from '@okta/okta-angular/client-js';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <nav>
    <button id="home-button" routerLink="/">Home</button>
    @if (signedIn()) {
      <button id="logout-button" (click)="logout()">Logout</button>
    } @else {
      <button id="login-button" (click)="login()">Login</button>
    }
    <button id="protected-button" routerLink="/protected">Protected</button>
    <button id="protected-child-button" routerLink="/protected/child">Protected (child route)</button>
    <button id="messages-button" routerLink="/messages">Messages (resource server)</button>
    <button id="admin-button" routerLink="/admin">Admin (step-up scopes)</button>
    <button id="public-button" routerLink="/public">Public (parent)</button>
    <button id="private-button" routerLink="/public/private">Public &rarr; Private (canActivateChild)</button>
    <button id="lazy-button" routerLink="/lazy">Lazy (canMatch)</button>
  </nav>
  <p id="home-message">
    Sample app for <code>&#64;okta/okta-angular/client-js</code>. It installs the three client-js
    packages and deliberately not <code>&#64;okta/okta-auth-js</code>; that it builds is the proof
    the subpath never reaches the other SDK.
  </p>
  <router-outlet></router-outlet>
  `,
  styles: [`
    nav { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-bottom: 1rem; }
  `]
})
export class AppComponent implements OnInit {
  readonly signedIn = signal(false);

  readonly #orchestrator = inject(CLIENT_JS_ORCHESTRATOR);
  readonly #injector = inject(Injector);
  readonly #router = inject(Router);

  // There is no persistent `AuthState` to subscribe to on this path, so this is a point-in-time read
  // re-run after login and logout rather than a stream.
  async ngOnInit(): Promise<void> {
    await this.#refreshSignedIn();
  }

  /** `selectCredential()` only reads storage; unlike `getToken()` it never redirects. */
  async #refreshSignedIn(): Promise<void> {
    this.signedIn.set(!!(await this.#orchestrator.selectCredential({})));
  }

  /** There is no `signIn()` helper by design: navigating to a guarded route *is* the trigger. */
  login(): void {
    this.#router.navigate(['/protected']);
  }

  /** `signOut()` needs an injection context; a DOM handler is not one. */
  async logout(): Promise<void> {
    await runInInjectionContext(this.#injector, () => signOut());
    await this.#refreshSignedIn();
  }
}
