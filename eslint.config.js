const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

// Couleurs en dur : hexadécimal, rgb(a), hsl(a).
const COLOR_LITERAL = '/^(#[0-9a-fA-F]{3,8}$|rgba?\\(|hsla?\\()/';

module.exports = defineConfig([
  expoConfig,
  prettierRecommended,
  {
    ignores: ['dist/*', '.expo/*', 'coverage/*', 'design/*', 'assets/*', 'expo-env.d.ts'],
  },
  {
    // Frontière app / serveur : la clé et le SDK OpenAI ne vivent que côté serveur.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/app/api/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@server/*', '**/server/*', 'openai', 'openai/*'],
              message:
                "Code serveur interdit dans l'app : passer par src/services/tutor (voir CLAUDE.md).",
            },
          ],
        },
      ],
    },
  },
  {
    // Design system strict : toutes les couleurs passent par le thème.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/theme/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: `Literal[value=${COLOR_LITERAL}]`,
          message: 'Couleur en dur interdite : utiliser theme.colors ou theme.palette.',
        },
        {
          selector: `TemplateElement[value.raw=${COLOR_LITERAL}]`,
          message: 'Couleur en dur interdite : utiliser theme.colors ou theme.palette.',
        },
        {
          selector:
            "MemberExpression[object.object.name='process'][object.property.name='env'][property.name=/^(OPENAI_|SUPABASE_SECRET_KEY|LINK_CODE_PEPPER|SEED_)/]",
          message:
            'Secrets réservés au serveur (server/env.ts) : OPENAI_*, SUPABASE_SECRET_KEY, LINK_CODE_PEPPER, SEED_*.',
        },
      ],
    },
  },
  {
    // Scènes 3D (React Three Fiber) : les éléments JSX sont des objets three.js (mesh, args, position…),
    // inconnus de la règle React DOM.
    files: ['src/features/explorer/hd2d/**/*.tsx', 'src/features/explorer/dev/**/*.tsx'],
    rules: { 'react/no-unknown-property': 'off' },
  },
]);
