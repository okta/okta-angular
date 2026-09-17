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

import { ChangeDetectionStrategy, Component, inject, Injector, runInInjectionContext, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { CLIENT_JS_ORCHESTRATOR, signOut } from '@okta/okta-angular/client-js';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <nav>
    <a id="home-link" routerLink="/">Home</a>
    <a id="protected-link" routerLink="/protected">Protected</a>
    <a id="messages-link" routerLink="/messages">Messages (resource server)</a>
    <a id="admin-link" routerLink="/admin">Admin (step-up scopes)</a>
    <a id="public-link" routerLink="/public">Public (parent)</a>
    <a id="private-link" routerLink="/public/private">Public &rarr; Private (canActivateChild)</a>
    <a id="lazy-link" routerLink="/lazy">Lazy (canMatch)</a>
    @if (signedIn()) {
      <button id="logout-button" (click)="logout()">Logout</button>
    } @else {
      <button id="login-button" (click)="login()">Login</button>
    }
  </nav>
  <router-outlet></router-outlet>
  `,
  styles: `
    nav { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: baseline; margin-bottom: 1rem; }
  `
})
export class AppComponent {
  readonly signedIn = signal(false);

  readonly #orchestrator = inject(CLIENT_JS_ORCHESTRATOR);
  readonly #injector = inject(Injector);
  readonly #router = inject(Router);

  constructor() {
    // There is no observable `AuthState` on this path, only a point-in-time storage read - so it has
    // to be re-run whenever it could have changed. `NavigationEnd` is the right trigger and covers
    // the case a one-shot `ngOnInit` misses: `loginCallbackGuard` finishes the code exchange and
    // returns a `RedirectCommand`, which is an in-app navigation with no page reload, so this root
    // component is never re-created and would otherwise still show "Login" after signing in.
    // Fires on the initial navigation too, so no separate first read is needed.
    this.#router.events
      .pipe(filter((event) => event instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => void this.#refreshSignedIn());
  }

  /** `selectCredential()` only reads storage; unlike `getToken()` it never redirects. */
  async #refreshSignedIn(): Promise<void> {
    this.signedIn.set(!!(await this.#orchestrator.selectCredential({})));
  }

  /** There is no `signIn()` helper by design: navigating to a guarded route *is* the trigger. */
  login(): void {
    this.#router.navigate(['/protected']);
  }

  /**
   * `signOut()` needs an injection context and a DOM handler is not one, hence
   * `runInInjectionContext`. It ends in `window.location.assign`, so nothing after it runs.
   */
  logout(): void {
    void runInInjectionContext(this.#injector, () => signOut());
  }
}
