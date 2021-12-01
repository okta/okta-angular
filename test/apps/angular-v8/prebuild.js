const fs = require('fs');
const path = require('path');
// eslint-disable-next-line node/no-unpublished-require
require('../../../env'); // set environment variables

const getContent = (env, isProd) => {
  return `
  export const environment = {
    production: '${isProd}',
    appBaseHref: '/',
    oidc: {
      clientId: '${env.CLIENT_ID}',
      issuer: '${env.ISSUER}',
      redirectUri: '/login/callback',
      scopes: ['openid', 'profile', 'email', 'groups'],
      pkce: true,
    },
    resourceServer: {
      messagesUrl: 'http://localhost:8000/api/messages',
    }
  };
  `;
};

const getFilePath = isProd => 
  path.resolve(
    __dirname, 
    'src', 
    'environments', 
    isProd ? 'environment.prod.ts' : 'environment.ts'
  );

const env = {};
// List of environment variables made available to the app
[
  'ISSUER',
  'CLIENT_ID'
].forEach(function (key) {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} must be set. See README.md`);
  }
  env[key] = process.env[key];
});

fs.writeFileSync(getFilePath(false), getContent(env, false));
fs.writeFileSync(getFilePath(true), getContent(env, true));
