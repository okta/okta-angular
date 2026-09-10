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

import { EnvironmentProviders, makeEnvironmentProviders, VERSION } from '@angular/core';
import { addEnv, FetchClient } from '@okta/spa-platform';
import {
  CLIENT_JS_CONFIG,
  CLIENT_JS_FETCH_CLIENT,
  CLIENT_JS_ORCHESTRATOR,
  CLIENT_JS_SIGN_OUT_FLOW,
  ClientJsAuthConfig,
} from './models/client-js.config';
import packageInfo from './package-info';

// `addEnv` appends to a module-level list that builds the `X-Okta-User-Agent-Extended` header, so
// registering the same strings again on a second `provideClientJsAuth()` call - a second Angular
// app on the page, or a test suite - would repeat them in every request. This is the client-js
// equivalent of `oktaAuth._oktaUserAgent.addEnvironment()` on the okta-auth-js path.
let userAgentRegistered = false;

function registerUserAgent(): void {
  if (userAgentRegistered) {
    return;
  }
  userAgentRegistered = true;
  addEnv(`${packageInfo.name}/${packageInfo.version}`);
  addEnv(`Angular/${VERSION.full}`);
}

/**
 * Registers a consumer-constructed {@link ClientJsAuthConfig.orchestrator} (and, optionally, a
 * {@link ClientJsAuthConfig.fetchClient} and {@link ClientJsAuthConfig.signOutFlow}) in Angular's
 * injector graph, so that `tokenGuard`, `loginCallbackGuard`, `oktaFetch`, and `signOut` can
 * `inject()` them without either instance being threaded through as a function argument. The
 * orchestrator is still constructed by the consumer (this library has no opinion on
 * `AuthorizationCodeFlow` options) - this only wires the already-built instances into DI, the same
 * role `provideOktaAuth` plays for an already-constructed `OktaAuth` instance.
 *
 * @example
 * providers: [provideClientJsAuth({ orchestrator })]
 */
export function provideClientJsAuth(config: ClientJsAuthConfig): EnvironmentProviders {
  const { orchestrator } = config;

  if (!orchestrator) {
    throw new Error('No orchestrator passed to provideClientJsAuth.');
  }

  registerUserAgent();

  return makeEnvironmentProviders([
    { provide: CLIENT_JS_CONFIG, useValue: config },
    { provide: CLIENT_JS_ORCHESTRATOR, useValue: orchestrator },
    { provide: CLIENT_JS_FETCH_CLIENT, useValue: config.fetchClient ?? new FetchClient(orchestrator) },
    { provide: CLIENT_JS_SIGN_OUT_FLOW, useValue: config.signOutFlow },
  ]);
}
