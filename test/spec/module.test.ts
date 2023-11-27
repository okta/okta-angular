/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, APP_INITIALIZER } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OktaAuth, OktaAuthOptions } from '@okta/okta-auth-js';
import { 
  OktaAuthModule, 
  OKTA_CONFIG, 
  OKTA_AUTH,
  OktaAuthStateService, 
  OktaAuthGuard,
  OktaAuthConfigService
} from '../../lib/src/okta-angular';
import { of } from 'rxjs';
import { map, tap, take, catchError } from 'rxjs/operators';

@Component({ template: '' })
class MockComponent {}

// Simulate fetching OktaAuthOptions from backend with GET /config
// In APP_INITIALIZER factory the config should be set with configService.setConfig()
async function setupWithAppInitializer(
  oktaAuthOptions?: OktaAuthOptions,
  imports: any[] = [ OktaAuthModule ],
) {
  const configInitializer = (configService: OktaAuthConfigService, httpClient: HttpClient) => {
    return () => httpClient.get<OktaAuthOptions>('/config')
      .pipe(
        map((res) => ({
          issuer: res.issuer,
          clientId: res.clientId,
          redirectUri: res.redirectUri,
        })),
        tap((authConfig: OktaAuthOptions) => {
          const oktaAuth = new OktaAuth(authConfig);
          oktaAuth.start = jest.fn();
          configService.setConfig({
            oktaAuth,
          });
        }),
        take(1),
        catchError(() => of(null)),
      );
  };

  TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
      RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
      ...imports,
    ],
    declarations: [ MockComponent ],
    providers: [{
      provide: APP_INITIALIZER,
      useFactory: configInitializer,
      deps: [OktaAuthConfigService, HttpClient],
      multi: true
    }],
  });

  const httpTestingController = TestBed.inject(HttpTestingController);
  const req = httpTestingController.expectOne('/config');
  expect(req.request.method).toEqual('GET');
  if (oktaAuthOptions) {
    req.flush(oktaAuthOptions);
  } else {
    req.flush('404', { status: 404, statusText: 'Not Found' });
  }
  httpTestingController.verify();

  await TestBed.createComponent(MockComponent);
}

function setup(oktaAuth?: OktaAuth) {
  TestBed.configureTestingModule({
    imports: [
      RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
      OktaAuthModule
    ],
    declarations: [ MockComponent ],
    providers: [{
      provide: OKTA_CONFIG,
      useValue: {
        oktaAuth
      }
    }],
  });
  return TestBed.createComponent(MockComponent);
}

function setupForRoot(oktaAuth?: OktaAuth) {
  TestBed.configureTestingModule({
    imports: [
      RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
      oktaAuth ? OktaAuthModule.forRoot({ oktaAuth }) : OktaAuthModule.forRoot()
    ],
    declarations: [ MockComponent ],
  });
  return TestBed.createComponent(MockComponent);
}


