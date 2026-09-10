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

// Stand-in for `@okta/spa-platform`, wired up through `moduleNameMapper` in jest.config.cjs.
//
// The real package is ESM-only ("type": "module", no `require` condition in its exports map) and
// node_modules stays untransformed, so requiring it from a spec throws ERR_REQUIRE_ESM. Only these
// two bindings need to exist: they are the only *values* lib/client-js/ imports from the package.
// Everything else it uses - `AuthorizationCodeFlowOrchestrator`, `SessionLogoutFlow`, `FetchClient`
// as a type, `TokenOrchestrator` - is imported with `import type` and erased at compile time, so the
// specs stub those as plain objects instead.

export class FetchClient {
  constructor(public orchestrator: unknown) {}

  fetch(): never {
    throw new Error('The FetchClient test stub does not fetch. Pass a `fetchClient` double instead.');
  }
}

export const addEnv = jest.fn();
