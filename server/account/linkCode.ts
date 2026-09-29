const CODE_SPACE = 1_000_000;
// Plus grand multiple de 10^6 sous 2^32 : au-delà, le tirage recommence (pas de biais du modulo).
const UNBIASED_LIMIT = Math.floor(0x1_0000_0000 / CODE_SPACE) * CODE_SPACE;

type RandomFill = (buffer: Uint32Array<ArrayBuffer>) => Uint32Array<ArrayBuffer>;

const secureFill: RandomFill = (buffer) => crypto.getRandomValues(buffer);

/** Code de liaison à 6 chiffres, tiré uniformément par un générateur cryptographique. */
export function generateLinkCode(fill: RandomFill = secureFill): string {
  const buffer = new Uint32Array(1);
  for (;;) {
    const value = fill(buffer)[0] ?? UNBIASED_LIMIT;
    if (value < UNBIASED_LIMIT) return String(value % CODE_SPACE).padStart(6, '0');
  }
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

/**
 * Empreinte HMAC-SHA-256 du code, seule forme stockée en base.
 * Sans la clé LINK_CODE_PEPPER (serveur), une fuite de la base ne permet pas de retrouver les codes.
 */
export async function hmacLinkCode(pepperHex: string, code: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    hexToBytes(pepperHex),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(code));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
