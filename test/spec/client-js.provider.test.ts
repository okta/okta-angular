import { EnvironmentProviders, VERSION } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { AuthorizationCodeFlowOrchestrator, SessionLogoutFlow } from '@okta/spa-platform';
// Resolves to test/mocks/spa-platform.ts via `moduleNameMapper` - the real package is ESM-only.
import { addEnv, FetchClient } from '@okta/spa-platform';
import type { FetchClient as FetchClientType } from '@okta/auth-foundation';

import { provideClientJsAuth } from '../../lib/client-js/src/provide-client-js-auth';
import {
  CLIENT_JS_CONFIG,
  CLIENT_JS_FETCH_CLIENT,
  CLIENT_JS_ORCHESTRATOR,
  CLIENT_JS_SIGN_OUT_FLOW,
} from '../../lib/client-js/src/models/client-js.config';

const addEnvMock = addEnv as unknown as jest.Mock;

function orchestratorDouble(): AuthorizationCodeFlowOrchestrator {
  return { getToken: jest.fn(), resumeFlow: jest.fn() } as unknown as AuthorizationCodeFlowOrchestrator;
}

function setup(providers: EnvironmentProviders) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [providers] });
}

describe('provideClientJsAuth', () => {
  it('throws when no orchestrator is passed', () => {
    expect(() => provideClientJsAuth({ orchestrator: undefined as never })).toThrow(
      'No orchestrator passed to provideClientJsAuth.'
    );
  });

  it('provides the orchestrator and the whole config', () => {
    const orchestrator = orchestratorDouble();
    const config = { orchestrator };
    setup(provideClientJsAuth(config));

    expect(TestBed.inject(CLIENT_JS_ORCHESTRATOR)).toBe(orchestrator);
    expect(TestBed.inject(CLIENT_JS_CONFIG)).toBe(config);
  });

  it('defaults fetchClient to a FetchClient built from the orchestrator', () => {
    const orchestrator = orchestratorDouble();
    setup(provideClientJsAuth({ orchestrator }));

    const fetchClient = TestBed.inject(CLIENT_JS_FETCH_CLIENT);
    expect(fetchClient).toBeInstanceOf(FetchClient);
    // `orchestrator` is private on the real class, so reach for it through the stub's shape.
    expect((fetchClient as unknown as { orchestrator: unknown }).orchestrator).toBe(orchestrator);
  });

  it('uses a caller-supplied fetchClient as-is', () => {
    const fetchClient = { fetch: jest.fn() } as unknown as FetchClientType;
    setup(provideClientJsAuth({ orchestrator: orchestratorDouble(), fetchClient }));

    expect(TestBed.inject(CLIENT_JS_FETCH_CLIENT)).toBe(fetchClient);
  });

  it('provides a caller-supplied signOutFlow', () => {
    const signOutFlow = { start: jest.fn() } as unknown as SessionLogoutFlow;
    setup(provideClientJsAuth({ orchestrator: orchestratorDouble(), signOutFlow }));

    expect(TestBed.inject(CLIENT_JS_SIGN_OUT_FLOW)).toBe(signOutFlow);
  });

  it('leaves CLIENT_JS_SIGN_OUT_FLOW undefined when no signOutFlow is passed', () => {
    setup(provideClientJsAuth({ orchestrator: orchestratorDouble() }));

    expect(TestBed.inject(CLIENT_JS_SIGN_OUT_FLOW)).toBeUndefined();
  });

  describe('user agent registration', () => {
    it('registers the package and Angular versions with addEnv()', () => {
      provideClientJsAuth({ orchestrator: orchestratorDouble() });

      const registered: string[] = addEnvMock.mock.calls.flat();
      expect(registered).toContain('@okta/okta-angular/8.0.0');
      expect(registered).toContain(`Angular/${VERSION.full}`);
    });

    // The strings feed a module-level list behind `X-Okta-User-Agent-Extended`; re-registering them
    // on a second call (a second app on the page, or a second spec) would repeat them per request.
    it('registers nothing further on subsequent calls', () => {
      provideClientJsAuth({ orchestrator: orchestratorDouble() });
      const callsAfterFirst = addEnvMock.mock.calls.length;

      provideClientJsAuth({ orchestrator: orchestratorDouble() });
      provideClientJsAuth({ orchestrator: orchestratorDouble() });

      expect(addEnvMock.mock.calls.length).toBe(callsAfterFirst);
    });
  });
});
