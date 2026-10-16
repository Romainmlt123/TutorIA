# Tutor'IA — dossier design (app élève)

Maquettes validées de l'application mobile élève Tutor'IA, prêtes à être implémentées.
Source de vérité visuelle : le canevas Design « Tutor'IA · App mobile élève » sur claude.ai. Il contient 54 écrans iPhone de 390 px de large : 19 côté élève, 8 pour l'onglet Explorer, 4 dans l'espace Parents et 23 pour le compte (connexion, inscription, mot de passe oublié, accord d'un parent) et l'onboarding.

## Contenu

```
design/
├── README.md            ← ce fichier : vue d'ensemble, écrans, règles
├── COMPONENTS.md        ← inventaire des composants à créer, avec leurs specs
├── DESIGN_SYSTEM.md     ← README du design system Tutor'IA (règles de marque, couleurs des matières, écarts validés)
├── design-system/       ← les 121 composants publiés dans le design system (référence : bundle, props typées, fiches)
├── tokens/
│   ├── tokens.json      ← tokens officiels du design system (couleurs, type, espaces, rayons, ombres)
│   ├── app-tokens.json  ← ajouts propres à l'app (matières, jeu, KPI, vocal, bandeaux, appel vocal)
│   └── tokens.css       ← tout en variables CSS + @font-face Satoshi
├── assets/              ← images des maquettes
│   └── lea-debout.png        ← la figurine de Léa (rendu de la figurine de l'app, assets/avatar/avatar.glb)
├── components/          ← composants partagés des maquettes (importés par les écrans)
│   ├── support.js            ← moteur de rendu des maquettes (copie, voir « Voir une maquette dans un navigateur »)
│   ├── BottomNav.dc.html     ← barre de navigation élève et Parents (props espace, active)
│   ├── ModeToggle.dc.html    ← bascule Écrit / Vocal (props mode, variante)
│   ├── TopicCard.dc.html     ← carte sujet de discussion, dans le dégradé de sa matière (props matiere, titre, badge, live ; matiere « toutes » pour une discussion libre)
│   ├── PanelHeader.dc.html   ← en-tête graphique / tableau blanc (props type, titre, kicker, live, open, onToggle)
│   ├── CallControls.dc.html  ← micro / raccrocher / caméra de l’ancien X4b (plus utilisé depuis la v2.13)
│   ├── CallTopBar.dc.html    ← appel vocal : « Écrit » + chrono (props timer, ecritHref)
│   ├── VoiceAvatar.dc.html   ← appel vocal : logo du tuteur qui rebondit (props size, hop, tilt, label, onInterrupt)
│   ├── VoiceStatus.dc.html   ← appel vocal : pastille d'état (props etat, couleurEcoute)
│   ├── CallDock.dc.html      ← appel vocal : micro, sous-titres, caméra, raccrocher (props muted, captions, camOn, cameraVisible, onMute, onCaptions, onCam, hangupHref)
│   └── ExplorerMap.dc.html   ← carte d'une île (mer, chemin, villes, niveaux, avatar), partagée par X2 et X3
└── screens/             ← source HTML de chaque écran (format « Design Component »)
    ├── support.js                      ← moteur de rendu des maquettes (même fichier que dans components/)
    ├── 01-Accueil.dc.html
    ├── 02a-Tuteur-Ecrit.dc.html
    ├── 02b-Tuteur-Vocal.dc.html
    ├── 02c-Tuteur-Ecrit-Graphique.dc.html
    ├── 02d-Tuteur-Vocal-Graphique.dc.html
    ├── 02e-Tuteur-Ecrit-Tableau.dc.html
    ├── 02f-Tuteur-Vocal-Tableau.dc.html
    ├── 02g-Tuteur-Nouvelle-Discussion.dc.html   ← l'onglet Tutor'IA s'ouvre ici (v2.12)
    ├── 02h-Tuteur-Tes-Discussions.dc.html       ← volet ☰
    ├── 02i-Tuteur-Photo-Choix.dc.html           ← photo d'un exercice
    ├── 02j-Tuteur-Photo-Apercu.dc.html
    ├── 02k-Tuteur-Photo-Envoyee.dc.html
    ├── 03a-Flashcards-Choix.dc.html
    ├── 03b-Flashcards-Session.dc.html           ← question
    ├── 03b2-Flashcards-Session-Juste.dc.html    ← bonne réponse
    ├── 03b3-Flashcards-Session-A-Revoir.dc.html ← à revoir
    ├── 03c-Flashcards-Bilan.dc.html             ← bilan de la session
    ├── 04-Stats.dc.html
    ├── 05-Profil.dc.html              ← profil de l'élève (v2.8)
    ├── P1-Parents-Accueil.dc.html      ← espace Parents
    ├── P2-Parents-Progres.dc.html
    ├── P3-Parents-Sessions.dc.html
    ├── P4-Parents-Reglages.dc.html
    ├── L1-Connexion-Choix.dc.html      ← compte : connexion et inscription
    ├── L2-Connexion-Eleve.dc.html
    ├── L2b-Connexion-Eleve-Code-Garde.dc.html
    ├── L7-Code-Parent.dc.html
    ├── M1-MotDePasse-Email.dc.html     ← mot de passe oublié
    ├── M2-MotDePasse-Code.dc.html
    ├── M3-MotDePasse-Nouveau.dc.html
    ├── L3-Connexion-Parent.dc.html
    ├── L4-Inscription-Parent.dc.html
    ├── L4b-Inscription-Parent-Verification.dc.html
    ├── L5-Inscription-Parent-Enfant.dc.html
    ├── L6-Inscription-Parent-Code.dc.html
    ├── C1-Accord-Tuteur-En-Attente.dc.html   ← moins de 15 ans : l'accord d'un parent
    ├── C2-Accord-Relier-Parent.dc.html
    ├── C3-Accord-Invitation-Parent.dc.html
    ├── C4-Accord-Validation-Parent.dc.html
    ├── E1-Inscription-Eleve.dc.html    ← inscription élève et onboarding
    ├── E2-Verification-Email.dc.html
    ├── O1-Onboarding-Classe.dc.html
    ├── O2-Onboarding-Matieres.dc.html
    ├── O3-Onboarding-Objectifs.dc.html
    ├── O4-Onboarding-Style.dc.html
    ├── O5-Onboarding-Pret.dc.html
    ├── X1-Explorer-Iles.dc.html        ← onglet Explorer (X1 à X3b : anciennes maquettes, scène 3D : le code fait foi)
    ├── X2-Explorer-Carte.dc.html
    ├── X3-Explorer-Niveau.dc.html
    ├── X3b-Explorer-Niveau-Evaluation.dc.html
    ├── X4-Explorer-Discussion.dc.html
    ├── X4b-Explorer-Discussion-Vocal.dc.html
    ├── X4c-Explorer-Quitter.dc.html          ← « Quitter le niveau ? » (v2.14)
    ├── X5-Explorer-Bilan.dc.html
    ├── X5b-Explorer-Bilan-Consolider.dc.html
    ├── R1-Pause-Soir.dc.html            ← règles des parents côté élève (v2.15) : pause du soir
    ├── R2-Pause-Plage.dc.html           ← hors de la plage horaire
    ├── R3-Pause-Temps.dc.html           ← temps du jour atteint
    ├── R4-Vocal-Appels-Du-Jour.dc.html  ← appels du jour faits
    ├── R5-Accueil-Accord.dc.html        ← Accueil, un parent doit valider (comme l’app)
    ├── R6-Explorer-Pause.dc.html        ← un niveau d’Explorer pendant la pause
    ├── R7-Tuteur-Sans-Vocal.dc.html     ← vocal et caméra coupés par un parent
    ├── D1-Confidentialite-Eleve.dc.html   ← données et confidentialité (v2.16) : confidentialité, élève
    ├── D2-Supprimer-Compte-Eleve.dc.html  ← supprimer ton compte
    ├── D3-Donnees-Parent.dc.html          ← données personnelles, parent
    ├── D4-Supprimer-Compte-Enfant.dc.html ← supprimer le compte de l’enfant
    ├── F1-Ajouter-Enfant.dc.html          ← famille (v2.18) : ajouter un enfant, depuis P4 ou le choix de l’enfant
    ├── F2-Code-Enfant.dc.html             ← le profil est prêt, son code
    ├── F5-Modifier-Enfant.dc.html         ← modifier le profil d’un enfant (« Modifier » de P4)
    ├── F3-Choisir-Enfant.dc.html          ← choisir l’enfant affiché (pastille de P1)
    ├── F4-Demande-Liaison.dc.html         ← demande de liaison d’un enfant (P1)
    ├── J1-Accueil-Premier-Jour.dc.html    ← premiers jours (v2.19) : l’Accueil avant la première séance
    ├── J2-Stats-Premier-Jour.dc.html      ← les Stats avant la première séance (comme l’app)
    ├── J3-Parents-Sans-Enfant.dc.html     ← l’espace Parents sans enfant relié
    ├── J4-Parents-Semaine-Vide.dc.html    ← l’espace Parents, semaine sans séance (comme l’app)
    ├── H1-Tuteur-Hors-Ligne.dc.html       ← hors connexion : le tuteur sans réseau
    ├── H2-Pas-De-Connexion.dc.html        ← pas de réseau au premier lancement
    └── B1-Bientot.dc.html                 ← « Bientôt disponible » (réglage de Flashcards)
```

## Historique des mises à jour

- **v1**
  - 6 écrans élève : Accueil, Tuteur écrit et vocal, Flashcards (choix et session), Stats.
- **v2**
  - Tuteur avec **graphique** (02c, 02d) et avec **tableau blanc** (02e, 02f), en écrit et en vocal.
  - **Espace Parents** (P1 à P4).
  - Nouveaux composants dans `COMPONENTS.md` : sections « Tuteur visuel » et « Espace Parents ».
  - Nouveaux tokens dans `tokens/app-tokens.json` : `statuses`, `hero`, `settingTiles`.
  - Les 6 écrans de la v1 n'ont pas changé.
- **v2.1**
  - Les éléments répétés des maquettes sont maintenant de **vrais composants partagés**, dans `components/`.
  - Chaque écran les importe avec `<dc-import name="../components/BottomNav" espace="eleve" active="tuteur">`. Les attributs en kebab-case deviennent des props en camelCase.
  - Aucun changement visuel. C'est la **frontière de composants à reproduire dans le code** : un seul composant par élément, piloté par ses props.

- **v2.2**
  - Les **46 composants** de l'app sont publiés dans le design system Tutor'IA et copiés dans `design-system/` : un bundle React de référence (`bundle.js`), les props typées (`index.d.ts`) et une fiche par composant.
  - `DESIGN_SYSTEM.md` est à jour : couleurs des matières, écarts validés, liste des composants par groupe.
  - Aucun changement dans les maquettes ni dans `tokens/`.
- **v2.3**
  - **Connexion et inscription** (L1 à L6) : choix du profil, connexion élève et parent, inscription parent avec ajout de l'enfant et code de liaison.
  - **Inscription élève et onboarding** (E1, O1 à O5) : création de compte autonome, puis classe, auto-évaluation par matière, objectifs, façon d'apprendre et plan personnalisé.
  - 18 nouveaux composants dans le design system (64 au total) et dans `COMPONENTS.md`, section « Connexion et onboarding ».
  - Les écrans des versions précédentes et `tokens/` n'ont pas changé.
- **v2.4**
  - **Onglet Explorer** (X1 à X5b), qui remplace « Parcours » : carrousel des îles-matières, carte d'aventure de l'île, fiche d'un niveau, discussion de niveau à l'écrit et à la voix, bilan réussi ou à consolider.
  - La barre de navigation élève affiche **Explorer** avec une boussole (`active="explorer"` ; `parcours` reste accepté comme alias). Les autres écrans élève n'ont pas changé.
  - Nouveau composant partagé `components/ExplorerMap.dc.html`.
  - 17 nouveaux composants dans le design system (81 au total) et dans `COMPONENTS.md`, section « Explorer ».
  - `tokens/` n'a pas changé : les couleurs des types de niveau et de la carte sont à ajouter dans `tokens/app-tokens.json` au moment du développement (voir la section Explorer).
