import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart} from '@angular/router';

import { OktaAuthService } from '@okta/okta-angular';
import * as OktaSignIn from '@okta/okta-signin-widget';

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
    baseUrl: 'https://dev-411042.okta.com',
    authParams: {
      pkce: true
    },
    clientId: '0oaxmzfypar0nMlJj4x6',
    redirectUri: 'http://localhost:4200/login/callback'
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
    this.widget.showSignInToGetTokens({
      el: '#okta-signin-container'}).then(
      ({accessToken, idToken}) => {
        const tokenManager = this.authService.tokenManager;
        tokenManager.add('idToken', idToken);
        tokenManager.add('accessToken', accessToken);
        const navigateToUri = this.authService.getOriginalUri();
        window.location.assign(navigateToUri);
      }).catch(
      (err) => {
        console.log(err);
      }
    );
  }
}
