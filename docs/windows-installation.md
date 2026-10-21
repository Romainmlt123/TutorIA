# Développer Tutor'IA sous Windows : guide pour un agent de code

**Pour qui :** une IA de code (ou une personne) qui travaille sur Windows pour Romain, sans contexte.
**À lire avec :** `CLAUDE.md` (conventions, elles font foi) et `docs/explorer-passation.md` (le chantier Explorer).
**Honnêteté :** ce guide a été écrit depuis Linux. Les commandes Windows ci-dessous sont déduites des scripts du dépôt et n'ont **pas** été exécutées sur Windows. Si une commande échoue, le dire à Romain et corriger ce guide.

---

## 1. Ce qui marche tel quel, et ce qui demande bash

Le dépôt est écrit pour bash (Linux, macOS).

| Commande                                                                                                | Windows                                                                |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `npm start`, `npm run web`, `npm run android`, `npm run start:tunnel`                                   | marche dans PowerShell, cmd ou Git Bash                                |
| `npm run check` (lint, types, tests), `npm run lint`, `npm run typecheck`, `npm test`, `npm run format` | marche partout                                                         |
| `npm run tokens`, `npm run explorer:clean`, `npm run monitor`, `npm run db:seed`, `npm run web:local`   | marche partout (Node 24 exécute directement les `.ts`)                 |
| `npm run db:*` (Supabase local)                                                                         | marche, mais demande Docker Desktop (inutile en mode simulé)           |
| `npm run start:labo`, `npm run start:labo:tunnel`                                                       | **bash seulement** : `mkdir -p`, `$HOME` et `VARIABLE=valeur commande` |
| `npm run explorer:layout`, `npm run explorer:models`, `npm run avatar:model`                            | **bash seulement** (variables d'environnement avant la commande)       |
| Les commandes Blender de `docs/explorer-passation.md` § 5                                               | **bash seulement**                                                     |

**Règle simple : travailler dans Git Bash** (installé avec Git for Windows) ou dans WSL. Tout ce guide suppose Git Bash. Dans PowerShell, `EXPO_PUBLIC_BACKEND=mock npm start` ne marche pas : écrire `$env:EXPO_PUBLIC_BACKEND="mock"; npm start`.

---

## 2. Installation de la machine

1. **Git for Windows.** Puis, une fois : `git config --global core.autocrlf false` (ne jamais laisser Git convertir les fins de ligne : Prettier et ESLint attendent du LF).
2. **Node 24.13.0 et npm 11** (fixés par `.nvmrc`, `engines` et `eas.json` : npm 10 refuse le fichier de verrouillage produit par npm 11). Avec nvm-windows : `nvm install 24.13.0`, `nvm use 24.13.0`, puis `npm install -g npm@11`. Vérifier : `node -v` donne `v24.13.0`.
3. **Visual Studio Code** (et l'extension Claude Code si l'agent y travaille).
4. **Seulement pour refaire des rendus 3D :**
   - **Blender 5.2.2**, dossier ajouté au `PATH` pour que `blender --version` marche dans Git Bash ;
   - **Python 3**, puis `pip install pillow` (découpe des tuiles) ;
   - la machine de Romain a une GTX 1660 Super : Cycles pourrait rendre sur GPU, mais les scripts imposent `cycles.device = "CPU"` (`tools/explorer-3d/region_tiles.py`, `tools/explorer-3d/lib/bake.py`). Un choix par variable d'environnement serait une petite modification, à faire seulement si Romain le demande.
5. **Docker Desktop** seulement pour Supabase en local. Le mode simulé n'en a pas besoin.

---

## 3. Récupérer le code et lancer l'app

Dans Git Bash :

```bash
git clone https://github.com/Romainmlt123/TutorIA.git
cd TutorIA
git fetch origin
git switch --no-track -c explorer/<nom-de-la-branche> origin/explorer/rendu-v2
npm ci
EXPO_PUBLIC_BACKEND=mock EXPO_PUBLIC_TUTOR_MODE=mock npm start
```

- **Quelle branche ?** Le travail d'Explorer est sur `explorer/rendu-v2`, pas sur `main` ni `dev`. Pour le reste de l'app, partir de `dev` (`origin/dev`). Voir `CLAUDE.md` § 7 pour les règles git : jamais de commit direct sur `main` ni `dev`, jamais de force push, jamais de fusion par l'agent, rien d'envoyé sans la demande de Romain.
- **Mode simulé obligatoire** tant que Romain n'a pas dit le contraire : comptes en mémoire (`lea@tutoria.test`, `claire@tutoria.test`, `hugo@tutoria.test`, n'importe quel mot de passe non vide), aucune écriture dans Supabase.
- **`.env` :** il n'est pas dans git (et ne doit jamais l'être). Sans `.env`, l'app passe seule en mode simulé. Ne jamais demander ni écrire de clé (OpenAI, Supabase) dans le dépôt, un message ou un fichier.
- **Web :** `EXPO_PUBLIC_BACKEND=mock npm run web`, puis ouvrir en largeur 390 px (F12, puis Ctrl+Maj+M). Si l'app semble parler au vrai Supabase alors que la variable dit `mock`, relancer avec le cache vidé : `npx expo start --web -c` (Metro garde en cache les variables `EXPO_PUBLIC_*`).
- **Téléphone, Expo Go :** `npm start` et scanner le QR code. Si l'écran affiche « Failed to download remote update », le Wi-Fi isole les appareils : utiliser `npm run start:tunnel`. Sous Windows, il n'y a pas de réglage `inotify` à faire (c'est une limite de Linux).
- **Variante Labo** (à côté de l'app principale dans Expo Go, port 8082) : `npm run start:labo:tunnel`, depuis Git Bash. Jamais de `npm run update:preview` depuis une copie Labo.

---

## 4. Pièges propres à Windows

- **Fins de ligne :** tout le dépôt est en LF. Si Prettier signale des centaines de fichiers, c'est du CRLF : `git config core.autocrlf false`, puis `npx prettier --write .` sur la copie de travail, jamais sur un autre dossier. Un `.gitattributes` avec `* text=auto eol=lf` réglerait le problème à la source (à proposer à Romain).
- **Chemins :** les scripts et tests utilisent des `/`. Ne pas écrire de chemins avec `\` dans le code ; passer par `path.join` ou `path.posix`. Les alias d'import sont `@/…` (= `src/`).
- **Chemins longs :** si `npm ci` ou git échoue sur un chemin trop long, `git config --global core.longpaths true`, et cloner près de la racine (`C:\dev\TutorIA`), pas dans OneDrive ni Bureau.
- **Antivirus et OneDrive :** exclure le dossier du projet de OneDrive et, si possible, de la surveillance en temps réel de l'antivirus : `node_modules` compte des dizaines de milliers de fichiers.
- **Hooks git :** `husky` installe un hook pre-commit (`lint-staged` puis `npm run typecheck`) lancé par `npm ci`. Il passe par `sh` : Git for Windows le fournit. Ne jamais le contourner avec `--no-verify`.
- **Tests :** `npm run check` doit passer. Exception connue : `src/components/ConfirmDialog.test.tsx` peut dépasser son délai de 20 s quand toute la suite tourne sur une petite machine ; il passe seul. Ne pas le modifier.
- **Blender sous Windows :** le dossier de sortie des rendus doit être hors du dépôt ; utiliser `EXPLORER_TILES_LOG` (la sortie standard de Blender en tâche de fond peut perdre ses messages), `--python-exit-code 1`, puis supprimer les `__pycache__` de `tools/explorer-3d/`.
- **Modules natifs :** ajouter un paquet avec `npx expo install <paquet>`, jamais `npm install` pour un module natif (versions compatibles avec le SDK 57).

---

## 5. Avant chaque commit

1. `npm run check` au vert (lint, types, tests).
2. Aucune couleur, taille ou texte en dur hors de `src/theme/` et `src/i18n/fr.ts`.
3. Messages au format Conventional Commits, petits commits, un sujet par commit.
4. Pour les rendus Explorer : montrer à Romain les images avant/après, et respecter les budgets du `docs/explorer-passation.md` § 3.5.
5. Ne jamais commiter ni pousser sans que Romain l'ait demandé ; ouvrir la pull request vers la branche d'origine, vérifier la CI (`gh pr checks`), laisser Romain fusionner.

---

## 6. Parler à Romain

Romain écrit en français : lui répondre en français, avec des phrases courtes, en disant clairement ce qui a été vérifié et ce qui ne l'a pas été.
