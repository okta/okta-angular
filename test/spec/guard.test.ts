import { TestBed } from "@angular/core/testing";
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Route,
  UrlSegment,
} from "@angular/router";
import { OktaAuthGuardService } from "../../lib/src/okta/okta-auth-guard.service";
import {
  oktaCanActivate,
  oktaCanActivateChild,
  oktaCanMatch,
} from "../../lib/src/okta/okta.guard";

describe("Okta Functional Guards", () => {
  let guardServiceSpy: jest.Mocked<OktaAuthGuardService>;
  let routeMock: any;
  let stateMock: any;

  beforeEach(() => {
    guardServiceSpy = {
      canActivate: jest.fn(),
      canActivateChild: jest.fn(),
      canMatch: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [{ provide: OktaAuthGuardService, useValue: guardServiceSpy }],
    });

    routeMock = {} as ActivatedRouteSnapshot;
    stateMock = {} as RouterStateSnapshot;
  });

  describe("oktaCanActivate", () => {
    it("should call OktaAuthGuardService.canActivate and return true", async () => {
      guardServiceSpy.canActivate.mockResolvedValue(true);

      const result = await TestBed.runInInjectionContext(() =>
        oktaCanActivate(routeMock, stateMock)
      );

      expect(guardServiceSpy.canActivate).toHaveBeenCalledWith(
        routeMock,
        stateMock
      );
      expect(result).toBe(true);
    });

    it("should call OktaAuthGuardService.canActivate and return false", async () => {
      guardServiceSpy.canActivate.mockResolvedValue(false);
      const result = await TestBed.runInInjectionContext(() =>
        oktaCanActivate(routeMock, stateMock)
      );

      expect(guardServiceSpy.canActivate).toHaveBeenCalledWith(
        routeMock,
        stateMock
      );
      expect(result).toBe(false);
    });
  });

  describe("oktaCanActivateChild", () => {
    it("should call OktaAuthGuardService.canActivateChild and return true", async () => {
      guardServiceSpy.canActivateChild.mockResolvedValue(true);
      const result = await TestBed.runInInjectionContext(() =>
        oktaCanActivateChild(routeMock, stateMock)
      );

      expect(guardServiceSpy.canActivateChild).toHaveBeenCalledWith(
        routeMock,
        stateMock
      );
      expect(result).toBe(true);
    });

    it("should call OktaAuthGuardService.canActivateChild and return false", async () => {
      guardServiceSpy.canActivateChild.mockResolvedValue(false);
      const result = await TestBed.runInInjectionContext(() =>
        oktaCanActivateChild(routeMock, stateMock)
      );

      expect(guardServiceSpy.canActivateChild).toHaveBeenCalledWith(
        routeMock,
        stateMock
      );
      expect(result).toBe(false);
    });
  });

  describe("oktaCanMatch", () => {
    it("should call OktaAuthGuardService.canMatch and return true", async () => {
      guardServiceSpy.canMatch.mockResolvedValue(true);
      const route = {} as Route;
      const segments: UrlSegment[] = [];

      const result = await TestBed.runInInjectionContext(() =>
        oktaCanMatch(route, segments)
      );

      expect(guardServiceSpy.canMatch).toHaveBeenCalledWith(route, segments);
      expect(result).toBe(true);
    });

    it("should call OktaAuthGuardService.canMatch and return false", async () => {
      guardServiceSpy.canMatch.mockResolvedValue(false);
      const route = {} as Route;
      const segments: UrlSegment[] = [];

      const result = await TestBed.runInInjectionContext(() =>
        oktaCanMatch(route, segments)
      );

      expect(guardServiceSpy.canMatch).toHaveBeenCalledWith(route, segments);
      expect(result).toBe(false);
    });
  });
});

import { OKTA_AUTH } from "../../lib/src/okta/models/okta.config";
import { OktaAuthConfigService } from "../../lib/src/okta/services/auth-config.service";
import { Router } from "@angular/router";
import { OktaAuth } from "@okta/okta-auth-js";
import { of } from "rxjs";

