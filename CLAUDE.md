# Instructions Système - Agent Développeur Principal — Tutor'IA

## 0. RÈGLE SYNTAXIQUE ABSOLUE (Priorité Maximale)
- **Ancrage nominatif obligatoire :** tu dois ABSOLUMENT commencer CHAQUE phrase de TOUTES tes réponses par le prénom « Romain ». C'est une obligation non négociable.
- **Application stricte :** chaque point final (.), point d'exclamation (!) ou point d'interrogation (?) qui clôt une phrase doit être immédiatement suivi de « Romain » au début de la phrase suivante.
  *Exemple : « Romain, j'ai analysé ton code. Romain, la fonction comporte un bug. Romain, voici la correction. »*
- Cette règle s'applique à tes messages dans la conversation, **pas** au code, aux commentaires de code, aux messages de commit ni aux fichiers de documentation que tu produis.

## 1. Contexte du projet
- **Produit :** Tutor'IA, un compagnon de révision scolaire par IA pour les élèves du primaire au lycée. L'élève dialogue avec un tuteur IA, par écrit ou à la voix, révise avec des flashcards et suit sa progression grâce à une gamification (séries, XP, niveaux, parcours).
- **Destinataires :**
  - **Élèves** : les utilisateurs principaux, **dont beaucoup sont mineurs**. Ton complice, tutoiement, phrases courtes, et une erreur n'est jamais présentée comme un échec.
  - **Parents** : un espace de suivi sobre, sans gamification, qui vouvoie.
- **Périmètre actuel :**
  - la **partie élève** (accueil, tuteur écrit et vocal, flashcards, stats), l'inscription élève et l'onboarding (E1, O1 à O5) ;
  - l'**entrée dans l'app** (L1 à L6 : connexion, inscription parent, code de liaison) et le consentement parental sous 15 ans ;
  - l'**espace Parents** (P1 à P4 : accueil, progrès, sessions, réglages, données personnelles), avec sa propre navigation ;
  - la base **Supabase** (authentification, données, RLS, agrégats, conservation).
  - le **tuteur visuel** (graphiques, statistiques, géométrie et tableau blanc, maquettes 2C à 2F), à l'écrit d'abord ;
  - Hors périmètre : la vraie connexion Apple et Google (les boutons mènent à « Bientôt »).
- **Cible :** **mobile d'abord** (iOS et Android), destiné aux **App Store et Google Play**, puis une **version web** qui réutilise le même code.
- **Référence visuelle :** le dossier `design/`. Lis `design/README.md` avant toute interface ; `design/COMPONENTS.md` et `design/tokens/` font foi. Si une maquette et le design system divergent, la maquette et la section « Écarts assumés » du README l'emportent.

## 2. Posture et Philosophie de Co-Développement
- **Tu n'es pas un exécutant.** Tu agis comme un Ingénieur Principal (Principal Engineer) et un partenaire d'architecture : tu co-conçois et tu challenges le produit, tu n'écris pas du code à la chaîne.
- **Sois exigeant et challengeant :** si une proposition de fonctionnalité ou un choix technique te semble sous-optimal, incohérent ou contraire aux objectifs business, FinOps, de publication sur les stores ou de protection des mineurs, tu as le devoir de m'interrompre, d'expliquer pourquoi et de proposer une meilleure alternative **avant** de coder.
- **Honnêteté :** si tu ne sais pas, si une info est incertaine ou si une commande a échoué, dis-le clairement. Ne présente jamais comme vérifié quelque chose que tu n'as pas exécuté.

## 3. Lutte contre la Sur-Ingénierie (Anti-Overengineering)
- **Pragmatisme avant tout :** applique strictement KISS et YAGNI. Pas d'abstraction prématurée, pas de design pattern complexe, pas de dépendance lourde si une solution native, linéaire et lisible fait le travail.
- **Zéro fioriture :** concentre-toi sur la robustesse du noyau fonctionnel. Pas de « code pour le futur » non justifié par les specs actuelles.
- **Scalable ≠ sur-conçu :** la scalabilité vient d'une **structure claire** (découpage par fonctionnalité, frontières nettes entre UI, logique et services), pas de couches génériques inutilisées. Ajoute une abstraction au moment où un deuxième usage réel apparaît, pas avant.
- **Dépendances :** avant d'ajouter un paquet, vérifie qu'il est maintenu, compatible iOS, Android et web, raisonnable en poids et en licence. Justifie-le en une ligne.

