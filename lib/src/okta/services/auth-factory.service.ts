import { Location } from '@angular/common';
import { VERSION } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSdkError, OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { OktaAuthConfigService } from './auth-config.serice';
import { compare } from 'compare-versions';
import packageInfo from '../packageInfo';

export class OktaAuthFactoryService {
  private static setupOktaAuth(
    oktaAuth: OktaAuth,
    router?: Router, 
    location?: Location
  ): void {
    const isAuthJsSupported = oktaAuth._oktaUserAgent && compare(oktaAuth._oktaUserAgent.getVersion(), packageInfo.authJSMinSupportedVersion, '>=');
    if (!isAuthJsSupported) {
      throw new AuthSdkError(`Passed in oktaAuth is not compatible with the SDK, minimum supported okta-auth-js version is ${packageInfo.authJSMinSupportedVersion}.`);
    }

    // Add Okta UA
    oktaAuth._oktaUserAgent.addEnvironment(`${packageInfo.name}/${packageInfo.version}`);
    oktaAuth._oktaUserAgent.addEnvironment(`Angular/${VERSION.full}`);

    // Provide a default implementation of `restoreOriginalUri`
    if (!oktaAuth.options.restoreOriginalUri && router && location) {
      oktaAuth.options.restoreOriginalUri = async (_, originalUri: string | undefined) => {
        const baseUrl = window.location.origin + location.prepareExternalUrl('');
        const routePath = toRelativeUrl(originalUri || '/', baseUrl);
        router.navigateByUrl(routePath);
      };
    }

    // Start services
    oktaAuth.start();
  }

  public static createOktaAuth(
    configService: OktaAuthConfigService, 
    router?: Router, 
    location?: Location
  ): OktaAuth {
    const config = configService.getConfig();
    if (!config) {
      throw new Error('Okta config is not provided');
    }

    const { oktaAuth } = config;
    if (!oktaAuth) {
      throw new Error('Okta config should contain oktaAuth');
    }

    OktaAuthFactoryService.setupOktaAuth(oktaAuth, router, location);

    return oktaAuth;
  }
}