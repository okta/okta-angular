
  export const environment = {
    production: 'true',
    appBaseHref: '/',
    oidc: {
      clientId: '0oa22vth7m0Gcu26T1d7',
      issuer: 'https://jperreault-test.oktapreview.com/oauth2/default',
      redirectUri: '/login/callback',
      scopes: ['openid', 'profile', 'email', 'groups'],
      pkce: true,
    },
    resourceServer: {
      messagesUrl: 'http://localhost:8000/api/messages',
    },
    asyncOktaConfig: false,
  };
  