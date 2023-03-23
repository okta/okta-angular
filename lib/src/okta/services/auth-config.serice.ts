import { Inject, Injectable, Optional } from '@angular/core';
import { OktaConfig, OKTA_CONFIG } from '../models/okta.config';

@Injectable({
  providedIn: 'root'
})
export class OktaAuthConfigService {
  private config: OktaConfig | undefined;

  constructor(
    @Optional() @Inject(OKTA_CONFIG) config?: OktaConfig
  ) {
    if (config) {
      this.config = config;
    }
  }

  public getConfig(): OktaConfig | undefined {
    return this.config;
  }

  public setConfig(config: OktaConfig): void {
    this.config = config;
  }
}
