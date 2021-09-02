import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import {
  OktaAuthGuard,
  OktaConfig,
  OKTA_CONFIG,
} from '../../src/okta-angular';
import { AuthRequiredFunction } from '../../src/okta/models/okta.config';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, RouterState } from '@angular/router';
import { Injector } from '@angular/core';
import { OktaAuth } from '@okta/okta-auth-js';

function setup(oktaAuth: OktaAuth, config: OktaConfig) {
  config = config || {};

  TestBed.configureTestingModule({
    imports: [
      RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
    ],
    providers: [
      OktaAuthGuard,
      {
        provide: OktaAuth,
        value: oktaAuth
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
        const injector: Injector = TestBed.inject(Injector);
        const guard = new OktaAuthGuard({} as OktaConfig, oktaAuth as OktaAuth, injector as Injector);
        const route: unknown = undefined;
        const state: unknown = undefined;
        const res = await guard.canActivate(route as ActivatedRouteSnapshot, state as RouterStateSnapshot);
        expect(res).toBe(true);
      });
    });

    describe('isAuthenticated() = false', () => {
      let oktaAuth: OktaAuth;
      let guard: OktaAuthGuard;
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
        guard = new OktaAuthGuard(config, oktaAuth, injector);
        const routerState: RouterState = router.routerState;
        state = routerState.snapshot;
        route = state.root;
      });

      it('returns false', async () => {
        const res = await guard.canActivate(route, state);
        expect(res).toBe(false);
      });

      it('by default, calls "signInWithRedirect()"', async () => {
        await guard.canActivate(route, state);
        expect(oktaAuth.signInWithRedirect).toHaveBeenCalled();
      });

      it('calls "setOriginalUri" with state url', async () => {
        const baseUrl = 'http://fake.url/path';
        const query = '?query=foo&bar=baz';
        const hash = '#hash=foo';
        state.url = `${baseUrl}${query}${hash}`;
        const queryObj = { 'bar': 'baz' };
        route.queryParams = queryObj;
        await guard.canActivate(route, state);
        expect(oktaAuth.setOriginalUri).toHaveBeenCalledWith(state.url);
      });

      it('onAuthRequired can be set on route', async () => {
        const fn = route.data['onAuthRequired'] = jest.fn();
        await guard.canActivate(route, state);
        expect(fn).toHaveBeenCalledWith(oktaAuth, injector);
      });

      it('onAuthRequired can be set on config', async () => {
        guard = new OktaAuthGuard({ oktaAuth, onAuthRequired }, oktaAuth, injector);
        await guard.canActivate(route, state);
        expect(onAuthRequired).toHaveBeenCalledWith(oktaAuth, injector);
      });
    });
  });

  describe('canActivateChild', () => {
    let oktaAuth;
    it('calls canActivate', () => {
      oktaAuth = {
        isAuthenticated: jest.fn().mockResolvedValue(false),
        authStateManager: {
          subscribe: jest.fn()
        },
        setOriginalUri: jest.fn(),
        signInWithRedirect: jest.fn()
      } as unknown as OktaAuth;
      const config = { oktaAuth } as OktaConfig;
      setup(oktaAuth, config);
      const injector = TestBed.inject(Injector);
      const guard = new OktaAuthGuard(config, oktaAuth, injector);
      const router = TestBed.inject(Router);
      const routerState: RouterState = router.routerState;
      const state = routerState.snapshot;
      const route = state.root;

      jest.spyOn(guard, 'canActivate').mockReturnValue(Promise.resolve(true));
      guard.canActivateChild(route, state);
      expect(guard.canActivate).toHaveBeenCalledWith(route, state);
    });
  });
});
