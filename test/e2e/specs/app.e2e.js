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

import AppPage from '../pageobjects/app.page';
import OktaSignInPage from '../pageobjects/okta-signin.page';
import ProtectedPage from '../pageobjects/protected.page';
import SessionTokenSignInPage from '../pageobjects/sessiontoken-signin.page';
import PublicPage from '../pageobjects/public.page';
import HasGroupPage from '../pageobjects/has-group.page';
import { waitForLoad } from '../util/waitUtil';

describe('Angular + Okta App', () => {
  
  describe('implicit flow', () => {
    it('should redirect to Okta for login when trying to access a protected page', async () => {
      await ProtectedPage.navigateTo();
      await OktaSignInPage.waitForLoad();
      await OktaSignInPage.signIn({
        username: process.env.USERNAME,
        password: process.env.PASSWORD
      });
      await ProtectedPage.assertUserInfo(process.env.USERNAME);
      await ProtectedPage.logout();
    });

    it('should preserve query paramaters after redirecting to Okta', async () => {
      await ProtectedPage.navigateTo('/foo?state=bar');
      await OktaSignInPage.waitForLoad();
      await OktaSignInPage.signIn({
        username: process.env.USERNAME,
        password: process.env.PASSWORD
      });
      await ProtectedPage.assertQueryParams('/foo?state=bar');
      await ProtectedPage.logout();
    });

    it('should redirect to Okta for login', async () => {
      await AppPage.navigateTo();
      await AppPage.login();
      await OktaSignInPage.waitForLoad();
      await OktaSignInPage.signIn({
        username: process.env.USERNAME,
        password: process.env.PASSWORD
      });
      await waitForLoad(AppPage.logoutButton);
      await AppPage.logout();
    });

  });

  describe('session token login', () => {
    it('should allow passing sessionToken to skip Okta login', async () => {
      await SessionTokenSignInPage.navigateTo();
      await SessionTokenSignInPage.waitForLoad();
      await SessionTokenSignInPage.signIn({
        username: process.env.USERNAME,
        password: process.env.PASSWORD
      });
      await AppPage.waitUntilLoggedIn();
      await AppPage.logout();
    });
  });

  describe('child route guard', () => {
    it('displays the parent route without authentication', async () => {
      await PublicPage.navigateTo();
      await PublicPage.waitForLoad();
      await PublicPage.publicArea.then(el => el.getText()).then(txt => {
        expect(txt).toContain('Public!');
      });
      await PublicPage.privateArea.isExisting(isExisting => {
        expect(isExisting).toBeFalse();
      });
    });

    it('displays the child route with authentication', async () => {
      PublicPage.navigateTo('/private');
      OktaSignInPage.waitForLoad();
      OktaSignInPage.signIn({
        username: process.env.USERNAME,
        password: process.env.PASSWORD
      });
      PublicPage.waitForLoad();
      PublicPage.waitUntilLoggedIn();
      await PublicPage.publicArea.then(el => el.getText()).then(txt => {
        expect(txt).toContain('Public!');
      });
      await PublicPage.privateArea.then(el => el.getText()).then(txt => {
        expect(txt).toContain('Protected!');
      });
      await PublicPage.logout();
    });
  });

  describe('Role Based Access Control (RBAC)', () => {
    describe('isAuthenticated === false', () => {
      it('not display elements', async () => {
        await HasGroupPage.navigateTo();
        await HasGroupPage.inGroupContent.isExisting().then(isExisting => {
          expect(isExisting).toBeFalse();
        });
        await HasGroupPage.notInGroupContent.isExisting().then(isExisting => {
          expect(isExisting).toBeFalse();
        });
      });
    });

    describe('isAuthenticated === true', () => {
      it('displays in-group content', async () => {
        await AppPage.navigateTo();
        await AppPage.login();
        await OktaSignInPage.waitForLoad();
        await OktaSignInPage.signIn({
          username: process.env.USERNAME,
          password: process.env.PASSWORD
        });
        await AppPage.waitUntilLoggedIn();
        
        await HasGroupPage.navigateTo();
        await HasGroupPage.inGroupContent.then(el => el.getText()).then(txt => {
          expect(txt).toContain('In "Test" group');
        });
        await HasGroupPage.notInGroupContent.isExisting().then(isExisting => {
          expect(isExisting).toBeFalse();
        });
        await HasGroupPage.logout();
      });
    });
  });

});
