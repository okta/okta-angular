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

/**
 * The single place this entry point hands control to the browser and leaves the SPA.
 *
 * Kept in its own module because `window.location` is unforgeable - non-configurable on `window`,
 * with non-writable own properties - so it cannot be spied on. Unit tests mock this module instead.
 *
 * @internal
 */
export function navigate(url: string | URL): void {
  window.location.assign(url);
}
