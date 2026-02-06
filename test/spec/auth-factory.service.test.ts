import { TestBed } from '@angular/core/testing';
import { AuthSdkError, OktaAuth } from '@okta/okta-auth-js';
import { OKTA_AUTH, OKTA_CONFIG, OktaAuthConfigService, provideOktaAuth, withOktaConfig } from '../../lib/src/okta-angular';
import { OktaAuthFactoryService } from '../../lib/src/okta/services/auth-factory.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { SpyLocation } from '@angular/common/testing';

jest.mock('../../lib/src/okta/packageInfo', () => ({
  __esModule: true,
  default: {
    authJSMinSupportedVersion: '5.3.1',
    version: '99.9.9',
    name: '@okta/okta-angular',
  }
}));

describe('OktaAuthFactoryService', () => {
  let oktaAuth: OktaAuth;

  beforeEach(() => {
    oktaAuth = {
      options: {},
      authStateManager: {
        updateAuthState: jest.fn(),
        getAuthState: jest.fn(),
        subscribe: jest.fn()
      },
      start: jest.fn(),
      _oktaUserAgent: {
        addEnvironment: jest.fn(),
        getVersion: jest.fn().mockReturnValue(`999.9.9`)
      },
    } as unknown as OktaAuth;
  });


  describe('createOktaAuth', () => {
    describe('auth-js major version compatibility', () => {
      it('should not throw when version matches', () => {
        TestBed.configureTestingModule({
          providers: [
            OktaAuthConfigService,
            { provide: OKTA_CONFIG, useValue: { oktaAuth } }
          ]
        });

        expect(() => OktaAuthFactoryService.createOktaAuth(TestBed.inject(OktaAuthConfigService))).not.toThrow();
      });

      it('throws when version not match', () => {
        oktaAuth = {
          ...oktaAuth,
          _oktaUserAgent: {
            addEnvironment: jest.fn(),
            // any major version before 5 should be invalid
            getVersion: jest.fn().mockReturnValue('0.9.9')
          }
        } as unknown as OktaAuth;

        TestBed.configureTestingModule({
          providers: [
            OktaAuthConfigService,
            { provide: OKTA_CONFIG, useValue: { oktaAuth } }
          ]
        });
        expect(() => OktaAuthFactoryService.createOktaAuth(TestBed.inject(OktaAuthConfigService))).toThrow(new AuthSdkError(`Passed in oktaAuth is not compatible with the SDK, minimum supported okta-auth-js version is 5.3.1.`));

      });

    });

    describe('Okta User Agent tracking', () => {
      it('adds sdk environment to oktaAuth instance', () => {
        TestBed.configureTestingModule({
          providers: [
            OktaAuthConfigService,
            { provide: OKTA_CONFIG, useValue: { oktaAuth } }
          ]
        });
        const configService = TestBed.inject(OktaAuthConfigService);
        OktaAuthFactoryService.createOktaAuth(configService)
        expect(configService?.getConfig()?.oktaAuth._oktaUserAgent.addEnvironment).toHaveBeenCalledWith('@okta/okta-angular/99.9.9');
      });
      it('throws if _oktaUserAgent is not exist', () => {
        oktaAuth = {
          ...oktaAuth,
          _oktaUserAgent: null
        } as unknown as OktaAuth;
        TestBed.configureTestingModule({
          providers: [
            OktaAuthConfigService,
            { provide: OKTA_CONFIG, useValue: { oktaAuth } }
          ]
        });

        expect(() => OktaAuthFactoryService.createOktaAuth(TestBed.inject(OktaAuthConfigService))).toThrow(new AuthSdkError(`Passed in oktaAuth is not compatible with the SDK, minimum supported okta-auth-js version is 5.3.1.`));
      });
    });

    describe('default restoreOriginalUri', () => {
      it('sets default restoreOriginalUri', async () => {

        TestBed.configureTestingModule({
          providers: [
            { provide: Router, useValue: { navigateByUrl: jest.fn() } },
            { provide: Location, useClass: SpyLocation },
            provideOktaAuth(withOktaConfig({ oktaAuth }))
          ]
        });
        const injectedOktaAuth = TestBed.inject(OKTA_AUTH);
        expect(injectedOktaAuth.options.restoreOriginalUri).toBeDefined();
      });
    });

    describe('Start service', () => {
      it('starts service', () => {
        TestBed.configureTestingModule({
          providers: [
            OktaAuthConfigService,
            { provide: OKTA_CONFIG, useValue: { oktaAuth } }
          ]
        });

        const configService = TestBed.inject(OktaAuthConfigService);
        OktaAuthFactoryService.createOktaAuth(configService)

        expect(configService?.getConfig()?.oktaAuth.start).toHaveBeenCalled();
      });
    });
  });

});