describe('Okta Module', () => {
  let oktaAuth: OktaAuth;
  let oktaAuthOptions: OktaAuthOptions;

  beforeEach(() => {
    oktaAuthOptions = {
      issuer: 'http://xyz',
      clientId: 'fake clientId',
      redirectUri: 'fake redirectUri'
    };

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


  describe('DI', () => {
    describe('with OKTA_CONFIG injection token', () => {
      it('provides OktaAuth', () => {
        setup(oktaAuth);
        expect(TestBed.get(OKTA_AUTH)).toBeDefined();
        expect(oktaAuth.start).toHaveBeenCalled();
      });
      it('provides AuthStateService', () => {
        setup(oktaAuth);
        expect(TestBed.get(OktaAuthStateService)).toBeDefined();
      });
      it('provides OktaAuthGuard', () => {
        setup(oktaAuth);
        expect(TestBed.get(OktaAuthGuard)).toBeDefined();
      });
      it('provides OktaAuthConfigService', () => {
        setup(oktaAuth);
        expect(TestBed.get(OktaAuthConfigService)).toBeDefined();
        expect(TestBed.get(OktaAuthConfigService).getConfig()).toBeDefined();
        expect(TestBed.get(OktaAuthConfigService).getConfig().oktaAuth).toEqual(oktaAuth);
      });
      it('should throw if oktaAuth is not provided in OKTA_CONFIG value', () => {
        setup();
        expect(() => TestBed.get(OKTA_AUTH)).toThrow('Okta config should contain oktaAuth');
      });
    });

    describe('with .forRoot(config)', () => {
      it('should provide OktaAuth', () => {
        setupForRoot(oktaAuth);
        expect(TestBed.get(OKTA_AUTH)).toBeDefined();
        expect(oktaAuth.start).toHaveBeenCalled();
      });

      it('should provide OKTA_CONFIG', () => {
        setupForRoot(oktaAuth);
        expect(TestBed.get(OKTA_CONFIG)).toBeDefined();
        expect(TestBed.get(OKTA_CONFIG).oktaAuth).toEqual(oktaAuth);
      });

      it('should provide OktaAuthConfigService', () => {
        setupForRoot(oktaAuth);
        expect(TestBed.get(OktaAuthConfigService)).toBeDefined();
        expect(TestBed.get(OktaAuthConfigService).getConfig()).toBeDefined();
        expect(TestBed.get(OktaAuthConfigService).getConfig().oktaAuth).toEqual(oktaAuth);
      });
  
      it('should provide OktaAuthStateService', () => {
        setupForRoot(oktaAuth);
        expect(TestBed.get(OktaAuthStateService)).toBeDefined();
      });
  
      it('should provide OktaAuthGuard', () => {
        setupForRoot(oktaAuth);
        expect(TestBed.get(OktaAuthGuard)).toBeDefined();
      });
  
      it('should throw if oktaAuth is not provided', () => {
        setupForRoot();
        expect(() => TestBed.get(OKTA_AUTH)).toThrow('Okta config is not provided');
      });
    });
  
    describe('with APP_INITIALIZER', () => {
      it('should set loaded config with configService.setConfig()', async () => {
        await setupWithAppInitializer(oktaAuthOptions);
        expect(TestBed.get(OKTA_CONFIG)).not.toBeDefined();
        expect(TestBed.get(OktaAuthConfigService)).toBeDefined();
        expect(TestBed.get(OktaAuthConfigService).getConfig()).toBeDefined();
        expect(TestBed.get(OktaAuthConfigService).getConfig().oktaAuth.options.issuer).toEqual(oktaAuthOptions.issuer);
      });

      it('should provide OktaAuth', async () => {
        await setupWithAppInitializer(oktaAuthOptions);
        expect(TestBed.get(OKTA_AUTH)).toBeDefined();
        expect(TestBed.get(OKTA_AUTH).start).toHaveBeenCalled();
      });
  
      it('should provide OktaAuthStateService', async () => {
        await setupWithAppInitializer(oktaAuthOptions);
        expect(TestBed.get(OktaAuthStateService)).toBeDefined();
      });
  
      it('should provide OktaAuthGuard', async () => {
        await setupWithAppInitializer(oktaAuthOptions);
        expect(TestBed.get(OktaAuthGuard)).toBeDefined();
      });
  
      it('should throw if oktaAuth is not provided', async () => {
        await setupWithAppInitializer();
        expect(() => TestBed.get(OKTA_AUTH)).toThrow('Okta config is not provided');
      });
  
      it('should work if OktaAuthModule is imported with .forRoot()', async () => {
        await setupWithAppInitializer(oktaAuthOptions, [ OktaAuthModule.forRoot() ]);
        expect(TestBed.get(OKTA_CONFIG)).not.toBeDefined();
        expect(TestBed.get(OKTA_AUTH)).toBeDefined();
        expect(TestBed.get(OktaAuthConfigService).getConfig()).toBeDefined();
      });

    });
  });
  
});
