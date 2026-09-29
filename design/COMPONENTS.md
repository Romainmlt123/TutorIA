# Composants de l'app élève Tutor'IA

> **Déjà factorisés dans les maquettes** (`components/`) : **BottomNav** (élève + Parents), **ModeToggle**, **TopicCard**, **PanelHeader**, **CallControls**. Leurs props figurent en tête de chaque fichier (`data-props`). Les autres composants ci-dessous sont encore dessinés directement dans les écrans : leurs specs font foi pour le code.

> **Implémentation de référence** : les 46 composants existent dans `design-system/` (publiés dans le design system Tutor'IA). Pour chaque composant, `design-system/index.d.ts` donne les props exactes et `design-system/components/<Nom>/README.md` son usage ; les noms peuvent différer légèrement de cet inventaire (par exemple `CallControls` pour les boutons d'appel, `LineChart`/`BarChart`/`Heatmap` pour `ChartCard`). TopBar de session, SessionComplete et Greeting restent des assemblages d'écran, décrits seulement ici.

Inventaire des composants à créer, tirés des maquettes (`screens/`). Valeurs = tokens de `tokens/`.
Chaque composant liste : rôle, anatomie, specs, états / variantes, écrans où il apparaît.

---

## Fondations

### Icon
- Icônes au contour, sur une grille 24, trait de 1,75 (2 à 2,5 dans les petits boutons), bouts et angles arrondis.
- Couleur au repos `gray-400` (#798398). Une action active ou importante passe en `primary` ou en blanc sur fond coloré.
- Jeu nécessaire : accueil, parcours (carte), révisions (cartes), stats (barres), cloche, réglages (curseurs), flèche droite, chevron gauche, croix, envoi (flèche haut), micro, micro barré, caméra, caméra barrée, clavier, ampoule, flamme (pleine), étoile, horloge, cible, tendance haut, coche, retour (rotation).
- Icônes des matières : Maths = calculatrice, Français = livre, Histoire-Géo = globe, Anglais = langues, SVT = feuille, Physique-Chimie = fiole.
- Le design system n'a pas encore de composant icône : c'est à créer en priorité.

### Logo
- Deux versions : `assets/logo/Logo_tutoria_fond_blanc.png` et `assets/logo/Logo_tutoria_fond_bleu.png`.
- Le logo est toujours bleu : jamais recoloré, jamais déformé, sans ombre dure.

---

## Navigation

### BottomNav (barre de navigation flottante)
- Position : `absolute`, à 20 px à gauche, à droite et en bas. Hauteur 72 px, padding horizontal 4 px, fond `surface`, `radius-3xl`, `shadow-lg`.
- 5 onglets de largeur égale, contenu aligné en bas (padding-bottom 12 px, gap de 4 px) :
  - Accueil
  - Parcours
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

### CallButton (appel vocal)
- Rond de 56 px (micro, caméra) : fond `surface` et `shadow-md`, avec une légende de 12 px en dessous.
  - Micro coupé : fond `gray-900`, icône blanche barrée.
  - Caméra active : fond `primary`, icône blanche.
- Raccrocher : rond de 72 px `error-strong`, croix blanche de 28 px. C'est un lien qui revient au chat écrit.

---

## Cartes

### SubjectCard (carte de matière colorée)
- `radius-3xl`, padding 16 px, hauteur minimale 128 à 132 px, fond = dégradé de la matière (160°), `shadow-md`, texte blanc, `overflow: hidden`.
- En haut : pastille de 40 px (`rgba(255,255,255,.24)`) avec l'icône blanche de la matière. À droite : pourcentage (sur l'Accueil) ou coche de sélection (sur les Flashcards).
- En bas : nom 18/24 Black, puis une barre de progression de 6 px (piste `rgba(255,255,255,.3)`, remplissage blanc) ou « N cartes » en 12 px.
- Filigrane : l'icône de la matière en 96 px, opacité 0,16, décalée de −20 px en bas à droite.
- État sélectionné (Flashcards) : `box-shadow: 0 0 0 3px bg, 0 0 0 6px <encre de la matière>`, plus une coche dans un rond blanc de 28 px.

