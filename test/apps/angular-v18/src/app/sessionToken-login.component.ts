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

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OKTA_AUTH } from '@okta/okta-angular';

@Component({
  selector: 'app-session-login',
  standalone: true,
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <router-outlet />

    <div>
      <br />
      <label>
        Username:
        <input #username id="username" type="text" />
        Password:
        <input #password id="password" type="password" />
      </label>
      <button id="submit" (click)="signIn(username.value, password.value)">
        Login
      </button>
    </div>
  `,
})
export class SessionTokenLoginComponent {
  private readonly oktaAuth = inject(OKTA_AUTH);

  signIn(username: string, password: string) {
    this.oktaAuth
      .signIn({
        username: username,
        password: password,
      })
      .then((res) => {
        return this.oktaAuth.token.getWithRedirect({
          sessionToken: res.sessionToken,
        });
      })
      .catch((err) => console.log('Found an error', err));
  }
}
