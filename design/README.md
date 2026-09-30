# Tutor'IA — dossier design (app élève)

Maquettes validées de l'application mobile élève Tutor'IA, prêtes à être implémentées.
Source de vérité visuelle : le canevas Design « Tutor'IA · App mobile élève » sur claude.ai. Il contient 34 écrans iPhone de 390 px de large : 10 côté élève, 8 pour l'onglet Explorer, 4 dans l'espace Parents et 12 pour la connexion, l'inscription et l'onboarding.

## Contenu

```
design/
├── README.md            ← ce fichier : vue d'ensemble, écrans, règles
├── COMPONENTS.md        ← inventaire des composants à créer, avec leurs specs
├── DESIGN_SYSTEM.md     ← README du design system Tutor'IA (règles de marque, couleurs des matières, écarts validés)
├── design-system/       ← les 81 composants publiés dans le design system (référence : bundle, props typées, fiches)
├── tokens/
│   ├── tokens.json      ← tokens officiels du design system (couleurs, type, espaces, rayons, ombres)
│   ├── app-tokens.json  ← ajouts propres à l'app (matières, jeu, KPI, vocal)
│   └── tokens.css       ← tout en variables CSS + @font-face Satoshi
├── components/          ← composants partagés des maquettes (importés par les écrans)
│   ├── BottomNav.dc.html     ← barre de navigation élève et Parents (props espace, active)
│   ├── ModeToggle.dc.html    ← bascule Écrit / Vocal (props mode, variante)
│   ├── TopicCard.dc.html     ← carte sujet de discussion (props matiere, titre, badge, live)
│   ├── PanelHeader.dc.html   ← en-tête graphique / tableau blanc (props type, titre, kicker, live, open, onToggle)
│   ├── CallControls.dc.html  ← micro / raccrocher / caméra (props muted, camOn, onMute, onCam, hangupHref)
│   └── ExplorerMap.dc.html   ← carte d'une île (mer, chemin, villes, niveaux, avatar), partagée par X2 et X3
└── screens/             ← source HTML de chaque écran (format « Design Component »)
    ├── 01-Accueil.dc.html
    ├── 02a-Tuteur-Ecrit.dc.html
    ├── 02b-Tuteur-Vocal.dc.html
    ├── 02c-Tuteur-Ecrit-Graphique.dc.html
    ├── 02d-Tuteur-Vocal-Graphique.dc.html
    ├── 02e-Tuteur-Ecrit-Tableau.dc.html
    ├── 02f-Tuteur-Vocal-Tableau.dc.html
    ├── 03a-Flashcards-Choix.dc.html
    ├── 03b-Flashcards-Session.dc.html
    ├── 04-Stats.dc.html
    ├── P1-Parents-Accueil.dc.html      ← espace Parents
    ├── P2-Parents-Progres.dc.html
    ├── P3-Parents-Sessions.dc.html
    ├── P4-Parents-Reglages.dc.html
    ├── L1-Connexion-Choix.dc.html      ← connexion et inscription
    ├── L2-Connexion-Eleve.dc.html
    ├── L3-Connexion-Parent.dc.html
    ├── L4-Inscription-Parent.dc.html
    ├── L5-Inscription-Parent-Enfant.dc.html
    ├── L6-Inscription-Parent-Code.dc.html
    ├── E1-Inscription-Eleve.dc.html    ← inscription élève et onboarding
    ├── O1-Onboarding-Classe.dc.html
    ├── O2-Onboarding-Matieres.dc.html
    ├── O3-Onboarding-Objectifs.dc.html
    ├── O4-Onboarding-Style.dc.html
    ├── O5-Onboarding-Pret.dc.html
    ├── X1-Explorer-Iles.dc.html        ← onglet Explorer
    ├── X2-Explorer-Carte.dc.html
    ├── X3-Explorer-Niveau.dc.html
    ├── X3b-Explorer-Niveau-Evaluation.dc.html
    ├── X4-Explorer-Discussion.dc.html
    ├── X4b-Explorer-Discussion-Vocal.dc.html
    ├── X5-Explorer-Bilan.dc.html
    └── X5b-Explorer-Bilan-Consolider.dc.html
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
- `<script src="./support.js">` est le moteur de rendu du canevas ; il n'est pas fourni et n'est pas nécessaire pour implémenter.

Les données (citations, matières, cartes, stats) sont des exemples réalistes à remplacer par les vraies données de l'API.

## Les écrans

Format : iPhone 390 × 844. Marges d'écran 20 px. La barre de navigation flotte à 20 px du bas ; le contenu défilant garde ~116 px libres en bas pour ne pas passer dessous. Accueil (1260 px), Flashcards · Choix (1360 px) et Stats (2480 px) sont montrés en entier : ce sont des écrans qui défilent.

### 1 · Accueil — `01-Accueil.dc.html`
- En-tête : « Salut Léa ! » (28 px, Black 900), bouton notifications (point violet `accent` = nouveauté), avatar.
- Citation du jour sous la salutation : italique 14 px, `text-secondary`, auteur en 12 px. Une liste de citations tourne (Mandela, Sénèque, La Fontaine, Wilde, Confucius, Boileau, proverbe).
- Deux cartes jeu côte à côte : **Série** (orange uni `--streak`, texte blanc, « 12 jours » sur une ligne) et **Niveau** (gris ardoise `--level-card`, jauge XP verte).
- Carte « Reprendre » : matière + chapitre, progression, bouton principal **Reprendre** (`shadow-brand`, le seul de l'écran).
- Objectif du jour : anneau 2/3 + « 15 min · 2/3 sessions ».
- Grille 2 colonnes des 6 matières, cartes remplies du dégradé de la matière (voir Couleurs des matières).

### 2A · Tuteur écrit — `02a-Tuteur-Ecrit.dc.html`
- Toggle **Écrit / Vocal** centré en haut.
- Carte « Sujet de la discussion » : tuile de la matière, « MATHS », « Équations du 1er degré », pastille « Leçon 3/5 ».
- Messagerie façon SMS : bulles du tuteur à gauche (blanc, `shadow-sm`, avatar = logo sur fond bleu 32 px), bulles de l'élève à droite (`primary`, texte blanc). Espacement 12 px entre bulles.
- Carte **Conseil** en `accent-soft` avec pastille violette.
- Barre de saisie : champ 48 px + bouton d'envoi rond `primary`.

### 2B · Tuteur vocal — `02b-Tuteur-Vocal.dc.html`
- Même toggle et même carte sujet (avec chrono de l'appel à la place de la leçon).
- 4 barres verticales (40 px de large, 20 px d'écart, bouts arrondis) en dégradé `blue-500 → violet-500`.
  - Le tuteur parle : chaque barre varie de 40 à 190 px, rapide et irrégulière.
  - L'élève parle : 40 à 100 px, plus lent et plus doux.
  - Repos ou micro coupé : 4 pastilles rondes immobiles de 40 px.
- Statut en `text-secondary` : « Le tuteur parle… » / « Le tuteur t'écoute… » / « Ton micro est coupé ». Puis « Touche l'écran pour interrompre » (toucher l'écran interrompt le tuteur).
- Contrôles : Micro (rond blanc 56 px, noir quand coupé) · **Raccrocher** (rond 72 px `error-strong`, croix blanche, revient au chat écrit) · Caméra (rond blanc 56 px, bleu quand activée).
- La barre de navigation reste visible.

### 3A · Flashcards · Choix — `03a-Flashcards-Choix.dc.html`
- Titre « Flashcards » + bouton réglages.
- Carte « Révision du jour » : 30 cartes à revoir, badge de série orange, pastilles des matières concernées, bouton **C'est parti** en violet vif (`violet-500`, ombre violette).
- « Choisis ta matière » : grille 2 × 3 de cartes colorées sélectionnables (sélection = anneau de la couleur de la matière + coche).
- « Chapitres · {matière} » : liste de chapitres numérotés (numéro sur le fond doux de la matière), cartes et durée, bouton radio.
- Bouton principal **Commencer · N cartes** (`shadow-brand`).

### 3B · Flashcards · Session — `03b-Flashcards-Session.dc.html`
- En-tête : « Quitter », matière + « Carte 4 sur 12 », badge de série. Barre de progression dans la couleur de la matière.
- Carte question : liseré haut de 8 px dans la couleur de la matière, icône, question (24 px Black), **4 réponses en grille 2 × 2** (A, B, C, D).
- Après la réponse :
  - Bonne réponse : l'option passe en vert (`success-soft`, bord `success`, coche) et la carte est rangée dans « Je sais ».
  - Mauvaise réponse : le choix passe en orange (`warning`), la bonne réponse en vert, et la carte est rangée dans « À revoir ». Jamais de rouge.
  - Le message sous la grille explique la réponse, sur un ton bienveillant.
- Bouton **Carte suivante** (désactivé tant qu'on n'a pas répondu) + compteurs « Je sais » / « À revoir ».
- Fin de session : carte verte « Session terminée ! », bilan et « +60 XP ».

### 4 · Stats — `04-Stats.dc.html`
- Titre « Tes stats » (Black 900) + sélecteur **Semaine / Mois / Trimestre** (change chiffres et histogramme).
- 4 KPI en cartes colorées : temps d'étude (bleu), sessions (cyan), flashcards révisées (violet), série record (orange uni, texte blanc).
- Histogramme du temps d'étude (barres en dégradé violet → bleu, axes en `text-secondary`).
- Progression par matière : icône colorée de la matière sur son fond doux, barre en dégradé de la matière, pourcentage.
- Évolution de la maîtrise : carte en dégradé bleu, courbe blanche, « 68 % » en grand, badge vert « +26 pts ».
- Calendrier d'activité (heatmap 13 semaines, 5 niveaux de bleu).
- **Tes points forts** : carte dégradé vert, titre blanc, lignes blanches.
- **À retravailler** : carte orange uni, titre blanc, lignes blanches avec bouton **Réviser** (`primary`).

### 2C / 2D · Tuteur + graphique — `02c-…`, `02d-…`
- Le tuteur peut **tracer un graphique** pour illustrer son explication. Exemple : la droite y = 3x + 5 (rouge Maths) et la droite y = 20 (bleu pointillé), avec leur intersection x = 5 mise en évidence.
- Le panneau graphique est en haut (carte blanche, `radius-3xl`), la discussion continue en dessous. Il se réduit en bandeau (chevron) et s'agrandit en plein écran. Le bouton d'agrandissement est dessiné mais pas encore fonctionnel sur la maquette.
- Écrit (2C) : le tuteur fait référence aux couleurs du graphique (« la droite **rouge** »). Les anciens messages s'estompent en haut quand la place manque.
- Vocal (2D) : les 4 barres rétrécissent sous le graphique. Le point clé pulse **seulement quand le tuteur parle**, pour synchroniser la voix et le visuel. Une pastille « En direct » clignote à côté du chrono.

### 2E / 2F · Tuteur + tableau blanc — `02e-…`, `02f-…`
- Surface blanche avec une grille de points : le tuteur y écrit la résolution pas à pas (3x + 5 = 20 → 3x = 15 → **x = 5** entouré en rouge). Les opérations (− 5, ÷ 3) sont en bleu, et les annotations numérotées sont à droite, reliées par des flèches.
- Sous le tableau, des pastilles d'étapes : ① Retirer 5 · ② Diviser par 3 · ③ x = 5.
- Vocal (2F) : le tableau **s'écrit en direct**. Les étapes apparaissent l'une après l'autre (fondu), puis le cercle rouge se trace, un point bleu pulsant joue le rôle du stylo et la pastille de l'étape en cours s'allume. L'état affiché est « Le tuteur écrit au tableau… ».

## Espace Parents (P1 à P4)

Il est dans la **même app**, avec un profil parent. Persona : Claire, la maman de Léa.
Principes :
- vouvoiement et ton factuel ;
- pas de gamification (ni série, ni XP) ;
- mais **les mêmes couleurs, cartes en dégradé et espacements que l'app élève**, pour garder la même envie de lire.

Sections séparées de 24 px, cartes en `radius-3xl`, titres de section en 18 à 22 px Black.

Navigation à 4 onglets, dans le même style que l'élève : **Accueil · Progrès · Sessions · Réglages**.

### P1 · Tableau de bord — `P1-Parents-Accueil.dc.html`
- Sélecteur d'enfant (« Léa · 4e ») pour les familles avec plusieurs enfants, badge « Espace Parents » et notifications.
- **Résumé de la semaine** rédigé par l'IA : carte en dégradé bleu vers violet, logo, badge vert.
- 3 chiffres clés en cartes colorées : temps d'étude (cyan), jours actifs (vert), notions acquises (violet).
- **À surveiller** : orange uni, texte blanc, bouton « Voir le détail ». N'apparaît que s'il y a un point à signaler.
- **Comment l'encourager** : carte violette claire avec un conseil concret.
- Temps d'étude par jour avec la ligne d'objectif, et une remarque sur les horaires de travail.

### P2 · Progrès par matière — `P2-Parents-Progres.dc.html`
- Période (ce mois-ci / ce trimestre). Maîtrise globale dans un anneau blanc sur une carte en dégradé.
- Une carte par matière : tuile en dégradé, pourcentage, évolution, barre segmentée par chapitre. Toucher la carte **déplie les chapitres** avec leur statut.
- Statuts : **Acquis** (vert), **En cours** (bleu), **À consolider** (orange), **Pas commencé** (gris). Ce vocabulaire est plus lisible pour un parent que des pourcentages bruts.

### P3 · Sessions — `P3-Parents-Sessions.dc.html`
- Bandeau « Cette semaine » : nombre de sessions, temps et répartition par mode.
- **Confidentialité** : le parent voit un **résumé** de chaque session rédigé par l'IA, jamais la conversation complète, pour préserver la confiance de l'enfant. C'est une règle produit, pas seulement de l'affichage.
- Filtres par matière. Cartes regroupées par jour : en-tête dans la couleur de la matière, résumé, résultat (Compris, En progrès ou À revoir) et mode utilisé.

### P4 · Réglages — `P4-Parents-Reglages.dc.html`
- Profil de l'enfant. **Objectif hebdomadaire**, réglable avec − et +, à fixer avec l'enfant.
- Interrupteurs répartis en trois groupes :
  - temps d'écran (limite par jour, pause après 21 h) ;
  - fonctionnalités (vocal, caméra, graphiques et tableau blanc) ;
  - notifications (bilan du dimanche, alertes).
- Compte : abonnement, données personnelles (RGPD), ajout d'un enfant, **suppression du compte** (obligatoire pour les stores).

## Connexion et inscription (L1 à L6)

Élève en **bleu** (tutoiement), parent en **violet** (vouvoiement). Pas de barre de navigation sur ces écrans.

### L1 · Bienvenue — `L1-Connexion-Choix.dc.html`
- Illustration des six matières autour du logo, titre « Bienvenue sur Tutor'IA ».
- Deux cartes **ProfileChoiceCard** « Je suis élève » / « Je suis parent », sans autre texte. Le bouton du bas prend la couleur du profil choisi.

### L2 · Connexion élève — `L2-Connexion-Eleve.dc.html`
- En-tête **AuthHero** bleu, « Identifiant ou e-mail », mot de passe (avec l'œil), « Mot de passe oublié ? ».
- Champ **Code parent facultatif** : l'élève se connecte seul, le code sert seulement à relier son compte à celui d'un parent.
- « Pas encore de compte ? Créer mon compte » → E1.

### L3 · Connexion parent — `L3-Connexion-Parent.dc.html`
- En-tête violet, e-mail et mot de passe **d'abord**, puis « ou » et Apple / Google.

### L4 · Inscription parent, étape 1 — `L4-Inscription-Parent.dc.html`
- Prénom, e-mail, mot de passe avec ses règles, conditions d'utilisation et bilan de la semaine par e-mail.

### L5 · Ajouter l'enfant — `L5-Inscription-Parent-Enfant.dc.html`
- Prénom de l'enfant et classe (grille du CP à la Terminale).

### L6 · Code de l'enfant — `L6-Inscription-Parent-Code.dc.html`
- Profil créé, **ParentCodeCard** avec le code à 6 chiffres (valable 24 h) et le partage, puis les trois étapes à faire sur le téléphone de l'enfant.

## Inscription élève et onboarding (E1, O1 à O5)

Tout en bleu. Chaque étape de l'onboarding a un **StepHeader** (retour, « Étape n sur 4 », « Passer »). En mode présentation, le bouton principal mène à l'écran suivant, jusqu'à l'accueil.

### E1 · Crée ton compte — `E1-Inscription-Eleve.dc.html`
- Prénom, e-mail, mot de passe avec ses règles, puis Apple / Google côte à côte.
- Interrupteur « J'ai moins de 15 ans » : il affiche un champ « E-mail d'un parent » pour faire valider le compte.

### O1 · Classe — `O1-Onboarding-Classe.dc.html`
- Bulle de bienvenue du tuteur, puis **GradePicker** groupé Primaire / Collège / Lycée.

### O2 · Auto-évaluation — `O2-Onboarding-Matieres.dc.html`
- Une **SelfAssessmentRow** par matière : « Galère · Bof · Ça va · À l'aise », dans la couleur de la matière. Jamais présentée comme une note.

### O3 · Objectifs — `O3-Onboarding-Objectifs.dc.html`
- Six **GoalTile** à cocher (choix multiple), puis **DurationPicker** 10 / 15 / 20 / 30 min par jour.

### O4 · Façon d'apprendre — `O4-Onboarding-Style.dc.html`
- Quatre **ChoiceRow** (écrit, voix, schémas, quiz) qui correspondent aux modes de l'app, des **ToggleChip** pour le moment de révision et un rappel à activer.

### O5 · Parcours prêt — `O5-Onboarding-Pret.dc.html`
- Carte héros « Ton parcours est prêt », plan en **PlanRow** qui commence par la matière la moins à l'aise, objectif du jour et jour 1 de la série. Boutons « Commencer ma première séance » et « Relier mon compte à un parent ».

## Explorer (X1 à X5b)

L'onglet Explorer transforme le programme en carte d'aventure. **Une île = une matière**, découpée en régions (thèmes), villes (chapitres) et niveaux. L'exemple des maquettes est l'île des Maths de 4e.

**Trois types de niveaux**, toujours avec leur couleur, leur icône et leur libellé :

| Type | Couleur | Icône | Comportement du tuteur |
| --- | --- | --- | --- |
| Leçon | vert (`green-700`, dégradé green-400 → green-700) | livre | Explique, donne des exemples, vérifie la compréhension. |
| Exercices | bleu (`blue-500`, dégradé blue-400 → blue-600) | crayon | Laisse chercher, donne des indices progressifs. |
| Évaluation | rouge (`red-500`, dégradé red-300 → red-600) | couronne | Exigeant : ni indice ni correction pendant l'épreuve, correction dans le bilan. |

L'évaluation ferme chaque ville : son point est plus grand (68 px contre 52) avec un double anneau.

**Chaque point lance un chat sans quitter l'onglet Explorer.** On ne renvoie jamais vers l'onglet Tutor'IA : la discussion garde le fond de l'île et la progression du niveau.

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

### X4 / X4b · Discussion de niveau — `X4-…`, `X4b-…`
- Fond **IslandBackdrop** aux couleurs de l'île et **LevelProgressHeader** (retour à la carte, type, titre, bascule écrit / vocal, progression en segments).
- X4 : chat écrit avec les bulles et la saisie de l'onglet Tutor'IA. X4b : visualiseur vocal, **VoiceBoardCard** (le tuteur écrit les étapes) et contrôles d'appel ; raccrocher ramène à la carte.

### X5 / X5b · Bilan — `X5-…`, `X5b-…`
- **LevelResultCard** : « Bien joué ! » sur vert (X5) ou « Presque ! » sur orange (X5b), étoiles, score et XP, puis des **TutorFeedback** réussi / à revoir.
- Il faut 70 % à l'évaluation pour valider la ville. En dessous, la ville passe « à consolider » (orange) : on revoit la notion et on retente quand on veut.

## Barre de navigation (tous les écrans)

Flottante : `left/right/bottom: 20px`, hauteur 72 px, `radius-3xl`, `shadow-lg`, fond blanc.
5 onglets : **Accueil · Explorer · Tutor'IA · Révisions · Stats** (Explorer avec une icône boussole), avec des icônes au contour (`gray-400`) et un libellé de 12 px en `text-secondary`.
L'onglet actif a une pastille ronde `primary` de 52 px qui dépasse de la barre (bord blanc de 4 px), avec une icône blanche et un libellé en `primary` Bold.
L'onglet **Tutor'IA** utilise le **logo** au lieu d'une icône : le logo sur fond blanc (30 px) au repos, et le logo sur fond bleu (42 px) dans une pastille de 60 px quand il est actif.

## Règles clés

- **Police** : Satoshi uniquement. Titres de page et de section en Black 900. Titres de carte en Bold 700 ou Medium 500. Texte courant en Regular 400, jamais sous 16 px dans le chat.
- **Espacements** : multiples de 4. Intérieur des cartes 16 px (grandes cartes 24 px). 12 px entre cartes, 32 px entre sections.
- **Zones tactiles** : 48 px minimum.
- **Rayons** : 16 px pour les cartes, champs, boutons et bulles. 24 px pour les grandes surfaces et les cartes colorées. Ronds pour les pastilles et les boutons d'appel.
- **Ombres** : `sm` pour ce qui est posé, `md` pour les cartes, `lg` pour ce qui flotte. `shadow-brand` sur un seul élément par écran.
- **Voix** : tutoiement, phrases courtes, une erreur n'est jamais un échec.
- **Accessibilité** : de vrais `button` et liens, `aria-label` sur les boutons à icône seule, un focus visible (`shadow-focus`).

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
6. **Barre de navigation visible pendant l'appel vocal.**
7. **Espace Parents coloré** : le design system le voulait « plus sobre ». Il garde les couleurs et les cartes en dégradé de l'app élève, mais sans aucune gamification.
8. **Explorer en 3D, sur fond de ciel (X1)** : validé par Romain. L'île est en 3D réaliste façon maquette, avec des couleurs naturelles hors de la palette de la marque, et tout l'écran X1 garde le ciel et ses nuages au lieu du fond `bg`. Sur ce ciel, le sous-titre « Choisis ton île » passe en `text` (le `text-secondary` serait illisible), et les points inactifs du carrousel sont blancs. Tant qu'une seule île est construite en 3D (les Maths), le carrousel ne montre qu'elle, sans flèches ni points. L'île tourne au doigt, avec un peu d'élan au lâcher ; on changera d'île avec les flèches.
10. **X2a · les régions de l'île** : « Explorer l'île » zoome dans la même scène 3D (caméra plus haute, île entière). Les régions (domaines du référentiel de 4e) se choisissent avec un **carrousel de cartes en bois en bas de l'écran** (défilement au doigt ou flèches) : la région choisie est éclairée, teintée, avec ses frontières en pointillés, les autres sont grisées, et la caméra dérive vers elle. Rien n'est posé sur l'île. Le bouton « Entrer dans la région » déclenche un vrai zoom-in sur la région, un fondu au noir accompagne le zoom, puis la carte de la région apparaît (X2b). L'Algorithmique, région d'un seul chapitre, est un îlot flottant derrière l'île (en haut à gauche), hors de portée du carrousel. Sans WebGL ou avec un lecteur d'écran, le carrousel est remplacé par une liste de régions.
11. **X2b · la carte d'une région** : « Entrer dans la région » ouvre la bande de terre de la région, vue de face à 38°, qui défile au doigt avec de l'élan (ou par les flèches ville précédente/suivante du panneau de ville). Le chemin est orange jusqu'au pion et gris ensuite ; les points de niveau sont verts (leçon), bleus (exercices) ou rouges et plus grands (évaluation), gris avec un cadenas quand ils sont fermés, avec leurs étoiles ; un bandeau de bois et un village marquent chaque ville. L'en-tête nomme la région et la ville au centre de l'écran. Les boutons de 48 px et les bandeaux sont posés sur la 3D ; une vue en liste (région, ville, niveau) remplace la carte sans WebGL, avec un lecteur d'écran ou sur demande. Art provisoire : les monuments et le sol sont en maquette grise jusqu'à l'étape Blender.
9. **HUD de jeu vidéo sur X1** : à la demande de Romain, l'écran doit se distinguer du reste de l'app, « plus Mario ». Le titre, les compteurs, la banderole de l'île et les boutons utilisent la police Lilita One (licence OFL, `assets/typographie/LilitaOne/`), en blanc cerné de bleu nuit avec une ombre portée. S'y ajoutent des boutons brillants en relief (flèches jaunes, bouton vert « Explorer l'île »), des gemmes à la place des points et un panneau « Ta quête » en bois (planches rendues par Blender, `tools/explorer-3d/wood_panel.py`), avec des clous, un ruban et une étiquette en parchemin pour la prochaine étape. La barre de navigation reste celle de l'app.
