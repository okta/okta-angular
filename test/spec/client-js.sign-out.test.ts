import { TestBed } from '@angular/core/testing';
import type { AuthorizationCodeFlowOrchestrator, SessionLogoutFlow } from '@okta/spa-platform';

import { signOut } from '../../lib/client-js/src/client-js.sign-out';
import {
  CLIENT_JS_ORCHESTRATOR,
  CLIENT_JS_SIGN_OUT_FLOW,
} from '../../lib/client-js/src/models/client-js.config';
import { navigate } from '../../lib/client-js/src/navigate';

// `window.location` cannot be spied on, so the one module that touches it is mocked wholesale.
jest.mock('../../lib/client-js/src/navigate', () => ({ navigate: jest.fn() }));

const navigateMock = navigate as jest.MockedFunction<typeof navigate>;

interface Doubles {
  revoke: jest.Mock;
  remove: jest.Mock;
  start: jest.Mock;
  selectCredential: jest.Mock;
}

function setup(
  { noIdToken = false, credential = true }: { noIdToken?: boolean; credential?: boolean } = {},
  { withSignOutFlow = true }: { withSignOutFlow?: boolean } = {}
): Doubles {
  const revoke = jest.fn().mockResolvedValue(undefined);
  const remove = jest.fn().mockResolvedValue(undefined);
  const start = jest.fn().mockResolvedValue(new URL('https://okta.example.com/oauth2/v1/logout'));
  const selectCredential = jest.fn().mockResolvedValue(
    credential
      ? { token: { idToken: noIdToken ? undefined : { rawValue: 'raw.id.token' } }, revoke, remove }
      : null
  );

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: CLIENT_JS_ORCHESTRATOR, useValue: { selectCredential } as unknown as AuthorizationCodeFlowOrchestrator },
      ...(withSignOutFlow
        ? [{ provide: CLIENT_JS_SIGN_OUT_FLOW, useValue: { start } as unknown as SessionLogoutFlow }]
        : []),
    ],
  });

  return { revoke, remove, start, selectCredential };
}

const run = () => TestBed.runInInjectionContext(() => signOut());
const runWith = (options: Parameters<typeof signOut>[0]) =>
  TestBed.runInInjectionContext(() => signOut(options));

describe('signOut', () => {
  beforeEach(() => navigateMock.mockClear());

  it('revokes the credential and navigates to the logout URL', async () => {
    const { revoke, remove, start } = setup();

    await run();

    expect(revoke).toHaveBeenCalledWith('ALL');
    expect(remove).not.toHaveBeenCalled();
    expect(start).toHaveBeenCalledWith('raw.id.token');
    expect(navigateMock).toHaveBeenCalledWith(new URL('https://okta.example.com/oauth2/v1/logout'));
  });

  it('only removes the credential locally when revokeTokens is false', async () => {
    const { revoke, remove, start } = setup();

    await runWith({ revokeTokens: false });

    expect(remove).toHaveBeenCalled();
    expect(revoke).not.toHaveBeenCalled();
    // Local-only removal still performs RP-initiated logout - the Okta session is separate state.
    expect(start).toHaveBeenCalledWith('raw.id.token');
  });

  // The raw id_token has to be read off the credential *before* it is cleared, or there is nothing
  // left to build the `end_session_endpoint` request with.
  it('reads the id_token before clearing the credential', async () => {
    const order: string[] = [];
    const { revoke, start } = setup();
    revoke.mockImplementation(() => {
      order.push('revoke');
      return Promise.resolve();
    });
    start.mockImplementation((idToken: string) => {
      order.push(`start:${idToken}`);
      return Promise.resolve(new URL('https://okta.example.com/oauth2/v1/logout'));
    });

    await run();

    expect(order).toEqual(['revoke', 'start:raw.id.token']);
  });

  it('clears local state but does not navigate when the credential has no id_token', async () => {
    const { revoke, start } = setup({ noIdToken: true });

    await run();

    expect(revoke).toHaveBeenCalledWith('ALL');
    expect(start).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('is a no-op when there is no credential at all', async () => {
    const { revoke, remove, start } = setup({ credential: false });

    await run();

    expect(revoke).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(start).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('throws when no signOutFlow was provided', async () => {
    const { selectCredential } = setup({}, { withSignOutFlow: false });

    await expect(run()).rejects.toThrow(
      'No signOutFlow available. Pass a `SessionLogoutFlow` to provideClientJsAuth() to use signOut().'
    );
    // It fails before touching any credential state, so nothing is half-cleared.
    expect(selectCredential).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