### StreakCard / StreakBadge
- Carte : fond `orange-500` uni (sans dégradé), texte blanc, `radius-3xl`, padding 16 px. Pastille blanche de 40 px avec une flamme orange, « 12 jours » en 24 Black sur une ligne, « de série, continue ! » en 12 Bold. Flamme blanche en filigrane.
- Badge : pastille `orange-500`, texte blanc 14 Bold, flamme blanche de 16 px, hauteur 32 px.

### LevelCard
- Fond `gray-600`, texte blanc, `radius-3xl`. Pastille `green-500` de 40 px avec une étoile, « 340 / 500 XP » en `green-200`, « Niveau 7 » en 24 Black, jauge XP de 8 px (piste blanche à 18 %, remplissage `green-500`).

### ResumeCard (Reprendre)
- `surface`, `radius-3xl`, padding 24 px, `shadow-md`.
- Tuile de la matière de 48 px (dégradé) · titre 22/30 Medium · sous-titre 14 `text-secondary` · barre de progression de 8 px (`primary-soft` / `primary`) · Button primary « Reprendre ».

### GoalCard (Objectif du jour)
- `surface`, `radius-2xl`, padding 16 px. Anneau de 56 px (trait de 6 px, piste `blue-100`, progression `primary`), au centre « 2/3 ». Titre 16 Bold, détail 14 `text-secondary`, pastille « Plus qu'une ! » (`primary-soft`).

### TopicCard (Sujet de la discussion)
- Pleine largeur, `surface`, `radius-2xl`, padding 12 × 16 px, `shadow-md`.
- Tuile de 40 px (dégradé de la matière) · surtitre de 12 px en capitales, couleur de l'encre de la matière · titre 16 Bold · pastille à droite (« Leçon 3/5 » ou chrono avec un point rouge).

### DailyReviewCard (Révision du jour)
- `surface`, `radius-3xl`, padding 24 px. Cercle décoratif `orange-100` en haut à droite. Titre 22 Bold, détail 14, StreakBadge.
- Pastilles des matières qui se chevauchent (36 px, bord blanc de 2 px, −10 px de chevauchement) + « +2 ». Button vivid « C'est parti ».

