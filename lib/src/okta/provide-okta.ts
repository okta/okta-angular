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

import { EnvironmentProviders, makeEnvironmentProviders, Optional, Provider } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { OktaAuthConfigService, OktaAuthStateService, OKTA_AUTH, OKTA_CONFIG, OktaConfig } from '../okta-angular';
import { OktaAuthFactoryService } from './services/auth-factory.service';

// This is for setting up the `withOktaConfig` function (or other feature functions)
export interface OktaAuthFeatures {
  eProviders: Provider[];
}

export function withOktaConfig(config: OktaConfig): OktaAuthFeatures {
  return {
    eProviders: [{ provide: OKTA_CONFIG, useValue: config }]
  };
}

export function provideOktaAuth(...features: OktaAuthFeatures[]): EnvironmentProviders {
  
  const providers: Provider[] = [
    OktaAuthConfigService,
    OktaAuthStateService,
    {
      provide: OKTA_AUTH,
      useFactory: (configService: OktaAuthConfigService, router?: Router, location?: Location) => OktaAuthFactoryService.createOktaAuth(configService,router!, location!),
      deps: [
        OktaAuthConfigService,
        [new Optional(), Router],
        [new Optional(), Location]
      ]
    }
  ];

  features.forEach(f => providers.push(...f.eProviders));

  return makeEnvironmentProviders(providers);
}