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

import { NgModule, ModuleWithProviders, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { OktaCallbackComponent } from './components/callback.component';
import { OktaAuthGuard } from './okta.guard';
import { OktaAuthConfigService } from './services/auth-config.serice';
import { OktaAuthStateService } from './services/auth-state.service';
import { OktaAuthFactoryService } from './services/auth-factory.service';
import { OktaHasAnyGroupDirective } from './has-any-group.directive';
import { OktaConfig, OKTA_CONFIG, OKTA_AUTH } from './models/okta.config';


@NgModule({
  declarations: [
    OktaCallbackComponent,
    OktaHasAnyGroupDirective,
  ],
  exports: [
    OktaCallbackComponent,
    OktaHasAnyGroupDirective,
  ],
  providers: [
    OktaAuthConfigService,
    OktaAuthStateService,
    OktaAuthGuard,
    {
      provide: OKTA_AUTH,
      useFactory: OktaAuthFactoryService.createOktaAuth,
      deps: [
        OktaAuthConfigService,
        [new Optional(), Router],
        [new Optional(), Location]
      ]
    },
    // Provide empty OKTA_CONFIG by default
    // Real config should be provided at runtime with `APP_INITIALIZER` or with `OktaAuthModule.forRoot()`
    { provide: OKTA_CONFIG, useValue: undefined },
  ]
})
export class OktaAuthModule {
  static forRoot(config?: OktaConfig): ModuleWithProviders<OktaAuthModule> {
    return {
      ngModule: OktaAuthModule,
      providers: [
        { provide: OKTA_CONFIG, useValue: config },
      ]
    };
  }

  // Should not have constructor to support lazy load of config with APP_INITIALIZER

}
