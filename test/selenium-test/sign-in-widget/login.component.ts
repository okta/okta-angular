import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart} from '@angular/router';

import { OktaAuthService } from '@okta/okta-angular';
import * as OktaSignIn from '@okta/okta-signin-widget';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-secure',
  template: `
    <!-- Container to inject the Sign-In Widget -->
    <div id="okta-signin-container"></div>
  `
})
export class LoginComponent {
  authService;
  widget = new OktaSignIn({
    el: '#okta-signin-container',
    baseUrl: `https://${environment.yourOktaDomain}`,
    authParams: {
      pkce: true
    },
    clientId: environment.clientId,
    redirectUri: 'http://localhost:9000/login/callback'
  });

  constructor(oktaAuth: OktaAuthService, router: Router) {
    this.authService = oktaAuth;

    // Show the widget when prompted, otherwise remove it from the DOM.
    router.events.forEach(event => {
      if (event instanceof NavigationStart) {
        switch(event.url) {
          case '/login':
            break;
          case '/protected':
            break;
          default:
            this.widget.remove();
            break;
        }
      }
    });
  }

  ngOnInit() {
    this.widget.showSignInAndRedirect().catch(err => {
      throw(err);
    });
  }
}