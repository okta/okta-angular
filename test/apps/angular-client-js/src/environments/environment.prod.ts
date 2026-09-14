
  export const environment = {
    production: 'true',
    appBaseHref: '/',
    oidc: {
      clientId: '0oapmwm72082GXal14x6',
      issuer: 'https://samples-javascript.okta.com/oauth2/default',
      redirectUri: '/login/callback',
      postLogoutRedirectUri: '/',
      scopes: ['openid', 'profile', 'email'],
    },
    resourceServer: {
      messagesUrl: 'http://localhost:8000/api/messages',
      boomUrl: 'http://localhost:8000/api/boom',
    },
  };
