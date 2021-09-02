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

import { Component } from '@angular/core';
import { OktaAuth } from '@okta/okta-auth-js';
import { OktaAuthStateService } from '@okta/okta-angular';

@Component({
  selector: 'app-root',
  template: `
  <button id="home-button" routerLink="/"> Home </button>
  <button id="login-button" *ngIf="!(authStateService.authState | async).isAuthenticated" (click)="login()"> Login </button>
  <button id="logout-button" *ngIf="(authStateService.authState | async).isAuthenticated" (click)="logout()"> Logout </button>
  <button id="protected-button" routerLink="/protected" [queryParams]="{ fooParams: 'foo' }"> Protected </button>
  <button id="protected-login-button" routerLink="/protected-with-data"
    [queryParams]="{ fooParams: 'foo' }"> Protected Page w/ custom config </button>
  <button id="public-button" routerLink="/public"> Parent Route (public) </button>
  <button id="private-button" routerLink="/public/private"> Child Route (private) </button>
  <router-outlet></router-outlet>
  `,
})
export class AppComponent {

  constructor(public oktaAuth: OktaAuth, private authStateService: OktaAuthStateService) {}

  login() {
    this.oktaAuth.signInWithRedirect();
  }

  logout() {
    this.oktaAuth.signOut();
  }
}
