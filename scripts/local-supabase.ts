/**
 * Lance une commande (par défaut l'app web) branchée sur Supabase local, sans modifier .env :
 * l'URL et les clés locales sont lues dans `supabase status` et passées en variables d'environnement,
 * prioritaires sur celles de .env.
 * Usage : npm run web:local
 * Supabase local n'est joignable que depuis ce PC : pour un téléphone, utiliser le projet en ligne.
 */
import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';

const status = JSON.parse(
  execFileSync('npx', ['supabase', 'status', '-o', 'json'], { encoding: 'utf8' }),
) as { API_URL?: string; PUBLISHABLE_KEY?: string; SECRET_KEY?: string; MAILPIT_URL?: string };

if (!status.API_URL || !status.PUBLISHABLE_KEY || !status.SECRET_KEY) {
  process.stderr.write('Supabase local est arrêté : npm run db:start.\n');
  process.exit(1);
}

const [command = 'npx', ...args] = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['npx', 'expo', 'start', '--web'];

process.stdout.write(
  `Supabase local : ${status.API_URL} · e-mails : ${status.MAILPIT_URL ?? ''}\n`,
);

const child = spawn(command, args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    EXPO_PUBLIC_BACKEND: 'supabase',
    EXPO_PUBLIC_SUPABASE_URL: status.API_URL,
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY: status.SECRET_KEY,
    // Clé de hachage des codes de liaison, propre à cette base locale et stable d'un lancement à l'autre.
    LINK_CODE_PEPPER: createHash('sha256')
      .update(`tutoria-local:${status.SECRET_KEY}`)
      .digest('hex'),
  },
});
child.on('exit', (code) => process.exit(code ?? 0));
