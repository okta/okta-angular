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

import { NgModule, Inject, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { OktaCallbackComponent } from './components/callback.component';
import { OktaAuthGuard } from './okta.guard';
import { OktaAuthStateService } from './services/auth-state.service';
import { OktaConfig, OKTA_CONFIG } from './models/okta.config';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import packageInfo from './packageInfo';

@NgModule({
  declarations: [
    OktaCallbackComponent,
  ],
  exports: [
    OktaCallbackComponent,
  ],
  providers: [
    OktaAuthGuard,
    OktaAuthStateService,
    {
      provide: OktaAuth,
      useFactory(config: OktaConfig) {
        return config.oktaAuth;
      },
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

    if (!oktaAuth._oktaUserAgent) {
      throw new Error('_oktaUserAgent is not available on auth SDK instance. Please use okta-auth-js@^5.3.1 .');
    }

    // Add Okta UA
    oktaAuth._oktaUserAgent.addEnvironment(`${packageInfo.name}/${packageInfo.version}`);

    // Auth-js version compatibility runtime check
    const oktaAuthVersion = oktaAuth._oktaUserAgent.getVersion();
    const majorVersion = +oktaAuthVersion?.split('.')[0];
    if (packageInfo.authJSMajorVersion !== majorVersion) {
      throw new Error(`Passed in oktaAuth is not compatible with the SDK, okta-auth-js version ${packageInfo.authJSMajorVersion}.x is the current supported version.`);
    }

    // Provide a default implementation of `restoreOriginalUri`
    if (!oktaAuth.options.restoreOriginalUri && router && location) {
      oktaAuth.options.restoreOriginalUri = async (_, originalUri: string) => {
        const baseUrl = window.location.origin + location.prepareExternalUrl('');
        const routePath = toRelativeUrl(originalUri || '/', baseUrl);
        router.navigateByUrl(routePath);
      };
    }

    // Start services
    // TODO: logic here should belong to auth-js
    if (!oktaAuth.token.isLoginRedirect()) {
      // Trigger an initial change event to make sure authState is latest
      oktaAuth.authStateManager.updateAuthState();
    }
    // Start the token auto-renew service
    oktaAuth.tokenManager.start();
  }

}
