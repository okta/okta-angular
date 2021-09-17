import { Injectable, OnDestroy } from '@angular/core';
import { AuthState, OktaAuth } from '@okta/okta-auth-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

const defaultAuthState = {
  isAuthenticated: false
};

export type Groups = string | string[] | { [key: string]: string[] };

@Injectable()
export class OktaAuthStateService implements OnDestroy {
  private _authState: BehaviorSubject<AuthState> = new BehaviorSubject<AuthState>(defaultAuthState);
  
  // only expose readonly property
  public readonly authState$: Observable<AuthState> = this._authState.asObservable();

  constructor(private oktaAuth: OktaAuth) {
    this.updateAuthState = this.updateAuthState.bind(this);

    // set initial authState
    const initialAuthState = this.oktaAuth.authStateManager.getAuthState() || defaultAuthState;
    this._authState.next(initialAuthState);

    // subscribe to future changes
    this.oktaAuth.authStateManager.subscribe(this.updateAuthState);
  }

  ngOnDestroy(): void {
    this.oktaAuth.authStateManager.unsubscribe(this.updateAuthState);
  }

  // Observes as true when any group input can match groups from user claims 
  hasAnyGroups(groups: Groups): Observable<boolean> {
    return this.authState$.pipe(
      mergeMap(async ({ isAuthenticated, idToken }) => {
        // return false when not authenticated or openid is not in scopes
        if (!isAuthenticated || !idToken) {
          return false;
        }

        // transform inputs to consistent object format
        if (typeof groups === 'string') {
          groups = { groups: [groups] };
        }
        if (Array.isArray(groups)) {
          groups = { groups };
        }

        const key = Object.keys(groups)[0];
        const value = groups[key];

        // groups or custom claims is avaiable in idToken
        if (idToken.claims[key]) {
          return value.some((authority: string) => idToken.claims[key].includes(authority));
        }

        // try /userinfo endpoint when thin idToken (no groups claim) is returned
        // https://developer.okta.com/docs/concepts/api-access-management/#tokens-and-scopes
        const userInfo = await this.oktaAuth.getUser();
        if (!userInfo[key]) {
          return false;
        }
        return value.some((authority: string) => userInfo[key].includes(authority));
      })
    );
  }

  private updateAuthState(authState: AuthState): void {
    this._authState.next(authState);
  }
}
