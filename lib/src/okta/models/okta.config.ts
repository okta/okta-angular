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

import { InjectionToken, Injector } from '@angular/core';
import { OktaAuth } from '@okta/okta-auth-js';

export type AuthRequiredFunction = (oktaAuth: OktaAuth, injector: Injector) => void;

export interface TestingObject {
  disableHttpsCheck: boolean;
}

export interface OktaConfig {
  oktaAuth: OktaAuth;
  onAuthRequired?: AuthRequiredFunction;
  onAuthResume?: AuthRequiredFunction;
  testing?: TestingObject;
}

export const OKTA_CONFIG = new InjectionToken<OktaConfig>('okta.config.angular');
export const OKTA_AUTH = new InjectionToken<OktaAuth>('okta.auth');