describe("Okta Functional Guards Integration", () => {
  let oktaAuthSpy: jest.Mocked<OktaAuth>;
  let routerSpy: jest.Mocked<Partial<Router>>;
  let authConfigServiceSpy: jest.Mocked<Partial<OktaAuthConfigService>>;
  let routeMock: ActivatedRouteSnapshot;
  let stateMock: RouterStateSnapshot;

  beforeEach(() => {
    oktaAuthSpy = {
      isAuthenticated: jest.fn(),
      setOriginalUri: jest.fn(),
      authStateManager: {
        getAuthState: jest.fn(),
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
      } as any,
      signInWithRedirect: jest.fn(),
    } as unknown as jest.Mocked<OktaAuth>;

    routerSpy = {
      navigate: jest.fn(),
      events: of(),
      parseUrl: jest.fn(),
      getCurrentNavigation: jest.fn(),
      createUrlTree: jest.fn(),
    };

    authConfigServiceSpy = {
      getConfig: jest.fn().mockReturnValue({
        oktaAuth: oktaAuthSpy,
      }),
      setConfig: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        OktaAuthGuardService,
        { provide: OKTA_AUTH, useValue: oktaAuthSpy },
        { provide: OktaAuthConfigService, useValue: authConfigServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  describe("oktaCanActivate", () => {
    describe("isAuthenticated() = false", () => {
      it('calls "setOriginalUri" with state url', async () => {
        const baseUrl = "http://fake.url/path";
        const query = "?query=foo&bar=baz";
        const hash = "#hash=foo";
        const url = `${baseUrl}${query}${hash}`;

        stateMock = { url } as RouterStateSnapshot;
        routeMock = { queryParams: { bar: "baz" }, data: {} } as any;

        oktaAuthSpy.isAuthenticated.mockResolvedValue(false);

        await TestBed.runInInjectionContext(() =>
          oktaCanActivate(routeMock, stateMock)
        );

        expect(oktaAuthSpy.setOriginalUri).toHaveBeenCalledWith(url);
      });

      it("onAuthRequired can be set on route", async () => {
        const onAuthRequiredSpy = jest.fn();
        routeMock = {
          data: {
            onAuthRequired: onAuthRequiredSpy,
          },
        } as any;
        stateMock = { url: "http://foo" } as RouterStateSnapshot;

        oktaAuthSpy.isAuthenticated.mockResolvedValue(false);

        await TestBed.runInInjectionContext(() =>
          oktaCanActivate(routeMock, stateMock)
        );

        const options = {};
        expect(onAuthRequiredSpy).toHaveBeenCalledWith(
          oktaAuthSpy,
          expect.anything(),
          options
        );
      });

      it("onAuthRequired can be set on config", async () => {
        const onAuthRequiredSpy = jest.fn();
        (authConfigServiceSpy.getConfig as jest.Mock).mockReturnValue({
          oktaAuth: oktaAuthSpy,
          onAuthRequired: onAuthRequiredSpy,
        });

        routeMock = { data: {} } as any;
        stateMock = { url: "http://foo" } as RouterStateSnapshot;

        oktaAuthSpy.isAuthenticated.mockResolvedValue(false);

        await TestBed.runInInjectionContext(() =>
          oktaCanActivate(routeMock, stateMock)
        );

        const options = {};
        expect(onAuthRequiredSpy).toHaveBeenCalledWith(
          oktaAuthSpy,
          expect.anything(),
          options
        );
      });

      it('by default, calls "signInWithRedirect()"', async () => {
        stateMock = { url: "http://foo" } as RouterStateSnapshot;
        routeMock = { data: {} } as any;

        oktaAuthSpy.isAuthenticated.mockResolvedValue(false);

        await TestBed.runInInjectionContext(() =>
          oktaCanActivate(routeMock, stateMock)
        );

        expect(oktaAuthSpy.signInWithRedirect).toHaveBeenCalled();
      });
    });
  });
});
