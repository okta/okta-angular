import { Router } from '@angular/router';
import { OktaConfig } from './models/okta.config';
import { OktaAuthService } from './services/okta.service';

export function createOktaService(config: OktaConfig, router?: Router): OktaAuthService {
  return new OktaAuthService(config, router);
}
