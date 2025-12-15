import { inject, Injectable } from '@angular/core';
import { OktaConfig, OKTA_CONFIG } from '../models/okta.config';

@Injectable({
  providedIn: 'root'
})
export class OktaAuthConfigService {
  private config = inject(OKTA_CONFIG, { optional: true });

  public getConfig(): OktaConfig | undefined {
    return this.config ? this.config : undefined;
  }

  public setConfig(config: OktaConfig): void {
    this.config = config;
  }
}
