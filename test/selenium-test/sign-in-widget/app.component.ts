import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OktaAuth } from '@okta/okta-auth-js';
import { OktaAuthStateService } from '@okta/okta-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  isAuthenticated: boolean;

  constructor(
    private oktaAuth: OktaAuth, 
    private authStateService: OktaAuthStateService, 
    private router: Router
  ) {}

  login() {
    this.oktaAuth.signInWithRedirect({ originalUri: '/profile' });
  }

  async logout() {
    // Terminates the session with Okta and removes current tokens.
    await this.oktaAuth.signOut();
    this.router.navigateByUrl('/');
  }
}
