/*
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

import { Component, OnInit, Optional, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { OktaAuthService } from '../services/okta.service';
@Component({
  template: `<div>{{error}}</div>`
})
export class OktaCallbackComponent implements OnInit {
  error: string;

  constructor(private okta: OktaAuthService, private router: Router, @Optional() private injector?: Injector) {}

  async ngOnInit(): Promise<void> {
    try {
      // Parse code or tokens from the URL, store tokens in the TokenManager, and redirect back to the originalUri
      await this.okta.handleLoginRedirect();
    } catch (e) {
      // Callback from social IDP. Show custom login page to continue.
      if (this.okta.isInteractionRequiredError(e) && this.injector) {
        const { onAuthResume, onAuthRequired } = this.okta.getOktaConfig();
        const callbackFn = onAuthResume || onAuthRequired;
        if (callbackFn) {
          callbackFn(this.okta, this.injector);
          return;
        }
      }
      this.error = e.toString();
    }
  }
}
