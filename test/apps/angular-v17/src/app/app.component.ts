import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterOutlet, AsyncPipe],
  template: `
    <button id="home-button" routerLink="/">Home</button>
    @if (!(authStateService.authState$ | async)?.isAuthenticated) {
    <button id="login-button" (click)="login()">Login</button>
    } @else {
    <button id="logout-button" (click)="logout()">Logout</button>
    }
    <button
      id="protected-button"
      routerLink="/protected"
      [queryParams]="{ fooParams: 'foo' }"
    >
      Protected
    </button>
    <button
      id="protected-login-button"
      routerLink="/protected-with-data"
      [queryParams]="{ fooParams: 'foo' }"
    >
      Protected Page w/ custom config
    </button>
    <button id="public-button" routerLink="/public">
      Parent Route (public)
    </button>
    <button id="private-button" routerLink="/public/private">
      Child Route (private)
    </button>
    <button id="1fa-button" routerLink="/public/1fa">
      Step-up Route (1fa)
    </button>
    <button id="2fa-button" routerLink="/public/2fa">
      Step-up Route (2fa)
    </button>
    <button id="group-button" routerLink="/group">Has Group</button>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  readonly oktaAuth = inject(OKTA_AUTH);
  readonly authStateService = inject(OktaAuthStateService);

  login() {
    this.oktaAuth.signInWithRedirect();
  }

  logout() {
    this.oktaAuth.signOut();
  }
}
