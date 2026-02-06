import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import {
  OktaConfig,
  OKTA_AUTH,
  OKTA_CONFIG,
} from '../../lib/src/okta-angular';
import {
  OktaAuthGuard,
  canActivateAuthGuard,
  canActivateChildAuthGuard,
  canMatchAuthGuard,
} from '../../lib/src/okta/okta.guard';
import { AuthRequiredFunction } from '../../lib/src/okta/models/okta.config';
import { 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router, 
  RouterState, 
  Route
} from '@angular/router';
import { Injector } from '@angular/core';
import { OktaAuth } from '@okta/okta-auth-js';

jest.mock('../../lib/src/okta/packageInfo', () => ({
  __esModule: true,
  default: {
    authJSMinSupportedVersion: '5.3.1',
    version: '99.9.9',
    name: '@okta/okta-angular',
  }
}));

function setup(oktaAuth: OktaAuth, config: OktaConfig) {
  config = config || {};

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      OktaAuthGuard,
      {
        provide: OKTA_AUTH,
        useValue: oktaAuth
      },
      {
        provide: OKTA_CONFIG,
        useValue: config
      },
    ],
  });
}

describe('Angular auth guard', () => {

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('canMatch', () => {
    describe('isAuthenticated() = true', () => {
      it('returns true', async () => {
        const oktaAuth = {
          isAuthenticated: jest.fn().mockResolvedValue(true),
        } as unknown;
        setup(oktaAuth as OktaAuth, {} as OktaConfig);
        const route: unknown = {};
        const res = await TestBed.runInInjectionContext(() => canMatchAuthGuard(route as Route, []));
        expect(res).toBe(true);
      });
    });

    describe('isAuthenticated() = false', () => {
      let oktaAuth: OktaAuth;
      let route: Route;
      let router: Router;
      let injector: Injector;
      let onAuthRequired: AuthRequiredFunction;
      beforeEach(() => {
        oktaAuth = {
          isAuthenticated: jest.fn().mockResolvedValue(false),
          setOriginalUri: jest.fn(),
          signInWithRedirect: jest.fn()
        } as unknown as OktaAuth;
        onAuthRequired = jest.fn();
        const config = { oktaAuth } as OktaConfig;
        setup(oktaAuth, config);
        injector = TestBed.inject(Injector);
        route = {} as unknown as Route;
      });

      it('returns false', async () => {
        const res = await TestBed.runInInjectionContext(() => canMatchAuthGuard(route, []));
        expect(res).toBe(false);
      });

      it('by default, calls "signInWithRedirect()"', async () => {
        await TestBed.runInInjectionContext(() => canMatchAuthGuard(route, []));
        expect(oktaAuth.signInWithRedirect).toHaveBeenCalled();
      });

      it('calls "setOriginalUri" with state url', async () => {
        const path = '/path';
        const query = '?query=foo&bar=baz';
        const hash = '#hash=foo';
        const routerUrl = `${path}${query}${hash}`;
        router = TestBed.inject(Router);
        jest.spyOn(router, 'getCurrentNavigation').mockReturnValue({
          extractedUrl: router.parseUrl(routerUrl),
          extras: {},
          id: 1,
          initialUrl: router.parseUrl('fakepath'),
          previousNavigation: null,
          trigger: 'imperative',
        });

        await TestBed.runInInjectionContext(() => canMatchAuthGuard(route, []));
        expect(oktaAuth.setOriginalUri).toHaveBeenCalledWith('/path?query=foo&bar=baz#hash=foo');
      });

      it('onAuthRequired can be set on route', async () => {
        const mockFn = jest.fn();
        route.data = {
          onAuthRequired: mockFn
        };
        await TestBed.runInInjectionContext(() => canMatchAuthGuard(route, []));
        const options = {};
        expect(mockFn).toHaveBeenCalledWith(oktaAuth, injector, options);
      });

      it('onAuthRequired can be set on config', async () => {
        TestBed.inject(OktaAuthGuard).onAuthRequired = onAuthRequired;
        await TestBed.runInInjectionContext(() => canMatchAuthGuard(route, []));
        const options = {};
        expect(onAuthRequired).toHaveBeenCalledWith(oktaAuth, injector, options);
      });
    });

    describe('isAuthenticated() = true and "acr" claim matches provided acrValues', () => {
      it('returns true', async () => {
        const oktaAuth = {
          isAuthenticated: jest.fn().mockResolvedValue(true),
          authStateManager: {
            getAuthState: jest.fn().mockReturnValue({
              idToken: {
                claims: {
                  acr: 'urn:okta:loa:2fa:any'
                }
              }
            })
          },
          _oktaUserAgent: {
            getVersion: jest.fn().mockReturnValue('7.1.0')
          }
        } as unknown;
        setup(oktaAuth as OktaAuth, {} as OktaConfig);
        const route: unknown = {
          data: {
            okta: {
              acrValues: 'urn:okta:loa:2fa:any'
            }
          }
        };
        const res = await TestBed.runInInjectionContext(() => canMatchAuthGuard(route as Route, []));
        expect(res).toBe(true);
      });
    });

    describe('isAuthenticated() = true and "acr" claim does not match provided acrValues', () => {
      let oktaAuth: OktaAuth;
      let route: Route;
      let injector: Injector;
      beforeEach(() => {
        oktaAuth = {
          isAuthenticated: jest.fn().mockResolvedValue(true),
          authStateManager: {
            getAuthState: jest.fn().mockReturnValue({
              idToken: {
                claims: {
                  acr: 'urn:okta:loa:1fa:any'
                }
              }
            })
          },
          signInWithRedirect: jest.fn(),
          _oktaUserAgent: {
            getVersion: jest.fn().mockReturnValue('7.1.0')
          }
        } as unknown as OktaAuth;
        const config = { oktaAuth } as OktaConfig;
        setup(oktaAuth, config);
        injector = TestBed.inject(Injector);
        route = {
          data: {
            okta: {
              acrValues: 'urn:okta:loa:2fa:any'
            }
          }
        } as unknown as Route;
      });

      it('returns false', async () => {
        const res = await TestBed.runInInjectionContext(() => canMatchAuthGuard(route, []));
        expect(res).toBe(false);
      });

      it('by default, calls "signInWithRedirect({ acrValues })"', async () => {
        await TestBed.runInInjectionContext(() => canMatchAuthGuard(route, []));
        expect(oktaAuth.signInWithRedirect).toHaveBeenCalledWith({
          acrValues: 'urn:okta:loa:2fa:any'
        });
      });

      it('if onAuthRequired is provided, calls with options { acrValues }', async () => {
        const mockFn = jest.fn();
        route.data = {
          ...route.data,
          onAuthRequired: mockFn,
        };
        await TestBed.runInInjectionContext(() => canMatchAuthGuard(route, []));
        const options = {
          acrValues: 'urn:okta:loa:2fa:any'
        };
        expect(mockFn).toHaveBeenCalledWith(oktaAuth, injector, options);
      });
    });
  });

  describe('canActivate', () => {
    describe('isAuthenticated() = true', () => {
      it('returns true', async () => {
        const oktaAuth = {
          isAuthenticated: jest.fn().mockResolvedValue(true),
          authStateManager: {
            subscribe: jest.fn()
          }
        } as unknown;
        setup(oktaAuth as OktaAuth, {} as OktaConfig);
        const route: unknown = {};
        const state: unknown = {};
        const res = await TestBed.runInInjectionContext(() => canActivateAuthGuard(route as ActivatedRouteSnapshot, state as RouterStateSnapshot));
        expect(res).toBe(true);
      });
    });

    describe('isAuthenticated() = false', () => {
      let oktaAuth: OktaAuth;
      let state: RouterStateSnapshot;
      let route: ActivatedRouteSnapshot;
      let router: Router;
      let injector: Injector;
      let onAuthRequired: AuthRequiredFunction;
      beforeEach(() => {
        oktaAuth = {
          isAuthenticated: jest.fn().mockResolvedValue(false),
          authStateManager: {
            subscribe: jest.fn()
          },
          setOriginalUri: jest.fn(),
          signInWithRedirect: jest.fn()
        } as unknown as OktaAuth;
        onAuthRequired = jest.fn();
        const config = { oktaAuth } as OktaConfig;
        setup(oktaAuth, config);
        router = TestBed.inject(Router);
        injector = TestBed.inject(Injector);
        const routerState: RouterState = router.routerState;
        state = routerState.snapshot;
        route = state.root;
      });

      it('returns false', async () => {
        const res = await TestBed.runInInjectionContext(() => canActivateAuthGuard(route, state));
        expect(res).toBe(false);
      });

      it('by default, calls "signInWithRedirect()"', async () => {
        await TestBed.runInInjectionContext(() => canActivateAuthGuard(route, state));
        expect(oktaAuth.signInWithRedirect).toHaveBeenCalled();
      });

      it('calls "setOriginalUri" with state url', async () => {
        const baseUrl = 'http://fake.url/path';
        const query = '?query=foo&bar=baz';
        const hash = '#hash=foo';
        state.url = `${baseUrl}${query}${hash}`;
        const queryObj = { 'bar': 'baz' };
        route.queryParams = queryObj;
        await TestBed.runInInjectionContext(() => canActivateAuthGuard(route, state));
        expect(oktaAuth.setOriginalUri).toHaveBeenCalledWith(state.url);
      });

      it('onAuthRequired can be set on route', async () => {
        const fn = route.data['onAuthRequired'] = jest.fn();
        await TestBed.runInInjectionContext(() => canActivateAuthGuard(route, state));
        const options = {};
        expect(fn).toHaveBeenCalledWith(oktaAuth, injector, options);
      });

      it('onAuthRequired can be set on config', async () => {
        TestBed.inject(OktaAuthGuard).onAuthRequired = onAuthRequired;
        await TestBed.runInInjectionContext(() => canActivateAuthGuard(route, state));
        const options = {};
        expect(onAuthRequired).toHaveBeenCalledWith(oktaAuth, injector, options);
      });
    });

    describe('isAuthenticated() = true and "acr" claim matches provided acrValues', () => {
      it('returns true', async () => {
        const oktaAuth = {
          isAuthenticated: jest.fn().mockResolvedValue(true),
          authStateManager: {
            getAuthState: jest.fn().mockReturnValue({
              idToken: {
                claims: {
                  acr: 'urn:okta:loa:2fa:any'
                }
              }
            }),
            subscribe: jest.fn()
          },
          _oktaUserAgent: {
            getVersion: jest.fn().mockReturnValue('7.1.0')
          }
        } as unknown;
        setup(oktaAuth as OktaAuth, {} as OktaConfig);
        const route: unknown = {
          data: {
            okta: {
              acrValues: 'urn:okta:loa:2fa:any'
            }
          }
        };
        const state: unknown = {};
        const res = await TestBed.runInInjectionContext(() => canActivateAuthGuard(route as ActivatedRouteSnapshot, state as RouterStateSnapshot));
        expect(res).toBe(true);
      });
    });

    describe('isAuthenticated() = true and "acr" claim does not match provided acrValues', () => {
      let oktaAuth: OktaAuth;
      let state: RouterStateSnapshot;
      let route: ActivatedRouteSnapshot;
      let router: Router;
      let injector: Injector;
      beforeEach(() => {
        oktaAuth = {
          isAuthenticated: jest.fn().mockResolvedValue(true),
          authStateManager: {
            getAuthState: jest.fn().mockReturnValue({
              idToken: {
                claims: {
                  acr: 'urn:okta:loa:1fa:any'
                }
              }
            }),
            subscribe: jest.fn(),
          },
          signInWithRedirect: jest.fn(),
          _oktaUserAgent: {
            getVersion: jest.fn().mockReturnValue('7.1.0')
          }
        } as unknown as OktaAuth;
        const config = { oktaAuth } as OktaConfig;
        setup(oktaAuth, config);
        router = TestBed.inject(Router);
        injector = TestBed.inject(Injector);
        const routerState: RouterState = router.routerState;
        state = routerState.snapshot;
        route = state.root;
        route.data = {
          okta: {
            acrValues: 'urn:okta:loa:2fa:any'
          }
        };
      });

      it('returns false', async () => {
        const res = await TestBed.runInInjectionContext(() => canActivateAuthGuard(route, state));
        expect(res).toBe(false);
      });

      it('by default, calls "signInWithRedirect({ acrValues })"', async () => {
        await TestBed.runInInjectionContext(() => canActivateAuthGuard(route, state));
        expect(oktaAuth.signInWithRedirect).toHaveBeenCalledWith({
          acrValues: 'urn:okta:loa:2fa:any'
        });
      });

      it('if onAuthRequired is provided, calls with options { acrValues }', async () => {
        const mockFn = jest.fn();
        route.data = {
          ...route.data,
          onAuthRequired: mockFn
        };
        await TestBed.runInInjectionContext(() => canActivateAuthGuard(route, state));
        const options = {
          acrValues: 'urn:okta:loa:2fa:any'
        };
        expect(mockFn).toHaveBeenCalledWith(oktaAuth, injector, options);
      });
    });
  });

  describe('canActivateChild', () => {
    it('returns false when not authenticated', async () => {
      const oktaAuth = {
        isAuthenticated: jest.fn().mockResolvedValue(false),
        authStateManager: {
          subscribe: jest.fn()
        },
        setOriginalUri: jest.fn(),
        signInWithRedirect: jest.fn()
      } as unknown as OktaAuth;
      const config = { oktaAuth } as OktaConfig;
      setup(oktaAuth, config);
      const router = TestBed.inject(Router);
      const routerState: RouterState = router.routerState;
      const state = routerState.snapshot;
      const route = state.root;

      const res = await TestBed.runInInjectionContext(() => canActivateChildAuthGuard(route, state));
      expect(res).toBe(false);
      expect(oktaAuth.signInWithRedirect).toHaveBeenCalled();
    });
  });
});