### ChapterRow
- `button`, hauteur minimale 68 px, `radius-2xl`, `surface`, `shadow-md`, bord de 2 px (blanc, ou encre de la matière si sélectionné).
- Tuile numéro de 40 px (fond doux et encre de la matière, 14 Bold) · titre 16 Bold · « N cartes · ~M min » 14 `text-secondary` · radio de 24 px (bord de 7 px à la couleur de l'encre si sélectionné).

### KpiCard (carte de statistique)
- `radius-3xl`, padding 16 px, fond coloré (voir `app-tokens.json` › `kpi`), texte blanc, icône en filigrane.
- Pastille d'icône de 32 px · libellé 12 Medium · valeur 28 Black · pastille d'évolution (voile blanc, 12 Bold).
- Série record : fond `orange-500` uni, pastille d'icône blanche avec une flamme orange.

### ChartCard
- `surface` (ou dégradé pour « Maîtrise »), `radius-2xl` à `3xl`, padding 16 px. En-tête : titre 16 Black + méta 12 à droite.
- Contenus :
  - **BarChart** : 140 px de haut, grille en pointillés `gray-200`, axes 12 `text-secondary`, barres en dégradé `violet-500 → blue-500`, rayon 6/6/2/2.
  - **SubjectProgressList** : tuile d'icône de 36 px (fond doux et encre de la matière), nom 14 Medium, barre de 12 px en dégradé de la matière, pourcentage 14 Bold.
  - **LineChart** (sur la carte en dégradé) : courbe blanche de 3 px, aire en dégradé blanc de 35 % à 0 %, dernier point en `green-500` cerclé de blanc.
  - **Heatmap** : 13 colonnes × 7 lignes, cellules de 18 px, écart de 4 px, rayon 4, niveaux `blue-100 / 200 / 300 / 500 / 700`, légende « Moins … Plus ».

### InsightList (Points forts / À retravailler)
- Carte `radius-3xl`, padding 16 px. Points forts : dégradé vert. À retravailler : `orange-500` uni. Titre blanc 16 Black avec une icône.
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
- 4 barres de 40 px de large, 20 px d'écart, rondes, en dégradé vertical `blue-500 → violet-500`. Hauteur animée (transition de 140 ms).
  - Tuteur qui parle (IA) : de 40 à 190 px, chaque barre avec sa propre phase et des micro-pauses.
  - Élève qui parle : de 40 à 100 px, plus lent.
  - Repos ou micro coupé : 40 px (pastilles).
- Libellé d'état 18 Medium en `text-secondary` (`aria-live="polite"`), aide « Touche l'écran pour interrompre » en 14 px.
- Toute la zone est un `button` : le toucher interrompt le tuteur.

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
- « Salut {prénom} ! » 28/36 Black.
- Citation : `figure`, avec un `blockquote` 14/20 italique `text-secondary` entre guillemets « … » et un `figcaption` « — Auteur » 12 Medium.

---

## Tuteur visuel (v2)

### VisualPanel (conteneur commun du graphique et du tableau blanc)
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

### Variante des écrans tuteur avec un visuel
- **Écrit** : la discussion commence sous le panneau (haut à ~450 px), avec un fondu de masquage en haut (`mask-image` sur 28 px). Placeholder « Pose une question sur le graphique… ».
- **Vocal** : les barres passent à 28 px de large avec un écart de 14 px, et une amplitude maximale d'environ 72 à 84 px. Libellé « Le tuteur t'explique le graphique… » ou « Le tuteur écrit au tableau… ».

---

## Espace Parents (v2)

Même base que l'élève (tokens, cartes, BottomNav). Sections séparées de 24 px, `radius-3xl` sur les cartes, titres de section 18 à 22 Black, vouvoiement.

### ParentBottomNav
- Même composant que BottomNav, avec 4 onglets : Accueil (maison), Progrès (tendance), Sessions (bulle avec lignes), Réglages (curseurs).

### ChildSwitcher
- Pastille blanche de 48 px de haut, `shadow-sm` : avatar de 36 px (dégradé bleu, initiale blanche en Black), prénom 14 Bold, classe 12 `text-secondary`, chevron. Ouvre le choix de l'enfant.
- Badge « Espace Parents » : pastille `primary`, texte blanc 12 Bold.

### HeroCard (résumé et vue d'ensemble)
- Dégradé `hero` (bleu → violet), `radius-3xl`, padding 24, texte blanc, grande icône en filigrane (opacité 0,12).
- Variantes :
  - **Résumé de la semaine** : logo dans un rond blanc de 44 px, titre 18 Black, texte 16/26, badge vert `green-500` / `green-900`.
  - **Maîtrise globale** : anneau de 96 px (piste blanche à 22 %, progression blanche), valeur 22 Black.
  - **Cette semaine** (sessions) : total en 28 Black, pastilles par mode (voile blanc), encadré de confidentialité (blanc à 14 %).
  - **Profil de l'enfant** : avatar blanc de 56 px et bouton « Modifier » (voile blanc).

### ParentKpiCard
- Grille de 3 colonnes, `radius-3xl`, padding 16 × 12, dégradés cyan, vert et violet. Pastille d'icône de 32 px, valeur 22 Black, libellé 12 Medium avec l'évolution en gras.

### AlertCard (À surveiller)
- `orange-500` uni, texte blanc, `radius-3xl`, padding 20. Pastille blanche de 40 px avec un triangle orange, titre 18 Black, texte 15 Medium, bouton blanc « Voir le détail » (texte `orange-800`). Filigrane en triangle.
- N'est affichée que s'il y a une alerte réelle.

### AdviceCard (Comment l'encourager)
- `accent-soft`, `radius-3xl`, padding 20. Pastille de 40 px en dégradé violet avec une ampoule, titre 18 Black `violet-600`, texte 15 `violet-800`.

### StudyTimeChart
- Carte blanche, barres en dégradé `violet-500 → blue-500` quand l'objectif est atteint, `blue-200` en dessous, `gray-200` sans session. Ligne d'objectif en pointillés `gray-300` et pastille « Objectif 40 min ». Note en bas sur fond `bg`.

### SubjectProgressCard (dépliable)
- `button`, carte blanche `radius-3xl`, padding 18 × 20.
- Tuile de 48 px en dégradé de la matière · nom 17 Black · résumé des statuts 12 · pourcentage 18 Black · pastille d'évolution (vert si positif, orange si négatif).
- Barre segmentée de 10 px, un segment par chapitre, dans la couleur de son statut.
- Lien « Voir les N chapitres » (encre de la matière) avec un chevron. Une fois dépliée, les **ChapterStatusRow** sont sur un fond teinté de la matière (rayon 16) : titre 14 Bold, détail 12, **StatusChip**.

### StatusChip
- Pastille de 26 px, 12 Bold, fond plein (voir `app-tokens.json` › `statuses`) : Acquis (vert), En cours (bleu), À consolider (orange), Pas commencé (gris, texte foncé).
- Mêmes couleurs pour les résultats de session : Compris (vert), En progrès (bleu), À revoir (orange).

### SessionSummaryCard
- Carte blanche `radius-3xl`. En-tête en dégradé de la matière (padding 16 × 20, filigrane) : pastille d'icône, surtitre « MATIÈRE · 17:42 · 25 min », titre 17 Black.
- Corps : résumé 15/22 rédigé par l'IA (**jamais la transcription**), StatusChip de résultat avec icône, et pastilles du mode utilisé (fond doux et encre de la matière).
- Regroupées par jour (titre 18 Black). Filtres par matière : pastilles de 40 px avec un point de couleur, et la sélection en `primary`.

### GoalStepper (objectif hebdomadaire)
- Carte en dégradé vert, `radius-3xl`. Valeur 40 Black au centre, bouton « − » (voile blanc) et bouton « + » (blanc, texte `green-800`) de 52 px, et le texte « soit N min par jour ».

### SettingRow + Switch
- Ligne de 72 px de haut minimum, séparateurs `blue-100`. Tuile d'icône colorée de 44 px (rayon 14, voir `app-tokens.json` › `settingTiles`), libellé 16 Bold, aide 13 `text-secondary`.
- **Switch** : `button role="switch"`, 52 × 32, piste `primary` quand il est activé et `gray-200` quand il est désactivé, rond blanc de 24 px, transition de 200 ms, `aria-checked`.
- Variante « lien » : chevron à la place du switch (abonnement, données, ajout d'un enfant).
- **DangerButton** « Supprimer le compte » : fond `red-100`, texte `red-600` 14 Bold, 48 px de haut, séparé du reste.

---

## Connexion et onboarding (v2.3)

Implémentation de référence de chacun dans `design-system/` (props dans `design-system/index.d.ts`). Élève en bleu (`primary`), parent en violet (`accent`).

### ProfileChoiceCard
- Bouton pleine largeur, 96 px de haut minimum, `radius-3xl`, dégradé de l'espace (élève : Français ; parent : Physique-Chimie). Pastille d'icône 56 px en voile blanc, titre 24 Black, rond de sélection à droite. Sélectionnée : double anneau (`bg` puis encre de l'espace) et coche.

### SubjectCluster
- Illustration décorative (`aria-hidden`) : six tuiles de 56 px en dégradé des matières, inclinées, autour du logo (carré blanc de 96 px, rayon 28).

### AuthHero
- En-tête de connexion en dégradé de l'espace, padding 24, filigrane (mortier ou famille). Surtitre, titre 28 Black, phrase 15.

### TextField
- Libellé 14 Bold au-dessus, champ de 52 px, rayon 16, bordure `border`, `shadow-sm`, icône 20 px à gauche. Focus : bordure `primary` + `shadow-focus`.
- Mot de passe : bouton œil de 40 px à droite (« Afficher / Masquer le mot de passe »). Champ facultatif : pastille « Facultatif » (`primary-soft`) à droite du libellé et aide 13 sous le champ.

### PasswordRules
- Liste des règles avec une pastille de 18 px : verte cochée si validée, grise sinon. En colonne ou en ligne.

### Checkbox
- `button role="checkbox"`, carré de 24 px (rayon 8), plein dans la couleur de l'espace quand coché, texte 14/22.

### OrDivider · AuthProviderButtons
- « ou » entre deux filets `border`. Boutons de 52 px : Apple noir (`gray-900`), Google blanc bordé. Toujours **sous** le formulaire. Dans l'app, utiliser les boutons officiels des SDK.

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

