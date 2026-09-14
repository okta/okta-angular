import { toRelativeUri } from '../../lib/client-js/src/to-relative-uri';

describe('toRelativeUri', () => {
  const origin = window.location.origin;

  it('passes a relative path through', () => {
    expect(toRelativeUri('/protected')).toBe('/protected');
  });

  it('keeps the query string and fragment', () => {
    expect(toRelativeUri('/protected?a=1&b=2#frag')).toBe('/protected?a=1&b=2#frag');
  });

  it('reduces an absolute same-origin URL to its path', () => {
    expect(toRelativeUri(`${origin}/protected?a=1#frag`)).toBe('/protected?a=1#frag');
  });

  it('falls back for an off-origin absolute URL', () => {
    expect(toRelativeUri('https://evil.example.com/protected')).toBe('/');
  });

  // `//evil.example.com/x` is protocol-relative: it resolves against the current *protocol*, not the
  // current host, so a naive "starts with /" check would let it through.
  it('falls back for a protocol-relative URL', () => {
    expect(toRelativeUri('//evil.example.com/protected')).toBe('/');
  });

  it('falls back for a non-http scheme', () => {
    expect(toRelativeUri('javascript:alert(1)')).toBe('/');
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['an empty string', ''],
    ['a number', 42],
    ['an object', { originalUri: '/protected' }],
  ])('falls back for %s', (_label, value) => {
    expect(toRelativeUri(value)).toBe('/');
  });

  it('honours a caller-supplied fallback', () => {
    expect(toRelativeUri(undefined, '/home')).toBe('/home');
    expect(toRelativeUri('https://evil.example.com/', '/home')).toBe('/home');
  });
});
