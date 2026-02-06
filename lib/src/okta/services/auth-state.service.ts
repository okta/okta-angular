import { Injectable, inject, OnDestroy } from '@angular/core';
import { AuthState, UserClaims } from '@okta/okta-auth-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { OKTA_AUTH } from '../models/okta.config';

const defaultAuthState = {
  isAuthenticated: false
};

export type Groups = string | string[] | { [key: string]: string[] };

@Injectable({ providedIn: 'root' })
export class OktaAuthStateService implements OnDestroy {
  #oktaAuth = inject(OKTA_AUTH);

  #authState: BehaviorSubject<AuthState> = new BehaviorSubject<AuthState>(defaultAuthState);
  
  // only expose readonly property
  public readonly authState$: Observable<AuthState> = this.#authState.asObservable();

  constructor() {
    // set initial authState
    const initialAuthState = this.#oktaAuth.authStateManager.getAuthState() || defaultAuthState;
    this.#authState.next(initialAuthState);

    // subscribe to future changes
    this.#oktaAuth.authStateManager.subscribe(this.#updateAuthState);
  }

  ngOnDestroy(): void {
    this.#oktaAuth.authStateManager.unsubscribe(this.#updateAuthState);
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

        const key = Object.keys(groups)[0] as keyof UserClaims;
        const value = groups[key];

        // groups or custom claims is available in idToken
        if (idToken.claims[key]) {
          return value.some((authority: string) => (idToken.claims[key] as unknown as string[]).includes(authority));
        }

        // try /userinfo endpoint when thin idToken (no groups claim) is returned
        // https://developer.okta.com/docs/concepts/api-access-management/#tokens-and-scopes
        const userInfo = await this.#oktaAuth.getUser();
        if (!userInfo[key]) {
          return false;
        }
        return value.some((authority: string) => (userInfo[key] as unknown as string[]).includes(authority));
      })
    );
  }

  #updateAuthState = (authState: AuthState): void => {
    this.#authState.next(authState);
  }
}
