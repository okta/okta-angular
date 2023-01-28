import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { AuthState, OktaAuth, UserClaims } from '@okta/okta-auth-js';
import { 
  OktaAuthModule, 
  OktaAuthStateService
} from '../../src/okta-angular';

function setup(oktaAuth: OktaAuth) {
  TestBed.configureTestingModule({
    imports: [
      OktaAuthModule.forRoot({oktaAuth})
    ]
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
    const service: OktaAuthStateService = TestBed.get(OktaAuthStateService);
    expect(service).toBeTruthy();
    expect(service.authState$).toBeInstanceOf(Observable);
    expect(oktaAuth.authStateManager.subscribe).toHaveBeenCalled();
  });

  it('initials with the current authState of oktaAuth', () => {
    const mockState = { mock: 'mock' } as unknown as AuthState;
    jest.spyOn(oktaAuth.authStateManager, 'getAuthState').mockReturnValue(mockState);
    setup(oktaAuth);
    const service: OktaAuthStateService = TestBed.get(OktaAuthStateService);
    return new Promise(resolve => {
      service.authState$.subscribe(authState => {
        expect(authState).toBe(mockState);
        resolve(undefined);
      });
    });
  });

  it('initials with default authState when oktaAuth state is not ready', () => {
    jest.spyOn(oktaAuth.authStateManager, 'getAuthState').mockReturnValue(null as unknown as AuthState);
    setup(oktaAuth);
    const service: OktaAuthStateService = TestBed.get(OktaAuthStateService);
    return new Promise(resolve => {
      service.authState$.subscribe(authState => {
        expect(authState).toEqual({ isAuthenticated: false });
        resolve(undefined);
      });
    });
  });

  it('updates with oktaAuth state changes', () => {
    const states = [{ mock1: 'mock1' }, { mock2: 'mock2' }];
    setup(oktaAuth);
    const service: OktaAuthStateService = TestBed.get(OktaAuthStateService);
    const fn = jest.fn();
    return new Promise(resolve => {
      let calls = 0;
      service.authState$.subscribe(authState => {
        if (++calls === 3) {
          resolve(undefined);
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

  describe('hasAnyGroups', () => {
    describe('isAuthenticated === false', () => {
      it('observes false result', () => {
        jest.spyOn(oktaAuth.authStateManager, 'getAuthState').mockReturnValue({ isAuthenticated: false } as AuthState);
        setup(oktaAuth);
        const service: OktaAuthStateService = TestBed.get(OktaAuthStateService);
        return new Promise(resolve => {
          service.hasAnyGroups(['mock']).subscribe(result => {
            expect(result).toEqual(false);
            resolve(undefined);
          });
        });
      });
    });

    describe('idToken not exist', () => {
      it('observes false result', () => {
        jest.spyOn(oktaAuth.authStateManager, 'getAuthState').mockReturnValue({ idToken: undefined } as AuthState);
        setup(oktaAuth);
        const service: OktaAuthStateService = TestBed.get(OktaAuthStateService);
        return new Promise(resolve => {
          service.hasAnyGroups(['mock']).subscribe(result => {
            expect(result).toEqual(false);
            resolve(undefined);
          });
        });
      });
    });

    describe('isAuthenticated === true and idToken exist', () => {
      describe('has groups claim', () => {
        let service: OktaAuthStateService;
        beforeEach(() => {
          jest.spyOn(oktaAuth.authStateManager, 'getAuthState')
            .mockReturnValue({ 
              isAuthenticated: true,
              idToken: { 
                claims: {
                  groups: ['test']
                } 
              }
            } as unknown as AuthState);
          setup(oktaAuth);
          service = TestBed.get(OktaAuthStateService);
        });

        describe('can verify with string input', () => {
          it('observes true when groups match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups('test').subscribe(result => {
                expect(result).toEqual(true);
                resolve(undefined);
              });
            });
          });
          it('observes false when groups not match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups('non-exist-group').subscribe(result => {
                expect(result).toEqual(false);
                resolve(undefined);
              });
            });
          });
        });
        describe('can verify with array input', () => {
          it('observes true when groups match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups(['test']).subscribe(result => {
                expect(result).toEqual(true);
                resolve(undefined);
              });
            });
          });
          it('observes false when groups not match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups(['non-exist-group']).subscribe(result => {
                expect(result).toEqual(false);
                resolve(undefined);
              });
            });
          });
        });
        describe('can verify with object input', () => {
          it('observes true when groups match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups({ groups: ['test'] }).subscribe(result => {
                expect(result).toEqual(true);
                resolve(undefined);
              });
            });
          });
          it('observes false when groups not match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups({ groups: ['non-exist-group'] }).subscribe(result => {
                expect(result).toEqual(false);
                resolve(undefined);
              });
            });
          });
        });
      });

      describe('has custom claims', () => {
        let service: OktaAuthStateService;
        beforeEach(() => {
          jest.spyOn(oktaAuth.authStateManager, 'getAuthState')
            .mockReturnValue({ 
              isAuthenticated: true,
              idToken: { 
                claims: {
                  'custom-groups': ['test']
                } 
              }
            } as unknown as AuthState);
          jest.spyOn(oktaAuth, 'getUser').mockResolvedValue({
            'custom-groups': ['test']
          } as unknown as UserClaims);
          setup(oktaAuth);
          service = TestBed.get(OktaAuthStateService);
        });
        describe('can verify with object input', () => {
          it('observes true when groups match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups({ 'custom-groups': ['test'] }).subscribe(result => {
                expect(result).toEqual(true);
                resolve(undefined);
              });
            });
          });
          it('observes false when groups not match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups({ 'custom-groups': ['non-exist-group'] }).subscribe(result => {
                expect(result).toEqual(false);
                resolve(undefined);
              });
            });
          });
        });
        it('fails with array input', () => {
          return new Promise(resolve => {
            service.hasAnyGroups(['test']).subscribe(result => {
              expect(result).toEqual(false);
              resolve(undefined);
            });
          });
        });
        it('fails with string input', () => {
          return new Promise(resolve => {
            service.hasAnyGroups('test').subscribe(result => {
              expect(result).toEqual(false);
              resolve(undefined);
            });
          });
        });
      });

      describe('has thin idToken (groups claim not in idToken)', () => {
        let service: OktaAuthStateService;
        beforeEach(() => {
          jest.spyOn(oktaAuth.authStateManager, 'getAuthState')
            .mockReturnValue({ 
              isAuthenticated: true,
              idToken: {
                claims: {}
              }
            } as unknown as AuthState);
          jest.spyOn(oktaAuth, 'getUser').mockResolvedValue({
            groups: ['test']
          } as unknown as UserClaims);
          setup(oktaAuth);
          service = TestBed.get(OktaAuthStateService);
        });

        it('calls oktaAuth.getUser()', () => {
          return new Promise(resolve => {
            service.hasAnyGroups('test').subscribe(() => {
              expect(oktaAuth.getUser).toHaveBeenCalled();
              resolve(undefined);
            });
          });
        });

        describe('can verify with string input', () => {
          it('observes true when groups match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups('test').subscribe(result => {
                expect(result).toEqual(true);
                resolve(undefined);
              });
            });
          });
          it('observes false when groups not match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups('non-exist-group').subscribe(result => {
                expect(result).toEqual(false);
                resolve(undefined);
              });
            });
          });
        });
        describe('can verify with array input', () => {
          it('observes true when groups match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups(['test']).subscribe(result => {
                expect(result).toEqual(true);
                resolve(undefined);
              });
            });
          });
          it('observes false when groups not match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups(['non-exist-group']).subscribe(result => {
                expect(result).toEqual(false);
                resolve(undefined);
              });
            });
          });
        });
        describe('can verify with object input', () => {
          it('observes true when groups match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups({ groups: ['test'] }).subscribe(result => {
                expect(result).toEqual(true);
                resolve(undefined);
              });
            });
          });
          it('observes false when groups not match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups({ groups: ['non-exist-group'] }).subscribe(result => {
                expect(result).toEqual(false);
                resolve(undefined);
              });
            });
          });
        });
      });

    });
  });
});
