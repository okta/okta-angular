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

/** Shape returned by the bundled mock API at `mock-api/server.mjs`. */
export interface Message {
  id: string;
  text: string;
  date: string;
}

export interface MessagesResponse {
  messages: Message[];
}

/**
 * What the resolver hands the component. The failure reason is carried rather than swallowed: a
 * resolver cannot reject without aborting the navigation, but returning a bare `null` reports every
 * failure identically, which is useless when the cause is a CORS preflight or a missing credential.
 */
export type MessagesResult =
  | { ok: true; messages: Message[] }
  | { ok: false; error: string };
