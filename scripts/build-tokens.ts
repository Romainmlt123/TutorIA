/**
 * Génère src/theme/tokens.generated.ts depuis design/tokens/.
 * Usage : npm run tokens
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { generateTokensModule } from './tokens/generate.ts';

const root = join(import.meta.dirname, '..');
const readJson = (path: string) => JSON.parse(readFileSync(join(root, path), 'utf8'));

const output = generateTokensModule(
  readJson('design/tokens/tokens.json'),
  readJson('design/tokens/app-tokens.json'),
);
const target = join(root, 'src/theme/tokens.generated.ts');
writeFileSync(target, output);
process.stdout.write(`Tokens générés : ${target}\n`);
