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

import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { CLIENT_JS_ORCHESTRATOR, CLIENT_JS_FETCH_CLIENT, ClientJsAuthConfig } from './models/client-js.config';

/**
 * Registers a consumer-constructed {@link ClientJsAuthConfig.orchestrator} and
 * {@link ClientJsAuthConfig.fetchClient} in Angular's injector graph, so that `tokenGuard`,
 * `loginCallbackGuard`, and `fetchResolver` can `inject()` them without either instance being
 * threaded through as a function argument. The orchestrator and fetch client themselves are still
 * constructed by the consumer (this library has no opinion on `AuthorizationCodeFlow` options) -
 * this only wires the already-built instances into DI, the same role `provideOktaAuth` plays for
 * an already-constructed `OktaAuth` instance.
 *
 * @example
 * providers: [provideClientJsAuth({ orchestrator, fetchClient })]
 */
export function provideClientJsAuth(config: ClientJsAuthConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: CLIENT_JS_ORCHESTRATOR, useValue: config.orchestrator },
    { provide: CLIENT_JS_FETCH_CLIENT, useValue: config.fetchClient },
  ]);
}
