import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
// eslint-disable-next-line node/no-unpublished-import
import '../../../env.cjs'; // set environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// `redirectUri` / `postLogoutRedirectUri` stay relative here and are made absolute in
// `app.config.ts`. `AuthorizationCodeFlow` runs `new URL(redirectUri)` with no base, so a relative
// value would throw `Invalid URL` at construction time.
//
// There is no `pkce` flag: `AuthorizationCodeFlow` is always PKCE.
const getContent = (env) => {
  return `
  export const environment = {
    oidc: {
      clientId: '${env.CLIENT_ID}',
      issuer: '${env.ISSUER}',
      redirectUri: '/login/callback',
      postLogoutRedirectUri: '/',
      scopes: ['openid', 'profile', 'email'],
    },
    resourceServer: {
      messagesUrl: 'http://localhost:8000/api/messages',
      boomUrl: 'http://localhost:8000/api/boom',
    },
  };
  `;
};

const filePath = path.resolve(__dirname, 'src', 'environments', 'environment.ts');

const env = {};
// List of environment variables made available to the app
[
  'ISSUER',
  'CLIENT_ID',
].forEach(function (key) {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} must be set. See README.md`);
  }
  env[key] = process.env[key];
});

fs.writeFileSync(filePath, getContent(env));
