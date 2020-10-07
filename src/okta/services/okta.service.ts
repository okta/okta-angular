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

import { Inject, Injectable } from '@angular/core';
import {
  assertIssuer,
  assertClientId,
  assertRedirectUri,
} from '@okta/configuration-validation';

import { OKTA_CONFIG, OktaConfig } from '../models/okta.config';

// eslint-disable-next-line node/no-unpublished-import
import packageInfo from '../packageInfo';

/**
 * Import the okta-auth-js library
 */
import { OktaAuth, AuthState, OktaAuthOptions } from '@okta/okta-auth-js';
import { Observable, Observer } from 'rxjs';

@Injectable()
export class OktaAuthService extends OktaAuth {
    private config: OktaConfig;
    private observers: Observer<boolean>[];

    $authenticationState: Observable<boolean>;

    constructor(@Inject(OKTA_CONFIG) config: OktaConfig) {
      // Assert Configuration
      assertIssuer(config.issuer, config.testing);
      assertClientId(config.clientId);
      assertRedirectUri(config.redirectUri);

      const transformAuthState = async (oktaAuth: OktaAuth, authState: AuthState) => {
        // if `isAuthenticated` was set on config, call it now to override the value of `authState.isAuthenticated`
        if (config.isAuthenticated) {
          authState.isAuthenticated = await config.isAuthenticated(this);
        }
        // if `transformAuthState` was set on config, call it now to transform the authState object
        if (config.transformAuthState) {
          authState = await config.transformAuthState(oktaAuth, authState);
        }
        return authState;
      };
      
      const options: OktaAuthOptions = Object.assign({
        transformAuthState
      }, config);

      super(options);

      this.config = config;

      // Customize user agent
      this.userAgent = `${packageInfo.name}/${packageInfo.version} ${this.userAgent}`;

      // Initialize observers
      this.observers = [];
      this.$authenticationState = new Observable((observer: Observer<boolean>) => { this.observers.push(observer); });

      this.authStateManager.subscribe((authState: AuthState) => {
        this.emitAuthenticationState(!!authState.isAuthenticated);
      });
      if (!this.token.isLoginRedirect()) {
        // Trigger an initial change event to make sure authState is latest
        this.authStateManager.updateAuthState();
      }
    }

    private async emitAuthenticationState(state: boolean) {
      this.observers.forEach(observer => observer.next(state));
    }

    /**
     * Returns the configuration object used.
     */
    getOktaConfig(): OktaConfig {
      return this.config;
    }

}
