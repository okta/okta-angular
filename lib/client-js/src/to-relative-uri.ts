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
 * Reduces a flow-context `originalUri` to something `Router.parseUrl()` can be handed.
 *
 * `resumeFlow()` resolves to `Record<string, any>` - the `meta` object recorded when the flow
 * started - so `originalUri` is untyped external input. Anything that isn't a string, or that
 * points off-origin (or doesn't parse), collapses to the fallback rather than being turned into a
 * nonsense in-app route.
 *
 * @internal
 */
export function toRelativeUri(uri: unknown, fallback = '/'): string {
  if (typeof uri !== 'string' || uri === '') {
    return fallback;
  }

  try {
    const url = new URL(uri, window.location.origin);
    return url.origin === window.location.origin
      ? `${url.pathname}${url.search}${url.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}
