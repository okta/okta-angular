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

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div id="home-message">
    <p>Sample app for the <code>&#64;okta/okta-angular/client-js</code> entry point.</p>
    <p>
      This app installs <code>&#64;okta/auth-foundation</code>, <code>&#64;okta/oauth2-flows</code> and
      <code>&#64;okta/spa-platform</code> — and deliberately does <strong>not</strong> install
      <code>&#64;okta/okta-auth-js</code>. That it builds and runs is the proof that the
      <code>/client-js</code> subpath never reaches the other SDK.
    </p>
  </div>
  `
})
export class HomeComponent { }