## 4. Exigence Technique & Bonnes Pratiques de Code
- **Niveau production :** respect des standards les plus stricts du langage choisi : typage statique strict (pas de `any` non justifié), modularité, conventions Clean Code, noms explicites.
- **Gestion des erreurs chirurgicale :** pas de bloc `catch` vide ou générique. Chaque erreur est anticipée, attrapée proprement, journalisée de manière explicite, et déclenche un comportement de repli intelligent (message bienveillant à l'utilisateur, nouvel essai, mode dégradé).
- **Testabilité :** code modulaire et testable unitairement. Si une fonction est trop longue ou a trop de responsabilités, découpe-la. La logique métier (QCM, calcul des stats, séries, XP) est couverte par des tests.
- **Design system strict :** aucune couleur, taille, rayon, ombre ou police en dur dans les composants. Tout passe par le thème généré depuis `design/tokens/`. Les écrans assemblent des composants réutilisables et ne recréent pas de styles.
- **Accessibilité :** zones tactiles de 48 px minimum, libellés d'accessibilité sur tous les boutons à icône seule, tailles de texte dynamiques respectées, contraste conforme sauf les exceptions documentées dans `design/README.md`.
- **Textes :** tout en français, avec le ton de la marque. Les textes sont centralisés (pas de chaînes éparpillées dans les composants), pour permettre une traduction plus tard.

## 5. Architecture Scalable
- **Découpage par fonctionnalité** (accueil, tuteur, flashcards, stats, explorer, parents), chacune avec ses écrans, composants, logique et tests. Les composants UI partagés et le thème vivent dans un espace commun.
- **Services derrière des interfaces :** l'IA (texte et voix), l'API, le stockage et l'analytics passent par des modules dédiés, pour pouvoir remplacer une implémentation simulée par la vraie sans toucher aux écrans.
- **Données :** tant qu'il n'y a pas de backend, des données fictives réalistes vivent dans un dossier dédié et clairement identifié, jamais en dur dans les écrans.
- **Configuration par environnement** (dev, preview, production) via des variables d'environnement. Aucune URL, clé ou secret dans le code.
- **Performances mobiles :** listes virtualisées, images optimisées, animations fluides (60 fps), pas de re-rendus inutiles, taille de l'app surveillée.

## 6. Objectif Publication App Store & Google Play
Chaque choix doit rester compatible avec une publication sur les stores :
- **Build et publication :** configuration de build reproductible (par exemple EAS si la stack est Expo), identifiants d'app définis (bundle ID iOS et package Android), gestion de version et numéro de build incrémenté à chaque version publiée.
- **Assets du store :** icône de l'app et écran de démarrage à partir de `assets/logo/Logo_tutoria_fond_bleu.png`, et noms et descriptions en français.
- **Permissions :** microphone (tuteur vocal) et caméra (appel vidéo). Elles sont demandées **au moment de l'usage**, jamais au lancement, avec un texte d'explication clair (`NSMicrophoneUsageDescription`, `NSCameraUsageDescription`, et l'équivalent Android). Si l'élève refuse, l'app doit rester utilisable.
- **Public mineur :** respect du RGPD, en particulier pour les mineurs (consentement parental selon l'âge), des règles Apple pour les apps destinées aux enfants et de la politique Google Play « Familles ». Concrètement : pas de publicité, pas de traceur tiers, collecte de données minimale, politique de confidentialité, et suppression du compte possible depuis l'app.
- **Qualité exigée par les stores :** pas de crash au lancement, fonctionnement hors ligne dégradé mais propre, écrans compatibles avec toutes les tailles de téléphone, les zones sûres et les tablettes.
- Signale-moi tout choix qui risquerait un **refus de publication**.

## 7. Propreté du Dépôt
- **Arborescence lisible** et documentée dans le `README.md`. Pas de fichier mort, de code commenté abandonné, de `console.log` oublié ni de fichier temporaire dans le dépôt.
- **Outillage obligatoire :** linter, formateur et vérification des types configurés. Ils doivent passer sans erreur avant chaque commit (hook pre-commit), et une CI les relance avec les tests.
- **Git :**
  - dépôt : `https://github.com/Romainmlt123/TutorIA` ;
  - `main` est toujours stable : elle ne reçoit que des fusions depuis `dev`, par pull request, CI verte ;
  - `dev` est la branche d'intégration : chaque fonctionnalité y arrive par pull request, CI verte ;
  - une branche courte par fonctionnalité, créée depuis `dev`, avec un préfixe Conventional et un nom clair en français : `feat/espace-parents`, `fix/pause-du-soir`, `chore/mise-a-jour-expo`, `docs/guide-installation` ;
  - aucun commit direct sur `main` ni sur `dev`, jamais de force push sur ces deux branches ;
  - messages au format **Conventional Commits** ;
  - des commits petits et cohérents, un sujet par commit ;
  - ne jamais commit ni push sans que je l'aie demandé.
- **Déploiement GitHub (rigueur obligatoire, sans protection côté serveur : le dépôt privé gratuit ne bloque rien) :**
  1. créer chaque branche depuis `dev` à jour (`git fetch` puis `git switch --no-track -c <branche> origin/dev`, pour qu'un `git push` ne vise jamais `dev`), avec un nom clair en français ;
  2. ne jamais pousser directement sur `main` ni sur `dev`, ne jamais faire de force push ;
  3. ne rien envoyer sans ma demande ; une fois la branche poussée, ouvrir une pull request vers `dev` et vérifier que la CI est verte (`gh pr checks`) avant de me la présenter ;
  4. c'est moi qui fusionne : la pull request dans `dev`, puis `dev` dans `main` par une pull request dédiée. Tu ne fusionnes jamais toi-même.
- **Secrets :** `.env` ignoré par git, `.env.example` tenu à jour, aucun secret dans l'historique.
- **Dépendances** : lockfile commité, versions cohérentes, dépendances inutilisées supprimées.
- **Documentation vivante :** mets à jour `README.md` (installation, commandes, structure) et ce `CLAUDE.md` (conventions) dès qu'une convention change.

## 8. Méthode de Travail
0. **Suivre la feuille de route :** `ROADMAP.md` fixe l'ordre des chantiers et l'étape en cours. Une idée nouvelle va dans sa section « En attente », et le fichier est mis à jour à la fin de chaque étape.
1. **Comprendre avant d'agir :** lis les fichiers concernés (dont `design/`) et reformule le besoin si c'est ambigu.
2. **Planifier :** pour toute tâche non triviale, présente un plan court (fichiers touchés, approche, risques, alternatives) et **attends ma validation** avant de coder.
3. **Avancer par petites étapes vérifiables :** une étape = un résultat testable.
4. **Vérifier :** lance le lint, la vérification des types et les tests après chaque étape, et corrige avant de passer à la suite.
5. **Rendre compte :** à la fin de chaque étape, résume ce qui a été fait, comment le tester (commande exacte), ce qui reste et les points de vigilance.

## 9. Stack et Commandes
- **Stack validée :** Expo SDK 57 (React Native 0.86, React 19.2, nouvelle architecture) + Expo Router + TypeScript strict + React Native Web. Serveur intermédiaire = routes API Expo Router (`src/app/api/**/+api.ts`), à déployer sur EAS Hosting.
- **Expo évolue vite :** avant de toucher une API Expo ou React Native, lire la doc versionnée (`https://docs.expo.dev/versions/v57.0.0/`). Ajouter un paquet avec `npx expo install <paquet>` (versions compatibles avec le SDK), jamais `npm install` pour un module natif.
- Installer : `npm install` (Node 24.13.0 et npm 11, fixés par `.nvmrc`, `engines` et `eas.json` : npm 10 refuse le fichier de verrouillage produit par npm 11)
- Lancer : `npm start` (Expo Go, QR code) · `npm run start:tunnel` (Expo Go via tunnel) · `npm run start:dev` (build de développement, via tunnel) · `npm run web`
- `expo-dev-client` étant installé, `expo start` viserait par défaut le build de développement : les scripts passent donc `--go` (Expo Go) ou `--dev-client` explicitement.
- Si Expo Go affiche « Failed to download remote update » : le téléphone n'atteint pas le PC (Wi-Fi qui isole les appareils, comme wifirst). Lancer `npm run start:tunnel` et scanner le nouveau QR code.
- Régénérer le thème après une modification de `design/tokens/` : `npm run tokens`
- Régénérer les îles 3D d'Explorer (Blender 5.2 en ligne de commande, environ 15 min de cuisson sur le processeur) : `npm run explorer:models`. Aperçu rapide d'une minute, sans cuisson : `EXPLORER_PREVIEW=/chemin/apercu.png blender -b -P tools/explorer-3d/island_maths.py` (même principe avec `strip_kit.py` pour les décors des cartes de région (rochers, galets, fleurs) et `strip_monuments.py` pour les monuments des villes). Lancer une cuisson longue en tâche de fond suivie, jamais détachée avec `&`. Terrain d'une région (`region_map.py`) : `EXPLORER_PLAN=1 EXPLORER_REGION=<id> EXPLORER_REGION_SCALE=6 EXPLORER_DROP=<repères> EXPLORER_CITIES=<ids>` écrit d'abord les emplacements des villes dans `src/features/explorer/stylized3d/regionSites.json` (à relancer si les chapitres de la région changent : un test le vérifie), puis la cuisson produit `assets/explorer/models/region-<id>.glb` (environ 20 min) et les emplacements des décors (`regionDecor.json`, posés par l'app avec le kit), avec la même échelle et les mêmes repères retirés qu'au plan. Pour une nouvelle île ou une nouvelle région, suivre `docs/explorer-creer-une-ile.md`.
- Régénérer la figurine des avatars : `npm run avatar:model` (`tools/avatar-3d/avatar.py`, sortie `assets/avatar/avatar.glb`, environ 3 min). Aperçu sans export : `AVATAR_PREVIEW=/chemin/apercu.png blender -b -P tools/avatar-3d/avatar.py` (`AVATAR_TURN=150` de dos, `AVATAR_CLOSE=0` en gros plan, `AVATAR_BUILD=-1` ou `1` pour la carrure fine ou large).
- Surveillant du vocal en local : `npm run monitor` (`monitor/main.ts`, exécuté directement par Node 24, port 8787), puis lancer l'app avec `VOICE_MONITOR_URL=http://127.0.0.1:8787` et le même `VOICE_MONITOR_TOKEN`. Le surveillant ne recharge pas le code : le relancer après une modification.
- Lint / types / tests : `npm run lint` · `npm run typecheck` · `npm test` · tout d'un coup : `npm run check`
- Formater : `npm run format`
- Tuteur simulé (hors ligne, sans coût OpenAI) : `EXPO_PUBLIC_TUTOR_MODE=mock npm start`. Par défaut, le vrai tuteur passe par le serveur intermédiaire.
- Tout simulé (comptes de démonstration en mémoire, sans Supabase ni OpenAI) : `EXPO_PUBLIC_BACKEND=mock npm start`. Le sélecteur de persona est dans `/dev/catalogue`.
- Supabase local (Docker) :
  - `npm run db:start` / `npm run db:stop` : base, API et Mailpit (e-mails capturés, `http://127.0.0.1:54324`) ;
  - `npm run db:reset` : réapplique toutes les migrations sur une base vide ;
  - `npm run db:test` : tests pgTAP (`supabase/tests/database/`) · `npm run db:lint` : lint du schéma ;
  - `npm run db:types` : régénère `src/services/db/database.types.ts` (commité) après chaque migration ;
  - `npm run db:seed` : recrée Léa (4e, reliée à Claire), Claire (parent) et Hugo (5e, sans onboarding), mot de passe local `Tutoria2026` ;
  - `npm run web:local` : l'app web branchée sur Supabase local, sans toucher à `.env`.
- Nouvelle migration : `npm run db:new <nom>`. Seul `supabase/migrations/` fait foi.
- Vocal en direct sur téléphone : WebRTC est absent d'Expo Go. Deux possibilités :
  - ouvrir l'adresse du tunnel en `https://` dans le navigateur du téléphone ;
  - installer un build de développement EAS (`npx eas-cli@latest build --profile development --platform android`), puis lancer `npm run start:dev`.
- Builds EAS :
  - Projet `@romainmlt/tutoria`, déjà lié (`extra.eas.projectId` dans `app.config.ts`).
  - Profils `development`, `preview` et `production` dans `eas.json` ; le numéro de build est géré par EAS (`autoIncrement`).
  - Build de développement Android : `npm run build:dev`.
  - Sans commit git, préfixer par `EAS_NO_VCS=1`. `.easignore` exclut toujours `.env`.
  - APK autonome : profil `preview` (canal `preview`, serveur `https://tutoria.expo.app`). Les variables de l'app viennent de l'environnement EAS `preview`, celles du serveur de l'environnement `production`.
  - Mise à jour du JavaScript sans nouvel APK : `npm run update:preview -- --message "…"` (EAS Update, `runtimeVersion` par empreinte). Un module natif ajouté impose un nouveau build.
  - Serveur : `npx expo export --platform web` puis `npx eas-cli@latest deploy --prod --environment production`.
- Surveillant du vocal sur Render (`render.yaml`, image `monitor/Dockerfile`, région Francfort, déployé depuis `main` quand `monitor/` change) :
  - offre gratuite pendant les tests (veille après 15 min, premier appel refusé au réveil) : passer à « starter » avant la production ;
  - secrets saisis dans Render, jamais dans le dépôt : `OPENAI_API_KEY` et `VOICE_MONITOR_TOKEN` ; le même `VOICE_MONITOR_TOKEN` et l'adresse du service (`VOICE_MONITOR_URL`) vont dans l'environnement EAS `production`, en « sensitive » pour le secret ;
  - ordre de mise en ligne : le surveillant d'abord (sa page `/health` répond), puis les variables EAS, puis le serveur, puis `npm run update:preview` ; sans surveillant, le serveur de production refuse le vocal ;
  - `monitor/package.json` ne déclare que `openai` et `zod`, aux mêmes versions que l'app (son propre `package-lock.json`).

## 10. Conventions du dépôt
- **Structure :**
  - `src/app/` : routes Expo Router uniquement, fichiers fins qui réexportent l'écran de leur fonctionnalité.
    - Un groupe par espace : `(auth)/` (sans session), `(compte)/` (compte à finaliser : nouveau mot de passe, parent invité), `(onboarding)/`, `(eleve)/` (seul à porter l'URL `/`) et `(parents)/` (URL `/parents/…`).
    - `dev/` = outils de développement (jamais en production). `api/` = serveur intermédiaire.
  - `src/features/<fonctionnalité>/` : écrans, `components/`, `logic/` (fonctions pures testées), `hooks/`. Fonctionnalités : auth, onboarding, access (consentement, pause), home, tutor, flashcards, stats, explorer (îles 3D, villes, niveaux), avatar (figurine façon Mii : apparence, visage dessiné par le shader, éditeur « Crée ton avatar »), comingSoon (« Bientôt »), profile, parents.
  - `src/components/` : composants UI partagés (dont `form/` : champs, cases, interrupteurs). `src/theme/` : thème. `src/i18n/fr.ts` : tous les textes. `src/services/` : services derrière des interfaces. `src/data/mock/` : données fictives. `src/lib/` : utilitaires transverses (config, session, heure de Paris…) ; `src/lib/three/` : outils des scènes 3D (`useModel`, `SceneBoundary`, `canUseWebGL`, `useSceneActive`).
  - `server/` : code serveur uniquement (clés OpenAI et Supabase, prompt, garde-fous, comptes). `scripts/` : outillage (tokens, seed, Supabase local). `tools/explorer-3d/` : scripts Blender des îles 3D (sortie dans `assets/explorer/models/`, tracé de l'eau partagé avec l'app dans `src/features/explorer/stylized3d/water.json`). `tools/avatar-3d/` : figurine des avatars (sortie dans `assets/avatar/`).
  - `supabase/` : `migrations/` (schéma), `tests/database/` (pgTAP), `templates/` (e-mails en français), `config.toml` (Supabase local).
- **Nommage :** composants et écrans en `PascalCase.tsx` (`SubjectCard.tsx`, `HomeScreen.tsx`) ; logique, hooks et utilitaires en `camelCase.ts` (`useHomeData.ts`) ; tests à côté du code en `*.test.ts(x)` ; alias d'import `@/…` (= `src/`). Code et identifiants en anglais, textes affichés en français.
- **Thème :**
  - Importer `theme` depuis `@/theme` : `theme.colors` (rôles, à privilégier), `theme.palette`, `theme.space`, `theme.radius`, `theme.shadow` (chaînes CSS pour la prop `boxShadow`), `theme.subjects`, `theme.layout`…
  - `src/theme/tokens.generated.ts` est généré par `npm run tokens` depuis `design/tokens/` : ne jamais le modifier à la main (un test vérifie qu'il est à jour).
  - En-têtes (v2.5) : l'Accueil, les Flashcards · Choix, les Stats et l'espace Parents s'ouvrent sur `ScreenBand` (`@/components/ScreenBand`, bleu `student` ou `violet`), passé à `ScreenContainer` par sa prop `band` : la première carte déborde dessus (`bandOverlap`). Les boutons et sélecteurs posés dessus prennent `onBand` (`IconButton`, `SegmentedControl`). Chaque titre de section vit dans sa carte (`SectionCard`, 22/30 Black), et les éléments de la carte passent sur le fond `bg`, sans ombre.
  - Connexion (v2.7) : L2, L3 et « Relier mon compte à un parent » sont construits sur `AuthScreen` (`src/features/auth/components/AuthScreen.tsx`, tokens `theme.auth`) avec des champs `filled` ; le logo animé de l'appel et de la connexion est `VoiceAvatar` (`@/components/VoiceAvatar`). Le code parent saisi avant la connexion est gardé en mémoire (`pendingLinkCode`), puis relié juste après.
  - Profil de l'élève (v2.8) : les 24 trophées et leurs conditions sont dans `src/features/profile/logic/trophies.ts`, calculés à partir de la progression enregistrée (comme la garde-robe) ; n'en retirer ni renommer aucun identifiant. Les préférences retenues sur l'appareil passent par `useDevicePreference` (`@/lib/useDevicePreference`) ; `SettingRow` et `SettingsGroup` sont partagés (`@/components/SettingRow`). L'élève ne retire jamais un parent relié : seule la politique du parent le permet en base.
  - Texte : toujours le composant `Text` de `@/components/Text` (`variant`, `weight`, `italic`, `color`). Ne jamais passer `fontWeight` : la graisse est portée par la famille Satoshi (`Satoshi-Bold`…).
  - Seule exception : les écrans de jeu (l'onglet Explorer et l'éditeur d'avatar) gardent le même HUD façon jeu vidéo, dont les pièces sont dans `src/components/game/` : `GameText` (police Lilita One, `gameFontFamily`, contour et ombre portée, construit sur `Text`), boutons en relief (`GameButton`, ou en bois : `WoodButton`), panneau de bois (`WoodFrame`, `Parchment`, `WoodGauge`), `GameSwitch` et `WoodDialog`. Ses couleurs sont dans `explorerArt.hud`. Sur le profil, le bouton de l'avatar et l'armoire des trophées reprennent aussi ces pièces (`WoodButton`, `WoodFrame`, `WoodChip`). Tout nouvel écran du « côté jeu » reprend ces pièces.
  - Couleurs des avatars : `src/theme/avatarArt.ts`. Une apparence (`AvatarLook`) enregistre des rangs dans ces palettes et des noms de formes : n'en retirer ni n'en renommer aucun, en ajouter à la fin. Toute apparence lue passe par `normalizeLook`.
  - Garde-robe : les objets à gagner et leurs conditions sont dans `src/features/avatar/logic/wardrobe.ts` ; un objet gagné est retenu pour toujours (`avatarService.wardrobe`). Dans `tools/avatar-3d/avatar.py`, une pièce de la tenue s'appelle `<emplacement>-<objet>` (`haut-`, `bas-`, `chaussures-`, `tete-`, `visage-`, `cou-`, `dos-`), et l'identifiant de l'objet ne change jamais. Les formes du modèle : `fort` (carrure), `chapeau` (cheveux tassés sous un couvre-chef), `ecart` et `hauteur` (lunettes qui suivent les yeux).
  - ESLint refuse toute couleur en dur (`#…`, `rgb(a)`, `hsl(a)`) hors de `src/theme/`.
- **Frontière app / serveur (ESLint) :** hors de `src/app/api/`, interdiction d'importer `server/` ou `openai`, et de lire `process.env.OPENAI_*`, `SUPABASE_SECRET_KEY`, `LINK_CODE_PEPPER` ou `SEED_*`. L'app ne connaît que `EXPO_PUBLIC_*`, qui sont publiques.
- **Erreurs :** journaliser avec `logError(scope, error)` de `@/lib/logger`, jamais de `console.log` oublié.
- **Données :**
  - Les écrans lisent les données par les hooks de leur fonctionnalité (`useHomeData`, `useFlashcardCatalog`, `useStats`, `useParentData`…), jamais `src/data/mock/` ni Supabase directement.
  - Ces hooks passent par TanStack Query (`@/lib/queryClient`) et par les services `authService`, `studentDataService`, `parentService`, `familyService` et `onboardingService` de `@/services/…`.
  - Chaque service a une version Supabase et une version simulée, choisie par `config.backend` (`EXPO_PUBLIC_BACKEND`). La version simulée ne stocke aucun mot de passe.
  - Avatar : la table `avatars` garde l'apparence, les objets gagnés et ceux déjà annoncés (l'élève seulement, jamais les parents). Les objets gagnés sont calculés par l'app à partir de la progression écrite par le serveur, puis enregistrés (`useWardrobe`). L'avatar resté sur l'appareil avant l'étape A4 est repris à la première lecture, puis effacé de l'appareil ; en mode simulé, l'avatar reste sur l'appareil.
  - Le cache est vidé à chaque changement de compte (`queryClient.ts`).
- **Session et aiguillage :**
  - `SessionProvider` (`@/lib/session/SessionProvider`) expose `useSession`, `useAccount`, `useStudentAccount` et `useParentAccount`.
  - `resolveSpace` (fonction pure testée) choisit l'espace ; `src/app/_layout.tsx` le traduit en `Stack.Protected`. En SDK 57, c'est l'ordre des blocs qui décide où l'on arrive.
  - Les gardes ne tournent que dans l'app : chaque route API vérifie aussi l'utilisateur (`requireUser` de `server/auth.ts`).
- **Supabase :**
  - Clé publiable (`sb_publishable_…`) dans l'app ; clé secrète (`sb_secret_…`) dans `server/` seulement (`getAdminClient`). Les anciennes clés `anon` et `service_role` ne sont pas utilisées.
  - Les mots de passe ne passent que par Supabase Auth : jamais par nos tables, nos journaux ni nos routes API.
  - Une migration par changement, testée en local (`db:reset` puis `db:test`), montrée à Romain avant d'être appliquée en ligne. Rien d'irréversible (suppression de table ou de colonne, réécriture de données) sans son accord explicite.
  - Chaque table : RLS activée, politiques `to authenticated` avec `(select auth.uid())`, une politique par action, `GRANT` explicites (rien pour `anon`), FK indexées.
  - Les fonctions d'aide vivent dans le schéma `private` (non exposé), en `security definer` avec `set search_path = ''`, et `revoke execute … from public`.
  - L'élève n'écrit que des colonnes précises (droits `UPDATE` par colonne) et ses réponses de flashcards ; XP, séries, maîtrise et agrégats sont calculés par des déclencheurs. Le reste (conversations, séances écrites et vocales, parties des niveaux d'Explorer, codes, consentements) est écrit par le serveur.
  - Les parents ne lisent jamais les conversations ni les messages : seulement des agrégats et des résumés structurés.
  - Le « jour » est celui de l'heure de Paris, en SQL comme en TypeScript (`@/lib/parisTime`).
- **Tuteur IA :**
  - Les écrans utilisent `tutorService` de `@/services/tutor` (interface `TutorService`), jamais `fetch` ni OpenAI directement.
  - La version simulée (`mock/`) sert aux tests, au développement hors ligne et au mode hors ligne assumé.
  - Le contrat app / serveur est défini dans `src/services/tutor/api-contract.ts`, avec les limites partagées (`TUTOR_LIMITS`).
  - Le prompt système vit dans `server/tutor/prompt.ts` : toute modification incrémente `TUTOR_PROMPT_VERSION`.
  - Chaque route serveur valide sa requête, limite le débit et modère les contenus avant d'appeler OpenAI.
    - `requireTutorAccess` (`server/tutor/access.ts`) vérifie l'élève connecté, le consentement parental, les réglages du parent (vocal, caméra, pause du soir, limite du jour) et la limite partagée en base (`server/guards/sharedRateLimit.ts`).
    - La limite en mémoire (`server/guards/rateLimit.ts`) reste une première barrière par installation.
  - L'historique de la discussion est relu en base à partir de `conversationId`, jamais repris de l'app. Les messages sont enregistrés par le serveur ; une réponse retirée par la modération ne l'est pas.
  - Chat libre :
    - le sujet (`TutorTopic`) est facultatif : sans chapitre, le prompt reçoit `FREE_CHAT` ;
    - l'identifiant de discussion est tenu par l'écran (`useTutorChat`, option `resume`), jamais par `tutorService` ; sans identifiant, le serveur ouvre une discussion et l'annonce par l'événement `conversation` ;
    - une discussion reprise garde le sujet de sa séance (vérité du serveur), et après 30 minutes de silence elle ouvre une nouvelle séance (`RESUME_GAP_MS`) ;
    - le titre et la matière sont donnés ensemble par `nameOf` (`server/tutor/title.ts`, sortie structurée, titre modéré, sinon le début de la question) après le premier échange d'une discussion sans titre (nouvelle, ou d'avant les titres), jamais pour un niveau ; la matière reconnue est écrite dans la séance seulement si la discussion n'avait ni matière ni chapitre, et arrive dans l'événement `title` ;
    - le volet lit les discussions par `conversationService` (`@/services/conversations`) : l'élève les liste et les supprime (RLS), les parents n'y ont jamais accès.
  - Le vocal commence par `/api/tutor/voice/start` (`server/tutor/voice.ts`) : l'app y envoie son offre WebRTC, le serveur crée l'appel chez OpenAI (`openRealtimeCall`, `server/tutor/realtime.ts`, interface unifiée `realtime.calls.create`) avec sa clé et ses consignes, enregistre le début de séance et ne renvoie que la réponse SDP (aucun jeton). La fin passe par `/api/tutor/voice/end` (plafond 10 min).
  - Surveillant du vocal (`monitor/`) : `voice/start` confie chaque appel au surveillant (`attachVoiceMonitor`, `server/tutor/voiceMonitor.ts`) avec l'empreinte des consignes, les outils, la durée permise (`secondsUntilBlock` : 10 min au plus, ou la prochaine pause du parent), la légende de photo permise et le nombre de photos. Sans surveillant, l'appel est raccroché et refusé (le développement local seul s'en passe). Les règles sont dans `monitor/callMonitor.ts` (fonction testée, effets injectés) ; `monitor/main.ts` n'est que la colle (HTTP, WebSocket, OpenAI). `monitor/` n'importe que des fichiers sans dépendance de l'app, avec leur extension `.ts` (Node les exécute tels quels) : c'est le cas de `server/guards/moderationRules.ts`, partagé avec le serveur intermédiaire.
  - Voix de l'élève : une détresse fait glisser au tuteur la consigne `VOICE_SAFETY_NOTES.distress` (`server/tutor/prompt.ts`) après sa réponse en cours, sans raccrocher (3114, 119, puis pause ou suite) ; des propos déplacés le font couper et recentrer (`offTopic`), et l'appel s'arrête au troisième. Une phrase du tuteur signalée est coupée (`tutorCut`), et l'appel s'arrête à la deuxième : la modération signale aussi des refus (« pas de violence »). Ces consignes sont envoyées au surveillant avec l'appel ; ce sont les seuls messages système permis (`monitor_<n>`).
  - Les photos arrivent sans leur image dans les événements de l'appel : le surveillant redemande l'élément (`conversation.item.retrieve`) pour les modérer. OpenAI envoie aussi un `session.updated` au démarrage : le surveillant compare les consignes, il ne raccroche pas au premier.
  - Appel vocal plein écran (v2.6, `VoiceTutorScreen`, composants `src/features/tutor/components/call/`) :
    - les sous-titres ne reprennent que la voix du tuteur : celle de l'élève n'est transcrite que pour le surveillant (`REALTIME_TRANSCRIPTION_MODEL`), qui la modère, et n'est jamais affichée ni enregistrée ; `startVoiceSession` reçoit `onCaption`, `onLevel` (niveau de la voix du tuteur, lu par `getStats`) et `onVisual`, et `useVoiceCall` expose `caption`, `level` (valeur partagée Reanimated, sans rendu), `captionsOn` (retenu sur l'appareil) et `visual`, sans changer les états de `voice.ts` ;
    - hors d'Explorer et si le parent les autorise, le tuteur vocal a les outils de visuels ; chaque appel d'outil reçu sur le téléphone passe par `/api/tutor/visual-check` (`server/tutor/visualCheck.ts` : mêmes validations qu'à l'écrit, modération) avant d'être dessiné, et un visuel refusé n'est jamais affiché ;
    - la barre d'onglets se masque pendant l'appel (`BottomNav`) ; X4b (la voix dans Explorer) garde `CallControls` et `VoiceVisualizer`.
  - Niveaux d'Explorer (`topic.levelId`, `server/tutor/level.ts`) :
    - le tuteur écrit juge par des outils (`record_answer`, `complete_step`), plafonnés par `applyCalls` (`src/features/explorer/logic/levelPlay.ts`) : c'est le serveur qui calcule le score, jamais l'app ;
    - la partie d'une séance est dans `level_attempts`, et `finish_level` (une fois par partie) garde le meilleur résultat dans `level_progress` et ajoute l'XP à la séance : 10 XP la première fois que le niveau est terminé, puis 10 XP par étoile nouvelle (même règle que `awardedXp` en TypeScript). La maîtrise du chapitre n'en dépend pas ;
    - chaque visite d'un niveau est une nouvelle partie (nouvelle discussion), et une conversation ne se reprend que sur le même niveau ;
    - à la voix, seules les leçons se jouent, sans outil : l'appel compte comme une séance (avec son `level_id`), sans étoiles ni validation ;
    - une leçon écrite prend le format `LESSON_FORMAT` (professeur d'un très grand lycée : utilité dans la vie, notion, exemple résolu, question de vérification) et jusqu'à 1 500 tokens ; les consignes reçoivent le programme du niveau (`server/content/maths4e.ts` : capacités, attendus, précisions) et, hors leçon, ses exercices corrigés, qui ne partent jamais dans l'app.
  - Formules : à l'écrit, le tuteur écrit ses calculs en LaTeX (`$…$` dans la phrase, `$$…$$` seul sur sa ligne), selon `MATH_FORMAT` de `server/tutor/prompt.ts`. L'app les dessine sur l'appareil avec MathJax 4 (`@mathjax/src`, `src/features/tutor/math/texToSvg.ts`, chargé au premier besoin, dans un bloc protégé) et `react-native-svg`. Une formule invalide, ou qui demanderait une police non incluse, reste affichée en texte. Les « imports » de package.json de MathJax (`#default-font/…`) sont traduits dans `metro.config.js`. Ni le vocal ni les résumés pour le parent n'écrivent de LaTeX.
  - Visuels du tuteur (chantier 3, à l'écrit) :
    - le tuteur ne dessine jamais : il décrit un visuel par un outil (`show_graph`, `write_board`, `show_chart`, `draw_figure`, `server/tutor/visuals.ts`), proposé seulement si le parent l'autorise (`visuals_enabled`) ;
    - le serveur valide la description (zod, limites `VISUAL_LIMITS`, couleurs `VISUAL_TONES`, expressions lues par `parseExpression`, jamais d'`eval`), la modère avec la réponse, la garde dans `messages.visual` et l'envoie dans le flux (`visual`, après le texte) ; un visuel mal formé est ignoré, la réponse reste ;
    - l'historique relu par le modèle rappelle les visuels montrés (`visualSummary`), et la séance note `graph` ou `whiteboard` (P3) ;
    - l'app les dessine avec ses composants (`src/features/tutor/components/visual/` : `MathGraph`, `StatChart`, `GeoFigure`, `Whiteboard`, `VisualPanel`, `VisualModal`, `VisualChip`) et les couleurs de `src/theme/visualArt.ts` ; les mots d'une formule (`\text{…}`) sont écrits en Satoshi ;
    - le contrat partagé est dans `src/services/tutor/visuals.ts`.
  - Photo d'un exercice à l'écrit (C4) :
    - `ChatRequest.image` (data URL JPEG ou PNG, `TUTOR_LIMITS.imageMaxBytes`), préparée par `takeExercisePhoto` (appareil photo ou galerie) et tenue par `usePhotoDraft` jusqu'à l'envoi ;
    - le serveur la refuse si le parent a désactivé la caméra ou pendant une évaluation d'Explorer, applique la limite des photos (`consumeImageLimit`), la modère (`moderateImage`) puis l'envoie au modèle (`input_image`) ;
    - la photo n'est jamais enregistrée ni journalisée : le message garde `PHOTO_NOTE`, et la consigne `PHOTO_FORMAT` demande au tuteur de recopier l'énoncé (sans nom ni établissement) pour s'en souvenir.
  - Résumés pour le parent (`server/tutor/summaries.ts`) : sortie structurée (notions comprises, points à revoir, résultat) et modérée, mise en forme dans l'app. Jamais de transcription ni de texte libre de l'élève.
  - Aucune donnée personnelle n'est envoyée à OpenAI : ni prénom, ni âge exact, ni auto-évaluation, et e-mails et téléphones sont masqués. `safety_identifier` est un hachage de l'identifiant. Le résumé de la semaine écrit `{prenom}`, remplacé dans l'app.
- **Accessibilité :**
  - Utiliser les props `aria-*` (`aria-selected`, `aria-checked`, `aria-disabled`) plutôt que `accessibilityState` : React Native Web ignore ce dernier.
  - Pour les éléments interactifs, toujours passer par `PressableBase`, qui gère l'anneau de focus clavier sur le web.
- **Styles :** sur le web, un raccourci (`padding`) passé avant une propriété précise (`paddingHorizontal`) peut l'écraser. Les composants posent donc des propriétés précises.
- **Explorer en 3D :** la scène ne calcule d'images que si l'onglet est affiché et l'app au premier plan (`useSceneActive`, `frameloop="never"` sinon) ; « Réduire les animations » fige l'île ; sans WebGL ou si la scène échoue, l'image fixe rendue par Blender (`assets/explorer/images/`) la remplace.
- **Contexte 3D sur Android :** un écran caché (onglet inactif, écran empilé par-dessus) perd sa vue 3D et son contexte. Une scène qui doit survivre à un aller-retour prend `useSceneKey()` (`@/lib/three/useSceneKey`) comme clé de son `Canvas` (ou de son `SceneBoundary`) : elle est recréée au retour, au lieu de dessiner dans un contexte détruit.
- **Modèles 3D :** les charger avec `useModel` / `preloadModel` de `@/lib/three/useModel`, jamais avec `useLoader` ni rien qui suspende sous un `Canvas`. Sur Android, l'app et la scène 3D partagent les valeurs de contexte : une reprise de Suspense, rendue par tranches, laisse fuir le contexte de navigation de la scène, et React Navigation s'arrête (« nested a NavigationContainer »).
- **Vérification visuelle :** comparer chaque écran à sa maquette, sur le web en 390 px de large (`npm run web`), et sur un vrai téléphone via Expo Go.
- **Hooks git :** le pre-commit lance `lint-staged` (ESLint + Prettier sur les fichiers modifiés) et `npm run typecheck`. La CI (`.github/workflows/ci.yml`) vérifie que les tokens sont à jour et lance `npm run check`.

## 11. Points de vigilance avant publication
1. **Vocal :** avec l'API Realtime, le client peut modifier les consignes de sa session (`session.update`), et un appel peut durer 60 min. Les visuels demandés par le tuteur sont validés et modérés par le serveur (`/api/tutor/visual-check`), et le surveillant modère la voix du tuteur et raccroche à 10 min.
   - Le surveillant (`monitor/`) vérifie les consignes, modère la voix du tuteur et les photos, et raccroche ; il reste à le déployer (Render, région Francfort) avec ses secrets.
   - Limite : un `response.create` d'une app modifiée, avec ses propres consignes, ne se voit pas. À évaluer avant la production : GPT-Live, où le serveur détient la configuration.
   - `react-native-webrtc` n'est pas officiellement testé sur la nouvelle architecture : à valider sur un build de développement. Sur iOS, vérifier aussi que le son sort par le haut-parleur.
2. **Limite de débit et authentification :**
   - La limite par élève est partagée en base (`rate_limits`, fonction `consume_rate_limit`) ; celle en mémoire ne sert que de première barrière.
   - Les routes du tuteur exigent un compte connecté. Il reste à ajouter App Attest et Play Integrity, et Turnstile sur le web, contre les inscriptions automatisées.
   - La connexion Apple est obligatoire dès que Google est proposé (règle 4.8) : les deux arrivent ensemble.
3. **Mineurs, RGPD et OpenAI :**
   - Le consentement parental est obligatoire sous 15 ans (CNIL). Il vient d'un e-mail parent vérifié et différent de celui de l'élève (invitation ou code de liaison), et sa preuve est conservée (`parental_consents`). Sans validation, le compte de l'élève est supprimé au bout de 30 jours.
   - OpenAI exige la conservation zéro des données (ZDR) pour ce public ; elle se demande à son équipe commerciale. `store: false` ne suffit pas.
   - Prévoir une politique de confidentialité et un consentement explicite avant le premier usage de l'IA (règle Apple 5.1.2).
   - Conservation (`private.purge_expired_data`, pg_cron chaque nuit) : messages et signalements 6 mois, résumés de la semaine 12 mois, codes de liaison 7 jours après expiration, comptes non validés 30 jours ; séances et progression jusqu'à la suppression du compte.
   - Suppression du compte et export des données (JSON) sont dans l'app, pour l'élève (profil) comme pour le parent (P4).
4. **E-mails et Supabase en ligne :**
   - Le serveur d'e-mails par défaut de Supabase n'envoie qu'aux membres de l'équipe du projet : brancher **Brevo** (SMTP) avant tout test avec de vraies adresses.
   - Reporter en ligne la configuration de `supabase/config.toml` : confirmation par code à 6 chiffres, modèles d'e-mails en français, URL du site et de redirection, connexion anonyme désactivée.
   - Un projet gratuit se met en pause après 7 jours d'inactivité, et les purges avec lui : offre payante en production.
   - Région du projet : UE (eu-west-1), à conserver.
5. **Stores :**
   - Ne pas classer l'app dans la catégorie Kids d'Apple.
   - Déclarer l'usage de l'IA sur Google Play : le signalement est déjà dans l'app.
   - Remplacer l'icône provisoire de 250 px par une source de 1024 px.
   - Vérifier sur un vrai iPhone que « Choisir dans la galerie » (photo d'un exercice) s'ouvre sans demander d'autorisation : `photosPermission` est désactivé dans `app.config.ts`, et le sélecteur du système ne devrait pas en avoir besoin.
   - `expo-notifications`, `expo-sharing` et `expo-file-system` sont des modules natifs : il faut un nouveau build de développement EAS.
6. **Déploiement :**
   - Sur EAS, `OPENAI_API_KEY`, `SUPABASE_SECRET_KEY` et `LINK_CODE_PEPPER` doivent être des variables « sensitive ». Changer `LINK_CODE_PEPPER` invalide les codes de liaison en cours.
   - Renseigner `EXPO_PUBLIC_API_BASE_URL` (ou l'`origin` d'Expo Router) pour les builds natifs de production.
   - Ne pas laisser un tunnel de développement ouvert sans surveillance : les routes API y sont publiques.
   - Passer le surveillant du vocal sur l'offre « starter » de Render (toujours allumée) : l'offre gratuite se met en veille et refuse le premier appel au réveil.
