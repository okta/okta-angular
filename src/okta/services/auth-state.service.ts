import { Injectable, OnDestroy } from '@angular/core';
import { AuthState, OktaAuth } from '@okta/okta-auth-js';
import { BehaviorSubject, Observable } from 'rxjs';

const defaultAuthState = {
  isAuthenticated: false
};

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

  private updateAuthState(authState: AuthState): void {
    this._authState.next(authState);
  }
}
