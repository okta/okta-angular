
  export const environment = {
    production: 'true',
    appBaseHref: '/',
    oidc: {
      clientId: '0oa1h1007bN3zW0o35d6',
      issuer: 'https://dev-6839150.okta.com/oauth2/default',
      redirectUri: '/login/callback',
      scopes: ['openid', 'profile', 'email', 'groups'],
      pkce: true,
    },
    resourceServer: {
      messagesUrl: 'http://localhost:8000/api/messages',
    }
  };
  