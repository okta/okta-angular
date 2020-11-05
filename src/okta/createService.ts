import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { OktaConfig } from './models/okta.config';
import { OktaAuthService } from './services/okta.service';

export function createOktaService(config: OktaConfig, location?: Location, router?: Router): OktaAuthService {
  return new OktaAuthService(config, location, router);
}
