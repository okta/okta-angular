
  export const environment = {
    production: 'true',
    appBaseHref: '/',
    oidc: {
      clientId: '0oapmwm72082GXal14x6',
      issuer: 'https://samples-javascript.okta.com/oauth2/default',
      redirectUri: '/login/callback',
      scopes: ['openid', 'profile', 'email', 'groups'],
      pkce: true,
    },
    resourceServer: {
      messagesUrl: 'http://localhost:8000/api/messages',
    },
    asyncOktaConfig: false,
  };
  