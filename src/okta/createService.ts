import { OktaConfig } from './models/okta.config';
import { OktaAuthService } from './services/okta.service';

export function createOktaService(config: OktaConfig): OktaAuthService {
  return new OktaAuthService(config);
}
