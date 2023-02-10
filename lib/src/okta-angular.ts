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

export { OktaAuthModule } from './okta/okta.module';
export { OktaAuthGuard } from './okta/okta.guard';
export { OktaConfig, OKTA_CONFIG, OKTA_AUTH } from './okta/models/okta.config';
export { OktaAuthStateService } from './okta/services/auth-state.service';
export { OktaHasAnyGroupDirective } from './okta/has-any-group.directive';

// Okta View Components
export { OktaCallbackComponent } from './okta/components/callback.component';
