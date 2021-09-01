import { Component, OnDestroy, OnInit } from '@angular/core';

import * as OktaSignIn from '@okta/okta-signin-widget';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-secure',
  template: `
    <!-- Container to inject the Sign-In Widget -->
    <div id="okta-signin-container"></div>
  `
})
export class LoginComponent implements OnInit, OnDestroy {
  widget = new OktaSignIn({
    el: '#okta-signin-container',
    baseUrl: `https://${environment.yourOktaDomain}`,
    authParams: {
      pkce: true
    },
    clientId: environment.clientId,
    redirectUri: 'http://localhost:8080/login/callback'
  });

  ngOnInit() {
    this.widget.showSignInAndRedirect().catch(err => {
      throw(err);
    });
  }

  ngOnDestroy() {
    this.widget.remove();
  }
}