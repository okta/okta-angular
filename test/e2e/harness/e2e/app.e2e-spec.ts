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

import { IterableDiffers } from '@angular/core';
import {
  AppPage,
  OktaSignInPage,
  ProtectedPage,
  PublicPage,
  SessionTokenSignInPage,
  HasGroupPage
} from './page-objects';

describe('Angular + Okta App', () => {
  let page: AppPage;
  let oktaLoginPage: OktaSignInPage;
  let protectedPage: ProtectedPage;
  let sessionTokenSignInPage: SessionTokenSignInPage;
  let publicPage: PublicPage;
  let hasGroupPage: HasGroupPage;

  beforeEach(() => {
    page = new AppPage();
    oktaLoginPage = new OktaSignInPage();
    protectedPage = new ProtectedPage();
    sessionTokenSignInPage = new SessionTokenSignInPage();
    publicPage = new PublicPage();
    hasGroupPage = new HasGroupPage();
  });

  describe('implicit flow', () => {
    it('should redirect to Okta for login when trying to access a protected page', () => {
      protectedPage.navigateTo();
      oktaLoginPage.waitUntilVisible(process.env.ISSUER);
      oktaLoginPage.signIn({
        username: process.env.USERNAME,
        password: process.env.PASSWORD
      });

      protectedPage.waitUntilVisible();
      expect(protectedPage.getLogoutButton().isPresent()).toBeTruthy();

      // Verify the user object was returned
      protectedPage.waitUntilTextVisible('userinfo-container', 'email');
      protectedPage.getUserInfo().getText()
      .then(userInfo => {
        expect(userInfo).toContain('email');
      });

      // Logout
      protectedPage.getLogoutButton().click();
      protectedPage.waitForElement('login-button');
      expect(protectedPage.getLoginButton().isPresent()).toBeTruthy();
    });

    it('should preserve query paramaters after redirecting to Okta', () => {
      protectedPage.navigateTo('/foo?state=bar');

      oktaLoginPage.waitUntilVisible(process.env.ISSUER);
      oktaLoginPage.signIn({
        username: process.env.USERNAME,
        password: process.env.PASSWORD
      });

      protectedPage.waitUntilVisible('/foo?state=bar');
      expect(protectedPage.getLogoutButton().isPresent()).toBeTruthy();

      // Logout
      protectedPage.getLogoutButton().click();
      protectedPage.waitForElement('login-button');
      expect(protectedPage.getLoginButton().isPresent()).toBeTruthy();
    });

    it('should redirect to Okta for login', () => {
      page.navigateTo();
      page.getLoginButton().click();

      oktaLoginPage.waitUntilVisible(process.env.ISSUER);
      oktaLoginPage.signIn({
        username: process.env.USERNAME,
        password: process.env.PASSWORD
      });

      page.waitUntilLoggedIn();

      // Logout
      page.getLogoutButton().click();
      page.waitUntilLoggedOut();
    });
  });

  describe('session token login', () => {

    it('should allow passing sessionToken to skip Okta login', () => {
      sessionTokenSignInPage.navigateTo();

      sessionTokenSignInPage.waitUntilVisible();
      sessionTokenSignInPage.signIn({
        username: process.env.USERNAME,
        password: process.env.PASSWORD
      });

      page.waitUntilLoggedIn();
      expect(page.getLogoutButton().isPresent()).toBeTruthy();

      // Logout
      page.getLogoutButton().click();
      page.waitForElement('login-button');
      expect(page.getLoginButton().isPresent()).toBeTruthy();
    });
  });

  describe('child route guard', () => {
    it('displays the parent route without authentication', () => {
      publicPage.navigateTo();
      publicPage.waitUntilVisible();
      expect(publicPage.getLoginButton().isPresent()).toBeTruthy();
      expect(publicPage.getPublicArea().isPresent()).toBeTruthy();
      publicPage.waitUntilTextVisible('public-message', 'Public!');
      expect(publicPage.getPrivateArea().isPresent()).toBeFalsy();
    });

    it('displays the child route with authentication', () => {
      publicPage.navigateTo('/private');

      oktaLoginPage.waitUntilVisible(process.env.ISSUER);
      oktaLoginPage.signIn({
        username: process.env.USERNAME,
        password: process.env.PASSWORD
      });

      publicPage.waitUntilVisible();
      expect(page.getLogoutButton().isPresent()).toBeTruthy();
      expect(publicPage.getPublicArea().isPresent()).toBeTruthy();
      publicPage.waitUntilTextVisible('public-message', 'Public!');
      expect(publicPage.getPrivateArea().isPresent()).toBeTruthy();
      publicPage.waitUntilTextVisible('userinfo-container', 'email');

      // Logout
      page.getLogoutButton().click();
      page.waitForElement('login-button');
      expect(page.getLoginButton().isPresent()).toBeTruthy();
    });
  });

  describe('Role Based Access Control (RBAC)', () => {
    describe('isAuthenticated === false', () => {
      it('not display elements', () => {
        hasGroupPage.navigateTo();
        expect(hasGroupPage.getInGroupContent().isPresent()).toBeFalsy();
        expect(hasGroupPage.getNotInGroupContent().isPresent()).toBeFalsy();
      });
    });

    describe('isAuthenticated === true', () => {
      it('displays in-group content', () => {
        // login with redirect
        page.navigateTo();
        page.getLoginButton().click();
        oktaLoginPage.waitUntilVisible(process.env.ISSUER);
        oktaLoginPage.signIn({
          username: process.env.USERNAME,
          password: process.env.PASSWORD
        });
        page.waitUntilLoggedIn();
  
        hasGroupPage.navigateTo();

        expect(hasGroupPage.getInGroupContent().isPresent()).toBeTruthy();
        hasGroupPage.waitUntilTextVisible('in-group', 'In "Test" group');
        expect(hasGroupPage.getNotInGroupContent().isPresent()).toBeFalsy();
      });
      
    });
  });

});