- **v2.5** (7 octobre 2026)
  - **Bandeau de marque** en haut de l'Accueil, des Flashcards · Choix, des Stats et des 4 écrans Parents : le titre de l'écran (30 px Black, en blanc) est posé sur un dégradé à 170° aux coins bas arrondis, et la première carte de l'écran déborde dessus. Bleu pour l'Accueil et les Flashcards, violet de marque pour les Stats et l'espace Parents.
  - **Chaque titre de section vit dans sa carte** : carte blanche `radius-3xl` + `shadow-md`, titre en 22 px Black. Plus aucun titre de section n'est posé directement sur le fond `bg`.
  - Accueil : « Objectif du jour » devient une carte verte (dégradé #0C9E42 → #03702B) et le titre de la carte « Reprendre » passe en Black.
  - Les 7 écrans touchés sont plus hauts, pour que la fin du contenu ne passe plus sous la barre de navigation.
  - Nouveaux tokens : `screenBand`, `sectionTitle` et `goal` dans `tokens/app-tokens.json`, variables `--band-*`, `--on-band-veil`, `--section-title-size` et `--goal-gradient` dans `tokens/tokens.css`. Le générateur (`scripts/tokens/generate.ts`) ne les exporte pas encore dans `src/theme/tokens.generated.ts`.
  - `COMPONENTS.md` : nouvelle section « En-têtes et sections » (ScreenBand, SectionCard) ; specs des composants touchés mises à jour.
  - Les autres écrans (Tuteur, Flashcards · Session, Explorer, connexion et onboarding) n'ont pas changé. Le design system (`DESIGN_SYSTEM.md`, `design-system/`) n'est pas encore mis à jour : les règles de la v2.5 font foi.
- **v2.6** (7 octobre 2026)
  - **Appel vocal refait** (2B, 2D, 2F) : écran d'appel plein écran sur le dégradé de marque, sans barre de navigation. Le logo du tuteur remplace les barres : il rebondit quand il parle et penche la tête quand il écoute. Pastille d'état verte « Je t'explique… » ou rouge « Je t'écoute… », sous-titres en direct, commandes en verre (micro, sous-titres, caméra, raccrocher). Avec un graphique ou un tableau, le visuel prend la moitié haute, le logo passe dessous, et la voix et le visuel avancent ensemble.
  - Nouvelle section « Appel vocal : ce que l'écran doit faire » (états, interactions, synchronisation, à changer dans le code). Écarts 20 à 22 ; l'écart 6 est remplacé.
  - Nouveaux composants partagés des maquettes : `CallTopBar`, `VoiceAvatar`, `VoiceStatus`, `CallDock`. `CallControls` ne sert plus qu'à X4b.
  - Design system (86 composants) : `CallTopBar`, `VoiceAvatar`, `VoiceStatus`, `LiveCaptions`, `CallDock` ; `VisualPanel` et `PanelHeader` teintés par sorte de visuel (comme dans l'app), `MathGraph` avec `focus`, `Whiteboard` qui s'écrit en direct (`progress`, `writing`). Copié dans `design-system/` et `DESIGN_SYSTEM.md`.
  - Tokens : `voiceCall` dans `tokens/app-tokens.json`, variables `--call-*`, `--voice-*` et `--caption-upcoming` dans `tokens/tokens.css`. Le générateur ne les exporte pas encore (sa sortie est inchangée).
  - `support.js` ajouté dans `screens/` et `components/` : les maquettes s'ouvrent maintenant dans un navigateur (voir « Voir une maquette dans un navigateur »).
- **v2.7** (8 octobre 2026)
  - **Connexion plein écran** (L2 élève, L3 parent), validée par Romain parmi trois pistes (bandeau de marque, plein écran, le tuteur t'accueille) : dégradé de l'espace sur tout l'écran, logo du tuteur de 96 px qui fait un petit rebond pour dire bonjour, titre en blanc, formulaire dans une feuille blanche qui monte du bas, champs remplis, Apple / Google empilés en pleine largeur. L1 ne change pas ; L4 à L6 et E1 non plus pour l'instant.
  - Le champ « Code parent » quitte la connexion élève : un lien « J'ai un code de mon parent » sous le formulaire ouvre sa saisie.
  - Design system (87 composants) : nouveau `AuthScreen`, `TextField` avec `filled`, fiches `AuthHero`, `AuthProviderButtons` et `OrDivider` mises à jour. Copié dans `design-system/` et `DESIGN_SYSTEM.md`.
  - Tokens : `auth` dans `tokens/app-tokens.json`, variables `--auth-parent-gradient`, `--sheet-*` et `--field-filled-border` dans `tokens/tokens.css`.
  - Les trois pistes restent en haut du canevas (rangée « Pistes · Connexion et inscription »).
- **v2.8** (8 octobre 2026)
  - **Profil de l'élève** (`05-Profil.dc.html`), l'écran ouvert en touchant son rond sur l'accueil, qui n'avait pas de maquette. Validé par Romain parmi trois variantes (carte d'identité, carte de joueur, épuré) : la carte d'identité, avec les trophées de la carte de joueur et un résumé retravaillé.
  - La figurine de Léa est un vrai rendu de la figurine de l'app (`assets/avatar/avatar.glb` : chignons, sweat orange, sac à dos violet), dans `design/assets/`.
  - Design system (92 composants) : `ProfileHero`, `ProfileSummary`, `LevelBar`, `TrophyShelf`, `TrophyBadge` ; icônes `download`, `logout`, `trash`, `gift`, `trophy`. Copié dans `design-system/` et `DESIGN_SYSTEM.md`.
  - Tokens : `profile` dans `tokens/app-tokens.json`, variables `--level-*` et `--trophy-locked*` dans `tokens/tokens.css`.
  - Le rond « L » de l'accueil mène maintenant au profil dans les maquettes. Les trois variantes restent en haut du canevas.
- **v2.9** (8 octobre 2026)
  - **Canevas nettoyé** : les 24 écrans de pistes et de variantes non retenues sont retirés (en-tête de l'accueil, mode vocal, vocal avec visuel, connexion, profil). Ce qui a été retenu est déjà dans les écrans validés ; les pistes restent consultables dans l'historique des versions du canevas.
  - **Rangé par parcours**, de haut en bas : 1 · Démarrage (L1 → L2 ou L3) ; 2 · Inscription de l'élève et onboarding (E1 → O1 … O5 → accueil) ; 3 · L'élève au quotidien (accueil, profil, flashcards, stats) ; 4 · Le tuteur (2A à 2F, écrit et vocal côte à côte) ; 5 · Explorer (X1 à X5b) ; 6 · Inscription d'un parent (L4 → L5 → L6) ; 7 · Espace Parents (P1 à P4). Les composants partagés sont dans une colonne à droite.
  - **Parcours cliquables de bout en bout** en mode présentation : le bouton de L1 mène à L2 ou L3 selon le profil choisi, les flèches retour et « Passer » de l'onboarding enchaînent les étapes, L4 → L5 → L6 → P1. Seuls des liens ont changé (L1, L4, L5, L6, E1, O1 à O4) : les écrans sont identiques au pixel près.
- **v2.10** (9 octobre 2026)
  - **Les maquettes rattrapent l'app** : les retouches validées par Romain sur le Pixel, déjà codées (écarts 18, 27 et 28, retours v2.5 sur P1 et P2), sont reportées dans les maquettes, qui redeviennent la référence.
  - Accueil : l'objectif du jour passe en dégradé violet → bleu qui glisse lentement (6 s, aller-retour, figé avec « Réduire les animations ») ; la pastille « Plus qu’une ! » est en `primary`.
  - Profil : « Modifier l'avatar » en planche de bois et « Mes trophées » en armoire de bois (Lilita One, médailles dorées sur une étagère, « 10 sur 24 », trophées de la liste validée dans l'ordre du code) ; plus de « Retirer » à côté du parent (« Lien depuis le 2 septembre ») ; aides « Une notification chaque jour pour réviser » et « Bonnes réponses, série, trophées (bientôt) ».
  - P1 : sans le badge « Espace Parents » ; chiffres clés centrés, sans évolution ; « Comment l'encourager » ajoute deux questions à poser à l'enfant.
  - P2 : chaque matière dans un bloc teinté de sa couleur (`soft`), chapitres dépliés en lignes blanches.
  - P4 : « Se déconnecter » (violet doux, icône de sortie) et « Supprimer le compte » (rouge doux, corbeille) en boutons pleine largeur sous la carte « Compte », comme sur le profil. Dans l'app, « Se déconnecter » est encore une ligne de la carte « Compte » : à aligner.
  - O2 : l'écran passe à 1160 px, le bouton « Continuer » n'est plus coupé.
  - Design system (95 composants) : `GoalCard` en violet → bleu, `KpiCard` `centered`, `AdviceCard` `questions`, `SubjectProgressCard` teinté par défaut, `ProfileHero`, `TrophyShelf` et `TrophyBadge` en bois, et trois nouveaux composants du côté jeu : `GameText`, `WoodButton`, `WoodFrame`. Police Lilita One ajoutée au design system (`--font-game`). Copié dans `design-system/` et `DESIGN_SYSTEM.md`.
  - Les maquettes utilisent `../../assets/typographie/LilitaOne/LilitaOne-Regular.ttf` et la texture `../../assets/explorer/images/wood-panel.webp` du dépôt ; `tokens/tokens.css` déclare Lilita One et `--font-game`. `tokens/tokens.json` n'est pas modifié (l'app définit déjà sa police de jeu dans `src/theme/fonts.ts`).
- **v2.11** (9 octobre 2026)
  - **Lot « Compte »**, validé par Romain : tous les écrans de compte, sauf L1, passent sur `AuthScreen` (dégradé de l'espace, logo qui dit bonjour, feuille blanche), comme L2 et L3 depuis la v2.7. 11 écrans nouveaux, 46 en tout.
  - Refaits : E1 (Apple et Google officiels empilés, interrupteur « J'ai moins de 15 ans » rempli), L4, L5 (classes groupées Primaire, Collège, Lycée), L6 (étapes corrigées, bouton violet). L2 garde « E-mail » (écart 26) et mène maintenant à M1 et L7.
  - Nouveaux : L7 code de mon parent et L2b code gardé ; M1 à M3 mot de passe oublié, avec **la double saisie du nouveau mot de passe** (demandée par Romain) ; E2 et L4b vérification de l'e-mail ; C1 tuteur en attente, C2 relier un parent, C3 invitation et C4 validation côté parent. O5 et le profil mènent à C2.
  - Canevas : nouvelle rangée « 3 · Moins de 15 ans » ; les rangées sont renumérotées de 1 à 8.
  - Design system (101 composants) : `AuthScreen` sur tout le compte (titres équilibrés sur deux lignes), `PasswordRules` `pills`, `StepHeader` `back: false`, `GradePicker` `filled`, `ParentCodeCard` et `StepList` `plain` comme sur L6 ; six nouveaux composants : `CodeInput`, `PasswordMatch`, `SwitchField`, `HelpCard`, `InlineNotice`, `ConsentPendingCard`. Copié dans `design-system/` et `DESIGN_SYSTEM.md`.
  - Ce que l'app doit changer : « À changer dans le code (v2.11) », section « Compte ».
- **v2.12** (9 octobre 2026)
  - **Lot « Tuteur et révisions »**, validé par Romain. 8 écrans nouveaux, 54 en tout.
  - Refaits comme l'app : 2A (☰, Écrit / Vocal et + en tête ; carte du sujet dans le dégradé de sa matière ; bouton photo dans la saisie), 2C (graphique dans sa carte violette, pastille « Voir le graphique »), 2E (tableau azur, sans grille de points ni pastilles d'étapes, formules en police mathématique).
  - Nouveaux : 2G nouvelle discussion (l'onglet Tutor'IA s'ouvre ici : « Toutes les matières », quatre idées de départ, « Pose ta question… ») ; 2H volet « Tes discussions » (bandeau bleu, rangé par jour) ; 2I à 2K photo d'un exercice (appareil ou galerie, aperçu dans la saisie, bulle avec la photo ; la carte du sujet prend la couleur des Maths quand le tuteur reconnaît la matière).
  - Flashcards : 3B question, 3B2 bonne réponse, 3B3 à revoir, 3C bilan. Sans barre de navigation pendant la session ; bouton gris « Choisis une réponse » puis violet « Carte suivante » ; pastille du retour (coche verte, flèche orange) ; bilan en dégradé violet → bleu avec les compteurs, l'objectif du jour et « Choisir un autre chapitre ».
  - Composants des maquettes : `TopicCard` en dégradé (et « Toutes les matières »), `PanelHeader` aux boutons blancs de 48 px, `BottomNav` (l'onglet Tutor'IA mène à 2G).
  - Design system (107 composants) : `TopicCard`, `PanelHeader`, `ChatInput` (photo et aperçu), `ChatBubble` (photo), `QuizCard` (pastille du retour) ; six nouveaux composants : `ChatStarters`, `VisualChip`, `ConversationDrawer`, `PhotoSourceDialog`, `NextCardButton`, `SessionComplete`. Copié dans `design-system/` et `DESIGN_SYSTEM.md`.
  - Ce que l'app doit changer : « À changer dans le code (v2.12) », section « Barre de navigation ».
- **v2.13** (9 octobre 2026)
  - **La leçon d'Explorer dans le HUD de jeu**, validée par Romain : X4a (à l'écrit) et X4b (à la voix) quittent le fond rose et la version plate pour le ciel d'Explorer, l'en-tête du niveau du code en Lilita One et un tableau en **ardoise dans un cadre de bois**.
  - X4b : trois propositions, puis un mélange choisi par Romain. Le logo du tuteur flotte et rebondit (plus de barres), pastille d'état cernée de bleu nuit, sous-titres du tuteur dans une bulle de dialogue, commandes sur une planche de bois (boutons en relief bleus, jaunes quand ils sont actifs, rouge pour raccrocher).
  - X4a : variante « allégée » retenue après trois variantes. Ardoise épinglée et repliable, discussion dans un cadre clair cerné de bleu nuit avec la saisie en bas (photo en bouton blanc, envoi en bouton bleu en relief), « Étape 1 réussie ! » en bandeau vert de jeu, segments à faire en blanc translucide.
  - Design system (114 composants) : nouveaux `GameButton`, `LevelBackdrop`, `LevelHeader`, `SlateBoard`, `LevelStepCard`, `CaptionBubble`, `WoodCallDock` ; `Whiteboard` `chalk`, `VoiceStatus` `hud`, `ChatInput` `game`. `IslandBackdrop`, `LevelProgressHeader`, `VoiceBoardCard`, `VoiceVisualizer` et `CallControls` ne servent plus dans les maquettes. Copié dans `design-system/` et `DESIGN_SYSTEM.md`.
  - Ce que l'app doit changer : « À changer dans le code (v2.13) », section « Explorer ».
- **v2.14** (9 octobre 2026)
  - **Quitter et bilan d'un niveau d'Explorer**, validés par Romain, redessinés **à l'identique du code** (`WoodDialog`, `LevelResultPanel`) sur l'écran de la leçon.
  - Nouveau X4c « Quitter le niveau ? » : panneau de bois, « Quitter » en jaune, « Continuer » en vert. Le retour de X4a y mène.
  - X5a (leçon réussie) et X5b (évaluation à consolider) : panneau de bois avec ruban « type · verdict », étoiles or ou bois creusé, score, XP gagnée, puis ce que tu as travaillé ou la leçon à revoir. Ils remplacent les cartes vertes et orange.
  - X1 à X3b : la scène d'Explorer est en 3D dans l'app (three.js) ; **le code fait foi**. Les anciennes maquettes plates restent pour le parcours et les textes, avec un bandeau « Ancienne maquette · scène 3D : le code fait foi ».
  - Design system (117 composants) : nouveaux `Parchment`, `WoodDialog`, `LevelResultPanel` (remplace `LevelResultCard` et `TutorFeedback`). Copié dans `design-system/` et `DESIGN_SYSTEM.md`.
  - Ce que l'app doit changer : rien, ces écrans sont repris du code.
- **v2.15** (9 octobre 2026)
  - **Les règles des parents, côté élève** (R1 à R7), validées par Romain. Ces écrans existaient dans l'app sans maquette : chacun a été reproduit à l'identique du code, critiqué, puis Romain a choisi entre la version de l'app et une proposition.
  - R1 à R3, les pauses (soir après 21 h, hors de la plage horaire, temps du jour atteint) : comme C1, le logo du tuteur avec un badge, le titre et le texte sur le fond de marque, un bouton blanc « Revenir à l'accueil ». R3 félicite d'abord dans une carte verte, puis propose aussi « Voir mes progrès ».
  - R4, appels du jour faits : pastille « Appels du jour terminés », le message en clair, un seul bouton blanc « Continuer à l'écrit » (au lieu de « Connexion perdue » et des commandes de l'appel).
  - R5, Accueil d'un compte à valider : la carte violette de l'app est gardée.
  - R6, un niveau d'Explorer pendant la pause : panneau de bois sur un ciel de nuit, « Revenir à la carte ».
  - R7, vocal ou caméra coupés : « Vocal » grisé avec un cadenas, et une bulle qui explique pourquoi.
  - Design system (118 composants) : nouveau `StudyPauseScreen` ; `ModeToggle` `voiceLocked`, `VoiceStatus` `limit`, `LevelBackdrop` `night`, `WoodDialog` `tab` et `single`. Copié dans `design-system/` et `DESIGN_SYSTEM.md`.
  - Ce que l'app doit changer : « À changer dans le code (v2.15) », section « Règles des parents, côté élève ».
- **v2.16** (14 octobre 2026)
  - **Données et confidentialité** (D1 à D4), validées par Romain : les quatre propositions sont retenues. Même méthode qu'en v2.15 : chaque écran reproduit à l'identique du code, critiqué, puis redessiné.
  - D1, Confidentialité (élève) : les mêmes textes en listes (coches vertes, cadenas, durées en pastilles) ; « Tes droits » porte « Télécharger mes données » et « Supprimer mon compte ».
  - D2, Supprimer ton compte : une corbeille, « Télécharger mes données d'abord », « Garder mon compte » en bouton principal, la suppression en second.
  - D3, Données personnelles (parent) : bandeau violet comme P4, ce que Tutor'IA garde en pastilles, boutons violets, la carte de l'enfant avec son accord et la suppression à part.
  - D4, Supprimer le compte de Léa : une seule confirmation, avec la case « Je comprends que c'est définitif » qui active le bouton rouge plein.
  - Parcours : « Confidentialité » et « Supprimer mon compte » du Profil mènent à D1 et D2 ; « Données personnelles » de P4 mène à D3.
  - Design system (121 composants) : nouveaux `ConfirmDialog`, `PrivacyCard`, `ChildDataCard` ; `Button` `vividSoft` et `dangerSolid`. Copié dans `design-system/` et `DESIGN_SYSTEM.md`.
  - Ce que l'app doit changer : « À changer dans le code (v2.16) », section « Données et confidentialité ».
- **v2.17** (14 octobre 2026)
  - **Ombre portée sur le bandeau de marque**, décidée par Romain : les sections posées à cheval sur le bandeau ressortaient mal. Trois pistes ont été essayées (cartes en relief, cartes blanches, verre, dégradé du bandeau inversé) ; Romain a gardé les écrans tels quels, avec seulement une ombre portée sur ces sections.
  - L'ombre descend sous la carte et prend sa couleur : orange sous la série, bleu nuit sous le niveau et les cartes blanches, violet dans l'espace Parents. Seule la rangée à cheval sur le bandeau la prend ; les autres cartes gardent `shadow-md` (si tout flotte, plus rien ne ressort).
  - Écrans : Accueil (et R5), Flashcards · Choix, Stats, Profil (et D2), P1 à P4, D3 (et D4).
  - Tokens : `shadow-lift` et `shadow-lift-parents` dans `tokens.json` (recopié du design system, à jour) et `tokens.css` ; formule et couleurs dans `app-tokens.json` › `screenBand` › `lift`.
  - Design system (121 composants) : prop `lifted` de `StreakCard`, `LevelCard`, `DailyReviewCard`, `KpiCard`, `HeroCard`, `ProfileSummary`, `PrivacyCard`, et `TutorIA.liftShadow(tone, parents)`.
  - Ce que l'app doit changer : « À changer dans le code (v2.17) », section « Bandeau de marque et cartes de section ».
- **v2.18** (15 octobre 2026)
  - **Famille** (F1 à F5), même méthode qu'en v2.16 : chaque écran reproduit à l'identique du code, critiqué, puis redessiné. Romain a retenu les propositions pour F1, F2 et F3 ; pour F4, il garde la carte de l'app avec seulement « Refuser » en rouge pâle.
  - F1, Ajouter un enfant : bandeau violet et « Ajouter un enfant » au lieu de « Étape 2 sur 2 » ; le prénom et la classe (comme L5) dans une carte posée sur le bandeau, puis « Déjà dans votre famille ».
  - F2, le profil est prêt : « Le profil de Tom est prêt », le code, les étapes à jour (« J'ai un code de mon parent ») et « Terminé », qui revient aux Réglages.
  - F3, choisir l'enfant affiché : une feuille du bas « Vos enfants », la classe et le temps de la semaine de chacun, l'enfant affiché en violet, « Ajouter un enfant » en pointillés.
  - F4, demande de liaison : la carte de l'app, « Refuser » en rouge doux.
  - F5, Modifier le profil (nouveau, demandé par Romain) : le « Modifier » de P4 ne menait à rien ; c'est le formulaire de F1 prérempli, avec « Enregistrer ».
  - Parcours : « Ajouter un enfant » de P4 et de F3 mènent à F1 ; la pastille de P1 ouvre F3 ; « Modifier » de P4 ouvre F5.
  - Design system (123 composants) : nouveaux `ChildPickerSheet` et `LinkRequestCard`. Copié dans `design-system/` et `DESIGN_SYSTEM.md`.
  - Ce que l'app doit changer : « À changer dans le code (v2.18) », section « Famille ».
- **v2.19** (15 octobre 2026)
  - **Premiers jours et hors connexion** (J1 à J4, H1, H2, B1), même méthode qu'en v2.16. Romain a retenu les propositions pour J1, J3, H2 et B1, gardé l'app pour J2 et J4, et voulu pour H1 juste un message violet « Pas de connexion ».
  - J1, Accueil du premier jour : « Ta série commence aujourd’hui », « Ta première séance » (10 min, d’après ton parcours, « Commencer ») au lieu de « Reprendre » à 0 %, « Une séance pour lancer ta journée », « À découvrir » sous chaque matière.
  - J3, espace Parents sans enfant : « Bienvenue dans l’espace Parents. », la carte « Ajoutez votre enfant » posée sur le bandeau avec trois étapes, puis ce que le parent verra chaque semaine.
  - H1, tuteur hors ligne : un message violet « Pas de connexion » et un bouton rond pour réessayer ; plus de bandeau orange ni d'entraînement hors ligne. La question de l'élève attend.
  - H2, pas de réseau au premier lancement : l'écran de marque de la pause, le tuteur avec un badge sans réseau, « Réessayer » en blanc et « Changer de compte » en lien.
  - B1, « Bientôt disponible » : une feuille du bas qui dit ce qui arrive, au lieu d'une page plein écran au texte unique. Le réglage de Flashcards (3A) y mène.
  - Design system (128 composants) : nouveaux `OfflineNotice`, `OfflineScreen`, `ComingSoonSheet`, `AddChildCard`, `FeatureList` ; `StreakCard` à 0 jour, `ResumeCard` `first`, `SubjectCard` `fresh`, pastille de `GoalCard` à 0 ; icônes `wifiOff`, `refresh`, `sparkle`. Copié dans `design-system/` et `DESIGN_SYSTEM.md`.
  - Ce que l'app doit changer : « À changer dans le code (v2.19) », section « Premiers jours et hors connexion ».
- **v2.19.1** (15 octobre 2026)
  - H1, demande de Romain : le message « Pas de connexion » passe du violet au **jaune** (`#FFD43B`, texte `orange-900`, bouton blanc) et entre **dans la conversation**, juste sous la question de l'élève qui n'est pas partie, au lieu d'un bandeau en haut de l'écran. Plus lisible, et on voit quel message attend.
  - Design system : `OfflineNotice` en jaune ; écart validé n° 12 (seul jaune de l'app, hors palette). « À changer dans le code (v2.19) » mis à jour pour `OfflineBanner`.

Les logos et les polices ne sont pas dupliqués : les écrans pointent vers `../../assets/logo/` et `../../assets/typographie/Satoshi_Complete/Fonts/WEB/fonts/`.

## Utiliser ce dossier avec Claude Code

Exemples de demandes :

- « Lis `design/README.md` et `design/COMPONENTS.md`, puis crée le thème de l'app à partir de `design/tokens/`. »
- « Implémente l'écran d'accueil à partir de `design/screens/01-Accueil.dc.html`. »
- « Crée le composant BottomNav décrit dans `design/COMPONENTS.md`. »
- « Crée le composant QuizCard en reprenant ses props de `design/design-system/index.d.ts` et son rendu de `design/design-system/bundle.js`. »

À ajouter dans le `CLAUDE.md` du projet pour que Claude Code s'y réfère toujours :

```md
## Design
- Les maquettes et règles visuelles sont dans `design/`. Lire `design/README.md` avant toute UI.
- Couleurs, espacements, rayons, ombres : uniquement via les tokens de `design/tokens/` (jamais de valeur en dur).
- Police : Satoshi (`assets/typographie/`). Logo : `assets/logo/` (toujours bleu, jamais recoloré).
- Textes en français, tutoiement, phrases courtes ; une erreur n'est jamais un échec (pas de rouge sur une mauvaise réponse).
```

### Lire un fichier `.dc.html`

Chaque écran est un fichier HTML autonome avec quelques conventions :

- Les **styles sont en ligne** (`style="…"`) et utilisent les variables CSS des tokens (`var(--primary)`, `var(--radius-2xl)`…). Les valeurs en dur (dégradés, couleurs des matières) correspondent à `tokens/app-tokens.json`.
- `{{ nom }}` insère une valeur calculée dans `renderVals()` (script en bas du fichier).
- `<sc-for list="{{ items }}" as="item">` répète un bloc ; `<sc-if value="{{ cond }}">` l'affiche sous condition.
- `onClick="{{ handler }}"` branche un événement ; l'état est dans `this.state` / `setState` (comme une classe React).
- `data-props` sur le `<script>` déclare les réglages de la maquette (ex. état du vocal) : ce ne sont pas des props de production.
- `<script src="./support.js">` charge le moteur de rendu des maquettes (voir ci-dessous).

Les données (citations, matières, cartes, stats) sont des exemples réalistes à remplacer par les vraies données de l'API.

### Voir une maquette dans un navigateur

- `screens/support.js` et `components/support.js` sont le **moteur de rendu des maquettes** (le « dc-runtime » du canevas, React 18 inclus, aucun accès réseau). Copié du canevas le 7 octobre 2026. C'est un fichier généré : ne pas le modifier ni le reformater ; le recopier si le canevas change de format.
- Lancer un petit serveur à la **racine du dépôt** (les polices et logos sont lus dans `assets/`) : `python3 -m http.server 8080` ou `npx serve .`, puis ouvrir par exemple `http://localhost:8080/design/screens/02d-Tuteur-Vocal-Graphique.dc.html`.
- Un double-clic sur le fichier (`file://`) ne suffit pas : le navigateur refuse alors de charger les composants partagés (`<dc-import>`).
- Régler la fenêtre sur 390 px de large (outils de développement, mode mobile, iPhone 12/13/14). Les réglages `data-props` gardent leur valeur par défaut ; les animations (logo qui rebondit, tableau qui s'écrit…) tournent comme dans le canevas.
- Pour une capture automatique (Playwright) : page de 390 × 844, attendre environ 2 s que les polices et les composants soient chargés, capture `fullPage` pour les écrans qui défilent. Une erreur de console du type `attribute r: Expected length, "{{ … }}"` est normale : le navigateur lit le gabarit avant que le moteur le remplisse.

## Les écrans

Format : iPhone 390 × 844. Marges d'écran 20 px. La barre de navigation flotte à 20 px du bas ; le contenu défilant garde ~116 px libres en bas pour ne pas passer dessous. Accueil (1460 px), Flashcards · Choix (1420 px), Stats (2560 px), Profil (1965 px) et les écrans Parents (P1 1692 px, P2 2036 px, P3 1860 px, P4 1896 px) sont montrés en entier : ce sont des écrans qui défilent.

Depuis la v2.5, l'Accueil, les Flashcards · Choix, les Stats et l'espace Parents s'ouvrent sur un **bandeau de marque**, et chaque titre de section est dans sa carte (voir « Bandeau de marque et cartes de section » dans les Règles clés).

Depuis la v2.6, l'appel vocal (2B, 2D, 2F) est plein écran, sans barre de navigation (voir « Appel vocal : ce que l'écran doit faire »). Depuis la v2.12, une session de flashcards (3B à 3C) se fait aussi sans barre de navigation.

### 1 · Accueil — `01-Accueil.dc.html`
- **Bandeau de marque bleu** : « Salut Léa ! » (30 px, Black 900, blanc), bouton notifications en blanc translucide (point violet `accent` = nouveauté), avatar rond blanc.
- Citation du jour sous la salutation, dans le bandeau : italique 15/22 px en blanc, auteur en 12 px Bold, largeur max 300 px. Une liste de citations tourne (Mandela, Sénèque, La Fontaine, Wilde, Confucius, Boileau, proverbe).
- Deux cartes jeu côte à côte, qui débordent de 64 px sur le bas du bandeau : **Série** (orange uni `--streak`, texte blanc, « 12 jours » sur une ligne) et **Niveau** (gris ardoise `--level-card`, jauge XP verte).
- Carte « Reprendre » : matière + chapitre (« Équations du 1er degré » en 20 px Black), progression, bouton principal **Reprendre** (`shadow-brand`, le seul de l'écran).
- **Objectif du jour** : carte en dégradé violet → bleu de la marque (`--goal-gradient`, #662EE6 → #2E6BE6 → #662EE6 sur deux largeurs de carte, 160°, `radius-3xl`, padding 20 px) qui glisse lentement d'un bout à l'autre (6 s, aller-retour ; figée avec « Réduire les animations », en pause hors de l'Accueil). Anneau blanc 2/3 de 64 px, cible en filigrane, titre 22 px Black, « 15 min · 2/3 sessions » et pastille blanche « Plus qu’une ! » (texte `primary`), tout en blanc.
- **Tes matières** : carte blanche (titre 22 px Black, lien « Tout voir ») qui contient la grille 2 colonnes des 6 matières ; cartes remplies du dégradé de la matière (voir Couleurs des matières), en `radius-2xl` et `shadow-sm` dans la carte.

### 2A · Tuteur écrit — `02a-Tuteur-Ecrit.dc.html`
- **En tête** (v2.12, comme l'app) : ☰ à gauche (ouvre « Tes discussions », 2H), la bascule **Écrit / Vocal** au milieu, + à droite (nouvelle discussion, 2G). Boutons blancs de 48 px, rayon 16, `shadow-sm`.
- **Carte « Sujet de la discussion »** (`TopicCard`) dans le **dégradé de sa matière** (écart 19) : icône de la matière en filigrane, pastille d'icône voilée, « MATHS » et « Équations du 1er degré » en blanc, pastille blanche « Leçon 3/5 » à l'encre de la matière.
- Messagerie façon SMS : bulles du tuteur à gauche (blanc, `shadow-sm`, avatar = logo sur fond bleu 32 px), bulles de l'élève à droite (`primary`, texte blanc). Espacement 12 px entre bulles.
- Carte **Conseil** en `accent-soft` avec pastille violette.
- **Saisie** : bouton photo rond blanc de 48 px (appareil photo `primary`, vers 2I), champ de 48 px, bouton d'envoi rond `primary`. Le bouton photo n'apparaît pas si un parent a coupé la caméra, hors connexion ni pendant une évaluation.

### 2B · Tuteur vocal — `02b-Tuteur-Vocal.dc.html`
- **Un écran d'appel** (v2.6) : plein écran sur le dégradé de marque, tout en blanc, sans barre de navigation.
- En haut : « Écrit » (passer au chat écrit) et le chrono ; au centre, la matière et le chapitre.
- **Le logo du tuteur** (148 px, dans un disque blanc) rebondit quand il parle, au niveau de sa voix, et penche la tête quand il écoute. Le toucher interrompt le tuteur.
- **Pastille d'état** sous le logo : verte « Je t'explique… », rouge « Je t'écoute… », neutre « Ton micro est coupé ».
- **Sous-titres en direct** (20/30), mot à mot ; une couleur nommée s'affiche dans une pastille de sa couleur.
- **Commandes en verre** en bas : Micro · Sous-titres · Caméra · **Raccrocher** (rond rouge de 64 px avec le combiné).
- Comportement détaillé : « Appel vocal : ce que l'écran doit faire », plus bas.

### 3A · Flashcards · Choix — `03a-Flashcards-Choix.dc.html`
- **Bandeau de marque bleu** : titre « Flashcards » (30 px Black, blanc) + bouton réglages en blanc translucide, qui ouvre « Bientôt disponible » (B1, v2.19).
- Carte « Révision du jour », qui déborde de 56 px sur le bandeau : 30 cartes à revoir, badge de série orange, pastilles des matières concernées, bouton **C'est parti** en violet vif (`violet-500`, ombre violette).
- Carte « Choisis ta matière » (titre 22 px Black) : grille 2 × 3 de cartes colorées sélectionnables, en `radius-2xl` (sélection = anneau blanc de 3 px puis anneau de 3 px à la couleur de la matière + coche).
- Carte « Chapitres · {matière} » (titre 22 px Black, « 529 cartes en tout » à droite) : liste de chapitres numérotés (numéro sur le fond doux de la matière), cartes et durée, bouton radio. Les lignes sont sur fond `bg` ; la ligne choisie passe en blanc, avec un bord de 2 px à la couleur de la matière.
- Bouton principal **Commencer · N cartes** (`shadow-brand`).

### 3B à 3C · Flashcards · Session — `03b-…`, `03b2-…`, `03b3-…`, `03c-…`
- **Sans barre de navigation** (v2.12), comme l'appel vocal : on sort par « Quitter ».
- En-tête : « Quitter », matière + « Carte 4 sur 12 », badge de série. Barre de progression dans la couleur de la matière.
- Carte question : liseré haut de 8 px dans la couleur de la matière, icône, question (24 px Black), **4 réponses en grille 2 × 2** (A, B, C, D).
- **3B · question** : le message sous la grille dit « Choisis la bonne réponse parmi les 4 propositions. » ; le bouton est **gris** (`#EEF1F6`, texte `text-secondary`) et dit « Choisis une réponse » : il n'est pas estompé, l'élève comprend ce qu'on attend de lui.
- **3B2 · bonne réponse** : l'option passe en vert (`success-soft`, bord `success`, coche), le retour en vert avec une **pastille** (coche blanche sur `success`) : « Bien joué ! … Carte rangée dans « Je sais ». » Le bouton passe en **violet** (`violet-500`, ombre violette) : « Carte suivante → », « Voir mon bilan » sur la dernière carte.
- **3B3 · à revoir** : le choix passe en orange (`warning`), la bonne réponse en vert, le retour en orange avec une pastille (flèche blanche sur `warning`) : « Pas tout à fait : c’était … On la revoit demain. » Jamais de rouge.
- Compteurs « Je sais » / « À revoir » sous le bouton.
- **3C · bilan** : carte en **dégradé violet → bleu de la marque** (plus le vert d'Histoire-Géo), étoile en filigrane, coche dans un disque voilé, « Session terminée ! », « 9 cartes maîtrisées, 3 à revoir demain. Bien joué, on passe à la suite ? », pastilles blanches Je sais · 9 et À revoir · 3, « +60 XP », « Objectif du jour atteint : 3 sessions sur 3 », puis **Recommencer** (blanc, texte violet) et **Choisir un autre chapitre** (en verre, vers 3A).

### 2G · Nouvelle discussion — `02g-Tuteur-Nouvelle-Discussion.dc.html`
- **L'onglet Tutor'IA s'ouvre ici** (v2.12) : une discussion libre neuve. Les discussions passées sont dans le volet ☰ (2H).
- `TopicCard` « Toutes les matières · Discussion libre » en bleu de l'élève (icône bulle), sans pastille.
- Mot d'accueil du tuteur : « Salut ! Pose-moi ta question, ou raconte-moi l’exercice qui te bloque : on le fait ensemble, pas à pas. »
- **Idées de départ** (`ChatStarters`) juste au-dessus de la saisie, qui défilent sur le côté : « Explique-moi une notion » (violet), « Aide-moi sur un exercice » (orange, ouvre la photo), « Fais-moi réviser » (vert), « Montre-moi un graphique » (cyan). Pastilles de 40 px en dégradé, texte blanc 14 Bold avec une icône. Elles disparaissent au premier message.
- Saisie avec « Pose ta question… ».

### 2H · Tes discussions — `02h-Tuteur-Tes-Discussions.dc.html`
- Volet de 335 px qui glisse de la gauche (`ConversationDrawer`), sur un voile `rgba(0,6,18,0.40)` posé sur 2A.
- **Bandeau bleu de l'élève** (dégradé `blue-500 → blue-700`, coins bas de 32 px) : « Tes discussions » 28 Black, croix en verre de 44 px, bouton blanc **Nouvelle discussion** (+ bleu).
- Discussions rangées par jour (« AUJOURD’HUI », « HIER », « 7 DERNIERS JOURS ») : tuile de 40 px de la matière, titre 16 Bold, matière en 12. Celle en cours sur fond `blue-100`. Une discussion libre a la tuile bleue à bulle.
- En bas : « Appui long sur une discussion pour la supprimer. »

### 2I à 2K · Photo d'un exercice — `02i-…`, `02j-…`, `02k-…`
- **2I · choix** : au toucher du bouton photo, une carte blanche se pose en bas sur un voile (`PhotoSourceDialog`) : « La photo de ton exercice », « Cadre seulement l’exercice, sans ton nom. », **Prendre une photo** (bleu), **Choisir dans la galerie** (bleu doux), Annuler.
- **2J · aperçu** : la photo se pose au-dessus de la saisie (vignette de 56 px, rappel « Cadre seulement l’exercice, sans ton nom. », croix pour la retirer) ; l'élève peut ajouter un texte (« Je bloque sur le b) »).
- **2K · envoyée** : la bulle de l'élève porte la photo (216 × 162, coins de 16 px) au-dessus de son texte. Le tuteur reconnaît l'exercice et la matière : la carte du sujet passe au dégradé des Maths, « Résoudre 2x − 7 = 9 ».

### 4 · Stats — `04-Stats.dc.html`
- **Bandeau de marque violet** : titre « Tes stats » (30 px Black, blanc) + sélecteur **Semaine / Mois / Trimestre** dans le bandeau (piste en blanc translucide, pastille active blanche au texte `violet-600`, les autres en blanc ; change chiffres et histogramme).
- 4 KPI en cartes colorées, qui débordent de 56 px sur le bandeau : temps d'étude (bleu), sessions (cyan), flashcards révisées (violet), série record (orange uni, texte blanc).
- Tous les titres de section sont en 22 px Black dans leur carte (16 px avant la v2.5).
- Histogramme du temps d'étude (barres en dégradé violet → bleu, axes en `text-secondary`).
- Progression par matière : icône colorée de la matière sur son fond doux, barre en dégradé de la matière, pourcentage.
- Évolution de la maîtrise : carte en dégradé bleu, courbe blanche, « 68 % » en grand avec le badge vert « +26 pts en 8 sem. » à côté.
- Calendrier d'activité (heatmap 13 semaines, 5 niveaux de bleu).
- **Tes points forts** : carte dégradé vert, titre blanc, lignes blanches.
- **À retravailler** : carte orange uni, titre blanc, lignes blanches avec bouton **Réviser** (`primary`).

### 5 · Profil — `05-Profil.dc.html`

Validé par Romain le 8 octobre (v2.8). On y arrive en touchant son rond « L » sur l'accueil ; pas de barre de navigation, le retour ramène à l'accueil. Composants : `ProfileHero`, `ProfileSummary`, `LevelBar`, `TrophyShelf`, `SettingRow`, `Button`.

- **Bandeau de marque bleu** (`ProfileHero`) : retour en verre, surtitre « Mon profil », prénom en 44 Black, pastille en verre « Élève de 4e », « Depuis septembre », et le bouton de bois **Modifier l'avatar** (`WoodButton`, 190 × 46 px, Lilita One, vers l'éditeur d'avatar), avec une pastille orange cernée de bleu nuit pour les nouveautés de la garde-robe : l'avatar relève du côté jeu de l'app. La figurine de l'élève se tient à droite, sur une ombre au sol, devant un halo clair.
  - Dans l'app, c'est la vraie figurine 3D (`AvatarPreview`, en pied, animation « attente », un « salut » à l'arrivée sur l'écran). L'image de la maquette (`design/assets/lea-debout.png`) est un rendu de cette figurine.
  - Sans avatar : l'initiale dans un disque blanc à la place de la figurine, et le bouton devient « Créer mon avatar ».
- **Résumé** (`ProfileSummary`), qui déborde de 72 px sur le bandeau : trois colonnes séparées par des filets, chaque chiffre **centré sous son icône** (tuile de 48 px en dégradé, avec une lueur de sa couleur) : série (orange, flamme, « 12 jours de série »), étoiles gagnées (violet, « 18 étoiles gagnées »), temps de la semaine (bleu, « 4 h 40 cette semaine »). Dessous, la **barre de niveau** (`LevelBar`) : pastille « 7 », barre en dégradé bleu → violet avec un curseur, pastille « 8 » en pointillés, « Niveau 7 · 340 / 500 XP » et « encore 160 XP ». La barre glisse quand l'XP change.
- **Mes trophées** (`TrophyShelf`), armoire de bois du côté jeu (`WoodFrame`) : ruban bleu « Mes trophées », compte « 10 sur 24 » dans une pastille dorée, médailles dorées de 64 px (disque de la couleur de la famille, icône blanche, rebord) sur une étagère creusée, qui défilent sur le côté ; les gagnées d'abord, dans l'ordre de la liste validée (séries, niveaux de joueur, niveaux d'Explorer, évaluations, étoiles, régions, ville parfaite, notions), puis la prochaine, creusée dans le bois avec un cadenas. Noms en Lilita One. Toucher une médaille ouvrira son détail (écran à concevoir).
- **Ma famille** : chaque parent relié (initiale dans un disque violet, prénom, « Lien depuis le 2 septembre » ; pas de « Retirer » : c'est au parent de défaire le lien), la phrase de transparence (« Claire voit tes progrès et le résumé de chaque session. Jamais tes conversations. »), puis **Relier un autre parent** en violet doux (vers « Relier mon compte à un parent »). Sans parent relié : « Aucun parent relié pour l'instant » et le même bouton.
- **Préférences** (`SettingRow` + `Switch`) : rappel de révision (« Une notification chaque jour pour réviser » ; l'heure n'est pas encore au choix de l'élève), sous-titres pendant l'appel (le même réglage que le bouton « Sous-titres » de l'appel), sons et vibrations (« Bonnes réponses, série, trophées (bientôt) », sans effet pour l'instant).
- **Compte et données** : « Télécharger mes données » (l'export actuel), « Confidentialité » (ce que voient les parents, les droits de l'élève : D1).
- **Deux boutons pleine largeur en bas** : **Se déconnecter** en bleu doux (`Button` `soft`), puis **Supprimer mon compte** en rouge doux (`Button` `danger`, qui ouvre la confirmation D2). Le rouge reste réservé à la seule action qui efface. Puis « Tutor'IA · version 1.0 ».
- Le bandeau d'accord parental (`ConsentBanner`), quand il s'affiche, se place juste sous le résumé.
- À changer dans le code : `ProfileScreen` (`src/features/profile/`) suit cet ordre et ces composants. Données à exposer : étoiles gagnées, temps de la semaine, niveau et XP, trophées (gagnés, total, prochain), date d'arrivée, nombre de nouveautés de la garde-robe, préférences (rappel et sons sont nouveaux ; les sous-titres existent déjà dans l'appel).

### 2C / 2D · Tuteur + graphique — `02c-…`, `02d-…`
- Le tuteur peut **tracer un graphique** pour illustrer son explication. Exemple : la droite y = 3x + 5 (rouge Maths) et la droite y = 20 (bleu pointillé), avec leur intersection x = 5 mise en évidence.
- Le panneau graphique est en haut, dans sa **carte violette** (v2.12 : fond `violet-100`, bord `violet-200`, tuile violette, surtitre « GRAPHIQUE · MATHS », boutons blancs de 48 px), le dessin sur une feuille blanche ; la discussion continue en dessous. Tout le bandeau le réduit (chevron) ; il s'agrandit en plein écran. Sous la réponse du tuteur, la pastille unie « Voir le graphique » (`VisualChip`, `violet-600`) le rouvre.
- Écrit (2C) : le tuteur fait référence aux couleurs du graphique (« la droite **rouge** »). Les anciens messages s'estompent en haut quand la place manque.
- Vocal (2D, v2.6) : l'écran d'appel de 2B, avec la carte du graphique dans la moitié haute (violette, comme dans l'app) et le logo de 96 px dessous. Quand le tuteur nomme une courbe, elle s'épaissit et sa légende s'allume ; le point clé pulse pendant qu'il parle.

### 2E / 2F · Tuteur + tableau blanc — `02e-…`, `02f-…`
- Écrit (2E, v2.12, comme l'app) : le tableau est dans sa **carte azur** (fond `azure-100`, bord `azure-200`, tuile azur, « TABLEAU · MATHS »), sur une feuille blanche **sans grille de points ni pastilles d'étapes**. Le tuteur y écrit la résolution pas à pas en police mathématique (3x + 5 = 20 → 3x = 15 → **x = 5** entouré en rouge) ; les opérations (− 5, ÷ 3) sont en bleu et les annotations numérotées à droite. Pastille unie « Voir le tableau » (`azure-600`) sous la réponse du tuteur.
- Vocal (2F, v2.6) : l'écran d'appel de 2B, avec la carte du tableau dans la moitié haute (azur, sans grille de points ni pastilles d'étapes, comme dans l'app). Le tableau **s'écrit en direct** pendant que le tuteur parle : les lignes apparaissent l'une après l'autre, un point bleu joue le rôle du stylo, puis le résultat s'entoure de rouge.

## Appel vocal : ce que l'écran doit faire (2B, 2D, 2F)

Validé par Romain le 7 octobre 2026 : piste A « L'appel » pour 2B, variante 1 « La carte » pour 2D et 2F (les pistes explorées ont été retirées du canevas le 8 octobre, voir v2.9). Composants : `CallTopBar`, `VoiceAvatar`, `VoiceStatus`, `LiveCaptions`, `CallDock`, et pour les visuels `VisualPanel`, `MathGraph`, `Whiteboard` (design system et `components/`).

### Disposition

- **Plein écran** sur le dégradé de marque (`--call-gradient`), tout en blanc, **sans barre de navigation** : on quitte l'appel par « Écrit » ou « Raccrocher ».
- En haut, à 56 px : « Écrit » à gauche, chrono à droite (`CallTopBar`). En bas, à 32 px : les commandes en verre (`CallDock`).
- **Sans visuel (2B)** : le sujet au centre (surtitre = matière avec sa tuile, titre = chapitre ; en discussion libre, « Toutes les matières » avec la tuile bleue de l'élève), le logo de 148 px au milieu, la pastille d'état dessous, puis les sous-titres en 20/30 (quatre lignes au plus, « Tutor'IA » ou « Toi » au-dessus).
- **Avec un visuel (2D, 2F)** : la carte du visuel prend le haut (de 112 à 448 px) et remplace le sujet (elle a son propre surtitre, « Graphique · Maths ») ; le logo passe à 96 px, puis la pastille et les sous-titres en 16/22 sur deux lignes.
- Quand le tuteur envoie un visuel pendant l'appel, on passe de 2B à 2D ou 2F : la carte descend du haut (300 ms) pendant que le logo rétrécit et glisse à sa place. Le dernier visuel reste jusqu'au suivant, qui le remplace, ou jusqu'à la fin de l'appel. « Agrandir » l'ouvre en plein écran ; l'appel continue derrière.

### États

Ils suivent `voiceStatus` (`src/features/tutor/logic/voice.ts`). « Neutre » = blanc translucide (`--call-glass`).

| État | Pastille (`VoiceStatus`) | Logo (`VoiceAvatar`) | Sous-titres (`LiveCaptions`) |
| --- | --- | --- | --- |
| `connecting` | « Connexion… », neutre | immobile, il respire | vides |
| `aiSpeaking` | « Je t'explique… », verte | il rebondit au niveau de la voix | la phrase du tuteur, mot à mot |
| `waiting` | « Je t'écoute… », rouge | il penche la tête | la dernière phrase du tuteur, toute allumée |
| `userSpeaking` | « Je t'écoute… », rouge | il penche la tête | la transcription de l'élève, sous « Toi » |
| `muted` | « Ton micro est coupé », neutre | immobile | « Réactive ton micro pour répondre. » quand c'est à l'élève |
| `ended` | « Appel terminé », neutre | immobile | puis retour au chat écrit |
| `error` | « Connexion perdue », neutre | immobile | le message d'erreur |

Le rouge de « Je t'écoute… » signale l'écoute, comme un voyant d'enregistrement, jamais une erreur. S'il paraît trop proche du bouton raccrocher à l'usage, il passe en orange (réglage `couleurEcoute` des maquettes, `--voice-listening-orange-gradient`).

### Le logo du tuteur

- **Il rebondit quand le tuteur parle.** La hauteur suit le niveau sonore de sa voix (sortie audio de la session, de 0 à 1, lissée sur environ 160 ms). Sans mesure disponible, la formule des maquettes donne un rebond crédible.
- Un saut toutes les 0,42 s, de niveau × 18 px (14 px pour le logo de 96 px), avec un léger écrasement au sol (6 %) et une ombre au sol qui rétrécit quand il est en l'air. À chaque virgule ou point de la phrase, le niveau est multiplié par 0,25 : le logo se pose. Entre deux phrases, il s'arrête.
- **Il penche la tête quand l'élève a la parole** (rotation de −8° en 0,5 s), et respire à peine au repos (échelle 1 → 1,025 en 3,2 s).
- **Toucher le logo pendant que le tuteur parle l'interrompt** (`interrupt()`), comme si l'élève lui coupait la parole. Un appui long (600 ms) signale la réponse (`report()`), comme l'ancienne zone des barres.
- Si l'utilisateur a demandé moins d'animations, tout s'arrête : la pastille suffit à dire qui parle.

### Les sous-titres

- Activés par défaut. Le bouton « Sous-titres » les masque ou les affiche ; retenir le choix de l'élève pour les appels suivants.
- Source : la transcription de la session (texte du tuteur, transcription de la voix de l'élève). Si le texte du tuteur arrive avant sa voix, les mots pas encore prononcés sont affichés à 45 % de blanc et s'allument au rythme de l'audio ; sinon, les mots apparaissent au fil de l'eau.
- Nombres et formules en gras, jamais coupés en fin de ligne (espaces insécables). Une couleur nommée par le tuteur (rouge, bleu, vert, orange, violet, gris : les couleurs de `visualArt.tones`) s'affiche dans une pastille de sa couleur dès qu'elle est prononcée.
- En 2D et 2F, deux lignes au plus : la fin de la phrase reste toujours visible.

### La voix et le visuel avancent ensemble (2D, 2F)

- **Graphique** : quand le tuteur nomme la couleur d'une courbe, celle-ci passe au premier plan (halo de sa couleur, trait plus épais de 2 px, pastille de légende allumée) jusqu'à ce qu'il en nomme une autre ou finisse sa phrase. Le point clé pulse pendant que le tuteur parle ; quand il parle du point (« ce point », « elles se croisent »), la pastille « Solution » s'allume.
- **Tableau blanc** : il s'écrit pendant que le tuteur parle. Chaque ligne apparaît en fondu (450 ms) quand la transcription atteint l'étape correspondante ; sans repère dans le texte, les étapes sont réparties sur la durée de la phrase. Un point bleu, le stylo, pulse au bout de la ligne en cours d'écriture, puis le résultat s'entoure de rouge.
- Couleurs du visuel (`visualArt.kinds`) : violet pour le graphique, azur pour le tableau ; carte teintée, dessin sur une feuille blanche, tableau sans grille de points.

### Les commandes (`CallDock`)

- **Micro** : couper ou réactiver (`toggleMute`) ; le bouton devient blanc quand le micro est coupé.
- **Sous-titres** : les afficher ou les masquer ; le bouton est blanc quand ils sont affichés.
- **Caméra** : montrer un exercice (`sendPhoto`). Le micro est mis en pause pendant la photo et le bouton reste blanc pendant la prise de vue. Il disparaît si les parents ont désactivé la caméra (`cameraEnabled`) : il reste alors trois boutons.
- **Raccrocher** : rond rouge de 64 px avec le combiné ; il termine l'appel et revient au chat écrit.
- **Écrit** (en haut) : termine l'appel de la même façon, la conversation continue à l'écrit avec la transcription.

### Les messages

Les messages de `useVoiceCall` (`notice`) prennent la place des sous-titres, en blanc 15 px : 4 s pour un message ponctuel (photo envoyée, caméra refusée…), pendant tout l'appel pour un message durable (appel d'entraînement, micro refusé, limite des 10 minutes atteinte).

### Accessibilité

- La pastille est annoncée aux lecteurs d'écran (`aria-live="polite"`) ; les sous-titres sont l'équivalent texte de la voix.
- Le logo est un bouton (« Interrompre Tutor'IA » quand le tuteur parle, « Tutor'IA t'écoute » sinon). Commandes de 56 px (raccrocher 64 px), avec un libellé sous chaque bouton.
- Texte blanc sur le dégradé : contraste supérieur à 4,5:1. Les mots à 45 % ne portent pas d'information indispensable : ils s'allument quand ils sont dits.

### À changer dans le code

- `VoiceTutorScreen` : passer en plein écran (barre d'onglets masquée pendant l'appel, plus de `clearance`) et remplacer `TopicCard`, `TutorModeToggle`, `VoiceVisualizer` et `CallControls` par l'en-tête d'appel, le logo, la pastille, les sous-titres et les commandes décrits ici.
- `useVoiceCall` : exposer le niveau de la voix du tuteur, la transcription (tuteur et élève) et l'état des sous-titres, en gardant les états actuels.
- Si la session vocale ne transmet pas encore les visuels du tuteur, c'est à brancher pour 2D et 2F (même format qu'à l'écrit, `TutorVisual`).

## Espace Parents (P1 à P4)

Il est dans la **même app**, avec un profil parent. Persona : Claire, la maman de Léa.
Principes :
- vouvoiement et ton factuel ;
- pas de gamification (ni série, ni XP) ;
- mais **les mêmes couleurs, cartes en dégradé et espacements que l'app élève**, pour garder la même envie de lire.

Sections séparées de 24 px, cartes en `radius-3xl`. Chaque écran s'ouvre sur un **bandeau de marque violet** (titre 30 px Black et phrase d'introduction 15 px, en blanc) et chaque titre de section est dans sa carte, en 22 px Black. Le violet évite le bleu sur bleu (la première carte de chaque écran Parents est bleue) et prolonge la règle « parents = violet » des écrans de connexion.

Navigation à 4 onglets, dans le même style que l'élève : **Accueil · Progrès · Sessions · Réglages**.

### P1 · Tableau de bord — `P1-Parents-Accueil.dc.html`
- Dans le bandeau : sélecteur d'enfant (« Léa · 4e », pastille blanche ; il ouvre le choix de l'enfant, F3) pour les familles avec plusieurs enfants et notifications en blanc translucide (plus de badge « Espace Parents » depuis la v2.10), puis « Bonjour Claire » et la semaine affichée.
- **Résumé de la semaine** rédigé par l'IA : carte en dégradé bleu vers violet, logo, badge vert. Elle déborde de 56 px sur le bandeau.
- 3 chiffres clés en cartes colorées, centrés (pastille d'icône, valeur 22 Black, libellé 12) et **sans évolution** : temps d'étude (cyan), jours actifs (vert), notions acquises (violet).
- **À surveiller** : orange uni, texte blanc, bouton « Voir le détail ». N'apparaît que s'il y a un point à signaler.
- **Comment l'encourager** : carte violette claire avec un conseil concret, puis **deux questions à lui poser** dans un encadré blanc (« Questions à lui poser », bulles violettes). Conseil et questions sont choisis parmi des formulations rédigées à l'avance, jamais écrites par l'IA.
- Temps d'étude par jour avec la ligne d'objectif, et une remarque sur les horaires de travail.
- Titres des cartes (Résumé de la semaine, À surveiller, Comment l'encourager, Temps d'étude par jour) en 22 px Black.

### P2 · Progrès par matière — `P2-Parents-Progres.dc.html`
- Période (ce mois-ci / ce trimestre) dans le bandeau, même style que les Stats. Maîtrise globale dans un anneau blanc sur une carte en dégradé.
- Carte « Par matière » (titre 22 px Black) avec un bloc par matière **teinté de sa couleur** (fond `soft` de la matière, `radius-2xl`, sans ombre, padding 18 × 20) : tuile en dégradé, pourcentage, évolution, barre segmentée par chapitre. Toucher le bloc **déplie les chapitres** avec leur statut, en lignes blanches.
- Statuts : **Acquis** (vert), **En cours** (bleu), **À consolider** (orange), **Pas commencé** (gris). Ce vocabulaire est plus lisible pour un parent que des pourcentages bruts.

### P3 · Sessions — `P3-Parents-Sessions.dc.html`
- Carte « Cette semaine » (dégradé, déborde sur le bandeau violet) : nombre de sessions, temps et répartition par mode.
- **Confidentialité** : le parent voit un **résumé** de chaque session rédigé par l'IA, jamais la conversation complète, pour préserver la confiance de l'enfant. C'est une règle produit, pas seulement de l'affichage.
- Filtres par matière. Une carte blanche par jour (titre du jour en 22 px Black) qui regroupe les sessions de ce jour, sur fond `bg` : en-tête dans la couleur de la matière, résumé, résultat (Compris, En progrès ou À revoir) et mode utilisé.

### P4 · Réglages — `P4-Parents-Reglages.dc.html`
- Profil de l'enfant (nom en 22 px Black) ; « Modifier » ouvre F5. **Objectif hebdomadaire** (titre 22 px Black), réglable avec − et +, à fixer avec l'enfant.
- Interrupteurs répartis en trois cartes, le titre du groupe (22 px Black) dans la carte :
  - temps d'écran (limite par jour, pause après 21 h) ;
  - fonctionnalités (vocal, caméra, graphiques et tableau blanc) ;
  - notifications (bilan du dimanche, alertes).
- Carte « Compte » (même style) : abonnement, données personnelles (RGPD, D3), ajout d'un enfant (F1). Sous la carte, deux boutons pleine largeur de 52 px, comme sur le profil de l'élève : **Se déconnecter** en violet doux (icône de sortie), puis **Supprimer le compte** en rouge doux (corbeille ; obligatoire pour les stores).

## Compte : connexion, inscription et accord d'un parent

Élève en **bleu** (tutoiement), parent en **violet** (vouvoiement). Pas de barre de navigation, sauf sur C1 (c'est un onglet). Depuis la v2.11, tous les écrans de compte sauf L1 sont en **plein écran**, dans l'univers de l'appel vocal (composant `AuthScreen`) : dégradé de l'espace, retour en verre de 44 px, logo du tuteur de 96 px qui fait un petit rebond pour dire bonjour, titre 28 Black et phrase 15 en blanc (équilibrés sur deux lignes), puis une feuille blanche qui monte du bas, aux champs remplis. Le bouton principal vient **juste sous ce qu'il valide** : le clavier occupe le bas de l'écran.

### L1 · Bienvenue — `L1-Connexion-Choix.dc.html`
- Illustration des six matières autour du logo, titre « Bienvenue sur Tutor'IA ».
- Deux cartes **ProfileChoiceCard** « Je suis élève » / « Je suis parent », sans autre texte. Le bouton du bas prend la couleur du profil choisi.

### L2 · Connexion élève — `L2-Connexion-Eleve.dc.html`
- **Plein écran** (v2.7) sur le dégradé de l'appel (`--call-gradient`). En haut : retour en verre (44 px, vers L1), puis le logo du tuteur de 96 px dans son disque blanc (`VoiceAvatar`), qui fait un petit rebond à l'arrivée pour dire bonjour puis respire. Titre « Content de te revoir ! » 28 Black et phrase 15 en blanc.
- **Feuille blanche** qui monte du bas (rayon 32 en haut, `--sheet-shadow`) : « E-mail » (comme dans l'app, écart 26), mot de passe (avec l'œil), « Mot de passe oublié ? » à droite → M1, bouton bleu **Me connecter**, « ou continuer avec », puis Apple et Google empilés en pleine largeur. Les champs sont remplis (fond `bg`, bordure `--field-filled-border`, sans ombre), comme tout ce qui est rangé dans une carte blanche.
- En bas de la feuille : « J'ai un code de mon parent » (clé) → L7, puis « Pas encore de compte ? Créer mon compte » → E1.
- La connexion d'un enfant par son code (profil créé par le parent en L5 et L6, « option B ») reste à concevoir.

### L7 · Code de mon parent — `L7-Code-Parent.dc.html`
- « Relier mon compte à un parent », « Tape le code à 6 chiffres que ton parent a créé dans son espace. » ; retour vers L2.
- **CodeInput** « Code parent » (six cases en deux groupes de trois), « Il est valable 24 h. Il sera relié dès que tu te connectes. », bouton bleu **Garder ce code** → L2b, puis **HelpCard** « Où trouver ce code ? » (« Ton parent le crée dans son espace Tutor'IA, en ajoutant ton profil. »).

### L2b · Connexion avec un code gardé — `L2b-Connexion-Eleve-Code-Garde.dc.html`
- L2, avec juste avant « Me connecter » le bandeau vert **InlineNotice** « Code 482 913 gardé : il sera relié à ta connexion. » et « Retirer le code » (→ L2). Le lien « J'ai un code de mon parent » disparaît tant qu'un code est gardé. 908 px.

### M1 à M3 · Mot de passe oublié — `M1-MotDePasse-Email`, `M2-MotDePasse-Code`, `M3-MotDePasse-Nouveau`
- **M1** « Mot de passe oublié ? », « Donne ton e-mail : on t'envoie un code pour choisir un nouveau mot de passe. » : e-mail, **Recevoir un code**, **HelpCard** « Tu utilises Apple ou Google ? » (« Pas de mot de passe à retrouver : reconnecte-toi avec le même bouton. »), puis en bas « Ça te revient ? Me connecter ».
- **M2** « Mot de passe oublié ? », « Saisis le code envoyé à lea.martin@exemple.fr. » : **CodeInput** « Code reçu », « Rien reçu ? Regarde dans les courriers indésirables. », **Valider le code**, « Renvoyer le code ».
- **M3** « Nouveau mot de passe », « Dernière étape : choisis un mot de passe que tu retiendras. » : le mot de passe et ses règles en pastilles (`PasswordRules` `pills`), puis **« Confirme le mot de passe »** (« Tape-le une deuxième fois ») et la pastille **PasswordMatch** : « Les deux sont identiques » en vert, « Pas encore identiques » en gris, jamais de rouge. **Enregistrer** → accueil.
- Côté parent (« Mot de passe oublié ? » de L3) : les mêmes trois écrans en violet, au vouvoiement (textes de `fr.parentAuth.reset`).

### L3 · Connexion parent — `L3-Connexion-Parent.dc.html`
- Même construction en **violet** (`--auth-parent-gradient`) : « Bon retour parmi nous », « Connectez-vous pour suivre les progrès de votre enfant. ».
- E-mail et mot de passe **d'abord**, bouton violet **Se connecter**, puis « ou continuer avec » et Apple / Google empilés. Liens en `violet-600`. « Pas encore de compte ? Créer un compte » → L4.
- Clavier ouvert : la feuille défile, le logo et le titre peuvent sortir de l'écran. Moins d'animations demandé : ni rebond ni montée de la feuille.

### L4 · Inscription parent, étape 1 — `L4-Inscription-Parent.dc.html`
- « Créez votre compte parent », « Un seul compte pour suivre tous vos enfants. » ; retour vers L3. En tête de la feuille, **StepHeader** `back: false` « Étape 1 sur 2 » (barres de 6 px).
- Prénom, e-mail, mot de passe et ses règles en pastilles (« 8 caractères minimum », « Au moins un chiffre », « Au moins une majuscule »), conditions d'utilisation et bilan de la semaine par e-mail ; **Continuer** (violet) → L4b ; « Déjà un compte ? Se connecter » → L3.

### L4b · Vérifiez votre boîte mail — `L4b-Inscription-Parent-Verification.dc.html`
- Étape 1 sur 2. « Nous vous avons envoyé un code à 6 chiffres à claire.martin@exemple.fr. » : **CodeInput** violet, « Rien reçu ? Pensez à vérifier les courriers indésirables. », **Valider** → L5, « Renvoyer le code ».

### L5 · Ajouter l'enfant — `L5-Inscription-Parent-Enfant.dc.html`
- Étape 2 sur 2. « Ajoutez votre enfant », « Tutor'IA adapte ses explications à sa classe. » : prénom de l'enfant, puis **GradePicker** `filled` (grille de 5 colonnes par cycle, Primaire, Collège, Lycée ; la classe choisie en violet plein) et **Créer le profil de Léa** → L6.

### L6 · Le profil de l'enfant est prêt — `L6-Inscription-Parent-Code.dc.html`
- Étape 2 sur 2. « Le profil de Léa est prêt », « Donnez-lui ce code pour relier son compte au vôtre. »
- Ligne de l'enfant (initiale, « Classe de 4e · profil créé », **Modifier** → L5), **ParentCodeCard** (482 913 en 48 Black, « Valable 24 h » en pastille de verre, **Partager le code** en pleine largeur), puis **StepList** `plain` « Sur le téléphone de Léa » : « Installez Tutor'IA et ouvrez l'app. », « Léa crée son compte élève, ou se connecte si elle en a déjà un. », « Elle touche « J'ai un code de mon parent » et saisit ce code. ». Bouton violet **Accéder au tableau de bord** → P1.

### C1 à C4 · Moins de 15 ans : l'accord d'un parent
- **C1 · Tuteur en attente** — `C1-Accord-Tuteur-En-Attente.dc.html` : remplace l'onglet Tuteur tant qu'aucun parent n'a validé le compte (le tuteur transmet des contenus à OpenAI, ce qui demande l'accord d'un parent, CNIL). Plein écran bleu avec la barre du bas (onglet Tutor'IA actif) : logo de 148 px, « Ton tuteur t'attend », « Il s'ouvre dès qu'un parent a validé ton compte. », carte **ConsentPendingCard** (« Un parent doit valider ton compte », « Demande envoyée à claire.martin@exemple.fr », **Relier un parent** → C2, « Sans validation, ton compte sera supprimé dans 28 jours. ») et le bouton en verre « Réviser avec mes flashcards » → 3A : les flashcards restent ouvertes.
- **C2 · Relier mon compte à un parent** — `C2-Accord-Relier-Parent.dc.html` : depuis C1, O5 et le profil. « J'ai un code parent » (**CodeInput**, « Ton parent le crée dans son espace. Il est valable 24 h. », **Relier mon compte**), « ou », puis « Prévenir un parent par e-mail » (« E-mail d'un parent », « Ton parent reçoit un e-mail pour valider ton compte. », **Envoyer l'e-mail** en bleu doux).
- **C3 · Invitation de votre enfant** — `C3-Accord-Invitation-Parent.dc.html` : violet, sans flèche de retour (on y arrive par l'e-mail). « Votre enfant vous invite à valider son compte Tutor'IA. » ; ce que le parent pourra faire (suivre ses progrès dans chaque matière ; voir le résumé de ses séances, jamais ses conversations ; choisir ses horaires et son temps de révision) ; « Le lien est valable 1 heure. » ; **Ouvrir l'invitation** → C4 ; « Déjà un compte ? Se connecter » → L3.
- **C4 · Validez le compte de votre enfant** — `C4-Accord-Validation-Parent.dc.html` : « Léa a créé un compte Tutor'IA et vous demande de le valider. » E-mail du parent en lecture seule avec la pastille « Vérifié », prénom, mot de passe et ses règles, « J'autorise Léa à utiliser le tuteur IA de Tutor'IA. », conditions d'utilisation, **HelpCard** « Ses conversations restent privées », **Valider le compte** → P1.

### À changer dans le code (v2.11)
- **Nouveau mot de passe** (`NewPasswordScreen`, élève et parent) : ajouter le champ de confirmation (élève « Confirme le mot de passe », « Tape-le une deuxième fois » ; parent, proposé : « Confirmez le mot de passe », « Saisissez-le une deuxième fois ») et la pastille `PasswordMatch` (« Les deux sont identiques » / « Pas encore identiques ») ; « Enregistrer » ne valide que si les deux saisies sont identiques. Demandé par Romain.
- **Mot de passe oublié** (`ResetPasswordScreen`) : titre « Mot de passe oublié ? » pour l'e-mail et le code (« Nouveau mot de passe » reste le titre de M3) ; le code se tape dans des cases (`CodeInput`), comme la vérification de l'e-mail.
- **Ajout de l'enfant** (`ChildSetupScreen`, `fr.parentAuth.child`) : une fois le profil créé, titre « Le profil de ${name} est prêt » et phrase « Donnez-lui ce code pour relier son compte au vôtre. ». Les étapes et `shareMessage` renvoient encore au champ « Code parent », qui n'existe plus depuis la v2.7 : étapes 2 et 3 comme sur L6 ; message proposé : « ${name}, voici ton code parent Tutor'IA : ${code}. Dans l'app, touche « J'ai un code de mon parent » et saisis-le. Il est valable 24 h. ». Bouton final en violet.
- **Tuteur en attente** (`ConsentLockedScreen`) : passer de la carte simple au plein écran de C1. L'adresse du parent à qui la demande est partie est nouvelle : l'app doit pouvoir la lire.
- **Inscription élève** (`StudentSignUpScreen`) : Apple et Google empilés (`AuthProviderButtons` en colonne, comme L2), puis E2.
- **Invitation** (`InvitationScreen`) : « Le lien est valable 1 heure. » sous la liste, séparé du texte.

## Inscription élève et onboarding (E1, E2, O1 à O5)

Tout en bleu. Chaque étape de l'onboarding a un **StepHeader** (retour, « Étape n sur 4 », « Passer »). En mode présentation, le bouton principal mène à l'écran suivant, jusqu'à l'accueil.

### E1 · Crée ton compte — `E1-Inscription-Eleve.dc.html`
- Plein écran bleu (`AuthScreen`, v2.11), retour vers L2 : « Crée ton compte », « Deux minutes, et ton tuteur est prêt. ». 1 132 px.
- Prénom, e-mail, mot de passe et ses règles en pastilles, puis **SwitchField** « J'ai moins de 15 ans » (« Un parent devra valider ton compte ») : activé, il affiche « E-mail d'un parent » et « Ton parent reçoit un e-mail pour valider ton compte. ».
- **Créer mon compte** → E2, puis « ou continuer avec », Apple et Google empilés en pleine largeur, et « En créant ton compte, tu acceptes les conditions d'utilisation. ».

### E2 · Regarde tes e-mails — `E2-Verification-Email.dc.html`
- « On t'a envoyé un code à 6 chiffres à lea.martin@exemple.fr. » : **CodeInput** (cinq chiffres tapés, le curseur clignote dans la sixième case), « Rien reçu ? Regarde dans les courriers indésirables. », **Valider** → O1, « Renvoyer le code ».
- **HelpCard** violette « Et après ? » : « Ton parent recevra un e-mail pour valider ton compte. En attendant, tu pourras déjà réviser avec tes flashcards. » (moins de 15 ans : l'e-mail de validation part après la confirmation, l'élève n'est pas bloqué).

### O1 · Classe — `O1-Onboarding-Classe.dc.html`
- Bulle de bienvenue du tuteur, puis **GradePicker** groupé Primaire / Collège / Lycée.

### O2 · Auto-évaluation — `O2-Onboarding-Matieres.dc.html`
- Une **SelfAssessmentRow** par matière : « Galère · Bof · Ça va · À l'aise », dans la couleur de la matière. Jamais présentée comme une note.

### O3 · Objectifs — `O3-Onboarding-Objectifs.dc.html`
- Six **GoalTile** à cocher (choix multiple), puis **DurationPicker** 10 / 15 / 20 / 30 min par jour.

### O4 · Façon d'apprendre — `O4-Onboarding-Style.dc.html`
- Quatre **ChoiceRow** (écrit, voix, schémas, quiz) qui correspondent aux modes de l'app, des **ToggleChip** pour le moment de révision et un rappel à activer.

### O5 · Parcours prêt — `O5-Onboarding-Pret.dc.html`
- Carte héros « Ton parcours est prêt », plan en **PlanRow** qui commence par la matière la moins à l'aise, objectif du jour et jour 1 de la série. Boutons « Commencer ma première séance » et « Relier mon compte à un parent » (→ C2).

## Explorer (X1 à X5b)

L'onglet Explorer transforme le programme en carte d'aventure. **Une île = une matière**, découpée en régions (thèmes), villes (chapitres) et niveaux. L'exemple des maquettes est l'île des Maths de 4e.

> **X1 à X3b : le code fait foi** (v2.14). Dans l'app, l'île, la carte, l'eau, les nuages et l'avatar qui marche sont une scène 3D (three.js, `src/features/explorer/stylized3d/`), avec le HUD de jeu par-dessus. Les maquettes X1 à X3b sont plates et datent d'avant le HUD : elles portent le bandeau « Ancienne maquette · scène 3D : le code fait foi » et ne servent que pour le parcours et les textes. X4a à X5b (2D) suivent l'app.

**Trois types de niveaux**, toujours avec leur couleur, leur icône et leur libellé :

| Type | Couleur | Icône | Comportement du tuteur |
| --- | --- | --- | --- |
| Leçon | vert (`green-700`, dégradé green-400 → green-700) | livre | Explique, donne des exemples, vérifie la compréhension. |
| Exercices | bleu (`blue-500`, dégradé blue-400 → blue-600) | crayon | Laisse chercher, donne des indices progressifs. |
| Évaluation | rouge (`red-500`, dégradé red-300 → red-600) | couronne | Exigeant : ni indice ni correction pendant l'épreuve, correction dans le bilan. |

L'évaluation ferme chaque ville : son point est plus grand (68 px contre 52) avec un double anneau.

**Chaque point lance un chat sans quitter l'onglet Explorer.** On ne renvoie jamais vers l'onglet Tutor'IA : la leçon se déroule dans le HUD de jeu (ciel d'Explorer, en-tête du niveau, ardoise en bois), avec la progression du niveau à l'écrit.

Tokens à ajouter dans `tokens/app-tokens.json` : `level-lecon` = green-700, `level-exercices` = blue-500, `level-evaluation` = red-500, `map-sea` = azure-100 (dégradé vers azure-200), `map-land` = green-100 (bord green-200), `map-path` = orange-300 (chemin à venir en gray-200).

### X1 · Les îles — `X1-Explorer-Iles.dc.html`
- **IslandCarousel** : nom de la matière en pastille dégradée, île flottante animée, îles voisines estompées, flèches et points.
- **IslandProgressCard** : villes validées, étoiles, barre aux couleurs de la matière et bouton « Explorer l'île ».

### X2 · Carte de l'île — `X2-Explorer-Carte.dc.html`
- **ExplorerHud** flottant (retour, île, ville, région, série, niveau) et carte **ExplorerMap** qui défile horizontalement.
- Chemin en vague : orange jusqu'au niveau en cours, gris ensuite. Villes en **CityBanner**, régions en **RegionSign**, avatar **MapAvatar** au-dessus du niveau en cours.
- États des points : terminé (coche et étoiles), en cours (halo pulsé), verrouillé (gris et cadenas).

### X3 / X3b · Fiche d'un niveau — `X3-…`, `X3b-…`
- **LevelSheet** en feuille du bas sur la carte assombrie : type, titre, lieu, durée, étoiles, objectifs, puis « À l'écrit » et « À la voix » (le dernier mode utilisé en premier).
- X3b montre une évaluation encore verrouillée : règle en rouge (le tuteur n'aide pas, quitter avant la fin oblige à recommencer) et message de déblocage (terminer d'abord les étapes de la ville).

### X4a / X4b · La leçon d'un niveau — `X4-Explorer-Discussion.dc.html`, `X4b-Explorer-Discussion-Vocal.dc.html`

Validées par Romain le 9 octobre (v2.13). Dans le HUD de jeu, comme X1, X2 et la fiche du niveau dans le code : pas de barre de navigation, le **ciel d'Explorer** (`LevelBackdrop` : `#2F6FD0 → #5F9CE8 → #8FC0F2`, quelques nuages blancs qui dérivent), et l'**en-tête du niveau** (`LevelHeader`) : retour jaune en relief (`GameButton`), pastille du type cernée de bleu nuit, titre « Isoler x » en Lilita One.

**X4a · à l'écrit**
- Sous le titre, la progression : quatre segments de 10 px cernés de bleu nuit, verts (`#2FD35A`) une fois faits, **blanc translucide** à faire, puis « Étape 2 sur 4 · Ville des Équations ».
- **L'ardoise** (`SlateBoard`) épinglée au-dessus de la discussion : cadre de bois (texture, clous), ruban « Au tableau », ardoise vert foncé, calcul à la craie (formules crème, opérations en bleu craie `#9CC8FF`, notes numérotées, résultat entouré de corail `#FF8A7A`). Deux boutons bleus en relief en haut à droite : agrandir, replier. Repliée, c'est une bande de 76 px avec la première ligne ; elle se replie quand le clavier s'ouvre. La pastille « Voir le tableau » (couleur ardoise) n'apparaît sous la réponse du tuteur que quand l'ardoise est repliée.
- **La discussion** dans un cadre clair (`bg`) cerné de 3 px de bleu nuit, rayon 24, rebord dur `0 6px 0 rgba(12,22,60,0.25)` : les bulles de l'onglet Tutor'IA (écart 13), les anciens messages s'estompent en haut.
- **« Étape 1 réussie ! »** (`LevelStepCard`) : bandeau de 44 px au vert des boutons de jeu, cerné de bleu nuit, coche verte dans un rond blanc, Lilita One 17.
- **La saisie** en bas du cadre, sur un fond `primary-soft` séparé par un filet : photo en bouton blanc en relief (vers la photo d'un exercice), champ blanc cerné de bleu nuit, envoi en **bouton bleu en relief** (le bleu d'envoi de toute l'app). Avant le premier message : le gros bouton vert « C'est parti ! ».

**X4b · à la voix**
- L'en-tête dit « À la voix · 02:14 · Ville des Équations » : à l'oral, rien n'est jugé (ni progression ni étoiles), l'appel compte comme une séance. Le retour raccroche et ramène à la carte.
- L'ardoise, non repliable, **s'écrit au fil de la voix** (point de craie au bout de la ligne en cours, résultat entouré à la fin).
- **Le logo du tuteur** (96 px) flotte sur le ciel et rebondit au niveau de sa voix, penche la tête quand il écoute (`VoiceAvatar`, comme 2B) ; le toucher l'interrompt.
- La pastille d'état est **cernée de bleu nuit** avec un rebord dur (`VoiceStatus` `hud`) : verte « Je t'explique… », rouge « Je t'écoute… », bleu nuit « Ton micro est coupé ».
- **Les sous-titres** du tuteur seulement (écart 24) dans une bulle de dialogue blanche cernée de bleu nuit avec le ruban « Tutor'IA » (`CaptionBubble`) ; quand l'élève parle, la dernière phrase du tuteur reste.
- **Les commandes sur une planche de bois** (`WoodCallDock`) : Micro, Sous-titres, Caméra en boutons bleus en relief, **jaunes quand ils sont actifs**, et Raccrocher en bouton **rouge** de 64 px (nouveau ton de bouton : `#FF8F7F → #E0504F`, rebord `#A3302E`) ; libellés en Lilita One. La caméra disparaît si un parent l'a coupée.

### À changer dans le code (v2.13)
- **`LevelChatView` (X4a)** : sortir le visuel du cadre de discussion et l'épingler au-dessus, dans un `WoodFrame` ; le tableau passe en ardoise (`Whiteboard` avec des couleurs de craie : formules `#F4F1E6`, opérations `#9CC8FF`, notes `rgba(244,241,230,0.85)`, résultat `#FF8A7A`, stylo crème, sur un fond `#24443A`). Un graphique, une statistique ou une figure garde sa feuille blanche dans le même cadre. Repli comme aujourd'hui (`useVisualViewer` le replie déjà quand le clavier s'ouvre) ; `VisualChip` seulement quand il est replié, couleur ardoise.
- **Saisie d'un niveau** : `ChatInput` en version jeu, en bas du cadre (photo en `GameButton` blanc de 44, champ cerné de 2 px `#16244F`, envoi en `GameButton` bleu de 44). Ajouter les tons `white` (`#FFFFFF → #E6ECF7`, rebord `#AEBBD2`, icône `primary`) et `red` (`#FF8F7F → #E0504F`, rebord `#A3302E`) à `explorerArt.hud.buttons`.
- **`LevelStepCard`** : bandeau vert de jeu (face `hud.buttons.green`, contour 2,5 px `#16244F`, rebord `0 4px 0 #1B7F33`, `GameText` 17) au lieu de la carte `successSoft`.
- **`LevelHeader`** : segments à faire en `rgba(255,255,255,0.35)` au lieu de `hud.wood.groove`.
- **`LevelVoiceView` (X4b)** : remplacer `VoiceVisualizer` et `CallControls` (et le cadre clair) par l'ardoise qui s'écrit pendant l'appel, `VoiceAvatar` de 96 px, `VoiceStatus` cerné de bleu nuit, les sous-titres du tuteur (`LiveCaptions`) dans une bulle de dialogue et une planche de bois (`WoodFrame`) avec quatre `GameButton` (micro, sous-titres, caméra, raccrocher). Si la séance vocale ne transmet pas encore les visuels, l'ardoise n'apparaît pas.
- **`LevelBackdrop`** : quelques nuages blancs sur le ciel (décoratifs, figés avec « Réduire les animations »).

### X4c · Quitter le niveau ? — `X4c-Explorer-Quitter.dc.html`
Repris du code (`WoodDialog`, v2.14). Quand l'élève quitte une partie commencée et pas finie (retour de l'en-tête, retour d'Android), un voile `rgba(0,6,18,0.40)` couvre la leçon et un panneau de bois (`WoodFrame` sans ruban) demande « Quitter le niveau ? » en Lilita One 22, avec sur un parchemin : « Ta progression dans ce niveau ne sera pas gardée : tu le reprendras depuis le début. » (en évaluation : « Si tu quittes maintenant, l'évaluation sera à recommencer. »). Deux `GameButton` de 48, 12 px d'écart : « Quitter » en jaune, « Continuer » en vert (l'action conseillée) ; toucher en dehors vaut « Continuer ».

### X5a / X5b · Bilan — `X5-Explorer-Bilan.dc.html`, `X5b-Explorer-Bilan-Consolider.dc.html`
Repris du code (`LevelResultPanel`, v2.14). Le bilan est calculé par le serveur et se pose sur la leçon, sous un voile `rgba(9,17,34,0.45)`, dans un panneau de bois centré (20 px des bords, 440 px au plus) :
- ruban « type · verdict » : « Leçon · réussie », « Exercices · réussis » ou « à revoir », « Évaluation · réussie » ou « à consolider » ;
- « Bien joué, Léa ! » ou « Presque, Léa ! » en Lilita One 26, puis sur un parchemin « Tu as validé « Isoler x ». » ou ce qu'il faut pour réussir (une étoile pour des exercices, 70 % pour une évaluation) ;
- trois étoiles (42, 52, 42 px), en or `#FFC933` ou en bois creusé `#2D1808` ;
- le score dans une encoche sombre de 36 px (« 4 étapes sur 4 », « 5 sur 8 · 63 % ») et la médaille d'XP dorée (`#FFF09A → #FFC933 → #F0A500`, cernée de `#B87400`), absente quand rejouer ne rapporte rien ;
- réussi : « Ce que tu as travaillé : » et les objectifs du niveau, et pour des exercices ou une évaluation sous 3 étoiles « Rejoue quand tu veux pour décrocher plus d'étoiles. » ; pas réussi : « À revoir : la leçon « … », puis retente. » ;
- la suite : « Continuer » (vert, 52), ou « Retour à la carte » (jaune) et « Revoir la notion » (vert), de 50.

Règles : étoiles à 50, 70 et 90 % ; des exercices sont réussis avec une étoile, une évaluation à 70 % (sinon la ville passe « à consolider ») ; une leçon terminée est toujours réussie ; 10 XP la première fois, plus 10 XP par étoile nouvelle. Pour une évaluation, la leçon à revoir est la première leçon de la ville (`reviewLessonOf`).

## Règles des parents, côté élève (R1 à R7)

Validées par Romain le 9 octobre (v2.15). Les réglages de P4 (temps par jour, plage horaire, pause après 21 h, tuteur vocal, caméra) s'appliquent à l'élève (`src/features/access/`, `src/services/student/studyRules.ts`, mêmes règles côté serveur). Une pause est un message bienveillant, jamais une punition. Elle bloque le tuteur, les flashcards et les niveaux d'Explorer ; les stats, le profil et la carte restent ouverts.

### R1 à R3 · La pause — `R1-Pause-Soir.dc.html`, `R2-Pause-Plage.dc.html`, `R3-Pause-Temps.dc.html`
- Dans l'onglet Tutor'IA (barre de navigation visible) et à la place d'une session de flashcards. Même mise en page que C1 : fond de marque (`#2E6BE6 → #1750C4 → #0A3B9D → #03276E`) avec deux halos, contenu centré.
- Le logo du tuteur (`VoiceAvatar` de 148 px, au repos, un petit saut à l'arrivée) avec un badge blanc de 48 px en haut à droite : lune `violet-600` (soir), horloge `orange-700` (plage horaire), trophée `green-800` (temps du jour).
- Titre 28/34 Black blanc, texte 15/22 Medium à 85 % de blanc :
  - R1 : « Il est tard, on reprend demain ? » / « Ton cerveau range tout ce que tu as appris pendant la nuit. »
  - R2 : « On se retrouve à 17 h » / « Tu peux réviser entre 17 h et 21 h. À tout à l'heure ! »
  - R3 : « Tu as bien travaillé aujourd'hui ! » / « On se retrouve demain. »
- R1 et R2 : rien d'autre qu'un **bouton blanc** de 56 px (rayon 18, ombre `0 12px 28px rgba(3,39,110,0.35)`, texte 17 Bold `blue-600`, icône maison) « Revenir à l'accueil », 32 px sous le texte.
- R3 : d'abord une **carte verte** qui félicite (rayon 24, padding 20, dégradé `#1BC85B → #0C9E42 → #03702B`, trophée en filigrane) : tuile blanche à 24 % avec le trophée, « 1 h 30 » 30/34 Black et « de révisions aujourd'hui » 15/20 Bold, jauge pleine blanche de 10 px, « Ton maximum du jour, décidé avec tes parents » 13/18, pastille « Ta série de 12 jours continue demain » (flamme). Puis, 24 px dessous, le bouton blanc « Revenir à l'accueil » et « Voir mes progrès » (52 px, blanc à 14 %, bord blanc à 32 %, vers les stats).

### R4 · Appels du jour faits — `R4-Vocal-Appels-Du-Jour.dc.html`
- La limite d'appels du jour vient du serveur (`daily_limit`), ce n'est pas un réglage des parents.
- Écran d'appel sans chrono (seulement « Écrit » en haut), la matière et le chapitre, le logo au repos, la pastille neutre « Appels du jour terminés » (combiné barré), puis le message en clair : « Tu as fait tes appels du jour. » (20/30 Bold) et « Le vocal revient demain. On continue à l'écrit ? » (16/24, 85 %). Plus de commandes : un seul bouton blanc de 56 px « Continuer à l'écrit » (icône clavier) à 40 px du bas.

### R5 · Accueil d'un compte à valider — `R5-Accueil-Accord.dc.html`
- Comme l'app (`ConsentBanner`, aussi sur le Profil) : sous la série et le niveau, la carte violette « Un parent doit valider ton compte », le texte et « Relier un parent ».

### R6 · Un niveau d'Explorer pendant la pause — `R6-Explorer-Pause.dc.html`
- On reste dans le jeu : le ciel de nuit (`LevelBackdrop` `night` : `#16244F → #2D3F8A → #5A6FC0`, lune `#FFF3B0`, étoiles, nuages à peine visibles en bas) ; de jour pour la plage horaire et le temps du jour.
- Au milieu, un panneau de bois (`WoodDialog` sans voile) : ruban « Pause du soir », « On fait une pause ? » en Lilita One 24, deux parchemins (« Il est tard : on reprend demain ? Ton cerveau range tout pendant la nuit. », « Pause décidée avec tes parents. Les niveaux reviennent demain matin, ta série continue. ») et un seul `GameButton` jaune de 52 « Revenir à la carte ».

### R7 · Vocal et caméra coupés par un parent — `R7-Tuteur-Sans-Vocal.dc.html`
- La bascule Écrit / Vocal reste en tête : « Vocal » grisé (`#A3ABBD`) avec un cadenas à la place du micro. Le toucher ouvre une bulle sombre (`#1C263B`, texte blanc 13/18, flèche vers « Vocal ») : « Le vocal et la caméra sont coupés dans les réglages de tes parents. » (« Le vocal est coupé… » si la caméra reste ouverte).
- Sans caméra, pas de bouton photo dans la saisie.

### À changer dans le code (v2.15)
- **`StudyPauseScreen`** (R1 à R3) : remplacer le titre et l'`AccessCard` par la mise en page ci-dessus (fond de marque, `VoiceAvatar` avec le badge, titre et texte blancs, bouton blanc). Textes : `outside_window` devient « On se retrouve à {from} » + « Tu peux réviser entre {from} et {until}. À tout à l'heure ! » ; `evening_pause` « Il est tard, on reprend demain ? » ; `daily_limit` « Tu as bien travaillé aujourd'hui ! » avec la carte verte (temps du jour depuis `todaySeconds`, série `streakDays`) et « Voir mes progrès » vers `/stats`.
- **Pause pendant une discussion** : quand le tuteur répond `paused` ou `daily_limit`, relire tout de suite les règles (`invalidateQueries(studyRulesKey)`) pour basculer sur la pause, au lieu d'attendre la minute suivante.
- **Vocal à la limite** : le serveur raccroche sans prévenir ; afficher « Plus que 2 minutes avant la pause » dans les sous-titres quand `secondsUntilBlock` passe sous 120 s.
- **`VoiceTutorScreen`** (R4) : pour `daily_limit`, un état `limit` au lieu de `error` : pastille « Appels du jour terminés », message en deux lignes, pas de minuteur, `CallDock` remplacé par un bouton blanc « Continuer à l'écrit ». Mieux : connaître la limite avant d'appeler et ouvrir directement cet écran.
- **`/niveau` pendant une pause** (R6) : au lieu de `StudyPauseScreen`, `LevelBackdrop` (de nuit pour `evening_pause`) avec un `WoodDialog` à une seule action jaune « Revenir à la carte ». Dans la fiche du niveau, griser « À l'écrit » et « À la voix » avec la raison.
- **`WrittenTutorScreen`** (R7) : quand `voiceEnabled` est faux, garder `TutorModeToggle` avec « Vocal » désactivé (cadenas) et la bulle d'explication au toucher. Quand `cameraEnabled` est faux, l'idée « Aide-moi sur un exercice » ne propose plus la photo.
- R5 : rien, la carte de l'app est gardée.

## Données et confidentialité (D1 à D4)

Validées par Romain le 14 octobre (v2.16). Côté élève, la page Confidentialité (`PrivacyScreen`, depuis le Profil) et la suppression du compte ; côté parent, les Données personnelles (`ParentDataScreen`, depuis P4) et la suppression du compte d'un enfant. Règle : on dit ce qui est partagé en listes, et pour effacer, le choix sûr vient toujours en premier.

### D1 · Confidentialité (élève) — `D1-Confidentialite-Eleve.dc.html`
- Sans barre de navigation ; retour (48 px, blanc, `shadow-sm`) vers le Profil. « Confidentialité » 28/34 Black, puis le texte actuel (`lead`) en 15/22 `text-secondary`.
- Trois cartes (`PrivacyCard`, écart 16) avec une tuile d'icône en dégradé et un titre 20/26 Black :
  - « Ce que voient tes parents » (œil, violet) : coche verte « Ton temps de travail », « Tes progrès par matière », « Un court résumé de chaque session » ; cadenas bleu « Jamais tes conversations avec le tuteur », « Jamais tes messages ni tes photos ».
  - « Ce que garde le tuteur » (bulle, bleu) : « Tes messages » avec la pastille bleue « 6 mois, puis effacés » ; « Tes photos d'exercice » et « Ta voix » avec la pastille verte « Jamais enregistrées » / « Jamais enregistrée ».
  - « Tes droits » (bouclier, vert) : « Tu peux télécharger toutes tes données et supprimer ton compte à tout moment. Tout est alors effacé. », puis « Télécharger mes données » (`Button` `soft`, l'export du Profil) et « Supprimer mon compte » (`Button` `danger`, ouvre D2).

### D2 · Supprimer ton compte — `D2-Supprimer-Compte-Eleve.dc.html`
- Sur le Profil, voile `rgba(0,6,18,0.40)` ; carte centrée (`ConfirmDialog`), texte centré.
- Badge corbeille (56 px, `red-100` / `red-600`), « Supprimer ton compte ? » 20/26 Black, le texte actuel (`deleteBody`).
- Lien « Télécharger mes données d'abord » (14 Bold `primary`, icône de téléchargement) : lance l'export, sans fermer.
- « Garder mon compte » en bouton principal (`Button` `primary` + `shadow-brand`, ferme), puis « Supprimer définitivement » en rouge doux. Toucher le voile garde le compte.
- Même dialogue depuis D1.

### D3 · Données personnelles (parent) — `D3-Donnees-Parent.dc.html`
- Bandeau violet comme P4 (`#662EE6 → #521DC8 → #3B0DA2`, rayon bas 32) : retour en verre, « Données personnelles » 30/38 Black blanc, « Consultez, exportez ou effacez les données de votre famille. ». Les cartes montent de 48 px sur le bandeau.
- « Ce que nous gardons » (bouclier, violet) : pastilles violettes cochées « Prénom », « Classe », « Séances », « Progression », puis en gris avec l'icône info : « Aucune date de naissance, aucune adresse. Les conversations avec le tuteur ne vous sont jamais transmises. »
- « Vos données » (téléchargement, bleu) : « Un fichier avec les données de votre compte parent. » et « Exporter mes données » en violet doux (`Button` `vividSoft`) ; ensuite, « Vos données sont prêtes. » comme aujourd'hui.
- Une carte par enfant (`ChildDataCard`) : avatar en dégradé, « Données de Léa », « Classe de 4e » et la pastille verte « Accord donné » (quand le parent a validé le compte) ; « Léa peut exporter ses données depuis son profil. » ; « Retirer le lien avec Léa » en violet doux (lien barré). Puis, sous un filet, la suppression à part, seulement quand le parent a validé le compte d'un enfant de moins de 15 ans (comme aujourd'hui) : « Supprimer le compte de Léa » en rouge, « Vous retirez votre accord : son compte et toutes ses données sont supprimés, définitivement. », et le bouton rouge doux (corbeille) qui ouvre D4.

### D4 · Supprimer le compte de Léa — `D4-Supprimer-Compte-Enfant.dc.html`
- Une seule confirmation au lieu de deux : badge corbeille, « Supprimer le compte de Léa ? », le texte actuel (`deleteChildBody`).
- La case « Je comprends que c'est définitif. » (rangée à bord gris, violette une fois cochée).
- « Garder le compte » en violet (`Button` `vivid`, bouton principal), puis « Supprimer définitivement » en rouge plein (`Button` `dangerSolid`), estompé à 40 % et inactif tant que la case n'est pas cochée. C'est le seul rouge plein de l'app.

### À changer dans le code (v2.16)
- **`ConfirmDialog`** (`src/components/ConfirmDialog.tsx`) : badge corbeille, titre et texte centrés ; le bouton d'annulation devient le bouton principal, avec un libellé qui dit ce qu'on garde (`keepLabel`), en bleu côté élève et en violet côté parent ; la suppression passe en second, en rouge doux. Options : `extraLabel` (lien au-dessus des boutons) et `ackLabel` (case qui active la suppression, alors en rouge plein). Toucher le voile garde. Pour les trois suppressions de compte : élève (Profil et D1), parent (P4, « Supprimer votre compte ? », en violet) et enfant (D4). La suppression d'une discussion garde sa confirmation actuelle.
- **`ProfileScreen`** (D2) : `keepLabel` « Garder mon compte », `extraLabel` « Télécharger mes données d'abord » (le même `exportData`). Nouveaux textes : `fr.profile.keep`, `fr.profile.exportFirst`.
- **`PrivacyScreen`** (D1) : les trois `SectionCard` de texte deviennent trois `PrivacyCard`. Dans `fr.profile.privacy`, découper `parentsBody` et `tutorBody` en lignes (trois « oui », deux « jamais » ; trois lignes avec leur durée) ; `rightsBody` devient « Tu peux télécharger toutes tes données et supprimer ton compte à tout moment. Tout est alors effacé. ». Ajouter les deux boutons : l'export du Profil et la même confirmation de suppression.
- **`ParentDataScreen`** (D3) : bandeau violet comme `ParentSettingsScreen` ; `subtitle` devient « Consultez, exportez ou effacez les données de votre famille. » et la phrase « Tutor'IA collecte le minimum… » devient la carte « Ce que nous gardons » (pastilles et ligne d'info) ; « Vos données » prend sa phrase (`mineBody`) et le bouton violet doux ; chaque enfant passe dans `ChildDataCard` : `consentGiven` devient la pastille « Accord donné », `childBody` se limite à l'export (la phrase sur les conversations est dans « Ce que nous gardons »), `deleteChild` devient « Supprimer le compte de {prénom} » avec son titre rouge et son explication (`deleteChildHint`) dans une zone à part.
- **Suppression du compte d'un enfant** (D4) : remplacer la double confirmation (`confirmed`, « Confirmer » puis « Oui, supprimer définitivement ») par une seule `ConfirmDialog` avec `ackLabel` « Je comprends que c'est définitif. » et `keepLabel` « Garder le compte » ; `confirmAgain` n'est plus utilisé.
- Le retrait du lien garde sa confirmation ; il peut prendre la nouvelle `ConfirmDialog` en violet (icône lien barré, « Garder le lien »).

## Famille (F1 à F5)

Validée par Romain le 15 octobre (v2.18). Ajouter, modifier et choisir un enfant dans l'espace Parents, et répondre à une demande de liaison. Persona : Claire relie Tom (6e) ; Léa (4e) est déjà dans la famille. Règle : tout reste violet, et chaque titre dit ce qui se passe.

### F1 · Ajouter un enfant — `F1-Ajouter-Enfant.dc.html`
- Depuis « Ajouter un enfant » de P4 et de F3. C'est `ChildSetupScreen` quand le parent est déjà inscrit : il ne montre plus « Étape 2 sur 2 », qui ne vaut qu'à l'inscription (L5).
- Bandeau violet comme P4 et D3 (`#662EE6 → #521DC8 → #3B0DA2`, rayon bas 32, padding 56 / 20 / 80) : retour en verre (48 px) vers P4, « Ajouter un enfant » 30/38 Black, « Tutor'IA adapte ses explications à sa classe. » 15/22.
- La carte « Son profil » remonte de 48 px sur le bandeau (blanche, rayon 24, padding 20, écart 18, `shadow-lift-parents`) : « Son profil » 20/26 Black, le prénom (champ `filled` de 52 px, icône personne) et la classe (`GradePicker` `filled`, ton parents, comme L5 : Primaire, Collège, Lycée en grilles de 5 colonnes, puces de 48 px, la classe choisie en violet plein).
- Dessous, « Déjà dans votre famille : **Léa**, 4e » (fond `bg`, rayon 16, padding 10 / 12, rond de 32 px, 13/18 `text-secondary`) : le parent voit qui est déjà relié. Puis « Créer le profil de Tom » (violet, 52 px, flèche) → F2.

### F2 · Le profil de Tom est prêt — `F2-Code-Enfant.dc.html`
- Même bandeau : « Le profil de Tom est prêt » (sur deux lignes équilibrées), « Donnez-lui ce code pour relier son compte au vôtre. ».
- Carte de l'enfant sur le bandeau (`shadow-lift-parents`) : rond de 48 px, « Tom » 17/22 Black, « Classe de 6e · profil créé », « Modifier » en violet doux (→ F1).
- `ParentCodeCard` (735 108), puis `StepList` « Sur le téléphone de Tom » avec les étapes de L6 (« J'ai un code de mon parent »).
- « Terminé » (violet) revient aux Réglages, d'où l'on vient.

### F5 · Modifier le profil de Léa — `F5-Modifier-Enfant.dc.html`
- Le « Modifier » de la carte de l'enfant (P4) ne menait à aucun écran. Romain a choisi de le dessiner : le formulaire de F1, prérempli (Léa, 4e), sous « Modifier le profil de Léa », et « Enregistrer » qui revient aux Réglages. Pas de rappel de la famille.

### F3 · Choisir un enfant — `F3-Choisir-Enfant.dc.html`
- La pastille du bandeau de P1 ouvre une feuille du bas (`ChildPickerSheet`) sur le voile `rgba(0,6,18,0.40)`, à portée de pouce, au lieu d'une liste en haut de l'écran.
- Feuille blanche, rayon 32 en haut, padding 12 / 20 / 32, ombre `0 -12px 32px rgba(3,39,110,0.25)` : poignée, « Vos enfants » 22/30 Black et un bouton rond pour fermer (44 px).
- Une rangée par enfant (padding 12 / 14, rayon 20, fond `bg`) : rond de 44 px, prénom 17/22 Black, « Classe de 4e · 4 h 40 cette semaine » 13/18. L'enfant affiché : fond `violet-100`, bord 2 px `accent`, rond coché violet (26 px) ; les autres, un rond vide.
- « Ajouter un enfant » en pointillés `violet-200`, avec « Jusqu'à 4 profils avec la formule Famille » → F1.

### F4 · Demande de liaison — `F4-Demande-Liaison.dc.html`
- La carte de l'app (`LinkRequestCard`, en tête de P1) est gardée : fond `accent-soft`, rond de Tom (44 px), « Tom souhaite relier son compte au vôtre » 16/22 Bold, « En acceptant, vous validez son compte et vous suivez ses progrès. ».
- Seul changement, décidé par Romain : **« Refuser » en rouge doux** (`Button` `danger` : `red-100`, texte `red-600`, 16 Medium) pour qu'il ressorte et ne se confonde pas avec « Accepter » (violet, 16 Bold). C'est le seul rouge doux de l'app qui n'efface rien.

### À changer dans le code (v2.18)
- **`Button`** (`src/components/Button.tsx`) : ajouter la variante `danger` (fond `colors.errorSoft`, texte `colors.errorStrong`, appui `palette.red[200]`), comme celle du design system.
- **`LinkRequestCard`** : « Refuser » passe de `variant="soft"` (bleu) à `variant="danger"`. Le reste ne change pas.
- **`ChildSwitcher`** (F3) : la `Modal` s'ouvre en feuille du bas (`animationType="slide"`, contenu en bas) au lieu d'une carte en haut (`paddingTop` 120). Titre « Vos enfants » (`fr.parent.home.chooseChild`), bouton « Fermer » (`closeChooser`). Chaque enfant : `ChildAvatar` de 44, prénom, et la ligne « Classe de {classe} · {temps} cette semaine » (le temps de la semaine de chaque enfant est à charger ; sans lui, la classe seule). L'enfant affiché en violet (`accent` et `violet[100]`, rond coché) au lieu de la coche bleue. « Ajouter un enfant » en pointillés `violet[200]`, avec `fr.parent.settings.addChild.hint` dessous.
- **`ChildSetupScreen`**, hors inscription (`!freshSignUp`, F1 et F2) : `ParentBand` (comme `ParentSettingsScreen`) au lieu de `StepHeader` ; titre « Ajouter un enfant », puis, une fois créé, « Le profil de {prénom} est prêt » (déjà demandé en v2.11). Le formulaire dans une carte posée sur le bandeau (`shadow.liftParents`), `GradePicker` comme à l'inscription, puis la ligne « Déjà dans votre famille : {prénoms et classes} ». Le bouton final devient « Terminé » (`router.back()`). Nouveaux textes : `fr.parent.child.addTitle` « Ajouter un enfant », `family` « Déjà dans votre famille : … », `done` « Terminé ». Les étapes et `shareMessage` : voir v2.11.
- **Modifier un enfant** (F5) : `ParentSettingsScreen` passe `onEdit` à `ChildProfileCard` (le bouton existe mais n'est pas branché), qui ouvre `/parents/enfant?id={id}`. `ChildSetupScreen` en mode modification : prérempli, titre « Modifier le profil de {prénom} » (`fr.parent.child.editTitle`), bouton « Enregistrer » (`save`), sans la ligne de la famille ni le code. Il faut une fonction du service famille pour mettre à jour le prénom et la classe.

## Premiers jours et hors connexion (J1 à J4, H1, H2, B1)

Validé par Romain le 15 octobre (v2.19). Ce que l'élève et le parent voient avant toute activité, sans réseau, ou devant une fonction pas encore prête. Même méthode qu'en v2.16 : chaque écran reproduit à l'identique du code, critiqué, puis redessiné. Romain a retenu les propositions pour J1, J3, H2 et B1 ; il garde l'app pour J2 et J4 ; pour H1, juste un message, en jaune dans la conversation (v2.19.1). Règle : un écran vide parle de ce qui commence, jamais d'un retard.

### J1 · Accueil, premier jour — `J1-Accueil-Premier-Jour.dc.html`
- L'Accueil (1) d'un compte tout neuf. L'app y disait « 0 jour de série, continue ! », proposait de « Reprendre » une leçon jamais commencée, à 0 %, et montrait six matières à 0 % : un retard alors que tout commence.
- Série : « Ta série » et « commence aujourd’hui » (`StreakCard` à 0). Niveau 1, 0 / 500 XP, sans changement.
- « Ta première séance » à la place de « Reprendre » (`ResumeCard` `first`) : surtitre bleu, la première leçon du parcours (« Équations du 1er degré », « Maths · Leçon 1 sur 5 »), deux pastilles `blue-100` / `blue-600` (horloge « 10 min », étincelles « D’après ton parcours ») au lieu de la barre à 0 %, et « Commencer ».
- Objectif du jour à 0/3 : la pastille dit « Une séance pour lancer ta journée ».
- Tes matières : « À découvrir » sous le nom (12/16 Bold), sans pourcentage ni barre (`SubjectCard` `fresh`).

### J2 · Stats, premier jour — `J2-Stats-Premier-Jour.dc.html`
- L'écran de l'app, gardé tel quel (choix de Romain).

### J3 · Espace Parents sans enfant — `J3-Parents-Sans-Enfant.dc.html`
- P1 quand aucun enfant n'est relié. Bandeau violet : « Bonjour Claire », puis « Bienvenue dans l’espace Parents. ».
- `AddChildCard` posée sur le bandeau (`shadow-lift-parents`) : tuile famille violette de 48 px, « Ajoutez votre enfant » 22/30 Black, trois étapes numérotées (son profil, son code de connexion, ses progrès chaque semaine) et « Ajouter un enfant » en violet → F1.
- `FeatureList` « Chaque semaine, vous verrez » : le résumé rédigé par Tutor’IA, le temps d’étude et les progrès par matière, un conseil pour l’encourager. En bas, avec un cadenas : « Jamais ses conversations avec le tuteur. ».

### J4 · Espace Parents, semaine sans séance — `J4-Parents-Semaine-Vide.dc.html`
- L'écran de l'app, gardé tel quel (choix de Romain).

### H1 · Tuteur hors ligne — `H1-Tuteur-Hors-Ligne.dc.html`
- Décision de Romain : juste un message. Le bandeau orange (« Tutor’IA est hors ligne », « En attendant, entraîne-toi avec ces questions. ») et l'entraînement hors ligne disparaissent.
- `OfflineNotice` **dans la conversation**, juste sous la question de l'élève qui n'est pas partie, sur toute la largeur (v2.19.1, demande de Romain : plus lisible que le violet en haut de l'écran). Carte jaune `#FFD43B` (`radius-2xl`, padding 12 / 12 / 12 / 14, ombre `0 6px 16px rgba(163,100,13,0.22)`), texte `orange-900` : rond de 36 px blanc à 45 % avec le Wi-Fi barré, « Pas de connexion » 15/20 Bold, « Vérifie ton Wi-Fi ou tes données mobiles. » 13/18 Medium, et un bouton rond blanc de 40 px (flèche circulaire `orange-900`) pour réessayer.
- La discussion reste à l'écran et la question de l'élève (« Je divise par 3 ? ») attend. Le bouton photo reste masqué hors connexion.

### H2 · Pas de connexion au premier lancement — `H2-Pas-De-Connexion.dc.html`
- Élève ou parent, compte illisible sans réseau. L'écran prend la forme de la pause (R1) : fond bleu de marque, le tuteur de 148 px avec un badge blanc Wi-Fi barré (`orange-700`).
- « Pas de connexion pour le moment », « Tutor’IA a besoin d’Internet pour ouvrir le compte la première fois. » : les textes de l'app, neutres (ni « tu » ni « vous »).
- « Réessayer » en bouton blanc, l'aide « Wi-Fi ou données mobiles : on réessaie tout seul. », puis « Changer de compte » en lien souligné au lieu d'un deuxième grand bouton.

### B1 · « Bientôt disponible » — `B1-Bientot.dc.html`
- Ici depuis le réglage de Flashcards (3A). Au lieu d'une page plein écran au même texte pour tous les sujets, une feuille du bas (`ComingSoonSheet`) sur l'écran d'où l'on vient, voile `rgba(0,6,18,0.40)`.
- Poignée, tuile bleue de 56 px avec l'icône du sujet, pastille « Bientôt » (`orange-100` / `orange-700`), « Réglages des révisions » 20/26 Black, bouton rond de 44 px pour fermer.
- Ce qui arrive, une ligne par point (horloge sur `blue-100`) : « Choisir le nombre de cartes par séance », « Garder ou retirer une matière », « Changer l’heure de ton rappel ». Puis « Continuer mes révisions », qui ferme la feuille.
- Les notifications et l'abonnement auront leurs propres écrans (prochains lots).

### À changer dans le code (v2.19)
- **Accueil, premier jour** (`src/features/home/`, J1), tant que l'élève n'a fait aucune séance :
  - `StreakCard` : à 0, « Ta série » et « commence aujourd’hui » au lieu de `streakDays(0)` et `streakCaption`.
  - `ResumeCard` : un mode premier jour — surtitre « Ta première séance », pas de barre « Progression du chapitre », deux pastilles (« {n} min », « D’après ton parcours ») et le bouton « Commencer ». La leçon est la première du parcours (O5).
  - `GoalCard` : `fr.home.goalRemaining` dit « Une séance pour lancer ta journée » quand aucune séance n'est faite.
  - `SubjectCard` (`mode="progress"`) : une matière jamais ouverte affiche « À découvrir » sous le nom, sans pourcentage ni barre.
- **P1 sans enfant** (`ParentHomeScreen`, J3) : `ParentBand` montre « Bienvenue dans l’espace Parents. » sous « Bonjour Claire ». Le bloc `noChild` devient une carte posée sur le bandeau (`shadow.liftParents`) : tuile famille, `noChild.title`, `StepList` avec trois étapes (nouveau `noChild.steps`) et `noChild.cta` ; `noChild.body` n'est plus affiché. Dessous, une carte « Chaque semaine, vous verrez » : trois lignes avec icône et « Jamais ses conversations avec le tuteur. ».
- **Tuteur hors ligne** (H1) :
  - `OfflineBanner` (v2.19.1) : fond jaune `#FFD43B` au lieu de `warningSoft` (à ajouter au thème, par exemple `palette.yellow.offline`), texte `warningStrong` → `palette.orange[900]`, rond Wi-Fi barré blanc à 45 %, et un bouton rond blanc de 40 px (flèche circulaire `orange[900]`, `accessibilityLabel` « Réessayer ») au lieu de `Button` `small`. `fr.tutor.offlineTitle` devient « Pas de connexion », `offlineBody` « Vérifie ton Wi-Fi ou tes données mobiles. ».
  - `WrittenTutorScreen` : le message n'est plus au-dessus de la liste (`styles.banner`) mais dans la conversation, après le dernier message : `ListFooterComponent` de la `FlatList` quand `offline` est vrai, pleine largeur.
  - `useTutorChat` : supprimer l'entraînement hors ligne (`askPractice`, `practiceIndex`, `nextPractice`, `checkPracticeAnswer`, `services/tutor/mock/practice.ts`). Sur une erreur réseau sans réponse reçue, retirer la bulle vide, garder le message de l'élève et passer `offline` à vrai, même sans cartes d'entraînement. `retry` renvoie la dernière question de l'élève au lieu de seulement remettre `offline` à faux.
- **Pas de connexion au lancement** (`UnavailableScreen`, H2) : la mise en page de `StudyPauseScreen` (fond bleu de marque, logo du tuteur avec un badge Wi-Fi barré), « Réessayer » en bouton blanc, nouvelle aide `fr.unavailable.hint` « Wi-Fi ou données mobiles : on réessaie tout seul. », et `signOut` en lien. Le projet n'a pas de bibliothèque réseau : ajouter `expo-network` pour rappeler `authService.refreshAccount()` quand le réseau revient (et au retour au premier plan, avec `AppState`) ; sans cela, retirer « on réessaie tout seul » de l'aide.
- **« Bientôt disponible »** (`ComingSoonModal`, B1) : `Stack.Screen name="bientot"` passe de `presentation: 'modal'` à `'transparentModal'`, et l'écran devient une feuille du bas sur un voile (poignée, tuile du sujet, pastille « Bientôt », titre, bouton fermer). `TOPICS` gagne une liste `items` par sujet, ce qui arrive vraiment ; pour `reglages`, les trois lignes de B1. Le bouton dit où l'on revient (« Continuer mes révisions » pour `reglages`) au lieu de « Fermer ». Les sujets `comptes` et `conditions` gardent leur texte neutre.
- **J2 et J4** : rien à changer.

## Barre de navigation (tous les écrans)

Flottante : `left/right/bottom: 20px`, hauteur 72 px, `radius-3xl`, `shadow-lg`, fond blanc.
5 onglets : **Accueil · Explorer · Tutor'IA · Révisions · Stats** (Explorer avec une icône boussole), avec des icônes au contour (`gray-400`) et un libellé de 12 px en `text-secondary`.
L'onglet actif a une pastille ronde `primary` de 52 px qui dépasse de la barre (bord blanc de 4 px), avec une icône blanche et un libellé en `primary` Bold.
L'onglet **Tutor'IA** utilise le **logo** au lieu d'une icône : le logo sur fond blanc (30 px) au repos, et le logo sur fond bleu (42 px) dans une pastille de 60 px quand il est actif.
La barre est masquée pendant l'appel vocal (2B, 2D, 2F), depuis la v2.6, et pendant une session de flashcards (3B à 3C), depuis la v2.12.
L'onglet **Tutor'IA** ouvre une discussion libre neuve (2G) depuis la v2.12.

### À changer dans le code (v2.12)
- **Session de flashcards** (`SessionScreen`) : masquer la barre de navigation pendant la session et sur le bilan, comme pendant l'appel vocal.
- **Bouton de la session** : avant la réponse, un bouton gris « Choisis une réponse » (fond `#EEF1F6`, texte `text-secondary`), pas un bouton estompé ; après, violet (`violet-500`, ombre violette) « Carte suivante » ou « Voir mon bilan » avec la flèche (`NextCardButton`). Libellé à ajouter : « Choisis une réponse ».
- **Retour de la carte** (`QuizCard`) : une pastille de 28 px devant le texte, coche blanche sur `success` ou flèche blanche sur `warning`.
- **Bilan** (`SessionComplete`) : passer du dégradé vert d'Histoire-Géo au dégradé violet → bleu de la marque (`violet-500 → blue-500`, étoile en filigrane) ; ajouter les pastilles blanches Je sais / À revoir, l'objectif du jour (« Objectif du jour atteint : 3 sessions sur 3 », ou « Objectif du jour : 2 sessions sur 3 ») et le bouton en verre « Choisir un autre chapitre » (vers le choix des chapitres) ; « Recommencer » garde le blanc, texte `violet-600`.
- Le reste du lot (2A, 2C, 2E, 2G à 2K) est déjà dans l'app : les maquettes la rattrapent.

## Règles clés

- **Police** : Satoshi uniquement. Titres de page et de section en Black 900 (30 px dans un bandeau de marque, 22 px pour une section). Titres de carte en Bold 700 ou Medium 500. Texte courant en Regular 400, jamais sous 16 px dans le chat.
- **Espacements** : multiples de 4. Intérieur des cartes 16 px (grandes cartes 24 px). 12 px entre cartes, 32 px entre sections.
- **Zones tactiles** : 48 px minimum.
- **Rayons** : 16 px pour les cartes, champs, boutons et bulles. 24 px pour les grandes surfaces et les cartes colorées. Ronds pour les pastilles et les boutons d'appel.
- **Ombres** : `sm` pour ce qui est posé, `md` pour les cartes, `lg` pour ce qui flotte. `shadow-brand` sur un seul élément par écran.
- **Voix** : tutoiement, phrases courtes, une erreur n'est jamais un échec.
- **Accessibilité** : de vrais `button` et liens, `aria-label` sur les boutons à icône seule, un focus visible (`shadow-focus`).

### Bandeau de marque et cartes de section (v2.5)

Appliqués à l'Accueil, aux Flashcards · Choix, aux Stats et aux écrans Parents (P1 à P4). Les écrans Tuteur, Flashcards · Session, Explorer, connexion et onboarding gardent leur propre en-tête.

- **Bandeau de marque** (`app-tokens.json` › `screenBand`) : bloc pleine largeur en haut de l'écran, dégradé à 170°, coins bas arrondis à 32 px, marge intérieure 56 px en haut, 20 px sur les côtés et 80 à 96 px en bas. Deux pilules blanches décoratives à droite (opacité 0,08 et 0,06).
  - **Bleu** (`--band-eleve-gradient` : #2E6BE6 → #1750C4 à 55 % → #0A3B9D) pour l'Accueil et les Flashcards.
  - **Violet de marque** (`--band-violet-gradient` : #662EE6 → #521DC8 à 55 % → #3B0DA2) pour les Stats et l'espace Parents, dont la première carte est bleue : on évite le bleu sur bleu. L'élève ne voit jamais l'espace Parents, donc le violet de Stats ne crée pas de confusion.
  - Tout le contenu est blanc : titre 30/38 px Black, phrase d'introduction ou citation 15/22 px (largeur max 300 px).
  - Boutons et badges posés dessus : fond blanc translucide (`--on-band-veil`, 16 %), icône ou texte blanc. L'avatar et le sélecteur d'enfant restent des pastilles blanches.
  - Sélecteur de période dans le bandeau : piste `--on-band-veil`, pastille active blanche avec le texte de la couleur du bandeau (`violet-600` sur le violet), les autres segments en blanc.
  - Le contenu (`main`) remonte de 56 px (`--band-overlap` ; 64 px sur l'Accueil) : la première carte déborde sur le bas du bandeau.
  - **Ombre portée** (v2.17) : cette première rangée, posée sur deux fonds, prend `shadow-lift` (`0 18px 32px -10px` de la couleur de la carte, puis un contact `0 4px 12px` bleu nuit ou violet à 16 %) au lieu de `shadow-md`. Orange `rgba(208,136,37,0.65)` sous la série, `rgba(9,17,34,0.55)` sous le niveau, `rgba(3,39,110,0.30)` sous une carte blanche, `rgba(10,59,157,0.55)` et `rgba(2,98,115,0.55)` sous les chiffres bleu et cyan des Stats, `rgba(59,13,162,0.50)` sous la carte bleu → violet des Parents (contact violet), `rgba(59,13,162,0.30)` sous une carte blanche sur le violet. Les cartes posées entièrement sur le fond clair gardent `shadow-md`.
- **Carte de section** : chaque titre de section vit dans sa carte. Carte `surface`, `radius-3xl`, `shadow-md`, marge intérieure 16 px. Titre 22/30 px Black ; une précision éventuelle en 12 px `text-secondary` se place à droite et passe à la ligne si la place manque. Dans la carte, les éléments passent sur le fond `bg` (#F5F8FF) sans ombre, ou gardent leur dégradé pour les cartes de matière (`radius-2xl`, `shadow-sm`).
- **Objectif du jour en violet → bleu** : la carte de l'Accueil est en `--goal-gradient` (#662EE6 → #2E6BE6 à 160°, qui glisse), texte blanc (le vert de la v2.5 ressemblait trop à la carte Histoire-Géo). L'objectif hebdomadaire des Parents (P4) garde le dégradé vert à trois couleurs de l'Histoire-Géo (#1BC85B → #0C9E42 → #03702B) : la carte de l'Accueil part d'un vert plus foncé pour que le texte blanc reste lisible.
- **Hauteur des écrans** : la fin du contenu s'arrête ~116 px au-dessus du bas pour ne pas passer sous la barre de navigation.

#### À changer dans le code (v2.17)
- Ajouter au thème `shadow.lift` et `shadow.liftParents` (valeurs de `tokens.css`), et une fonction `liftShadow(couleur, parents)` pour les cartes colorées (formule dans `app-tokens.json` › `screenBand` › `lift`).
- Les mettre sur la première rangée qui déborde sur le bandeau, et nulle part ailleurs : la série (`StreakCard`, orange) et le niveau (`LevelCard`, ardoise) de l'Accueil, « Révision du jour » des Flashcards, les deux premiers chiffres clés des Stats, le résumé du Profil, la première carte de P1 à P4 (`HeroCard` et cartes bleu → violet, contact violet) et « Ce que nous gardons » des Données personnelles (blanche sur violet).
- Les autres cartes ne changent pas (`shadow.md`).

### Couleurs des matières

| Matière | Couleur | Carte (dégradé 160°) | Fond doux | Encre |
| --- | --- | --- | --- | --- |
| Maths | rouge | #E95555 → #C21A1A → #980B0B | red-100 | red-600 |
| Français | bleu | #4D81EA → #1750C4 → #0A3B9D | blue-100 | blue-600 |
| Histoire-Géo | vert | #1BC85B → #0C9E42 → #03702B | green-100 | green-800 |
| Anglais | cyan | #17A5BE → #09879D → #026273 | cyan-100 | cyan-800 |
| SVT | marron | #A3640D → #6E4204 → #3D2400 | orange-100 | orange-800 |
| Physique-Chimie | violet | #8558EA → #521DC8 → #3B0DA2 | violet-100 | violet-600 |

Sur une carte colorée : texte blanc, icône dans une pastille `rgba(255,255,255,0.24)`, grande icône en filigrane (opacité 0,16) dans un coin.

## Écarts assumés par rapport au design system

Ces choix ont été validés sur les maquettes. Ils sont à reporter dans le design system (`DESIGN_SYSTEM.md`) :

1. **Rouge pour les Maths** : le design system réserve le rouge aux erreurs système. Ici, il identifie une matière. Le rouge n'est toujours **pas** utilisé pour une mauvaise réponse.
2. **Violet pour la Physique-Chimie** : c'est la teinte de l'`accent` (notifications et conseils), qui reste réservé à ces usages hors matière.
3. **Plus de couleurs vives que la règle 80/20** : les cartes des matières, les KPI et les points forts/faibles sont colorés.
4. **Black 900 sur les titres de page et de section** : le design system le réserve au style `display`, une fois par écran.
5. **Texte blanc sur l'orange** (série, À retravailler) : le contraste est d'environ 2,3:1, sous le seuil WCAG. Il reste lisible sur les grands textes gras. À surveiller pour les petits textes (possibilité de foncer l'orange si besoin).
6. ~~Barre de navigation visible pendant l'appel vocal~~ : remplacé par l'écart 20 (v2.6).
7. **Espace Parents coloré** : le design system le voulait « plus sobre ». Il garde les couleurs et les cartes en dégradé de l'app élève, mais sans aucune gamification.
8. **Explorer en 3D, sur fond de ciel (X1)** : validé par Romain. L'île est en 3D réaliste façon maquette, avec des couleurs naturelles hors de la palette de la marque, et tout l'écran X1 garde le ciel et ses nuages au lieu du fond `bg`. Sur ce ciel, le sous-titre « Choisis ton île » passe en `text` (le `text-secondary` serait illisible), et les points inactifs du carrousel sont blancs. Tant qu'une seule île est construite en 3D (les Maths), le carrousel ne montre qu'elle, sans flèches ni points. L'île tourne au doigt, avec un peu d'élan au lâcher ; on changera d'île avec les flèches.
10. **X2a · les régions de l'île** : « Explorer l'île » zoome dans la même scène 3D (caméra plus haute, île entière). Les régions (domaines du référentiel de 4e) se choisissent avec un **carrousel de cartes en bois en bas de l'écran** (défilement au doigt ou flèches) : la région choisie est éclairée, teintée, avec ses frontières en pointillés, les autres sont grisées, et la caméra dérive vers elle. Rien n'est posé sur l'île. Le bouton « Entrer dans la région » déclenche un vrai zoom-in sur la région, un fondu au noir accompagne le zoom, puis la carte de la région apparaît (X2b). L'Algorithmique, région d'un seul chapitre, est un îlot flottant derrière l'île (en haut à gauche), hors de portée du carrousel. Sans WebGL ou avec un lecteur d'écran, le carrousel est remplacé par une liste de régions.
11. **X2b · la carte d'une région** : « Entrer dans la région » ouvre une vraie carte de l'île de la région, vue de haut (caméra à 52°, abaissée de 62° à la demande de Romain le 06/10, champ de vision très étroit : presque sans perspective, comme un plateau de jeu). La carte se déplace au doigt dans tous les sens, avec de l'élan, bornée à l'île ; les flèches ville précédente/suivante du panneau de ville la recentrent sur une ville. Les villes sont posées en serpentin (deux par rangée) et chacune occupe une clairière avec son monument au centre ; ses niveaux forment un arc autour du monument, du côté de la ville précédente à celui de la suivante, et un seul chemin relie toutes les villes dans l'ordre du programme. Il est en bois miel jusqu'à l'avatar et en bois grisé ensuite ; les points de niveau sont verts (leçon), bleus (exercices) ou rouges et plus grands (évaluation), gris avec un cadenas quand ils sont fermés, avec leurs étoiles ; un bandeau de bois nomme chaque ville, derrière son cercle de niveaux. L'en-tête nomme la région et la ville la plus proche du centre de l'écran. Les boutons de 48 px et les bandeaux sont posés sur la 3D et rognés à la zone de la carte ; une vue en liste (région, ville, niveau) remplace la carte sans WebGL, avec un lecteur d'écran ou sur demande. Art : pour la région Nombres, la carte est la région elle-même de l'île, agrandie 6 fois (même contour, mêmes repères : π d'eau animé, pyramides, cubes numérotés, arbre « + » ; le boulier et l'octaèdre sont retirés pour faire de la place), cuite dans Blender avec la même herbe naturelle que l'île et ses brins qui ondulent. Comme sur l'île, il n'y a ni arbre ni buisson : quelques rochers, des galets et des touffes de fleurs (pièces texturées du kit de décor) sont posés par l'app aux emplacements choisis par Blender (regionDecor.json), avec une ombre douce au sol, sans surcharger la carte. Validé par Romain le 06/10 : le chemin est fait de planches posées en travers, comme sur un plateau de jeu, avec l'herbe visible entre elles (dessinées par le shader). Les points de niveau gardent leur disque coloré et leur icône blanche, mais leur relief est un rebord doré et lumineux, façon Mario (argenté pour un niveau fermé) ; un halo jaune entoure les niveaux ouverts et celui de l'avatar pulse doucement. L'avatar de l'élève remplace le pion : il salue à l'entrée dans la région, marche le long du chemin quand il avance, puis saute en arrivant. Les clairières des villes ne restent plus vides : de l'herbe, des fleurs et quelques galets y poussent autour du monument. Les monuments des villes sont posés à même l'herbe, sans socle, et soignés comme des figurines de maquette (moulin de pierre et toit de tuiles, ailes en treillis qui montrent 1/4 à 4/4, tarte festonnée à la chantilly, atelier à colombages, balance de laiton au cadran « = », bascule sur une droite graduée de −4 à +4, tour de cubes couronnée). Les autres régions gardent pour l'instant la maquette simple (terre unie, décors du kit, village générique).
9. **HUD de jeu vidéo sur X1** : à la demande de Romain, l'écran doit se distinguer du reste de l'app, « plus Mario ». Le titre, les compteurs, la banderole de l'île et les boutons utilisent la police Lilita One (licence OFL, `assets/typographie/LilitaOne/`), en blanc cerné de bleu nuit avec une ombre portée. S'y ajoutent des boutons brillants en relief (flèches jaunes, bouton vert « Explorer l'île »), des gemmes à la place des points et un panneau « Ta quête » en bois (planches rendues par Blender, `tools/explorer-3d/wood_panel.py`), avec des clous, un ruban et une étiquette en parchemin pour la prochaine étape. La barre de navigation reste celle de l'app.
12. **Éditeur d'avatar dans le HUD de jeu** (sans maquette, validé par Romain le 02/10) : « Crée ton avatar » reprend la direction artistique d'Explorer pour que le côté jeu de l'app reste cohérent. On y retrouve le ciel d'Explorer en fond, la figurine en 3D posée dessus et les boutons ronds en relief (retour jaune, dé vert). Les titres sont en Lilita One et les onglets sont des boutons de jeu, le choisi en jaune. Les réglages sont dans un panneau de bois (planches répétées à leur taille), avec des pastilles de parchemin (la choisie dorée), des pastilles de couleur cernées de bleu nuit, des curseurs à jauge creusée et bouton doré et des interrupteurs en bois. Le gros bouton vert « Enregistrer » et la confirmation de sortie, sur un panneau de bois, complètent l'écran.
13. **X3 à X5b · un niveau dans le HUD de jeu** (validé par Romain le 06/10) : la fiche d'un niveau et son bilan reprennent le panneau de bois d'Explorer au lieu de la feuille blanche des maquettes ; la discussion garde les bulles et la saisie de l'onglet Tutor'IA, dans un cadre clair cerné de bleu nuit, sur le ciel d'Explorer. Toucher un niveau ouvert y fait d'abord marcher l'avatar (2,5 s au plus), comme sur la carte d'un jeu, puis la fiche s'ouvre à son arrivée ; un niveau fermé ouvre sa fiche tout de suite. Les étoiles d'un niveau terminé s'affichent en arc au-dessus de son point, grandes et cernées de bleu nuit, celle du milieu plus haute. La fiche se pose en bas de la carte assombrie : ruban du type, titre en Lilita One, pastilles de durée, d'étapes et d'étoiles, objectifs sur parchemin, règle de l'évaluation sur fond rouge clair, raison du verrouillage, puis « À l'écrit » (vert) et, pour une leçon seulement, « À la voix » (bleu) : à l'oral, le tuteur ne peut pas juger les réponses, la leçon compte alors comme une séance, sans étoiles. L'en-tête de la discussion montre la progression en segments verts, et chaque étape réussie d'une leçon ajoute une carte verte « Étape n réussie ». Dessiné dans les maquettes le 9 octobre (v2.13, X4a et X4b), avec l'ardoise en bois et, à la voix, le logo du tuteur et une planche de commandes ; quitter (X4c) et le bilan (X5a, X5b) repris du code en v2.14. Le bilan est calculé par le serveur ; « Le bilan de ton tuteur » devient « Ce que tu as travaillé » (les objectifs du niveau) ou la leçon à revoir, et l'XP affichée est celle réellement gagnée (rejouer ne rapporte que les étoiles nouvelles ; rien n'est affiché sans gain).
14. **Formules mathématiques en New Computer Modern** (validé par Romain le 06/10) : dans les bulles du tuteur, les formules sont dessinées par MathJax avec sa police mathématique (fractions empilées, puissances, racines, x en italique), et non en Satoshi, comme dans un manuel. Une formule isolée est centrée sur sa ligne, un peu plus grande que le texte ; une formule trop longue défile sur le côté. Elles prennent la couleur du texte de la bulle.
15. **Le tuteur visuel au-delà des maquettes 2C et 2E** (validé par Romain le 07/10) : en plus du graphique et du tableau blanc, le tuteur peut montrer un diagramme statistique (barres arrondies ou secteurs avec leur légende) et une figure de géométrie (points nommés, longueurs, angle droit codé par un petit carré, cercles), dans le même panneau. Les couleurs que le tuteur peut nommer sont six teintes de la palette (rouge, bleu, vert, orange, violet, gris). Chaque sorte de visuel a sa couleur d'accent, pour se distinguer de la carte du chapitre (rouge Maths) : violet pour le graphique, azur pour le tableau, orange pour les statistiques, cyan pour la figure. Le panneau est teinté de cette couleur, sa tuile est en dégradé, et le dessin reste sur une feuille blanche. Le tableau blanc est une surface blanche nette, sans grille de points, sans cadre et sans les pastilles d'étapes de la maquette (les étapes sont déjà écrites au tableau) ; une ligne n'est jamais coupée : un long calcul fait défiler le tableau sur le côté, un long tableau le fait défiler vers le bas (validé par Romain le 07/10). La pastille « Voir… » est unie, dans la couleur de son visuel. Tout le bandeau ouvre ou replie le panneau, même clavier ouvert. Les boutons du panneau font 48 px au lieu de 44 (zones tactiles). Les mots écrits dans une formule sont en Satoshi.
16. **Bandeau de marque en tête des écrans principaux** (validé par Romain le 07/10) : le design system pose les titres d'écran directement sur le fond `bg`. Sur l'Accueil, les Flashcards · Choix, les Stats et l'espace Parents, le titre est en blanc dans un bandeau en dégradé : bleu côté élève, violet de marque pour les Stats et les Parents. Voir « Bandeau de marque et cartes de section ».
17. **Titres de section dans leur carte, en 22 px Black** (validé par Romain le 07/10) : plus aucun titre de section n'est posé sur le fond. Le titre de la carte « Reprendre » passe aussi en Black (20 px), au lieu du Medium 500 prévu par le design system.
18. **Objectif du jour en vert** (validé par Romain le 07/10) : la carte de l'Accueil passe en dégradé vert foncé (#0C9E42 → #03702B), texte blanc, pour mieux ressortir. Le vert y signale un objectif, comme l'objectif hebdomadaire des Parents. **Remplacé le 07/10 par un dégradé violet → bleu de la marque (#662EE6 → #2E6BE6)**, à la demande de Romain : le vert ressemblait trop à la carte Histoire-Géo, juste en dessous. Le dégradé glisse lentement d'un bout à l'autre de la carte (6 s, aller-retour), figé si l'élève a demandé moins d'animations. Reporté dans la maquette de l'Accueil le 9 octobre (v2.10).
19. **Le chat libre en couleurs** (demandé par Romain le 07/10) : la carte « Sujet de la discussion » des tuteurs écrit et vocal prend le dégradé de sa matière (bleu de l'élève pour « Toutes les matières »), avec son icône en filigrane, le texte en blanc et la pastille « Leçon n/5 » blanche, au lieu de la carte blanche de la maquette 02a. Une discussion libre encore vide propose quatre idées de départ, en pastilles dégradées de la palette d'accent (violet, orange, vert, cyan) qui défilent sur le côté juste au-dessus de la saisie ; un toucher envoie la demande au tuteur. Le volet « Tes discussions » s'ouvre sur un bandeau bleu de l'élève, dans l'esprit du bandeau de marque (entrée 16). Dessiné dans les maquettes le 9 octobre (v2.12) : 2A, 2G, 2H, 2K, et la session de flashcards (3B à 3C).
20. **Appel vocal plein écran, sans barre de navigation** (validé par Romain le 07/10, remplace l'écart 6) : 2B, 2D et 2F sont de vrais écrans d'appel, sur le dégradé de marque et tout en blanc. On en sort par « Écrit » ou « Raccrocher ». La caméra est à côté du bouton raccrocher.
21. **Pastilles d'état colorées** (validé par Romain le 07/10) : verte « Je t'explique… » quand le tuteur parle, rouge « Je t'écoute… » quand c'est à l'élève. Le rouge signale ici l'écoute, pas une erreur ; l'orange est prévu si le rouge gêne à côté du bouton raccrocher.
22. **Le logo du tuteur remplace les barres** (validé par Romain le 07/10, les ondes ont été jugées « cheap ») : il rebondit au niveau de la voix, se pose à chaque pause et penche la tête quand il écoute. Les quatre barres du design system ne servent plus que dans la discussion vocale d'Explorer, et plus du tout dans les maquettes depuis la v2.13 (X4b).
23. ~~**Pilules décoratives du bandeau à la même place sur tous les écrans**~~ (abandonné le 15/10, à la demande de Romain) : l'app place désormais les pilules comme chaque maquette (`ScreenBand`, prop `pills`). Seul le bas du bandeau garde 32 px visibles sous la carte qui déborde. Le volet « Tes discussions » s'ouvre sur ce même bandeau, sans carte qui déborde. Le badge de « Évolution de ta maîtrise » suit le pourcentage, sous le titre de 22 px.
24. **Le rythme des sous-titres et du tableau de l'appel** (v2.6, dans l'app, retours de Romain le 08/10) : l'API Realtime ne donne pas l'instant où chaque mot est prononcé, et le texte du tuteur arrive bien avant sa voix. La phrase du tuteur s'affiche donc à 45 % de blanc, et les mots s'allument au débit estimé de sa voix (15 caractères par seconde au départ, recalé sur chaque réponse entendue en entier) ; la courbe nommée s'allume quand sa couleur est prononcée. Les sous-titres de l'élève (« Toi ») sont retirés, à la demande de Romain : la transcription ne commençait qu'à la fin de sa phrase et arrivait après coup ; sa voix n'est donc plus transcrite (moins de données envoyées, aucun coût). Pendant que l'élève parle, les sous-titres gardent la dernière phrase du tuteur. Le tableau blanc s'écrit au rythme d'une ligne toutes les 1,6 s pendant que le tuteur parle, en entier quand il a fini. La pastille « Solution » du graphique n'est pas reprise. Les halos du logo n'apparaissent que quand le tuteur parle, et respirent avec sa voix ; le logo garde un petit rebond tant que le tuteur parle, même si le niveau de sa voix ne peut pas être mesuré.
25. **Connexion plein écran** (v2.7, validé par Romain le 08/10) : le design system posait la connexion sur le fond `bg`, sous un en-tête en carte (`AuthHero`). L2 et L3 couvrent maintenant tout l'écran du dégradé de l'espace, comme l'appel vocal, avec le formulaire dans une feuille blanche ; le logo y apparaît dans son disque blanc et rebondit une fois. Les boutons Apple et Google sont les boutons officiels (« Continuer avec Apple / Google », avec leurs logos), empilés en pleine largeur. Étendu à tous les écrans de compte sauf L1 le 9 octobre (v2.11) : inscriptions, mot de passe oublié, vérification de l'e-mail, accord d'un parent.
26. **Le code parent hors de la connexion, en attendant la connexion par code** (v2.7, dans l'app, option A validée par Romain le 08/10) : le lien « J'ai un code de mon parent » ouvre l'écran « Relier mon compte à un parent », construit sur `AuthScreen` (bleu, le logo qui dit bonjour, le champ du code dans la feuille). Le code y est gardé, rappelé sur L2 dans une bande verte (« Code 482913 gardé… », avec « Retirer le code »), puis relié juste après la connexion. Le premier champ de L2 reste « E-mail » : la connexion d'un enfant par identifiant ou par code (profil créé par le parent, L5 et L6) viendra avec cette fonction. Dessiné dans les maquettes le 9 octobre (v2.11) : L7 (saisie dans des cases, `CodeInput`) et L2b (bande verte, `InlineNotice`) ; L2 dit maintenant « E-mail ».
27. **Le profil de l'élève dans l'app** (v2.8, décisions de Romain le 08/10) : pas de bouton « Retirer » à côté d'un parent relié, ce n'est pas à l'élève de le faire (la base l'interdit aussi) ; la ligne du parent dit « Lien depuis le 2 septembre ». Les 24 trophées sont ceux validés par Romain (séries, niveaux de joueur, niveaux d'Explorer, évaluations réussies, étoiles, régions, ville parfaite, notions acquises) ; « Quiz parfait » n'est pas repris, l'app n'enregistrant pas les quiz réussis à 100 %. Le rappel de révision garde son interrupteur, avec « Une notification chaque jour pour réviser » au lieu d'une heure, que l'élève ne choisit pas encore. « Sons et vibrations » est un interrupteur retenu sur l'appareil, sans effet pour l'instant (« bientôt » dans son aide). « Confidentialité » ouvre une courte page (ce que voient les parents, ce qui est gardé, les droits). Reporté dans la maquette `05-Profil` le 9 octobre (v2.10).
28. **Le bouton de l'avatar et les trophées du profil en style jeu** (demande de Romain le 08/10, ils relèvent du côté jeu de l'app) : « Modifier l'avatar » est une planche de bois en relief, comme le panneau « Ta quête » (`WoodButton`, Lilita One), avec ses nouveautés dans une pastille orange cernée de bleu nuit. « Mes trophées » devient une armoire de bois (`WoodFrame`, ruban « Mes trophées », compte « 8 sur 24 » dans une pastille dorée) : les médailles gagnées ont un anneau doré, le disque de leur couleur et un rebord, et sont alignées sur une étagère creusée ; la prochaine à gagner est creusée dans le bois avec un cadenas. Les noms sont écrits en Lilita One. Reporté dans la maquette `05-Profil` et le design system (`WoodButton`, `WoodFrame`, `GameText`) le 9 octobre (v2.10).
29. **La barre de navigation de l'app** (décision de Romain le 15/10) : l'onglet actif reste la pastille ronde de 52 px qui dépasse de la barre, comme le décrit la section « Barre de navigation » ; les maquettes la dessinent plate, dans la barre, et ne font pas foi sur ce point.
30. **L'en-tête de l'Accueil et la barre d'état** (essais validés par Romain le 15/10, sur téléphone) : plus de citation du jour ; « Salut Léa ! » en 42 px Black (`extras.homeGreeting`, entre `h1` et `display`) sur la même ligne que la cloche et l'avatar, avec le même espace (48 px, `HOME_BAND_GAP`) au-dessus, sous la barre d'état, et en dessous, jusqu'à la série et au niveau. Sur tous les écrans à bandeau, l'heure et la batterie passent en blanc tant que l'écran est affiché, et le contenu commence 24 px sous la barre d'état (8 px avant) : en sombre et collé, le haut de l'écran se confondait avec la barre du téléphone.
