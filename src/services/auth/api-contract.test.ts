import {
  formatLinkCode,
  isLinkCodeExpired,
  isLinkCodeFormat,
  normalizeLinkCode,
} from './api-contract';

describe('link code format', () => {
  it('keeps the digits only', () => {
    expect(normalizeLinkCode(' 482 913 ')).toBe('482913');
    expect(normalizeLinkCode('482-9131234')).toBe('482913');
  });

  it('accepts exactly 6 digits', () => {
    expect(isLinkCodeFormat('482913')).toBe(true);
    expect(isLinkCodeFormat('48291')).toBe(false);
    expect(isLinkCodeFormat('48291a')).toBe(false);
  });

  it('displays the code in two groups', () => {
    expect(formatLinkCode('482913')).toBe('482 913');
  });

  it('expires at the exact deadline', () => {
    const expiresAt = '2026-09-29T10:00:00.000Z';
    expect(isLinkCodeExpired(expiresAt, new Date('2026-09-29T09:59:59.000Z'))).toBe(false);
    expect(isLinkCodeExpired(expiresAt, new Date('2026-09-29T10:00:00.000Z'))).toBe(true);
  });
});
