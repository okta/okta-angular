import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  RedirectCommand,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import type { AuthorizationCodeFlowOrchestrator } from '@okta/spa-platform';

import { tokenGuard, loginCallbackGuard } from '../../lib/client-js/src/client-js.guard';
import { CLIENT_JS_ORCHESTRATOR } from '../../lib/client-js/src/models/client-js.config';

function setup(orchestrator: AuthorizationCodeFlowOrchestrator) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: CLIENT_JS_ORCHESTRATOR, useValue: orchestrator },
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
});

describe('loginCallbackGuard', () => {
  let router: Router;

  function setupWithOrchestrator(orchestrator: AuthorizationCodeFlowOrchestrator) {
    setup(orchestrator);
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
