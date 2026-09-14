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

import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Where `onLoginCallbackError` (see app.config.ts) redirects when `resumeFlow()` rejects — a `state`
 * mismatch, a replayed callback URL, `access_denied`, or the user abandoning the Okta-hosted form.
 *
 * The thrown error is not passed through the redirect; `onLoginCallbackError` logs it to the console
 * and returns only a `RedirectCommand`. Stash it in a service first if you need to render it.
 */
@Component({
  selector: 'app-login-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div id="login-error-message">
    <h2>Sign-in could not be completed</h2>
    <p>See the browser console for the error <code>resumeFlow()</code> threw.</p>
  </div>
  `
})
export class LoginErrorComponent { }
