import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthSdkError, OktaAuth } from '@okta/okta-auth-js';
import { OktaAuthModule, OKTA_AUTH } from '../../lib/src/okta-angular';

jest.mock('../../lib/src/okta/packageInfo', () => ({
  __esModule: true,
  default: {
    authJSMinSupportedVersion: '5.3.1',
    version: '99.9.9',
    name: '@okta/okta-angular',
  }
}));

@Component({ template: '' })
class MockComponent {}

function setupForRoot(oktaAuth: OktaAuth) {
  TestBed.configureTestingModule({
    imports: [
      RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
      OktaAuthModule.forRoot({ oktaAuth })
    ],
    declarations: [ MockComponent ],
  });
  return TestBed.createComponent(MockComponent);
}


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
        setupForRoot(oktaAuth);
        expect(() => TestBed.get(OKTA_AUTH)).not.toThrow();
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
        setupForRoot(oktaAuth);
        expect(() => TestBed.get(OKTA_AUTH)).toThrow(new AuthSdkError(`Passed in oktaAuth is not compatible with the SDK, minimum supported okta-auth-js version is 5.3.1.`));
      });
      
    });

    describe('Okta User Agent tracking', () => {
      it('adds sdk environment to oktaAuth instance', () => {
        setupForRoot(oktaAuth);
        TestBed.get(OKTA_AUTH);
        expect(oktaAuth._oktaUserAgent.addEnvironment).toHaveBeenCalledWith('@okta/okta-angular/99.9.9');
      });
      it('throws if _oktaUserAgent is not exist', () => {
        oktaAuth = {
          ...oktaAuth,
          _oktaUserAgent: null
        } as unknown as OktaAuth;
        setupForRoot(oktaAuth);
        expect(() => TestBed.get(OKTA_AUTH)).toThrow(new AuthSdkError(`Passed in oktaAuth is not compatible with the SDK, minimum supported okta-auth-js version is 5.3.1.`));
      });
    });
  
    describe('default restoreOriginalUri', () => {
      it('sets default restoreOriginalUri', () => {
        setupForRoot(oktaAuth);
        const injectedOktaAuth = TestBed.get(OKTA_AUTH);
        expect(injectedOktaAuth.options.restoreOriginalUri).toBeDefined();
      });
    });
  
    describe('Start service', () => {
      it('starts service', () => {
        setupForRoot(oktaAuth);
        TestBed.get(OKTA_AUTH);
        expect(oktaAuth.start).toHaveBeenCalled();
      });
    });
  });

});