import { inject, Injectable } from '@angular/core';
import { OktaConfig, OKTA_CONFIG } from '../models/okta.config';

@Injectable({
  providedIn: 'root'
})
export class OktaAuthConfigService {
  #config = inject(OKTA_CONFIG, { optional: true }) ?? undefined;

  public getConfig(): OktaConfig | undefined {
    return this.#config;
  }

  public setConfig(config: OktaConfig): void {
    this.#config = config;
  }
}
