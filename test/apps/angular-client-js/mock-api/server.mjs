/*!
 * Copyright (c) 2017-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/*
 * ============================================================================
 *  NOT PRODUCTION CODE. THIS DOES NOT VERIFY TOKEN SIGNATURES.
 * ============================================================================
 *
 *  A resource server stub, just enough to give `oktaFetch` something real to talk to. It base64url-
 *  decodes the access token's payload and checks `exp` (and `iss`, if `ISSUER` is set) — it does
 *  NOT verify the signature, so ANY well-formed unexpired JWT is accepted, including one you mint
 *  yourself. That is fine for a local harness and catastrophic anywhere else: without signature
 *  verification, an attacker can grant themselves any claim they like.
 *
 *  A real resource server must fetch the authorization server's JWKS and verify the signature,
 *  `aud`, and `iss`. Use `@okta/jwt-verifier` (https://github.com/okta/okta-jwt-verifier-js) or any
 *  JOSE library:
 *
 *    const verifier = new OktaJwtVerifier({ issuer: process.env.ISSUER });
 *    const jwt = await verifier.verifyAccessToken(token, expectedAudience);
 *
 *  Zero dependencies is deliberate: this file must run with plain `node` before any install.
 */

import http from 'node:http';

const PORT = Number(process.env.PORT ?? 8000);

// The app's origin. A wildcard would be simpler but the browser rejects `*` on requests that carry
// credentials-adjacent headers, and being explicit is what a real deployment does anyway.
const APP_ORIGIN = process.env.APP_ORIGIN ?? 'http://localhost:8080';

// Optional: when set, the token's `iss` must match. `prebuild.mjs` reads the same variable.
const EXPECTED_ISSUER = process.env.ISSUER;

const MESSAGES = [
  { id: '1', text: 'I am a robot.', date: '2013-08-01T00:00:00.000Z' },
  { id: '2', text: 'Hello, world!', date: '2013-08-02T00:00:00.000Z' },
  { id: '3', text: 'This message came from a resource server, not the app bundle.', date: '2013-08-03T00:00:00.000Z' }
];

/** Decodes a JWT payload. Returns `null` for anything that isn't a well-formed JWT. */
function decodePayload (token) {
  const parts = token.split('.');

  if (parts.length !== 3) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

/** Returns `null` when the token is acceptable, or a string explaining why it isn't. */
function rejectionReason (authorization) {
  if (!authorization) {
    return 'missing Authorization header';
  }

  const [scheme, token] = authorization.split(' ');

  // The SDK sends `DPoP` instead of `Bearer` when constructed with `dpop: true`. This app doesn't
  // enable DPoP, and validating a DPoP proof is well beyond a stub, so only Bearer is accepted.
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return `expected an "Authorization: Bearer <token>" header, got scheme "${scheme}"`;
  }

  const payload = decodePayload(token);

  if (!payload) {
    return 'token is not a well-formed JWT';
  }

  if (typeof payload.exp !== 'number') {
    return 'token has no `exp` claim';
  }

  if (payload.exp * 1000 <= Date.now()) {
    return `token expired at ${new Date(payload.exp * 1000).toISOString()}`;
  }

  if (EXPECTED_ISSUER && payload.iss !== EXPECTED_ISSUER) {
    return `token \`iss\` is "${payload.iss}", expected "${EXPECTED_ISSUER}"`;
  }

  return null;
}

function send (res, status, body) {
  const json = JSON.stringify(body);

  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(json),
    'Cache-Control': 'no-store'
  });
  res.end(json);
}

const server = http.createServer((req, res) => {
  // CORS. The app is served from :8080 and this server listens on :8000, so every request here is
  // cross-origin and the preflight below is mandatory for the `Authorization` header to be allowed
  // through.
  res.setHeader('Access-Control-Allow-Origin', APP_ORIGIN);
  res.setHeader('Vary', 'Origin');
  // `x-okta-user-agent-extended` is not optional: `APIClient` adds that header to every request it
  // sends, and it is not a CORS-simple header. Omitting it here makes the browser's preflight fail,
  // so the real request is never sent — the app sees a network error and the server logs nothing.
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type, dpop, x-okta-user-agent-extended');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Max-Age', '600');

  // Logged, so a rejected preflight is distinguishable from a request that was never attempted.
  if (req.method === 'OPTIONS') {
    console.log(`204 OPTIONS ${req.url} — preflight for ${req.headers['access-control-request-headers'] ?? '(no headers requested)'}`);
    res.writeHead(204);
    res.end();
    return;
  }

  const { pathname } = new URL(req.url ?? '/', `http://localhost:${PORT}`);

  // Always 500, so the app's error branch is reachable on demand. Checked before auth: the point is
  // a server-side failure on an otherwise valid request.
  if (pathname === '/api/boom') {
    send(res, 500, { error: 'boom', detail: 'This endpoint always fails, on purpose.' });
    return;
  }

  if (pathname === '/api/messages') {
    const reason = rejectionReason(req.headers.authorization);

    if (reason) {
      console.log(`401 ${pathname} — ${reason}`);
      // `WWW-Authenticate` is what a spec-compliant resource server returns on a 401.
      res.setHeader('WWW-Authenticate', `Bearer realm="mock-api", error="invalid_token", error_description="${reason}"`);
      send(res, 401, { error: 'invalid_token', error_description: reason });
      return;
    }

    console.log(`200 ${pathname}`);
    send(res, 200, { messages: MESSAGES });
    return;
  }

  send(res, 404, { error: 'not_found', detail: `No route for ${pathname}` });
});

server.listen(PORT, () => {
  console.log(`mock resource server listening on http://localhost:${PORT}`);
  console.log(`  GET /api/messages  requires "Authorization: Bearer <unexpired JWT>"`);
  console.log(`  GET /api/boom      always 500`);
  console.log(`  CORS origin        ${APP_ORIGIN}`);
  console.log(EXPECTED_ISSUER
    ? `  issuer check       ${EXPECTED_ISSUER}`
    : '  issuer check       disabled (set ISSUER to enable)');
  console.log('  signatures         NOT VERIFIED — local harness only');
});
