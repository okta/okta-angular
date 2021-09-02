import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { AuthState, OktaAuth } from '@okta/okta-auth-js';
import { 
  OktaAuthModule, 
  OktaAuthStateService, 
  OKTA_CONFIG 
} from '../../src/okta-angular';

function setup(oktaAuth: OktaAuth) {
  TestBed.configureTestingModule({
    imports: [ OktaAuthModule ],
    providers: [{
      provide: OKTA_CONFIG,
      useValue: {
        oktaAuth
      }
    }]
  });
}

describe('OktaAuthStateService', () => {
  let oktaAuth: OktaAuth;
  
  beforeEach(() => {
    oktaAuth = new OktaAuth({
      issuer: 'http://xyz',
      clientId: 'fake clientId',
      redirectUri: 'fake redirectUri'
    });
    oktaAuth.start = jest.fn();
  });

  it('should be created and subscribe to authState change', () => {
    jest.spyOn(oktaAuth.authStateManager, 'subscribe');
    setup(oktaAuth);
    const service: OktaAuthStateService = TestBed.inject(OktaAuthStateService);
    expect(service).toBeTruthy();
    expect(service.authState$).toBeInstanceOf(Observable);
    expect(oktaAuth.authStateManager.subscribe).toHaveBeenCalled();
  });

  it('initials with the current authState of oktaAuth', () => {
    const mockState = { mock: 'mock' } as unknown as AuthState;
    jest.spyOn(oktaAuth.authStateManager, 'getAuthState').mockReturnValue(mockState);
    setup(oktaAuth);
    const service: OktaAuthStateService = TestBed.inject(OktaAuthStateService);
    return new Promise(resolve => {
      service.authState$.subscribe(authState => {
        expect(authState).toBe(mockState);
        resolve(null);
      });
    });
  });

  it('initials with default authState when oktaAuth state is not ready', () => {
    jest.spyOn(oktaAuth.authStateManager, 'getAuthState').mockReturnValue(null as unknown as AuthState);
    setup(oktaAuth);
    const service: OktaAuthStateService = TestBed.inject(OktaAuthStateService);
    return new Promise(resolve => {
      service.authState$.subscribe(authState => {
        expect(authState).toEqual({ isAuthenticated: false });
        resolve(null);
      });
    });
  });

  it('updates with oktaAuth state changes', () => {
    const states = [{ mock1: 'mock1' }, { mock2: 'mock2' }];
    setup(oktaAuth);
    const service: OktaAuthStateService = TestBed.inject(OktaAuthStateService);
    const fn = jest.fn();
    return new Promise(resolve => {
      let calls = 0;
      service.authState$.subscribe(authState => {
        if (++calls === 3) {
          resolve(null);
        }
        fn(authState);
      });
      states.forEach(state => oktaAuth.emitter.emit('authStateChange', state));
    }).then(() => {
      expect(fn).toHaveBeenNthCalledWith(1, { isAuthenticated: false });
      expect(fn).toHaveBeenNthCalledWith(2, states[0]);
      expect(fn).toHaveBeenNthCalledWith(3, states[1]);
    });
  });
});
