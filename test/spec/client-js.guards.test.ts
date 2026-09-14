import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  RedirectCommand,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
} from '@angular/router';
import type { AuthorizationCodeFlowOrchestrator } from '@okta/spa-platform';

import { tokenGuard, loginCallbackGuard } from '../../lib/client-js/src/client-js.guard';
import {
  CLIENT_JS_CONFIG,
  CLIENT_JS_ORCHESTRATOR,
  ClientJsAuthConfig,
} from '../../lib/client-js/src/models/client-js.config';

function setup(orchestrator: AuthorizationCodeFlowOrchestrator, config?: Partial<ClientJsAuthConfig>) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: CLIENT_JS_ORCHESTRATOR, useValue: orchestrator },
      ...(config ? [{ provide: CLIENT_JS_CONFIG, useValue: { orchestrator, ...config } }] : []),
    ],
  });
}

function fakeRouteArgs(data: Record<string, unknown> = {}): [ActivatedRouteSnapshot, RouterStateSnapshot] {
  const router = TestBed.inject(Router);
  const state = router.routerState.snapshot;
  const route = state.root;
  route.data = data;
  return [route, state];
}

describe('tokenGuard', () => {
  it('returns true when a token is resolved', async () => {
    const orchestrator = {
      getToken: jest.fn().mockResolvedValue({ accessToken: 'abc' }),
    } as unknown as AuthorizationCodeFlowOrchestrator;
    setup(orchestrator);

    const res = await TestBed.runInInjectionContext(() => tokenGuard(...fakeRouteArgs()));
    expect(res).toBe(true);
  });

  it('returns false when no token is resolved', async () => {
    const orchestrator = {
      getToken: jest.fn().mockResolvedValue(null),
    } as unknown as AuthorizationCodeFlowOrchestrator;
    setup(orchestrator);

    const res = await TestBed.runInInjectionContext(() => tokenGuard(...fakeRouteArgs()));
    expect(res).toBe(false);
  });

  it('forwards route data params to orchestrator.getToken()', async () => {
    const getToken = jest.fn().mockResolvedValue({ accessToken: 'abc' });
    const orchestrator = { getToken } as unknown as AuthorizationCodeFlowOrchestrator;
    setup(orchestrator);

    const params = { scopes: ['openid', 'admin'] };
    await TestBed.runInInjectionContext(() => tokenGuard(...fakeRouteArgs({ clientJs: { params } })));
    expect(getToken).toHaveBeenCalledWith(params);
  });

  it('calls orchestrator.getToken() with undefined when no route data params are set', async () => {
    const getToken = jest.fn().mockResolvedValue({ accessToken: 'abc' });
    const orchestrator = { getToken } as unknown as AuthorizationCodeFlowOrchestrator;
    setup(orchestrator);

    await TestBed.runInInjectionContext(() => tokenGuard(...fakeRouteArgs()));
    expect(getToken).toHaveBeenCalledWith(undefined);
  });

  // In `canMatch` position the first argument is a `Route`, whose `data` is optional - the guard
  // only touches `route.data`, so it works there, but the `?.` is what keeps it from throwing.
  it('works in canMatch position, where the first argument is a Route with no data', async () => {
    const getToken = jest.fn().mockResolvedValue({ accessToken: 'abc' });
    const orchestrator = { getToken } as unknown as AuthorizationCodeFlowOrchestrator;
    setup(orchestrator);

    const route: Route = { path: 'admin' };
    const segments: UrlSegment[] = [new UrlSegment('admin', {})];
    const res = await TestBed.runInInjectionContext(
      // `tokenGuard` is a `CanActivateFn`; this is the shape the router passes in `canMatch`.
      () => (tokenGuard as unknown as (r: Route, s: UrlSegment[]) => Promise<boolean>)(route, segments)
    );

    expect(res).toBe(true);
    expect(getToken).toHaveBeenCalledWith(undefined);
  });

  it('reads route data params in canMatch position', async () => {
    const getToken = jest.fn().mockResolvedValue({ accessToken: 'abc' });
    const orchestrator = { getToken } as unknown as AuthorizationCodeFlowOrchestrator;
    setup(orchestrator);

    const params = { scopes: ['openid', 'admin'] };
    const route: Route = { path: 'admin', data: { clientJs: { params } } };
    await TestBed.runInInjectionContext(
      () => (tokenGuard as unknown as (r: Route, s: UrlSegment[]) => Promise<boolean>)(route, [])
    );

    expect(getToken).toHaveBeenCalledWith(params);
  });
});

