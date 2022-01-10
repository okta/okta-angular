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
import { OktaHasAnyGroupDirective } from './has-any-group.directive';
import { OktaConfig, OKTA_CONFIG, OKTA_AUTH } from './models/okta.config';
import { AuthSdkError, OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import semverCompare from 'semver-compare';
import packageInfo from './packageInfo';

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

    const isAuthJsSupported = oktaAuth._oktaUserAgent && [0, 1].includes(semverCompare(oktaAuth._oktaUserAgent.getVersion(), packageInfo.authJSMinSupportedVersion));
    if (!isAuthJsSupported) {
      throw new AuthSdkError(`
      Passed in oktaAuth is not compatible with the SDK,
      minimum supported okta-auth-js version is ${packageInfo.authJSMinSupportedVersion}.
    `);
    }

    // Add Okta UA
    oktaAuth._oktaUserAgent.addEnvironment(`${packageInfo.name}/${packageInfo.version}`);

    // Provide a default implementation of `restoreOriginalUri`
    if (!oktaAuth.options.restoreOriginalUri && router && location) {
      oktaAuth.options.restoreOriginalUri = async (_, originalUri: string) => {
        const baseUrl = window.location.origin + location.prepareExternalUrl('');
        const routePath = toRelativeUrl(originalUri || '/', baseUrl);
        router.navigateByUrl(routePath);
      };
    }

    // Start services
    oktaAuth.start();
  }

}
