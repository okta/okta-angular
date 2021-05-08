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

import { Inject, Injectable, OnDestroy, Optional } from '@angular/core';
import { Router } from '@angular/router';

import { OKTA_CONFIG, OktaConfig } from '../models/okta.config';

// eslint-disable-next-line node/no-unpublished-import
import packageInfo from '../packageInfo';

/**
 * Import the okta-auth-js library
 */
import {
  OktaAuth,
  AuthState,
  OktaAuthOptions,
  isAbsoluteUrl,
  toAbsoluteUrl,
  toRelativeUrl,
  SigninWithRedirectOptions
} from '@okta/okta-auth-js';

import { Observable, Observer } from 'rxjs';
import { Location } from '@angular/common';

@Injectable()
export class OktaAuthService extends OktaAuth implements OnDestroy {
    private config: OktaConfig;
    private observers: Observer<boolean>[];
    private location?: Location;

    $authenticationState: Observable<boolean>;

    constructor(@Inject(OKTA_CONFIG) config: OktaConfig, @Optional() location?: Location, @Optional() router?: Router) {

      // If a relative `redirectUri` was passed, convert to absolute URL, including base href, if any.
      if (config.redirectUri && !isAbsoluteUrl(config.redirectUri) && location) {
        const baseUri = window.location.origin + location.prepareExternalUrl('');
        config.redirectUri = toAbsoluteUrl(config.redirectUri, baseUri);
      }

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
      
      // If a router is available, provide a default implementation of `restoreOriginalUri`
      const restoreOriginalUri = (!config.restoreOriginalUri && router && location) ? async (oktaAuth: OktaAuth, originalUri: string) => {
        if (originalUri) {
          const baseUrl = window.location.origin + location.prepareExternalUrl('');
          const routePath = toRelativeUrl(originalUri, baseUrl);
          return router.navigateByUrl(routePath);
        }
      } : config.restoreOriginalUri;

      const options: OktaAuthOptions = Object.assign({
        transformAuthState,
        restoreOriginalUri
      }, config);

      super(options);

      this.config = config;
      this.location = location;

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
        // Also starts the token auto-renew service
        this.start();
      }
    }

    ngOnDestroy() {
      this.stop();
    }

    private async emitAuthenticationState(state: boolean) {
      this.observers.forEach(observer => observer.next(state));
    }

    public async isAuthenticated(): Promise<boolean> {
      if (this.config.isAuthenticated) {
        return await this.config.isAuthenticated(this);
      }
      return await super.isAuthenticated();
    }

    async signInWithRedirect(options: SigninWithRedirectOptions = {}): Promise<void> {
      const originalUri = options.originalUri || this.getOriginalUri();
      if (!originalUri) {
        // Default to the app base as a relative path.
        options.originalUri = '/';
      }
      return super.signInWithRedirect(options);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
    async signOut(options?: any): Promise<void> {
      options = options || {};
      const postLogoutRedirectUri = options.postLogoutRedirectUri || this.options.postLogoutRedirectUri;
      if (!postLogoutRedirectUri && this.location) {
        // Default to the app base as an absolute URL, including base href, if any.
        options.postLogoutRedirectUri = window.location.origin + this.location.prepareExternalUrl('/'); // include trailing slash
      }
      return super.signOut(options);
    }

    /**
     * Returns the configuration object used.
     */
    getOktaConfig(): OktaConfig {
      return this.config;
    }

}