describe('loginCallbackGuard', () => {
  let router: Router;

  function setupWithOrchestrator(
    orchestrator: AuthorizationCodeFlowOrchestrator,
    config?: Partial<ClientJsAuthConfig>
  ) {
    setup(orchestrator, config);
    router = TestBed.inject(Router);
  }

  it('calls resumeFlow() with no arguments', async () => {
    const resumeFlow = jest.fn().mockResolvedValue({ originalUri: '/foo' });
    setupWithOrchestrator({ resumeFlow } as unknown as AuthorizationCodeFlowOrchestrator);

    await TestBed.runInInjectionContext(() => loginCallbackGuard(...fakeRouteArgs()));
    expect(resumeFlow).toHaveBeenCalledWith();
  });

  it('redirects to context.originalUri', async () => {
    setupWithOrchestrator({
      resumeFlow: jest.fn().mockResolvedValue({ originalUri: '/foo?bar=baz' }),
    } as unknown as AuthorizationCodeFlowOrchestrator);

    const res = await TestBed.runInInjectionContext(() => loginCallbackGuard(...fakeRouteArgs()));
    expect(res).toBeInstanceOf(RedirectCommand);
    expect((res as RedirectCommand).redirectTo).toEqual(router.parseUrl('/foo?bar=baz'));
  });

  it('falls back to "/" when context has no originalUri', async () => {
    setupWithOrchestrator({
      resumeFlow: jest.fn().mockResolvedValue({}),
    } as unknown as AuthorizationCodeFlowOrchestrator);

    const res = await TestBed.runInInjectionContext(() => loginCallbackGuard(...fakeRouteArgs()));
    expect((res as RedirectCommand).redirectTo).toEqual(router.parseUrl('/'));
  });

  it('reduces an absolute same-origin originalUri to a relative path', async () => {
    setupWithOrchestrator({
      resumeFlow: jest.fn().mockResolvedValue({
        originalUri: `${window.location.origin}/protected?a=1#frag`,
      }),
    } as unknown as AuthorizationCodeFlowOrchestrator);

    const res = await TestBed.runInInjectionContext(() => loginCallbackGuard(...fakeRouteArgs()));
    expect((res as RedirectCommand).redirectTo).toEqual(router.parseUrl('/protected?a=1#frag'));
  });

  it('falls back to "/" for an off-origin originalUri', async () => {
    setupWithOrchestrator({
      resumeFlow: jest.fn().mockResolvedValue({ originalUri: 'https://evil.example.com/protected' }),
    } as unknown as AuthorizationCodeFlowOrchestrator);

    const res = await TestBed.runInInjectionContext(() => loginCallbackGuard(...fakeRouteArgs()));
    expect((res as RedirectCommand).redirectTo).toEqual(router.parseUrl('/'));
  });

  it('falls back to "/" when originalUri is not a string', async () => {
    setupWithOrchestrator({
      resumeFlow: jest.fn().mockResolvedValue({ originalUri: { nope: true } }),
    } as unknown as AuthorizationCodeFlowOrchestrator);

    const res = await TestBed.runInInjectionContext(() => loginCallbackGuard(...fakeRouteArgs()));
    expect((res as RedirectCommand).redirectTo).toEqual(router.parseUrl('/'));
  });

  it('rethrows a resumeFlow() failure when no onLoginCallbackError is configured', async () => {
    const error = new Error('state mismatch');
    setupWithOrchestrator({
      resumeFlow: jest.fn().mockRejectedValue(error),
    } as unknown as AuthorizationCodeFlowOrchestrator);

    await expect(
      TestBed.runInInjectionContext(() => loginCallbackGuard(...fakeRouteArgs()))
    ).rejects.toThrow('state mismatch');
  });

  it('returns whatever onLoginCallbackError returns', async () => {
    const error = new Error('access_denied');
    const onLoginCallbackError = jest.fn().mockReturnValue(false);
    setupWithOrchestrator(
      { resumeFlow: jest.fn().mockRejectedValue(error) } as unknown as AuthorizationCodeFlowOrchestrator,
      { onLoginCallbackError }
    );

    const res = await TestBed.runInInjectionContext(() => loginCallbackGuard(...fakeRouteArgs()));

    expect(onLoginCallbackError).toHaveBeenCalledWith(error);
    expect(res).toBe(false);
  });

  it('awaits an async onLoginCallbackError and runs it in the guard injection context', async () => {
    setupWithOrchestrator(
      {
        resumeFlow: jest.fn().mockRejectedValue(new Error('access_denied')),
      } as unknown as AuthorizationCodeFlowOrchestrator,
      {
        onLoginCallbackError: async () =>
          new RedirectCommand(TestBed.inject(Router).parseUrl('/login/error')),
      }
    );

    const res = await TestBed.runInInjectionContext(() => loginCallbackGuard(...fakeRouteArgs()));
    expect((res as RedirectCommand).redirectTo).toEqual(router.parseUrl('/login/error'));
  });
});

describe('tokenGuard and loginCallbackGuard', () => {
  it('read the same orchestrator instance registered via DI', async () => {
    const getToken = jest.fn().mockResolvedValue({ accessToken: 'abc' });
    const resumeFlow = jest.fn().mockResolvedValue({ originalUri: '/foo' });
    const orchestrator = { getToken, resumeFlow } as unknown as AuthorizationCodeFlowOrchestrator;
    setup(orchestrator);

    await TestBed.runInInjectionContext(() => tokenGuard(...fakeRouteArgs()));
    expect(getToken).toHaveBeenCalled();

    await TestBed.runInInjectionContext(() => loginCallbackGuard(...fakeRouteArgs()));
    expect(resumeFlow).toHaveBeenCalled();
  });
});
