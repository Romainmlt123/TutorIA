# Composants de l'app élève Tutor'IA

> **Déjà factorisés dans les maquettes** (`components/`) : **BottomNav** (élève + Parents), **ModeToggle**, **TopicCard**, **PanelHeader**, **CallControls** (X4b), et pour l'appel vocal **CallTopBar**, **VoiceAvatar**, **VoiceStatus**, **CallDock**. Leurs props figurent en tête de chaque fichier (`data-props`). Les autres composants ci-dessous sont encore dessinés directement dans les écrans : leurs specs font foi pour le code.

> **Implémentation de référence** : les 92 composants existent dans `design-system/` (publiés dans le design system Tutor'IA). Pour chaque composant, `design-system/index.d.ts` donne les props exactes et `design-system/components/<Nom>/README.md` son usage ; les noms peuvent différer légèrement de cet inventaire (par exemple `CallControls` pour les boutons d'appel, `LineChart`/`BarChart`/`Heatmap` pour `ChartCard`). TopBar de session, SessionComplete et Greeting restent des assemblages d'écran, décrits seulement ici.

Inventaire des composants à créer, tirés des maquettes (`screens/`). Valeurs = tokens de `tokens/`.
Chaque composant liste : rôle, anatomie, specs, états / variantes, écrans où il apparaît.

---

## Fondations

