import { TestBed } from '@angular/core/testing';
import type { FetchClient } from '@okta/auth-foundation';

import { oktaFetch } from '../../lib/client-js/src/client-js.fetch';
import { CLIENT_JS_FETCH_CLIENT } from '../../lib/client-js/src/models/client-js.config';

function setup(fetchClient: FetchClient) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [{ provide: CLIENT_JS_FETCH_CLIENT, useValue: fetchClient }],
  });
}

describe('oktaFetch', () => {
  it('forwards resource and init straight to the registered fetchClient.fetch()', async () => {
    const response = { ok: true } as Response;
    const fetch = jest.fn().mockResolvedValue(response);
    setup({ fetch } as unknown as FetchClient);

    const init = { method: 'POST' };
    const res = await TestBed.runInInjectionContext(() => oktaFetch('/api/messages', init));

    expect(fetch).toHaveBeenCalledWith('/api/messages', init);
    expect(res).toBe(response);
  });

  it('works with no init provided', async () => {
    const fetch = jest.fn().mockResolvedValue({ ok: true } as Response);
    setup({ fetch } as unknown as FetchClient);

    await TestBed.runInInjectionContext(() => oktaFetch('/api/messages'));
    expect(fetch).toHaveBeenCalledWith('/api/messages', undefined);
  });
});
