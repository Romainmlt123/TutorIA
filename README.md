# Tutor'IA

Compagnon de révision scolaire par IA, du primaire au lycée. L'élève dialogue avec un tuteur IA, à l'écrit ou à la voix, révise avec des flashcards et suit sa progression (séries, XP, niveaux). Ses parents suivent son travail dans un espace sobre, sans jamais voir ses messages.

Mobile d'abord (iOS et Android), avec le même code pour le web. Données et comptes : Supabase (région UE).

## Écrans

**Entrée dans l'app**

| Écran                                     | Route                                                          | Maquette                                    |
| ----------------------------------------- | -------------------------------------------------------------- | ------------------------------------------- |
| L1 · Choix du profil                      | `/bienvenue`                                                   | `design/screens/L1-Connexion-Choix.dc.html` |
| L2 · Connexion élève                      | `/connexion/eleve`                                             | `L2-Connexion-Eleve.dc.html`                |
| L3 · Connexion parent                     | `/connexion/parent`                                            | `L3-Connexion-Parent.dc.html`               |
| L4 · Inscription parent                   | `/inscription/parent`                                          | `L4-Inscription-Parent.dc.html`             |
| L5 et L6 · Ajout d'un enfant, code        | `/parents/enfant`                                              | `L5-…-Enfant.dc.html`, `L6-…-Code.dc.html`  |
| E1 · Inscription élève                    | `/inscription/eleve`                                           | `E1-Inscription-Eleve.dc.html`              |
| Code reçu par e-mail                      | `/verification`                                                | pas de maquette                             |
| Mot de passe oublié, nouveau mot de passe | `/mot-de-passe`, `/nouveau-mot-de-passe`                       | pas de maquette                             |
| Invitation d'un parent, validation        | `/invitation`, `/validation-parent`                            | pas de maquette                             |
| O1 à O5 · Onboarding                      | `/onboarding/classe`, `matieres`, `objectifs`, `style`, `pret` | `O1-…` à `O5-…`                             |

**Espace élève**