### Icon
- Icônes au contour, sur une grille 24, trait de 1,75 (2 à 2,5 dans les petits boutons), bouts et angles arrondis.
- Couleur au repos `gray-400` (#798398). Une action active ou importante passe en `primary` ou en blanc sur fond coloré.
- Jeu nécessaire : accueil, explorer (boussole), révisions (cartes), stats (barres), cloche, réglages (curseurs), flèche droite, chevron gauche, croix, envoi (flèche haut), micro, micro barré, caméra, caméra barrée, clavier, ampoule, flamme (pleine), étoile, horloge, cible, tendance haut, coche, retour (rotation).
- Icônes des matières : Maths = calculatrice, Français = livre, Histoire-Géo = globe, Anglais = langues, SVT = feuille, Physique-Chimie = fiole.
- Le design system n'a pas encore de composant icône : c'est à créer en priorité.

### Logo
- Deux versions : `assets/logo/Logo_tutoria_fond_blanc.png` et `assets/logo/Logo_tutoria_fond_bleu.png`.
- Le logo est toujours bleu : jamais recoloré, jamais déformé, sans ombre dure.

---

## En-têtes et sections (v2.5)

Deux assemblages communs à l'Accueil, aux Flashcards · Choix, aux Stats et aux écrans Parents. Tokens : `app-tokens.json` › `screenBand`, variables `--band-*` et `--on-band-veil` de `tokens.css`. Ils n'existent pas encore dans le design system ni dans `components/` : ils sont dessinés dans chaque écran.

### ScreenBand (bandeau de marque)
- `section` pleine largeur en haut de l'écran, `position: relative`, `overflow: hidden`, coins bas arrondis à 32 px (`border-radius: 0 0 32px 32px`), texte blanc.
- Padding : 56 px en haut, 20 px sur les côtés, 80 à 96 px en bas selon ce qui déborde dessus.
- Fond en dégradé à 170° :
  - `eleve` (bleu) : #2E6BE6 → #1750C4 à 55 % → #0A3B9D, pour l'Accueil et les Flashcards ;
  - `violet` (violet de marque) : #662EE6 → #521DC8 à 55 % → #3B0DA2, pour les Stats et l'espace Parents.
- Décor : deux pilules blanches en position absolue à droite (environ 120 × 40 et 88 × 32 px, opacité 0,08 et 0,06), `aria-hidden`.
- Contenu, empilé (écart de 12 à 20 px) :
  - rangée d'actions éventuelle : IconButton « sur bandeau », ChildSwitcher, badge ;
  - titre `h1` 30/38 Black, blanc ;
  - phrase d'introduction ou citation 15/22, blanche, largeur max 300 px ;
  - SegmentedControl « sur bandeau » éventuel (sélecteur de période).
- Le `main` qui suit est en `position: relative` et remonte de 56 px (`--band-overlap` ; 64 px sur l'Accueil) : sa première carte déborde sur le bas du bandeau.
- Props suggérées : `variant: 'eleve' | 'violet'`, `title`, `subtitle?`, `actions?`, `children?`.

### SectionCard (carte de section)
- Chaque titre de section vit dans sa carte : `surface`, `radius-3xl`, `shadow-md`, padding 16 px, écart de 16 px (8 à 12 px pour une liste).
- En-tête : `h2` 22/30 Black. Précision optionnelle à droite en 12/16 `text-secondary`, ou lien « Tout voir » 14 Bold `primary`. Rangée en `flex-wrap`, alignée sur la ligne de base, écart horizontal de 12 px : la précision passe sous le titre si la place manque.
- Contenu : éléments sur le fond `bg` (#F5F8FF), sans ombre, en `radius-2xl` (14 px pour des lignes). Les cartes de matière gardent leur dégradé, en `radius-2xl` + `shadow-sm`.
- Les cartes colorées qui portent leur propre titre (HeroCard, AlertCard, AdviceCard, InsightList, GoalCard, maîtrise des Stats, GoalStepper) ont un titre de même taille : 22/30 Black.
- Props suggérées : `title`, `meta?`, `action?`, `children`.

---

## Navigation

### BottomNav (barre de navigation flottante)
- Position : `absolute`, à 20 px à gauche, à droite et en bas. Hauteur 72 px, padding horizontal 4 px, fond `surface`, `radius-3xl`, `shadow-lg`.
- 5 onglets de largeur égale, contenu aligné en bas (padding-bottom 12 px, gap de 4 px) :
  - Accueil
  - Explorer (boussole ; `active="explorer"`, `parcours` accepté comme alias)
  - **Tutor'IA** (logo)
  - Révisions
  - Stats
- Onglet au repos : icône de 24 px en `gray-400`, libellé de 12/16 Medium en `text-secondary`.
- Onglet actif : pastille de 52 px `primary` avec un bord blanc de 4 px et `shadow-md`, qui dépasse d'environ 12 px au-dessus de la barre. Icône blanche de 22 px, libellé en `primary` Bold.
- Onglet Tutor'IA :
  - au repos : logo sur fond blanc de 30 × 30 ;
  - actif : pastille de 60 px contenant le logo sur fond bleu de 42 px (rayon 12).
- `aria-current="page"` sur l'onglet actif, et `nav aria-label="Navigation principale"`.

### SegmentedControl (toggle Écrit / Vocal, Semaine / Mois / Trimestre)
- Conteneur `surface`, padding 4 px, gap 4 px, `radius-3xl`, `shadow-sm`, hauteur totale 48 px.
- Segment : hauteur 40 px, padding horizontal 20 px, rayon 20 px, texte 14 Medium. Icône optionnelle de 18 px.
- Actif : fond `primary`, texte blanc. Inactif : transparent, `text-secondary`.
- Variante « pleine largeur » (Stats) : grille de 3 colonnes égales.
- Variante « sur bandeau » (Stats, P2, dans un ScreenBand) : conteneur en blanc translucide (`--on-band-veil`), sans ombre ; segment actif blanc avec le texte de la couleur du bandeau (`violet-600`), segments inactifs transparents au texte blanc ; texte 14 Bold.

### TopBar de session (flashcards)
- Lien « Quitter » (chevron + texte 16 Bold, zone de 96 × 48) · titre centré (matière 16 Black, sous-titre 12 `text-secondary`) · StreakBadge à droite.

---

## Boutons

### Button
- Hauteur 48 px, `radius-2xl`, texte 16 Medium ou Bold, icône optionnelle de 20 px à droite (flèche).
- **primary** : fond `primary`, texte blanc ; + `shadow-brand` sur l'action principale de l'écran (une seule par écran : « Reprendre », « Commencer », « Carte suivante »).
- **vivid** (violet) : fond `violet-500`, texte blanc, ombre `0 8px 20px rgba(102,46,230,.30)` (« C'est parti »).
- **soft** : fond `primary-soft`, texte `primary`.
- **small** (« Réviser ») : hauteur 48, padding 0 16, 14 Bold, `primary` plein.
- **disabled** : opacité 0,4, `disabled`.

### IconButton
- Carré de 48 px, `radius-2xl`, fond `surface`, `shadow-sm`, icône de 22 à 24 px (notifications, réglages).
- Variante avec point de notification : rond de 10 px en `accent` avec un bord blanc de 2 px, en haut à droite.
- Variante « sur bandeau » (dans un ScreenBand) : fond `--on-band-veil` (blanc à 16 %), sans ombre, icône blanche.

### CallButton (appel vocal d'Explorer)
> Depuis la v2.6, l'appel du tuteur (2B, 2D, 2F) utilise `CallDock` (section « Appel vocal »). Ces boutons restent pour la discussion vocale d'Explorer (X4b).

- Rond de 56 px (micro, caméra) : fond `surface` et `shadow-md`, avec une légende de 12 px en dessous.
  - Micro coupé : fond `gray-900`, icône blanche barrée.
  - Caméra active : fond `primary`, icône blanche.
- Raccrocher : rond de 72 px `error-strong`, croix blanche de 28 px. C'est un lien qui revient au chat écrit.

---

## Cartes

### SubjectCard (carte de matière colorée)
- Padding 16 px, hauteur minimale 120 à 132 px, fond = dégradé de la matière (160°), texte blanc, `overflow: hidden`. Rangée dans une SectionCard (Accueil « Tes matières », Flashcards « Choisis ta matière ») : `radius-2xl` et `shadow-sm`. Posée seule : `radius-3xl` et `shadow-md`.
- En haut : pastille de 40 px (`rgba(255,255,255,.24)`) avec l'icône blanche de la matière. À droite : pourcentage (sur l'Accueil) ou coche de sélection (sur les Flashcards).
- En bas : nom 18/24 Black, puis une barre de progression de 6 px (piste `rgba(255,255,255,.3)`, remplissage blanc) ou « N cartes » en 12 px.
- Filigrane : l'icône de la matière en 96 px, opacité 0,16, décalée de −20 px en bas à droite.
- État sélectionné (Flashcards) : `box-shadow: 0 0 0 3px #FFFFFF, 0 0 0 6px <encre de la matière>` (l'anneau intérieur reprend le fond de la carte qui contient la grille), plus une coche dans un rond blanc de 28 px. Non sélectionnée : `0 1px 2px rgba(9,17,34,.06)`.

### StreakCard / StreakBadge
- Carte : fond `orange-500` uni (sans dégradé), texte blanc, `radius-3xl`, padding 16 px. Pastille blanche de 40 px avec une flamme orange, « 12 jours » en 24 Black sur une ligne, « de série, continue ! » en 12 Bold. Flamme blanche en filigrane.
- Badge : pastille `orange-500`, texte blanc 14 Bold, flamme blanche de 16 px, hauteur 32 px.

### LevelCard
- Fond `gray-600`, texte blanc, `radius-3xl`. Pastille `green-500` de 40 px avec une étoile, « 340 / 500 XP » en `green-200`, « Niveau 7 » en 24 Black, jauge XP de 8 px (piste blanche à 18 %, remplissage `green-500`).

### ResumeCard (Reprendre)
- `surface`, `radius-3xl`, padding 24 px, `shadow-md`.
- Tuile de la matière de 48 px (dégradé) · titre 20/28 Black (22/30 Medium avant la v2.5) · sous-titre 14 `text-secondary` · barre de progression de 8 px (`primary-soft` / `primary`) · Button primary « Reprendre ».

### GoalCard (Objectif du jour)
- Dégradé vert `goal` (#0C9E42 → #03702B, 160°), `radius-3xl`, padding 20 px, `shadow-md`, texte blanc. Cible blanche en filigrane (120 px, opacité 0,14) en bas à droite.
- Anneau de 64 px (trait de 7 px, piste blanche à 28 %, progression blanche), au centre « 2/3 » en 16 Black.
- Titre 22/30 Black, détail 14 Medium, puis la pastille blanche « Plus qu'une ! » (texte `green-800`, 12 Bold).
- Avant la v2.5 : carte `surface`, anneau bleu de 56 px, titre 16 Bold.

### TopicCard (Sujet de la discussion)
- Pleine largeur, `surface`, `radius-2xl`, padding 12 × 16 px, `shadow-md`.
- Tuile de 40 px (dégradé de la matière) · surtitre de 12 px en capitales, couleur de l'encre de la matière · titre 16 Bold · pastille à droite (« Leçon 3/5 » ou chrono avec un point rouge).

### DailyReviewCard (Révision du jour)
- `surface`, `radius-3xl`, padding 24 px. Cercle décoratif `orange-100` en haut à droite. Titre 22 Bold, détail 14, StreakBadge.
- Pastilles des matières qui se chevauchent (36 px, bord blanc de 2 px, −10 px de chevauchement) + « +2 ». Button vivid « C'est parti ».

### ChapterRow
- `button`, hauteur minimale 68 px, `radius-2xl`, sans ombre, rangé dans une SectionCard (écart de 8 px). Au repos : fond `bg` et bord de 2 px `bg`. Sélectionné : fond blanc et bord de 2 px à l'encre de la matière.
- Tuile numéro de 40 px (fond doux et encre de la matière, 14 Bold) · titre 16 Bold · « N cartes · ~M min » 14 `text-secondary` · radio de 24 px (bord de 7 px à la couleur de l'encre si sélectionné).

### KpiCard (carte de statistique)
- `radius-3xl`, padding 16 px, fond coloré (voir `app-tokens.json` › `kpi`), texte blanc, icône en filigrane.
- Pastille d'icône de 32 px · libellé 12 Medium · valeur 28 Black · pastille d'évolution (voile blanc, 12 Bold).
- Série record : fond `orange-500` uni, pastille d'icône blanche avec une flamme orange.

### ChartCard
- `surface` (ou dégradé pour « Maîtrise »), `radius-2xl` à `3xl`, padding 16 px. En-tête : titre 22/30 Black (16 avant la v2.5) + méta 12 à droite, qui passe à la ligne si besoin. Maîtrise : sous le titre, « 68 % » et le badge d'évolution côte à côte (badge sur une seule ligne).
- Contenus :
  - **BarChart** : 140 px de haut, grille en pointillés `gray-200`, axes 12 `text-secondary`, barres en dégradé `violet-500 → blue-500`, rayon 6/6/2/2.
  - **SubjectProgressList** : tuile d'icône de 36 px (fond doux et encre de la matière), nom 14 Medium, barre de 12 px en dégradé de la matière, pourcentage 14 Bold.
  - **LineChart** (sur la carte en dégradé) : courbe blanche de 3 px, aire en dégradé blanc de 35 % à 0 %, dernier point en `green-500` cerclé de blanc.
  - **Heatmap** : 13 colonnes × 7 lignes, cellules de 18 px, écart de 4 px, rayon 4, niveaux `blue-100 / 200 / 300 / 500 / 700`, légende « Moins … Plus ».

### InsightList (Points forts / À retravailler)
- Carte `radius-3xl`, padding 16 px. Points forts : dégradé vert. À retravailler : `orange-500` uni. Titre blanc 22/30 Black avec une icône de 24 px.
- Ligne : fond blanc, `radius-2xl`, padding 8 × 12, `shadow-sm`. Tuile de 40 px (fond `success-soft` avec une coche `success`, ou `warning-soft` avec l'icône de retour `warning`) · notion 14 Medium · matière 12 `text-secondary` · score ou Button small « Réviser ».

---

## Tuteur

### ChatBubble
- **Tuteur** : à gauche, avatar = logo sur fond bleu de 32 px (rond, `shadow-sm`), bulle `surface` de 256 px max, `radius-2xl`, `shadow-sm`, padding 12 × 16, texte 16/24.
- **Élève** : à droite, bulle `primary` de 280 px max, texte blanc.
- 12 px entre les bulles. L'italique sert à mettre en valeur une notion.

### TipCard (Conseil)
- `accent-soft`, `radius-2xl`, padding 16 px, alignée sur les bulles (marge gauche de 40 px). Pastille `accent` de 32 px avec une ampoule blanche · « CONSEIL » en 12 Bold, capitales, couleur `accent` · texte 14/20 `gray-700`.

### ChatInput
- Champ de 48 px (`surface`, bord `border`, `radius-2xl`, `shadow-sm`, placeholder `gray-400`, `label` masqué) + bouton rond d'envoi de 48 px en `primary`.

### VoiceVisualizer
> Depuis la v2.6, l'appel du tuteur n'utilise plus les barres : `VoiceAvatar`, `VoiceStatus` et `LiveCaptions` les remplacent (section « Appel vocal »). Elles restent pour la discussion vocale d'Explorer.

- 4 barres de 40 px de large, 20 px d'écart, rondes, en dégradé vertical `blue-500 → violet-500`. Hauteur animée (transition de 140 ms).
  - Tuteur qui parle (IA) : de 40 à 190 px, chaque barre avec sa propre phase et des micro-pauses.
  - Élève qui parle : de 40 à 100 px, plus lent.
  - Repos ou micro coupé : 40 px (pastilles).
- Libellé d'état 18 Medium en `text-secondary` (`aria-live="polite"`), aide « Touche l'écran pour interrompre » en 14 px.
- Toute la zone est un `button` : le toucher interrompt le tuteur.

---

## Appel vocal (v2.6)

Écrans 2B, 2D, 2F. Comportement complet : `README.md`, section « Appel vocal : ce que l'écran doit faire ». Tokens : `app-tokens.json` › `voiceCall`, variables `--call-*` et `--voice-*` de `tokens.css`.

### Écran d'appel (assemblage)
- Fond `--call-gradient` (`blue-500` → `blue-600` 42 % → `blue-700` 78 % → `blue-800`, 170°), texte blanc, pas de barre de navigation.
- 2B : CallTopBar (haut 56) · sujet centré (surtitre 12 Bold capitales avec la tuile de 24 px de la matière, chapitre 22/30 Black) à 120 px · VoiceAvatar 148 (logo de 248 à 396 px) · VoiceStatus à 436 px · LiveCaptions 20/30 à 508 px (gauche et droite 28 px) · CallDock (bas 32).
- 2D / 2F : CallTopBar · VisualPanel `elevated` de 112 à 448 px (gauche et droite 20) · VoiceAvatar 96 (logo de 472 à 568 px) · VoiceStatus à 592 px · LiveCaptions 16/22 sur 2 lignes à 642 px (gauche et droite 24) · CallDock.

### CallTopBar
- Rangée de 44 px : bouton « Écrit » (44 px, padding 0 16 0 12, `--call-glass`, icône clavier de 20 px, 14 Bold blanc) et chrono (pastille de 32 px, `--call-glass`, point blanc de 8 px qui clignote, 14 Bold en chiffres tabulaires).

### VoiceAvatar
- Disque blanc de 148 px (96 px avec un visuel), logo `Logo_tutoria_fond_blanc` à 82 % de sa taille, rogné en rond, ombre `0 12px 28px rgba(3,39,110,.35)`. Halo blanc fixe derrière (dégradé radial, 1,9 × la taille). Ombre au sol : ellipse de 82 % de la largeur × 14 px.
- Rebond : 0,42 s par saut ; hauteur = niveau de la voix (0 à 1) × 18 px (14 px en 96) ; écrasement de 6 % au sol, étirement de 3 % en l'air ; l'ombre rétrécit de 32 % et pâlit en l'air. Niveau × 0,25 à chaque ponctuation ; transitions du niveau en 160 ms.
- Écoute : rotation de −8° (et −3 px) en 0,5 s. Repos : respiration 1 → 1,025 en 3,2 s. `prefers-reduced-motion` : aucune animation.
- C'est un `button` : toucher = interrompre le tuteur quand il parle ; appui long de 600 ms = signaler.

### VoiceStatus
- Pastille de 40 px (32 en petit), padding 0 18 0 14, icône de 18 px + 15 Bold blanc.
- « Je t'explique… » : dégradé vert (`green-600` → `green-700` → `green-800`), icône haut-parleur. « Je t'écoute… » : dégradé rouge (`red-400` → `red-600` → `red-700`), icône micro ; variante orange. Lueur de leur couleur et liseré blanc à 28 %.
- Neutre (`--call-glass`, sans ombre) : « Ton micro est coupé » (micro barré), « Connexion… », « Appel terminé », « Connexion perdue ».
- `aria-live="polite"`.

### LiveCaptions
- Texte 20/30 Medium (16/22 avec un visuel), centré, `text-wrap: pretty`. Mots dits en blanc, mots à venir en `--caption-upcoming` (45 %). Nombres et formules en Bold, espaces insécables dans les formules.
- Couleur nommée (rouge, bleu, vert, orange, violet, gris) : pastille de sa couleur (padding 0 6, rayon 6), texte blanc Bold, dès qu'elle est prononcée.
- 2B : « TUTOR'IA » ou « TOI » au-dessus (12 Bold, capitales, blanc à 80 %). 2D/2F : deux lignes au plus.

### CallDock
- Barre en verre : `--call-dock`, rayon 32, padding 14 8 12, grille de 4 colonnes égales (3 sans la caméra).
- Boutons ronds de 56 px (`--call-glass`, icône blanche de 24 px), libellé 12 Medium blanc à 90 % dessous. Activé = fond blanc, icône `blue-600` (micro coupé : icône `blue-700`).
- Raccrocher : rond de 64 px `red-500`, combiné blanc de 28 px tourné de 135°, ombre `0 8px 20px rgba(194,26,26,.35)`.

---

## Flashcards

### QuizCard (flashcard QCM)
- `surface`, `radius-3xl`, `shadow-lg`, liseré haut de 8 px dans le dégradé de la matière, padding 24 px.
- Icône de la matière (rond de 48 px, fond doux et encre) · question 24/32 Black centrée · grille 2 × 2 d'options · zone de retour.
- **AnswerOption** : `button`, hauteur minimale 88 px, `radius-2xl`, bord de 2 px, texte 18 Bold centré, lettre A à D en 12 Bold en haut à gauche.
  - Par défaut : fond `gray-100`.
  - Bonne réponse révélée : `success-soft`, bord `success`, texte `success-strong` et coche verte de 22 px.
  - Mauvais choix : `warning-soft`, bord `warning`, texte `warning-strong`.
  - Autres options après la réponse : opacité 0,45.
- **Feedback** : `radius-2xl`, padding 12 × 16, texte 14 Medium. Avant la réponse : `gray-100` / `text-secondary`. Bonne réponse : `success-soft` / `success-strong`. Mauvaise réponse : `warning-soft` / `warning-strong`. Le ton est bienveillant et explique la réponse.
- Classement : bonne réponse = « Je sais », mauvaise = « À revoir ».

### SessionProgress
- Barre de 8 px, piste de la couleur douce de la matière, remplissage en dégradé de la matière, transition de 400 ms.

### TallyChips
- Pastilles de 28 px : « Je sais · N » (`success-soft` / `success-strong`) et « À revoir · N » (`warning-soft` / `warning-strong`).

### SessionComplete
- Carte en dégradé vert, `radius-3xl` : coche dans un rond blanc à 24 %, « Session terminée ! » 28 Black, bilan, pastille « +60 XP », bouton blanc « Recommencer ».

---

## Accueil

### Greeting + Quote
- Dans un ScreenBand bleu (v2.5). « Salut {prénom} ! » 30/38 Black, blanc, à côté du bouton notifications (IconButton « sur bandeau ») et de l'avatar (rond blanc de 48 px, initiale `primary`).
- Citation : `figure` (largeur max 300 px), avec un `blockquote` 15/22 italique blanc entre guillemets « … » et un `figcaption` « — Auteur » 12 Bold blanc.

---

## Tuteur visuel (v2)

### VisualPanel (conteneur commun du graphique et du tableau blanc)
> Depuis la v2.6 (et dans l'app depuis l'écart 15) : carte teintée de la couleur du visuel (graphique : fond `violet-100`, bord 2 px `violet-200`, tuile `violet-400` → `violet-600`, surtitre `violet-700` ; tableau : mêmes rôles en azur), padding 12, dessin sur une feuille blanche (`radius-2xl`, padding 12). Dans l'appel vocal : `elevated` (ombre `0 16px 36px rgba(3,39,110,.35)`), pas de chevron, seulement « Agrandir ». Les puces ci-dessous décrivent la maquette d'origine de 2C et 2E.

- Carte `surface`, `radius-3xl`, padding 16, `shadow-md`, pleine largeur, placée sous le SegmentedControl Écrit / Vocal.
- En-tête :
  - tuile de 40 px en dégradé de la matière, avec l'icône « graphique » (axes + courbe) ou « stylo » ;
  - surtitre de 12 px en capitales, couleur de l'encre de la matière : « GRAPHIQUE · MATHS » ou « TABLEAU · MATHS ». En vocal : « EN DIRECT · 03:07 », avec un point rouge clignotant ;
  - titre 16 Bold (l'énoncé, par exemple « 3x + 5 = 20 ») ;
  - deux IconButton de 44 px (fond `bg`, `radius` 14) : **Agrandir** (plein écran) et **Réduire / Afficher** (chevron qui pivote de 180°).
- État réduit : seul l'en-tête reste visible, et la zone de discussion ou de vocal remonte (transition de 250 ms).
- Contenu : zone de 318 × 210, puis une légende ou des pastilles d'étapes.
- Props suggérées : `kind: 'graph' | 'whiteboard'`, `subject`, `title`, `live?: boolean`, `collapsed`, `onToggle`, `onExpand`.

### MathGraph (contenu « graphique »)
- Rendu en SVG (données fournies par l'IA : fonctions, droites, points, étiquettes).
- Grille `blue-100` d'un pixel, axes `gray-300` de 1,5 px, graduations de 11 px en `text-secondary`. Les valeurs clés sont en gras, dans la couleur de la courbe correspondante.
- Courbes :
  - courbe principale : 3 px, encre de la matière ;
  - courbe secondaire : `primary`, 2,5 px, pointillés 7/5 ;
  - repères : pointillés 4/4, opacité 0,6.
- Point clé : rond blanc de 6,5 px avec une bordure de 3 px dans l'encre de la matière, plus une étiquette-pastille (par exemple « x = 5 »).
- **Halo** : cercle qui grandit de 0,6× à 2,2× en s'estompant, sur 1,6 s en boucle. En vocal, il n'est affiché que quand le tuteur parle.
- Légende : trait plein, trait pointillé et point, en 12 Medium `text-secondary`.
- `aria-label` : une description textuelle complète du graphique.
- **En vocal (v2.6)** : `focus` met en avant ce que le tuteur nomme : halo de sa couleur (trait de 13 px à 16 %), trait plus épais de 2 px, pastille de légende teintée ; la légende devient une rangée de pastilles de 26 px. L'étiquette du point clé se place à droite du point.

### Whiteboard (contenu « tableau blanc »)
- Fond `#FBFCFF` avec une grille de points (`gray-200`, rayon 1, pas de 16 px), `radius-2xl`. Un séparateur vertical en pointillés sépare le calcul, à gauche, des annotations, à droite.
- Calcul :
  - lignes en 26 Bold `text` ;
  - opérations en 16 Bold `primary` (sous les deux membres) ;
  - résultat en 30 Black, dans l'encre de la matière, entouré d'un **trait fait main** (tracé SVG de 2,5 px, rouge).
- Annotations : « ① … ② … ③ … » en 12 Bold `blue-600`, avec des précisions en `text-secondary`, reliées par des flèches courbes `primary`.
- **StepChips** sous le tableau : ① ② ③. Les étapes intermédiaires sont en `primary-soft` et l'étape finale en `red-100`. L'étape en cours est pleine (`primary`, ou `red-600` pour la dernière) avec le texte en blanc.
- **Mode direct** (vocal) :
  - chaque étape apparaît en fondu (450 ms) ;
  - le cercle se trace (`stroke-dashoffset` animé sur 1 s) ;
  - un **stylo** (point `primary` de 4 px avec un halo) se place en fin de ligne active ;
  - sans écriture en cours, tout est affiché et le stylo est masqué.
- Le contenu vient de l'IA sous forme **structurée** (étapes, opérations, annotations), pas d'image, pour rester accessible et animable.
- **Depuis la v2.6** (comme dans l'app) : feuille blanche sans grille de points ni pastilles d'étapes ; formules en écriture mathématique (24 px), opération de chaque passage en bleu sur sa propre ligne (« ↓ − 5 »), notes numérotées en 12 Bold dans une marge de 118 px, résultat en rouge entouré d'un ovale de 2,5 px. En vocal, les lignes apparaissent en fondu pendant que le tuteur parle, avec le stylo (point `primary` de 8 px qui pulse) au bout de la dernière ligne.

### Variante des écrans tuteur avec un visuel
- **Écrit** : la discussion commence sous le panneau (haut à ~450 px), avec un fondu de masquage en haut (`mask-image` sur 28 px). Placeholder « Pose une question sur le graphique… ».
- **Vocal** (v2.6) : l'écran d'appel, avec le visuel dans la moitié haute et le logo de 96 px dessous (voir « Appel vocal »).

---

## Espace Parents (v2)

Même base que l'élève (tokens, cartes, BottomNav). Sections séparées de 24 px, `radius-3xl` sur les cartes, vouvoiement. Depuis la v2.5 : ScreenBand violet en tête de chaque écran, et titres de section en 22/30 Black dans leur carte (SectionCard).

### ParentBottomNav
- Même composant que BottomNav, avec 4 onglets : Accueil (maison), Progrès (tendance), Sessions (bulle avec lignes), Réglages (curseurs).

### ChildSwitcher
- Pastille blanche de 48 px de haut, `shadow-sm` : avatar de 36 px (dégradé bleu, initiale blanche en Black), prénom 14 Bold, classe 12 `text-secondary`, chevron. Ouvre le choix de l'enfant.
- Posé sur le ScreenBand violet ; la pastille reste blanche.
- Badge « Espace Parents » : pastille en blanc translucide (`--on-band-veil`), texte blanc 12 Bold (`primary` plein avant la v2.5).

### HeroCard (résumé et vue d'ensemble)
- Dégradé `hero` (bleu → violet), `radius-3xl`, padding 24, texte blanc, grande icône en filigrane (opacité 0,12).
- Variantes :
  - **Résumé de la semaine** : logo dans un rond blanc de 44 px, titre 22/30 Black, texte 16/26, badge vert `green-500` / `green-900`.
  - **Maîtrise globale** : titre 22/30 Black, anneau de 96 px (piste blanche à 22 %, progression blanche), valeur 22 Black.
  - **Cette semaine** (sessions) : total en 28 Black, pastilles par mode (voile blanc), encadré de confidentialité (blanc à 14 %).
  - **Profil de l'enfant** : avatar blanc de 56 px, nom 22/30 Black et bouton « Modifier » (voile blanc).
- C'est souvent la première carte de l'écran : elle déborde sur le bas du ScreenBand.

### ParentKpiCard
- Grille de 3 colonnes, `radius-3xl`, padding 16 × 12, dégradés cyan, vert et violet. Pastille d'icône de 32 px, valeur 22 Black, libellé 12 Medium avec l'évolution en gras.

### AlertCard (À surveiller)
- `orange-500` uni, texte blanc, `radius-3xl`, padding 20. Pastille blanche de 40 px avec un triangle orange, titre 22/30 Black, texte 15 Medium, bouton blanc « Voir le détail » (texte `orange-800`). Filigrane en triangle.
- N'est affichée que s'il y a une alerte réelle.

### AdviceCard (Comment l'encourager)
- `accent-soft`, `radius-3xl`, padding 20. Pastille de 40 px en dégradé violet avec une ampoule, titre 22/30 Black `violet-600`, texte 15 `violet-800`.

### StudyTimeChart
- SectionCard « Temps d'étude par jour » (titre 22/30 Black), barres en dégradé `violet-500 → blue-500` quand l'objectif est atteint, `blue-200` en dessous, `gray-200` sans session. Ligne d'objectif en pointillés `gray-300` et pastille « Objectif 40 min ». Note en bas sur fond `bg`.

### SubjectProgressCard (dépliable)
- Bloc rangé dans la SectionCard « Par matière » : fond `bg`, `radius-2xl`, sans ombre. Le `button` d'en-tête a un padding de 16 px.
- Tuile de 48 px en dégradé de la matière · nom 17 Black · résumé des statuts 12 · pourcentage 18 Black · pastille d'évolution (vert si positif, orange si négatif). Pourcentage et évolution restent sur une ligne (`white-space: nowrap`, colonne qui ne rétrécit pas).
- Barre segmentée de 10 px, un segment par chapitre, dans la couleur de son statut.
- Lien « Voir les N chapitres » (encre de la matière) avec un chevron. Une fois dépliée, les **ChapterStatusRow** sont des lignes blanches (rayon 14, écart de 8 px ; fond teinté de la matière avant la v2.5) : titre 14 Bold, détail 12, **StatusChip**.

### StatusChip
- Pastille de 26 px, 12 Bold, fond plein (voir `app-tokens.json` › `statuses`) : Acquis (vert), En cours (bleu), À consolider (orange), Pas commencé (gris, texte foncé).
- Mêmes couleurs pour les résultats de session : Compris (vert), En progrès (bleu), À revoir (orange).

### SessionSummaryCard
- Bloc sur fond `bg`, `radius-2xl`, sans ombre, rangé dans la carte de son jour. En-tête en dégradé de la matière (padding 16 × 20, filigrane) : pastille d'icône, surtitre « MATIÈRE · 17:42 · 25 min », titre 17 Black.
- Corps : résumé 15/22 rédigé par l'IA (**jamais la transcription**), StatusChip de résultat avec icône, et pastilles du mode utilisé (fond doux et encre de la matière).
- Regroupées par jour, une SectionCard par jour (titre du jour 22/30 Black, écart de 12 px entre les sessions). Filtres par matière : pastilles de 40 px avec un point de couleur, et la sélection en `primary`.

### GoalStepper (objectif hebdomadaire)
- Carte en dégradé vert, `radius-3xl`, titre « Objectif hebdomadaire » 22/30 Black (surtitre en capitales de 12 px avant la v2.5). Valeur 40 Black au centre, bouton « − » (voile blanc) et bouton « + » (blanc, texte `green-800`) de 52 px, et le texte « soit N min par jour ».

### SettingRow + Switch
- Groupes : une carte blanche par groupe (`radius-3xl`, `shadow-md`, padding 20 px en haut et 6 px en bas), avec le titre du groupe dans la carte (22/30 Black, marges 0 20 px 6 px). Avant la v2.5, le titre était posé au-dessus de la carte.
- Ligne de 72 px de haut minimum, séparateurs `blue-100`. Tuile d'icône colorée de 44 px (rayon 14, voir `app-tokens.json` › `settingTiles`), libellé 16 Bold, aide 13 `text-secondary`.
- **Switch** : `button role="switch"`, 52 × 32, piste `primary` quand il est activé et `gray-200` quand il est désactivé, rond blanc de 24 px, transition de 200 ms, `aria-checked`.
- Variante « lien » : chevron à la place du switch (abonnement, données, ajout d'un enfant).
- **DangerButton** « Supprimer le compte » : fond `red-100`, texte `red-600` 14 Bold, 48 px de haut, séparé du reste, sous la carte « Compte ».

---

## Profil (v2.8)

Implémentation de référence dans `design-system/` (props dans `design-system/index.d.ts`). Écran : `screens/05-Profil.dc.html`.

### ProfileHero
- Bandeau de marque bleu (dégradé 170°, `blue-500` → `blue-600` → `blue-700`), coins bas de 32, padding 56 / 20 / 100. Retour en verre de 44 px.
- Colonne de gauche (190 px au plus) : surtitre 12 en capitales à 85 %, prénom 44/48 Black, pastille en verre « Élève de 4e » (30 px, mortier de 16), ligne 13 à 85 %, bouton blanc de 40 px « Modifier l'avatar » (crayon, texte `blue-600`, ombre bleue) avec une pastille orange de 20 px pour les nouveautés.
- Figurine à droite (168 × 282, à 26 px du bord et 50 px du haut), halo blanc radial de 250 px derrière, ombre au sol de 130 × 18. Sans figurine : initiale dans un disque blanc de 128 px.

### ProfileSummary · LevelBar
- Carte blanche `radius-3xl`, `shadow-md`, padding 20, qui déborde de 72 px sur le bandeau.
- Trois colonnes égales, filets `blue-100` entre elles. Dans chacune, centrés : tuile de 48 px (rayon 16) en dégradé (orange, violet, bleu) avec une lueur de sa couleur et un liseré blanc à 25 %, icône blanche de 24 ; valeur 24/28 Black ; légende 12/16 `text-secondary`.
- `LevelBar`, sous un filet : pastilles de 34 px (niveau atteint en dégradé violet → bleu, suivant en pointillés `gray-200` sur `bg`), barre de 12 px `blue-100` remplie en dégradé `blue-500` → `violet-500` (`--level-gradient`), curseur blanc de 18 px cerclé de 4 px `violet-500`. Dessous, 13 px : « Niveau 7 · 340 / 500 XP » en gras, « encore 160 XP » en `text-secondary`. La barre glisse en 0,6 s.

### TrophyShelf · TrophyBadge
- Carte blanche, titre 22 Black, compteur 13 Bold à droite. Ligne de médailles qui défile jusqu'aux bords de la carte, écart de 6 px.
- Médaille : 84 px de large, disque de 64 en dégradé avec un liseré blanc à 35 % et une ombre, icône de 28 ; nom 12/15 Bold sur deux lignes. Pas encore gagnée : disque `--trophy-locked`, liseré `--trophy-locked-ring`, cadenas et nom en `gray-300`.

### Ma famille · Préférences · Compte et données
- Ma famille : ligne du parent (disque de 44 en dégradé violet avec l'initiale, prénom 16 Bold, date 13, bouton « Retirer » de 36 px sur `bg`), encart de transparence (`bg`, rayon 16, bouclier violet, texte 13/19), bouton violet doux de 48 px « Relier un autre parent ».
- Préférences et Compte et données : `SettingRow` (tuile de 40 px en dégradé, libellé 16 Bold, aide 13, interrupteur ou chevron), séparés par des filets `blue-100`.
- Boutons du bas : `Button` pleine largeur, `soft` « Se déconnecter » (icône `logout`) puis `danger` « Supprimer mon compte » (icône `trash`), 52 px dans la maquette.

---

## Connexion et onboarding (v2.3)

Implémentation de référence de chacun dans `design-system/` (props dans `design-system/index.d.ts`). Élève en bleu (`primary`), parent en violet (`accent`).

### ProfileChoiceCard
- Bouton pleine largeur, 96 px de haut minimum, `radius-3xl`, dégradé de l'espace (élève : Français ; parent : Physique-Chimie). Pastille d'icône 56 px en voile blanc, titre 24 Black, rond de sélection à droite. Sélectionnée : double anneau (`bg` puis encre de l'espace) et coche.

### SubjectCluster
- Illustration décorative (`aria-hidden`) : six tuiles de 56 px en dégradé des matières, inclinées, autour du logo (carré blanc de 96 px, rayon 28).

### AuthScreen (v2.7)
- Écran de connexion plein écran (L2, L3). Fond : dégradé de l'espace à 170° sur tout l'écran (élève `--call-gradient`, parent `--auth-parent-gradient`), deux halos doux (blanc en haut à gauche, bleu clair ou lilas en bas à droite).
- En-tête centré, padding 56 / 20 / 18 : retour en verre de 44 px (`rgba(255,255,255,0.16)`) en haut à gauche, `VoiceAvatar` de 96 px remonté de 34 px, titre 28/34 Black blanc, phrase 15/22 à 85 % de blanc (320 px de large au plus).
- Feuille blanche : rayon 32 en haut, ombre `--sheet-shadow`, padding 24 / 20 / 32, éléments espacés de 16 px ; elle monte du bas en 0,55 s. Le bas de la feuille (`footer`) est collé en bas : liens centrés 15/22.
- Le logo rebondit une fois à l'arrivée (niveau 0,45 de 0,35 s à 2,1 s), puis respire. Moins d'animations : rien ne bouge.

### AuthHero
- En-tête de connexion en dégradé de l'espace, padding 24, filigrane (mortier ou famille). Surtitre, titre 28 Black, phrase 15. Plus utilisé par L2 et L3 depuis la v2.7 (`AuthScreen`).

### TextField
- Libellé 14 Bold au-dessus, champ de 52 px, rayon 16, bordure `border`, `shadow-sm`, icône 20 px à gauche. Focus : bordure `primary` + `shadow-focus`.
- Mot de passe : bouton œil de 40 px à droite (« Afficher / Masquer le mot de passe »). Champ facultatif : pastille « Facultatif » (`primary-soft`) à droite du libellé et aide 13 sous le champ.
- **Rempli** (`filled`, v2.7) : dans une carte ou une feuille blanche, fond `gray-100` (`bg`), bordure 1 px `--field-filled-border`, sans ombre. Focus inchangé (violet sur les écrans parents).

### PasswordRules
- Liste des règles avec une pastille de 18 px : verte cochée si validée, grise sinon. En colonne ou en ligne.

### Checkbox
- `button role="checkbox"`, carré de 24 px (rayon 8), plein dans la couleur de l'espace quand coché, texte 14/22.

### OrDivider · AuthProviderButtons
- « ou » entre deux filets `border` (« ou continuer avec » sur L2 et L3). Boutons de 52 px : Apple noir (`gray-900`), Google blanc bordé. Toujours **sous** le formulaire, **empilés en pleine largeur** depuis la v2.7 (côte à côte seulement sur E1). Dans l'app, utiliser les boutons officiels des SDK (« Continuer avec Apple / Google », avec leurs logos).

### ParentCodeCard · StepList
- Carte violette : surtitre, code 48 Black espacé, « Valable 24 h », bouton blanc « Partager le code ». StepList : carte blanche, numéros dans des ronds de 32 px de la couleur douce de l'espace.

### StepHeader
- Retour 48 px, « Étape n sur N » en surtitre, barre segmentée de 8 px (segments faits en couleur de l'espace, les autres en nuance 200), lien « Passer ».

### GradePicker
- Puces de 52 px (68 px de large minimum), groupées Primaire / Collège / Lycée ; sélection en dégradé + `shadow-brand`. Variante grille 4 colonnes de 48 px (inscription parent, violet).

### SelfAssessmentRow
- Carte blanche `radius-3xl` : tuile de 40 px de la matière, nom 17 Black, niveau choisi à droite dans l'encre de la matière. Quatre boutons de 40 px : choisi en dégradé, ceux d'avant en fond doux de la matière, ceux d'après en `bg`.

### GoalTile · ChoiceRow · ToggleChip
- **GoalTile** : tuile de 112 px, choix multiple ; cochée, elle se remplit de son dégradé et sa pastille passe en voile blanc.
- **ChoiceRow** : ligne de 72 px avec pastille de 48 px, titre 16 Black et aide 13 ; même logique de remplissage.
- **ToggleChip** : puce de 52 px, cochée avec bordure 2 px `primary` et fond `primary-soft`.

### DurationPicker
- Quatre boutons de 64 px (valeur 20 Black + « min »), sélection en dégradé bleu.

### PlanRow
- Carte blanche : tuile de 48 px de la matière, surtitre, titre 16 Black et raison du choix en 13.

---

## Explorer (v2.4)

Implémentation de référence de chacun dans `design-system/` (props dans `design-system/index.d.ts`). Types de niveau : `lecon` (vert, livre), `exercices` (bleu, crayon), `evaluation` (rouge, couronne), exposés par `TutorIA.LEVEL_TYPES`. Nouvelles icônes : crayon, couronne, boussole, coche cerclée, drapeau, liste.

### IslandIllustration
- Île flottante vectorielle de 300 px : rocher gris facetté, bande de terre orange, herbe verte en dégradé, rivière et cascade azur, motifs de la matière (règle, équerre, tuiles). Décorative sauf si elle a un `label`.

### IslandCarousel
- Pastille de 48 px avec le nom complet de la matière (22 Black, dégradé de la matière). Île centrale animée (`tia-float`, 8 px, 4 s), îles voisines à 50 % et opacité 0,35. Flèches de 48 px blanches `shadow-md`, points de 8 px (l'actif fait 24 px, encre de la matière).

### IslandProgressCard
- Carte blanche : « n villes sur N validées » 17 Black, prochaine étape en 13, pastille d'étoiles orange, barre de 10 px dans le dégradé de la matière, bouton principal « Explorer l'île ».

### ExplorerHud
- En-tête flottant, fond blanc à 94 %, rayon 20, `shadow-md`. Retour 44 px, île en surtitre (encre de la matière), ville 16 Black, région 12. Pastilles série (orange plein) et niveau (ardoise).

### WorldMap (`components/ExplorerMap.dc.html`)
- Mer en dégradé azure-100 → azure-200 avec des vagues blanches, bande de terre green-100 bordée de green-200. Chemin de 18 px en vague (orange-300 parcouru, gray-200 à venir) avec pointillés blancs. Défile horizontalement.

### LevelNode
- Rond de 52 px (évaluation : 68 px et double anneau de la couleur douce), anneau blanc de 4 px et ombre portée vers le bas façon jeton. Terminé : coche blanche en haut à droite et **Stars** dessous. En cours : halo pulsé (`tia-pulse`). Verrouillé : `gray-100`, cadenas `gray-400`. `aria-label` = type, titre et état.

### MapAvatar · CityBanner · RegionSign
- MapAvatar : initiale dans un rond `primary` de 40 px bordé de blanc, pointe vers le bas, animé (`tia-bob`). CityBanner : pastille blanche de 32 px, validée en vert (coche cerclée), en cours en rouge (drapeau), à consolider en orange (flèche de reprise), verrouillée en gris. RegionSign : « Région N » en surtitre + nom 14 Black sur blanc à 85 %.

### Stars · LevelTypePill
- Stars : trois étoiles, pleines en orange-500, vides en gray-200 (version blanche sur fond coloré). LevelTypePill : 30 px, fond doux du type, pastille de 20 px dans le dégradé du type avec l'icône.

### LevelSheet
- Feuille du bas blanche, rayon 28 en haut, poignée de 44 × 5. Type et bouton fermer, titre 26 Black, lieu, pastilles durée et étoiles, objectifs avec coches cerclées de la couleur du type. Évaluation : encadré rouge doux avec la règle. Deux boutons de 52 px « À l'écrit » / « À la voix », le dernier mode utilisé en premier et en `primary`. Verrouillé : boutons grisés et message avec cadenas.

### IslandBackdrop · LevelProgressHeader
- IslandBackdrop : dégradé du fond doux de la matière vers `bg`, motifs au trait en nuance 200 et île miniature en haut à droite. LevelProgressHeader : retour 44 px, LevelTypePill + titre 20 Black, bascule écrit / vocal en pastilles de 40 px, « Étape / Exercice / Question n sur N » et segments de 6 px de la couleur du type.

### VoiceBoardCard
- Carte blanche, rayon 24 : « Au tableau du tuteur » en surtitre, première ligne 26 Black, suivantes 20 Black, faites en vert avec une coche, à venir en gris.

### LevelResultCard · TutorFeedback
- LevelResultCard : rayon 28, dégradé vert (réussi) ou orange (à consolider), bulles décoratives, étoiles de 40 px, titre 30 Black, message, pastilles score (voile blanc) et XP (blanc). TutorFeedback : encadré vert doux « Réussi » ou orange doux « À revoir », pastille ronde de 32 px avec l'icône.
