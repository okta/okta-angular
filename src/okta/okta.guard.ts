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

import { Injectable, Injector, Inject } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  NavigationStart, 
  Event,
  CanLoad,
  Route,
  UrlSegment
} from '@angular/router';
import { filter } from 'rxjs/operators';

import { OktaAuth, AuthState } from '@okta/okta-auth-js';

import { AuthRequiredFunction, OktaConfig, OKTA_CONFIG } from './models/okta.config';

@Injectable()
export class OktaAuthGuard implements CanActivate, CanActivateChild, CanLoad {
  private state: RouterStateSnapshot;
  private onAuthRequired?: AuthRequiredFunction;


  constructor(
    @Inject(OKTA_CONFIG) private config: OktaConfig, 
    private oktaAuth: OktaAuth, 
    private injector: Injector
  ) { 
    this.onAuthRequired = this.config.onAuthRequired;

    // Unsubscribe updateAuthStateListener when route change
    const router = injector.get(Router);
    router.events.pipe(
      filter((e: Event) => e instanceof NavigationStart && this.state && this.state.url !== e.url)
    ).subscribe(() => {
      this.oktaAuth.authStateManager.unsubscribe(this.updateAuthStateListener);
    });
  }

  async canLoad(route: Route, segments: UrlSegment[]): Promise<boolean> {
    this.onAuthRequired = route.data && route.data.onAuthRequired || this.onAuthRequired;

    const isAuthenticated = await this.oktaAuth.isAuthenticated();
    if (isAuthenticated) {
      return true;
    }

    const originalUri = segments[0].path;
    await this.handleLogin(originalUri);

    return false;
  }

  /**
   * Gateway for protected route. Returns true if there is a valid accessToken,
   * otherwise it will cache the route and start the login flow.
   * @param route
   * @param state
   */
  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    // Track states for current route
    this.state = state;
    this.onAuthRequired = route.data && route.data.onAuthRequired || this.onAuthRequired;

    // Protect the route after accessing
    this.oktaAuth.authStateManager.subscribe(this.updateAuthStateListener);
    const isAuthenticated = await this.oktaAuth.isAuthenticated();
    if (isAuthenticated) {
      return true;
    }

    await this.handleLogin(state.url);

    return false;
  }

  async canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    return this.canActivate(route, state);
  }

  private async handleLogin(originalUri: string): Promise<void> {
    // Store the current path
    this.oktaAuth.setOriginalUri(originalUri);

    if (this.onAuthRequired) {
      this.onAuthRequired(this.oktaAuth, this.injector);
    } else {
      this.oktaAuth.signInWithRedirect();
    }
  }

  private updateAuthStateListener = (authState: AuthState) => {
    if (!authState.isAuthenticated) {
      this.handleLogin(this.state.url);
    }
  };

}
