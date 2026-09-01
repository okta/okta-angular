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

import { inject } from '@angular/core';
import { CLIENT_JS_FETCH_CLIENT } from './models/client-js.config';

/**
 * Fetches `resource` using the `fetchClient` registered via `provideClientJsAuth`.
 * `fetchClient.fetch()` already resolves a matching credential, refreshes it if needed, or
 * performs a full re-authentication redirect if not - this helper does no auth logic of its own,
 * it just fetches and returns the raw `Response`.
 *
 * Takes a resource and optional `RequestInit`, not Angular's `ActivatedRouteSnapshot`/
 * `RouterStateSnapshot` resolver args, so call it from within your own `ResolveFn` rather than
 * assigning it directly to `resolve` - `inject()` still resolves correctly here because it's
 * called synchronously within the resolver's injection context:
 *
 * @example
 * resolve: { messages: () => fetchResolver('/api/messages') }
 */
export function fetchResolver(resource: string | URL | Request, init?: RequestInit): Promise<Response> {
  const fetchClient = inject(CLIENT_JS_FETCH_CLIENT);
  return fetchClient.fetch(resource, init);
}
