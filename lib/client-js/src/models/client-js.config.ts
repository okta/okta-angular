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

import { InjectionToken } from '@angular/core';
import type { AuthorizationCodeFlowOrchestrator } from '@okta/spa-platform';
// Imported from @okta/auth-foundation (not @okta/spa-platform, whose FetchClient re-export doesn't
// surface the inherited `fetch` method to the type checker) - spa-platform's concrete FetchClient
// instances are structurally assignable here since they extend this base class.
import type { FetchClient } from '@okta/auth-foundation';

export interface ClientJsAuthConfig {
  orchestrator: AuthorizationCodeFlowOrchestrator;
  fetchClient: FetchClient;
}

export const CLIENT_JS_ORCHESTRATOR = new InjectionToken<AuthorizationCodeFlowOrchestrator>('okta.client-js.orchestrator');
export const CLIENT_JS_FETCH_CLIENT = new InjectionToken<FetchClient>('okta.client-js.fetch-client');
