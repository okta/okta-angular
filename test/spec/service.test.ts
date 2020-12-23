import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import * as OktaAuth from '@okta/okta-auth-js';
import { BehaviorSubject } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const PACKAGE_JSON = require("../../package.json");

import {
  OktaAuthModule,
  OktaAuthService,
  OktaConfig,
  OKTA_CONFIG,
} from "../../src/okta-angular";

describe("Angular service", () => {
  let VALID_CONFIG: OktaConfig;

  beforeEach(() => {
    VALID_CONFIG = {
      clientId: "foo",
      issuer: "https://foo",
      redirectUri: "https://foo",
    };
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  function extendConfig(config: OktaConfig): OktaConfig {
    return Object.assign({}, VALID_CONFIG, config);
  }

  const createInstance = (config = {}) => {
    return () => new OktaAuthService(config);
  };

  it("starts tokenService during construction", () => {
    const tokenManagerStart = jest.spyOn(OktaAuth.TokenManager.prototype, 'start');
    createInstance(VALID_CONFIG)();
    expect(tokenManagerStart).toBeCalled();
  });

  describe("configuration", () => {
    it("should throw if no issuer is provided", () => {
      expect(createInstance()).toThrow();
    });

    it("should throw if an issuer matching -admin.oktapreview.com is provided", () => {
      expect(
        createInstance({ issuer: "https://foo-admin.oktapreview.com" })
      ).toThrow();
    });

    it("should throw if an issuer matching -admin.okta-emea.com is provided", () => {
      expect(
        createInstance({ issuer: "https://foo-admin.okta-emea.com" })
      ).toThrow();
    });

    it("will not throw if config is valid", () => {
      expect(createInstance(VALID_CONFIG)).not.toThrow();
    });

    it("accepts a restoreOriginalUri method", () => {
      const restoreOriginalUri = jest.fn();
      const config = extendConfig({
        restoreOriginalUri
      });
      const instance = createInstance(config)();
      expect(instance.getOktaConfig().restoreOriginalUri).toBe(restoreOriginalUri);
    });
  });

  it("Adds an environment to oktaAuth's _oktaUserAgent", () => {
    const service = createInstance(VALID_CONFIG)();
    const userAgent = service._oktaUserAgent.getHttpHeader()['X-Okta-User-Agent-Extended'];
    expect(
      userAgent.indexOf(`@okta/okta-angular/${PACKAGE_JSON.version}`)
    ).toBeGreaterThan(-1);
  });

  describe('dependency injection', () => {
    it("Can create the service without a router", () => {
      TestBed.configureTestingModule({
        imports: [OktaAuthModule],
        providers: [
          OktaAuthService,
          {
            provide: OKTA_CONFIG,
            useValue: VALID_CONFIG,
          },
        ],
      });
      const service = TestBed.get(OktaAuthService);
      expect(service.config).toMatchInlineSnapshot(`
        Object {
          "clientId": "foo",
          "issuer": "https://foo",
          "redirectUri": "https://foo",
        }
      `);
      expect(service.options.restoreOriginalUri).toBeUndefined();
    });
    it("If a router is available, it will define `restoreOriginalUri`", () => {
      TestBed.configureTestingModule({
        imports: [
          RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
          OktaAuthModule
        ],
        providers: [
          OktaAuthService,
          {
            provide: OKTA_CONFIG,
            useValue: VALID_CONFIG,
          },
        ],
      });
      const service = TestBed.get(OktaAuthService);
      expect(service.config).toMatchInlineSnapshot(`
        Object {
          "clientId": "foo",
          "issuer": "https://foo",
          "redirectUri": "https://foo",
        }
      `);
      expect(service.options.restoreOriginalUri).toBeTruthy();
      const router = TestBed.get(Router);
      jest.spyOn(router, 'navigateByUrl').mockReturnValue(true);
      service.options.restoreOriginalUri(service, '/foo');
      expect(router.navigateByUrl).toHaveBeenCalledWith('/foo');
    });
  });


  describe("service properties and methods", () => {
    function createService(config?: OktaConfig) {
      config = extendConfig(config || {});
      TestBed.configureTestingModule({
        imports: [OktaAuthModule],
        providers: [
          OktaAuthService,
          {
            provide: OKTA_CONFIG,
            useValue: config,
          },
        ],
      });
      const service = TestBed.get(OktaAuthService);
      jest
        .spyOn(service.token, "getWithRedirect")
        .mockReturnValue(Promise.resolve(undefined));
      jest.spyOn(service.tokenManager, "on").mockReturnValue(undefined);
      return service;
    }

    describe('$authenticationState', () => {
      it('should expose as instance of BehaviorSubject', () => {
        const service = createService(VALID_CONFIG);
        expect(service.$authenticationState).toBeInstanceOf(BehaviorSubject);
      });

      it('should initial with false', () => {
        return new Promise((resolve) => {
          const service = createService(VALID_CONFIG);
          service.$authenticationState.subscribe((state: boolean) => {
            expect(state).toBe(false);
            resolve(undefined);
          });
        });
      });

      it('should update when authState changes from oktaAuth', () => {
        const mockFn = jest.fn();
        return new Promise((resolve) => {
          const service = createService({
            isAuthenticated: jest.fn().mockImplementation(() => Promise.resolve(true))
          });
          service.authStateManager.updateAuthState();
          service.$authenticationState.subscribe((state: boolean) => {
            mockFn(state);
            if (state) {
              resolve(undefined);
            }
          });
        }).then(() => {
          expect(mockFn).toHaveBeenCalledTimes(2);
          expect(mockFn).toHaveBeenNthCalledWith(1, false);
          expect(mockFn).toHaveBeenNthCalledWith(2, true);
        });
      });

      it('should get the last update state when subscribe after state change', () => {
        const mockFn = jest.fn();
        return new Promise((resolve) => {
          const service = createService({
            isAuthenticated: jest.fn().mockImplementation(() => Promise.resolve(true))
          });
          service.authStateManager.updateAuthState();
          // wait on authState update to finish
          setTimeout(() => {
            service.$authenticationState.subscribe((state: boolean) => {
              mockFn(state);
              resolve(undefined);
            });
          }, 100);
        }).then(() => {
          expect(mockFn).toHaveBeenCalledTimes(1);
          expect(mockFn).toHaveBeenNthCalledWith(1, true);
        });
      });
    });

    describe("isAuthenticated", () => {
      it('Will call a custom function if "isAuthenticated" was set on the passed config', async () => {
        jest
          .spyOn(OktaAuthService.prototype, "getAccessToken")
          .mockReturnValue("");
        jest.spyOn(OktaAuthService.prototype, "getIdToken").mockReturnValue("");

        const isAuthenticated = jest
          .fn()
          .mockReturnValue(Promise.resolve("foo"));
        const service = createService({ isAuthenticated });
        const ret = await service.isAuthenticated();
        expect(ret).toBe("foo");
        expect(isAuthenticated).toHaveBeenCalledWith(service);
        expect(OktaAuthService.prototype.getAccessToken).not.toHaveBeenCalled();
        expect(OktaAuthService.prototype.getIdToken).not.toHaveBeenCalled();
      });
    });

    describe("getOktaConfig", () => {
      it("returns config", () => {
        const service = createService(VALID_CONFIG);
        expect(service.getOktaConfig()).toMatchInlineSnapshot(`
          Object {
            "clientId": "foo",
            "issuer": "https://foo",
            "redirectUri": "https://foo",
          }
        `);
      });
    });
  });
});
