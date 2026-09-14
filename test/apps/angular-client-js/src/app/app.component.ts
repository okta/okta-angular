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

  async ngOnInit(): Promise<void> {
    // This SDK has no persistent `AuthState` to subscribe to — the `okta-auth-js` path's
    // `OktaAuthStateService.authState$` has no counterpart here. The nearest equivalent is asking
    // storage whether a credential exists, which is a point-in-time read, not a stream. Hence the
    // one-shot check plus manual re-reads after login/logout.
    await this.#refreshSignedIn();
  }

  /**
   * `selectCredential()` only reads storage; unlike `getToken()` it never redirects, which is what
   * makes it safe to call for a "am I signed in?" check.
   */
  async #refreshSignedIn(): Promise<void> {
    this.signedIn.set(!!(await this.#orchestrator.selectCredential({})));
  }

  /**
   * No `signIn()` helper exists, by design: navigating to a `tokenGuard`-protected route *is* the
   * sign-in trigger. The guard calls `getToken()`, which finds no credential and performs the
   * full-page redirect to Okta, recording this app's current URL as `originalUri` so
   * `loginCallbackGuard` can send the user back afterwards.
   */
  login(): void {
    this.#router.navigate(['/protected']);
  }

  /**
   * `signOut()` calls `inject()` internally, so it is only valid inside an injection context. A DOM
   * event handler is not one — calling it bare here throws NG0203. `runInInjectionContext` supplies
   * the missing context.
   */
  async logout(): Promise<void> {
    await runInInjectionContext(this.#injector, () => signOut());
    await this.#refreshSignedIn();
  }
}
