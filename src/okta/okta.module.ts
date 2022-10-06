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

import { NgModule, Inject, Optional, VERSION } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { OktaCallbackComponent } from './components/callback.component';
import { OktaAuthGuard } from './okta.guard';
import { OktaAuthStateService } from './services/auth-state.service';
import { OktaHasAnyGroupDirective } from './has-any-group.directive';
import { OktaConfig, OKTA_CONFIG, OKTA_AUTH } from './models/okta.config';
import { AuthSdkError, OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { compare } from 'compare-versions';

declare const AUTH_JS: {
  minSupportedVersion: string;
};
declare const PACKAGE_NAME: string;
declare const PACKAGE_VERSION: string;

export function oktaAuthFactory(config: OktaConfig): OktaAuth {
  return config.oktaAuth;
}

@NgModule({
  declarations: [
    OktaCallbackComponent,
    OktaHasAnyGroupDirective,
  ],
  exports: [
    OktaCallbackComponent,
    OktaHasAnyGroupDirective,
  ],
  providers: [
    OktaAuthGuard,
    OktaAuthStateService,
    {
      provide: OKTA_AUTH,
      useFactory: oktaAuthFactory,
      deps: [ OKTA_CONFIG ]
    },
  ]
})
export class OktaAuthModule {
  constructor(
    @Inject(OKTA_CONFIG) config: OktaConfig, 
    @Optional() location?: Location, 
    @Optional() router?: Router
  ) {
    const { oktaAuth } = config;

    const isAuthJsSupported = oktaAuth._oktaUserAgent && compare(oktaAuth._oktaUserAgent.getVersion(), AUTH_JS.minSupportedVersion, '>=');
    if (!isAuthJsSupported) {
      throw new AuthSdkError(`Passed in oktaAuth is not compatible with the SDK, minimum supported okta-auth-js version is ${AUTH_JS.minSupportedVersion}.`);
    }

    // Add Okta UA
    oktaAuth._oktaUserAgent.addEnvironment(`${PACKAGE_NAME}/${PACKAGE_VERSION}`);
    oktaAuth._oktaUserAgent.addEnvironment(`Angular/${VERSION.full}`);

    // Provide a default implementation of `restoreOriginalUri`
    if (!oktaAuth.options.restoreOriginalUri && router && location) {
      oktaAuth.options.restoreOriginalUri = async (_, originalUri: string | undefined) => {
        const baseUrl = window.location.origin + location.prepareExternalUrl('');
        const routePath = toRelativeUrl(originalUri || '/', baseUrl);
        router.navigateByUrl(routePath);
      };
    }

    // Start services
    oktaAuth.start();
  }

}