| Écran                | Route                                                     | Maquette                            |
| -------------------- | --------------------------------------------------------- | ----------------------------------- |
| Accueil              | `/`                                                       | `design/screens/01-Accueil.dc.html` |
| Tuteur écrit         | `/tuteur`                                                 | `02a-Tuteur-Ecrit.dc.html`          |
| Tuteur vocal         | `/tuteur/vocal`                                           | `02b-Tuteur-Vocal.dc.html`          |
| Flashcards · Choix   | `/revisions`                                              | `03a-Flashcards-Choix.dc.html`      |
| Flashcards · Session | `/revisions/session?chapter=…` ou `?mode=daily`           | `03b-Flashcards-Session.dc.html`    |
| Stats                | `/stats`                                                  | `04-Stats.dc.html`                  |
| Explorer · Les îles  | `/explorer`                                               | `X1-Explorer-Iles.dc.html`          |
| Profil               | `/profil` (déconnexion, code parent, export, suppression) | pas de maquette                     |
| Crée ton avatar      | `/avatar` (`?premiere=1` à la première visite d'Explorer) | pas de maquette                     |
| Relier un parent     | `/relier-parent`                                          | pas de maquette                     |

**Espace Parents**

| Écran                | Route               | Maquette                      |
| -------------------- | ------------------- | ----------------------------- |
| P1 · Accueil         | `/parents`          | `P1-Parents-Accueil.dc.html`  |
| P2 · Progrès         | `/parents/progres`  | `P2-Parents-Progres.dc.html`  |
| P3 · Sessions        | `/parents/sessions` | `P3-Parents-Sessions.dc.html` |
| P4 · Réglages        | `/parents/reglages` | `P4-Parents-Reglages.dc.html` |
| Données personnelles | `/parents/donnees`  | pas de maquette               |

L'app choisit l'espace selon la session (`src/lib/session/resolveSpace.ts`) : sans session, l'entrée ; élève sans onboarding, l'onboarding ; sinon l'espace élève ou l'espace Parents.

## Prérequis

- Node 24 et npm 11
- Docker, pour Supabase local (base, API et e-mails capturés)
- L'app **Expo Go** (SDK 57) sur un téléphone, pour tout tester sauf le vocal en direct
- Un compte Expo pour les builds de développement (vocal en direct sur téléphone)

## Installation

```sh
npm install
cp .env.example .env   # puis renseigner les valeurs (jamais versionné)
```

- `OPENAI_API_KEY`, `OPENAI_TEXT_MODEL` et `OPENAI_VOCAL_MODEL` ne sont lues que par le serveur intermédiaire (`server/env.ts`). L'app ne contient jamais la clé, ni le nom des modèles.
- `SUPABASE_SECRET_KEY` et `LINK_CODE_PEPPER` restent aussi sur le serveur. L'app ne connaît que l'URL du projet et sa clé publiable (`EXPO_PUBLIC_SUPABASE_*`), publiques par nature : la sécurité repose sur la RLS.
- Sans projet Supabase renseigné, l'app tourne entièrement en mode simulé (comptes de démonstration en mémoire).

### Supabase local

```sh
npm run db:start   # base, API et Mailpit (Docker) ; applique les migrations
npm run db:seed    # Léa (4e), Claire (sa maman) et Hugo (5e, sans onboarding)
npm run web:local  # l'app web branchée sur Supabase local, sans modifier .env
```

- Comptes de démonstration : `lea@tutoria.test`, `claire@tutoria.test` et `hugo@tutoria.test`, mot de passe `Tutoria2026`.
- Les e-mails (codes de confirmation, invitations, mots de passe) arrivent dans Mailpit : `http://127.0.0.1:54324`.
- Supabase local n'est joignable que depuis ce PC : sur un téléphone, utiliser le projet en ligne.

## Commandes

| Commande                                          | Effet                                                                                                           |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `npm start`                                       | Serveur de développement + routes API, QR code pour **Expo Go**                                                 |
| `npm run start:tunnel`                            | Idem via un tunnel : si le téléphone n'atteint pas le PC (Wi-Fi qui isole les appareils)                        |
| `npm run start:dev`                               | Idem pour le **build de développement** (vocal en direct), via un tunnel                                        |
| `npm run web`                                     | Version web                                                                                                     |
| `npm run web:local`                               | Version web branchée sur Supabase local                                                                         |
| `npm run android` / `npm run ios`                 | Émulateur ou simulateur                                                                                         |
| `npm run tokens`                                  | Régénère `src/theme/tokens.generated.ts` depuis `design/tokens/`                                                |
| `npm run explorer:models`                         | Régénère les îles, la bande de terre des régions et les monuments avec Blender 5.2 (environ 30 min)             |
| `npm run avatar:model`                            | Régénère la figurine des avatars (corps, coiffures, tenue de base, animations) avec Blender 5.2 (environ 3 min) |
| `npm run check`                                   | Lint, vérification des types et tests                                                                           |
| `npm run lint` / `npm run typecheck` / `npm test` | Chaque vérification séparément                                                                                  |
| `npm run format`                                  | Formate le code avec Prettier                                                                                   |
| `npm run db:start` / `npm run db:stop`            | Démarre ou arrête Supabase local                                                                                |
| `npm run db:reset`                                | Recrée la base locale à partir des migrations                                                                   |
| `npm run db:test`                                 | Tests pgTAP de la RLS et des déclencheurs (`supabase/tests/database/`)                                          |
| `npm run db:lint`                                 | Lint du schéma local                                                                                            |
| `npm run db:new <nom>`                            | Nouvelle migration dans `supabase/migrations/`                                                                  |
| `npm run db:types`                                | Régénère `src/services/db/database.types.ts` (commité) depuis la base locale                                    |
| `npm run db:seed`                                 | Comptes de démonstration (local ; `-- --remote` avec `SEED_ALLOW_PROJECT` pour le projet en ligne)              |

- Tuteur simulé (hors ligne, sans coût) : `EXPO_PUBLIC_TUTOR_MODE=mock npm start`.
- Tout simulé (sans Supabase ni OpenAI) : `EXPO_PUBLIC_BACKEND=mock npm start`.
- Pendant le développement, `/dev/catalogue` affiche le thème, les composants de base et, en mode simulé, un sélecteur de persona.

## Base de données

- Schéma dans `supabase/migrations/` : comptes et rôles, liens parent–enfant, codes de liaison, consentement, réglages parentaux, onboarding, conversations, séances, flashcards, progression, agrégats par jour, limite de débit partagée et purge.
- RLS sur toutes les tables. Un parent ne lit que ses enfants reliés, et jamais leurs conversations. L'élève ne peut modifier ni son consentement, ni ses XP, ni son rôle : XP, séries et maîtrise sont calculés par des déclencheurs.
- Après une migration : `npm run db:reset`, `npm run db:test`, puis `npm run db:types`.

## Comptes et consentement

- Connexion par e-mail et mot de passe, gérés uniquement par Supabase Auth. L'e-mail est confirmé par un code à 6 chiffres.
- Élève de moins de 15 ans : un parent valide le compte, par invitation e-mail (`POST /api/consent/request`) ou par code de liaison. D'ici là, le tuteur est bloqué ; les flashcards et les stats restent ouvertes.
- Codes de liaison : `POST /api/link-codes/create` (parent) et `POST /api/link-codes/redeem` (élève). Demande d'un élève à un parent déjà inscrit : `POST /api/link-requests/accept`.
- Export des données (JSON) et suppression du compte : `GET /api/account/export`, `POST /api/account/delete`, et pour un parent qui a donné le consentement, `POST /api/account/delete-child`.

## Tuteur IA

- **Écrit** : `POST /api/tutor/chat` (route API Expo Router).
  - Le serveur vérifie l'élève connecté, le consentement parental et les réglages du parent, puis applique une limite de débit partagée.
  - Il valide la requête, relit l'historique en base, modère l'entrée, appelle OpenAI (`store: false`) et renvoie la réponse en flux NDJSON. La réponse complète est aussi modérée, puis enregistrée.
- **Vocal** : `POST /api/tutor/realtime-session` délivre un jeton temporaire (60 s) après les mêmes vérifications. L'app se connecte ensuite directement à l'API Realtime d'OpenAI en WebRTC. La configuration de la session (modèle, consignes, voix) est fixée par le serveur. La fin de l'appel est déclarée par `POST /api/tutor/voice/end`.
- **Photo de l'exercice** : `POST /api/tutor/image-check` vérifie la taille et modère la photo avant son envoi dans l'appel.
- **Signalement** : appui long sur une réponse du tuteur, qui appelle `POST /api/tutor/report`.
- **Résumés pour les parents** : `POST /api/tutor/session/summary` (notions comprises et à revoir, sortie structurée et modérée) et `POST /api/parents/weekly-report` (à partir des agrégats seulement, sans prénom). Jamais de transcription.
- **Hors ligne** : si le serveur ne répond pas, un bandeau « Tutor'IA est hors ligne » s'affiche et des questions d'entraînement du chapitre prennent le relais.
- Le prompt système est versionné dans `server/tutor/prompt.ts`.

### Version installée sur téléphone (APK preview)

- L'APK « preview » vise le serveur en ligne (`https://tutoria.expo.app`) et Supabase en ligne : le PC n'a pas besoin d'être allumé.
- Nouvel APK : `EAS_NO_VCS=1 npx eas-cli@latest build --profile preview --platform android` (tant que le dépôt n'a aucun commit). Il s'installe par-dessus l'ancien.
- Changement du code de l'app seulement : `npm run update:preview -- --message "…"` publie une mise à jour, téléchargée au lancement suivant, sans nouvel APK.
- Changement du serveur (routes API, prompt) : `npx expo export --platform web` puis `npx eas-cli@latest deploy --prod --environment production`.
- Un module natif ajouté change l'empreinte (`runtimeVersion` « fingerprint ») : il faut alors un nouvel APK, les mises à jour ne s'y appliquent pas.

### Vocal en direct sur téléphone

Expo Go ne contient pas WebRTC : dans Expo Go, le vocal devient un appel d'entraînement, annoncé comme tel. Deux façons d'avoir le vrai vocal :

1. **Sans installation, dans le navigateur du téléphone.**
   - Lance `npm run start:tunnel`.
   - Dans le terminal, repère l'adresse `exp://xxxx.exp.direct` et ouvre-la dans Chrome sur le téléphone en remplaçant `exp://` par `https://`.
   - Autorise le micro quand le navigateur le demande.
2. **Avec l'app installée (build de développement).**
   - Projet EAS : `@romainmlt/tutoria`, déjà lié (identifiant dans `app.config.ts`).
   - Nouveau build : `npm run build:dev` (après `npx eas-cli@latest login`). Il n'en faut un que si un module natif est ajouté ; le code JavaScript se recharge sans build. `expo-notifications`, `expo-sharing` et `expo-file-system` en demandent un nouveau.
   - Tant que le dépôt git n'a aucun commit, préfixer par `EAS_NO_VCS=1`. `.easignore` exclut alors `.env` et les fichiers générés.
   - Installe l'APK obtenu sur le téléphone, puis, à chaque session de travail : `npm run start:dev`, et ouvre le projet avec cette app, et non avec Expo Go.
   - Sur iOS, un build de développement sur un vrai téléphone demande un compte Apple Developer.

## Structure

```
src/
  app/            routes Expo Router (écrans fins), un groupe par espace :
                  (auth)/ entrée · (compte)/ compte à finaliser · (onboarding)/ · (eleve)/ · (parents)/
                  api/ = serveur intermédiaire · dev/ = outils de développement
  components/     composants UI partagés (Text, Icon, Button, BottomNav, form/…) ; game/ = HUD de jeu (Explorer, avatar)
  features/       auth, onboarding, access, home, tutor, flashcards, stats, explorer, avatar, comingSoon, profile, parents :
                  écrans, composants, logique, hooks
  services/       services derrière des interfaces, versions Supabase et simulée :
                  auth, family, onboarding, student, parents, tutor, explorer ; avatar (sur l'appareil) ; db/ = types générés
  data/           types et programme (classes, chapitres) ; mock/ = données fictives de démonstration
  theme/          thème typé généré depuis design/tokens/ + police Satoshi + espaces élève et parent
  i18n/fr.ts      tous les textes de l'app
  lib/            utilitaires transverses (config, session, cache, heure de Paris, journalisation) ;
                  three/ = scènes 3D (chargement des modèles, WebGL, pause hors écran)
server/           code serveur uniquement : clés OpenAI et Supabase, prompt, garde-fous, comptes
supabase/         migrations, tests pgTAP, modèles d'e-mails, configuration locale
scripts/          outillage (tokens, seed, Supabase local)
tools/explorer-3d/ scripts Blender des îles 3D d'Explorer (modèles, matières, cuisson), sortie dans assets/explorer/models/
tools/avatar-3d/   script Blender de la figurine des avatars (squelette, coiffures, vêtements, animations), sortie dans assets/avatar/
design/           maquettes et design system (référence visuelle)
assets/           logos, police Satoshi, palette
```

Les conventions (thème, nommage, frontière app / serveur, Supabase) sont détaillées dans `CLAUDE.md`. L'ordre des chantiers et l'étape en cours sont dans `ROADMAP.md`.

## Branches

- `main` : toujours stable, ne reçoit que des fusions depuis `dev` (pull request, CI verte).
- `dev` : intégration des fonctionnalités.
- Une branche par fonctionnalité, créée depuis `dev`, nommée en français après son préfixe (`feat/espace-parents`, `fix/pause-du-soir`, `docs/guide-installation`), fusionnée dans `dev` par pull request.
- Messages de commit au format Conventional Commits. La CI (lint, types, tests, tokens à jour) tourne sur chaque pull request et sur `main` et `dev`.

## Avant une publication sur les stores

À régler avant toute mise en ligne (détail dans `CLAUDE.md`, § 11) :

- zéro rétention des données chez OpenAI, politique de confidentialité ;
- surveillance serveur du vocal ;
- e-mails par Brevo (SMTP) et configuration de l'authentification en ligne ;
- App Attest, Play Integrity et Turnstile ; connexion Apple et Google ensemble ;
- offre Supabase payante (pas de mise en pause) ;
- icône source en 1024 px ;
- domaine et variables d'environnement sur EAS Hosting.
