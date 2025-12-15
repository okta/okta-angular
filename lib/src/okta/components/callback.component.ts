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

import { Component, OnInit, Injector, signal, inject } from "@angular/core";
import { OKTA_AUTH } from "../models/okta.config";
import { OktaAuthConfigService } from "../services/auth-config.service";

@Component({
  template: `<div>{{ error() }}</div>`,
  standalone: true,
})
export class OktaCallbackComponent implements OnInit {
  private readonly configService = inject(OktaAuthConfigService);
  private readonly oktaAuth = inject(OKTA_AUTH);
  private readonly injector = inject(Injector, { optional: true });

  readonly error = signal<string | undefined>(undefined);

  async ngOnInit(): Promise<void> {
    const config = this.configService.getConfig();
    if (!config) {
      throw new Error("Okta config is not provided");
    }
    try {
      // Parse code or tokens from the URL, store tokens in the TokenManager, and redirect back to the originalUri
      await this.oktaAuth.handleLoginRedirect();
    } catch (e: any) {
      // Callback from social IDP. Show custom login page to continue.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore Supports auth-js v6-7
      const isInteractionRequiredError =
        this.oktaAuth.idx.isInteractionRequiredError;
      if (isInteractionRequiredError(e) && this.injector) {
        const { onAuthResume, onAuthRequired } = config;
        const callbackFn = onAuthResume || onAuthRequired;
        if (callbackFn) {
          callbackFn(this.oktaAuth, this.injector);
          return;
        }
      }
      this.error.set((e as Error).toString());
    }
  }
}
