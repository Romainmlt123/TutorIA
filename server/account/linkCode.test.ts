import { generateLinkCode, hmacLinkCode } from './linkCode';

const PEPPER = 'ab'.repeat(32);

function sequence(...values: number[]) {
  let index = 0;
  return (buffer: Uint32Array<ArrayBuffer>) => {
    buffer[0] = values[index] ?? 0;
    index += 1;
    return buffer;
  };
}

describe('generateLinkCode', () => {
  it('gives 6 digits, leading zeros included', () => {
    expect(generateLinkCode(sequence(42))).toBe('000042');
    expect(generateLinkCode()).toMatch(/^\d{6}$/);
  });

  it('draws again above the unbiased limit', () => {
    expect(generateLinkCode(sequence(0xffff_ffff, 482_913))).toBe('482913');
  });

  it('rarely gives the same code twice', () => {
    const codes = new Set(Array.from({ length: 200 }, () => generateLinkCode()));
    expect(codes.size).toBeGreaterThan(195);
  });
});

describe('hmacLinkCode', () => {
  it('never stores the code in clear', async () => {
    const hmac = await hmacLinkCode(PEPPER, '482913');
    expect(hmac).toMatch(/^[0-9a-f]{64}$/);
    expect(hmac).not.toContain('482913');
  });

  it('is stable for a code and changes with the key', async () => {
    expect(await hmacLinkCode(PEPPER, '482913')).toBe(await hmacLinkCode(PEPPER, '482913'));
    expect(await hmacLinkCode(PEPPER, '482913')).not.toBe(
      await hmacLinkCode('cd'.repeat(32), '482913'),
    );
  });
});
