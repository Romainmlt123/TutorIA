# Tutor'IA — dossier design (app élève)

Maquettes validées de l'application mobile élève Tutor'IA, prêtes à être implémentées.
Source de vérité visuelle : le canevas Design « Tutor'IA · App mobile élève » sur claude.ai. Il contient 34 écrans iPhone de 390 px de large : 10 côté élève, 8 pour l'onglet Explorer, 4 dans l'espace Parents et 12 pour la connexion, l'inscription et l'onboarding.

## Contenu

```
design/
├── README.md            ← ce fichier : vue d'ensemble, écrans, règles
├── COMPONENTS.md        ← inventaire des composants à créer, avec leurs specs
├── DESIGN_SYSTEM.md     ← README du design system Tutor'IA (règles de marque, couleurs des matières, écarts validés)
├── design-system/       ← les 86 composants publiés dans le design system (référence : bundle, props typées, fiches)
├── tokens/
│   ├── tokens.json      ← tokens officiels du design system (couleurs, type, espaces, rayons, ombres)
│   ├── app-tokens.json  ← ajouts propres à l'app (matières, jeu, KPI, vocal, bandeaux, appel vocal)
│   └── tokens.css       ← tout en variables CSS + @font-face Satoshi
├── components/          ← composants partagés des maquettes (importés par les écrans)
│   ├── support.js            ← moteur de rendu des maquettes (copie, voir « Voir une maquette dans un navigateur »)
│   ├── BottomNav.dc.html     ← barre de navigation élève et Parents (props espace, active)
│   ├── ModeToggle.dc.html    ← bascule Écrit / Vocal (props mode, variante)
│   ├── TopicCard.dc.html     ← carte sujet de discussion (props matiere, titre, badge, live)
│   ├── PanelHeader.dc.html   ← en-tête graphique / tableau blanc (props type, titre, kicker, live, open, onToggle)
│   ├── CallControls.dc.html  ← micro / raccrocher / caméra de X4b (props muted, camOn, onMute, onCam, hangupHref)
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

Format : iPhone 390 × 844. Marges d'écran 20 px. La barre de navigation flotte à 20 px du bas ; le contenu défilant garde ~116 px libres en bas pour ne pas passer dessous. Accueil (1460 px), Flashcards · Choix (1420 px), Stats (2560 px) et les écrans Parents (P1 1540 px, P2 2000 px, P3 1860 px, P4 1820 px) sont montrés en entier : ce sont des écrans qui défilent.

Depuis la v2.5, l'Accueil, les Flashcards · Choix, les Stats et l'espace Parents s'ouvrent sur un **bandeau de marque**, et chaque titre de section est dans sa carte (voir « Bandeau de marque et cartes de section » dans les Règles clés).

Depuis la v2.6, l'appel vocal (2B, 2D, 2F) est plein écran, sans barre de navigation (voir « Appel vocal : ce que l'écran doit faire »).

### 1 · Accueil — `01-Accueil.dc.html`
- **Bandeau de marque bleu** : « Salut Léa ! » (30 px, Black 900, blanc), bouton notifications en blanc translucide (point violet `accent` = nouveauté), avatar rond blanc.
- Citation du jour sous la salutation, dans le bandeau : italique 15/22 px en blanc, auteur en 12 px Bold, largeur max 300 px. Une liste de citations tourne (Mandela, Sénèque, La Fontaine, Wilde, Confucius, Boileau, proverbe).
- Deux cartes jeu côte à côte, qui débordent de 64 px sur le bas du bandeau : **Série** (orange uni `--streak`, texte blanc, « 12 jours » sur une ligne) et **Niveau** (gris ardoise `--level-card`, jauge XP verte).
- Carte « Reprendre » : matière + chapitre (« Équations du 1er degré » en 20 px Black), progression, bouton principal **Reprendre** (`shadow-brand`, le seul de l'écran).
- **Objectif du jour** : carte en dégradé vert (#0C9E42 → #03702B, 160°, `radius-3xl`, padding 20 px), anneau blanc 2/3 de 64 px, titre 22 px Black, « 15 min · 2/3 sessions » et pastille blanche « Plus qu'une ! », tout en blanc.
- **Tes matières** : carte blanche (titre 22 px Black, lien « Tout voir ») qui contient la grille 2 colonnes des 6 matières ; cartes remplies du dégradé de la matière (voir Couleurs des matières), en `radius-2xl` et `shadow-sm` dans la carte.

### 2A · Tuteur écrit — `02a-Tuteur-Ecrit.dc.html`
- Toggle **Écrit / Vocal** centré en haut.
- Carte « Sujet de la discussion » : tuile de la matière, « MATHS », « Équations du 1er degré », pastille « Leçon 3/5 ».
- Messagerie façon SMS : bulles du tuteur à gauche (blanc, `shadow-sm`, avatar = logo sur fond bleu 32 px), bulles de l'élève à droite (`primary`, texte blanc). Espacement 12 px entre bulles.
- Carte **Conseil** en `accent-soft` avec pastille violette.
- Barre de saisie : champ 48 px + bouton d'envoi rond `primary`.

### 2B · Tuteur vocal — `02b-Tuteur-Vocal.dc.html`
- **Un écran d'appel** (v2.6) : plein écran sur le dégradé de marque, tout en blanc, sans barre de navigation.
- En haut : « Écrit » (passer au chat écrit) et le chrono ; au centre, la matière et le chapitre.
- **Le logo du tuteur** (148 px, dans un disque blanc) rebondit quand il parle, au niveau de sa voix, et penche la tête quand il écoute. Le toucher interrompt le tuteur.
- **Pastille d'état** sous le logo : verte « Je t'explique… », rouge « Je t'écoute… », neutre « Ton micro est coupé ».
- **Sous-titres en direct** (20/30), mot à mot ; une couleur nommée s'affiche dans une pastille de sa couleur.
- **Commandes en verre** en bas : Micro · Sous-titres · Caméra · **Raccrocher** (rond rouge de 64 px avec le combiné).
- Comportement détaillé : « Appel vocal : ce que l'écran doit faire », plus bas.

### 3A · Flashcards · Choix — `03a-Flashcards-Choix.dc.html`
- **Bandeau de marque bleu** : titre « Flashcards » (30 px Black, blanc) + bouton réglages en blanc translucide.
- Carte « Révision du jour », qui déborde de 56 px sur le bandeau : 30 cartes à revoir, badge de série orange, pastilles des matières concernées, bouton **C'est parti** en violet vif (`violet-500`, ombre violette).
- Carte « Choisis ta matière » (titre 22 px Black) : grille 2 × 3 de cartes colorées sélectionnables, en `radius-2xl` (sélection = anneau blanc de 3 px puis anneau de 3 px à la couleur de la matière + coche).
- Carte « Chapitres · {matière} » (titre 22 px Black, « 529 cartes en tout » à droite) : liste de chapitres numérotés (numéro sur le fond doux de la matière), cartes et durée, bouton radio. Les lignes sont sur fond `bg` ; la ligne choisie passe en blanc, avec un bord de 2 px à la couleur de la matière.
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
- **Bandeau de marque violet** : titre « Tes stats » (30 px Black, blanc) + sélecteur **Semaine / Mois / Trimestre** dans le bandeau (piste en blanc translucide, pastille active blanche au texte `violet-600`, les autres en blanc ; change chiffres et histogramme).
- 4 KPI en cartes colorées, qui débordent de 56 px sur le bandeau : temps d'étude (bleu), sessions (cyan), flashcards révisées (violet), série record (orange uni, texte blanc).
- Tous les titres de section sont en 22 px Black dans leur carte (16 px avant la v2.5).
- Histogramme du temps d'étude (barres en dégradé violet → bleu, axes en `text-secondary`).
- Progression par matière : icône colorée de la matière sur son fond doux, barre en dégradé de la matière, pourcentage.
- Évolution de la maîtrise : carte en dégradé bleu, courbe blanche, « 68 % » en grand avec le badge vert « +26 pts en 8 sem. » à côté.
- Calendrier d'activité (heatmap 13 semaines, 5 niveaux de bleu).
- **Tes points forts** : carte dégradé vert, titre blanc, lignes blanches.
- **À retravailler** : carte orange uni, titre blanc, lignes blanches avec bouton **Réviser** (`primary`).

### 2C / 2D · Tuteur + graphique — `02c-…`, `02d-…`
- Le tuteur peut **tracer un graphique** pour illustrer son explication. Exemple : la droite y = 3x + 5 (rouge Maths) et la droite y = 20 (bleu pointillé), avec leur intersection x = 5 mise en évidence.
- Le panneau graphique est en haut (carte blanche, `radius-3xl`), la discussion continue en dessous. Il se réduit en bandeau (chevron) et s'agrandit en plein écran. Le bouton d'agrandissement est dessiné mais pas encore fonctionnel sur la maquette.
- Écrit (2C) : le tuteur fait référence aux couleurs du graphique (« la droite **rouge** »). Les anciens messages s'estompent en haut quand la place manque.
- Vocal (2D, v2.6) : l'écran d'appel de 2B, avec la carte du graphique dans la moitié haute (violette, comme dans l'app) et le logo de 96 px dessous. Quand le tuteur nomme une courbe, elle s'épaissit et sa légende s'allume ; le point clé pulse pendant qu'il parle.

### 2E / 2F · Tuteur + tableau blanc — `02e-…`, `02f-…`
- Surface blanche avec une grille de points : le tuteur y écrit la résolution pas à pas (3x + 5 = 20 → 3x = 15 → **x = 5** entouré en rouge). Les opérations (− 5, ÷ 3) sont en bleu, et les annotations numérotées sont à droite, reliées par des flèches.
- Sous le tableau, des pastilles d'étapes : ① Retirer 5 · ② Diviser par 3 · ③ x = 5.
- Vocal (2F, v2.6) : l'écran d'appel de 2B, avec la carte du tableau dans la moitié haute (azur, sans grille de points ni pastilles d'étapes, comme dans l'app). Le tableau **s'écrit en direct** pendant que le tuteur parle : les lignes apparaissent l'une après l'autre, un point bleu joue le rôle du stylo, puis le résultat s'entoure de rouge.

## Appel vocal : ce que l'écran doit faire (2B, 2D, 2F)

Validé par Romain le 7 octobre 2026 : piste A « L'appel » pour 2B, variante 1 « La carte » pour 2D et 2F (les pistes explorées restent en haut du canevas). Composants : `CallTopBar`, `VoiceAvatar`, `VoiceStatus`, `LiveCaptions`, `CallDock`, et pour les visuels `VisualPanel`, `MathGraph`, `Whiteboard` (design system et `components/`).

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
- Dans le bandeau : sélecteur d'enfant (« Léa · 4e », pastille blanche) pour les familles avec plusieurs enfants, badge « Espace Parents » et notifications en blanc translucide, puis « Bonjour Claire » et la semaine affichée.
- **Résumé de la semaine** rédigé par l'IA : carte en dégradé bleu vers violet, logo, badge vert. Elle déborde de 56 px sur le bandeau.
- 3 chiffres clés en cartes colorées : temps d'étude (cyan), jours actifs (vert), notions acquises (violet).
- **À surveiller** : orange uni, texte blanc, bouton « Voir le détail ». N'apparaît que s'il y a un point à signaler.
- **Comment l'encourager** : carte violette claire avec un conseil concret.
- Temps d'étude par jour avec la ligne d'objectif, et une remarque sur les horaires de travail.
- Titres des cartes (Résumé de la semaine, À surveiller, Comment l'encourager, Temps d'étude par jour) en 22 px Black.

### P2 · Progrès par matière — `P2-Parents-Progres.dc.html`
- Période (ce mois-ci / ce trimestre) dans le bandeau, même style que les Stats. Maîtrise globale dans un anneau blanc sur une carte en dégradé.
- Carte « Par matière » (titre 22 px Black) avec un bloc par matière sur fond `bg` (`radius-2xl`) : tuile en dégradé, pourcentage, évolution, barre segmentée par chapitre. Toucher le bloc **déplie les chapitres** avec leur statut, en lignes blanches.
- Statuts : **Acquis** (vert), **En cours** (bleu), **À consolider** (orange), **Pas commencé** (gris). Ce vocabulaire est plus lisible pour un parent que des pourcentages bruts.

### P3 · Sessions — `P3-Parents-Sessions.dc.html`
- Carte « Cette semaine » (dégradé, déborde sur le bandeau violet) : nombre de sessions, temps et répartition par mode.
- **Confidentialité** : le parent voit un **résumé** de chaque session rédigé par l'IA, jamais la conversation complète, pour préserver la confiance de l'enfant. C'est une règle produit, pas seulement de l'affichage.
- Filtres par matière. Une carte blanche par jour (titre du jour en 22 px Black) qui regroupe les sessions de ce jour, sur fond `bg` : en-tête dans la couleur de la matière, résumé, résultat (Compris, En progrès ou À revoir) et mode utilisé.

### P4 · Réglages — `P4-Parents-Reglages.dc.html`
- Profil de l'enfant (nom en 22 px Black). **Objectif hebdomadaire** (titre 22 px Black), réglable avec − et +, à fixer avec l'enfant.
- Interrupteurs répartis en trois cartes, le titre du groupe (22 px Black) dans la carte :
  - temps d'écran (limite par jour, pause après 21 h) ;
  - fonctionnalités (vocal, caméra, graphiques et tableau blanc) ;
  - notifications (bilan du dimanche, alertes).
- Carte « Compte » (même style) : abonnement, données personnelles (RGPD), ajout d'un enfant. Sous la carte, **suppression du compte** (obligatoire pour les stores).

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
La barre est masquée pendant l'appel vocal (2B, 2D, 2F), depuis la v2.6.

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
- **Carte de section** : chaque titre de section vit dans sa carte. Carte `surface`, `radius-3xl`, `shadow-md`, marge intérieure 16 px. Titre 22/30 px Black ; une précision éventuelle en 12 px `text-secondary` se place à droite et passe à la ligne si la place manque. Dans la carte, les éléments passent sur le fond `bg` (#F5F8FF) sans ombre, ou gardent leur dégradé pour les cartes de matière (`radius-2xl`, `shadow-sm`).
- **Vert = objectif** : la carte « Objectif du jour » de l'Accueil est en `--goal-gradient` (#0C9E42 → #03702B à 160°), texte blanc. L'objectif hebdomadaire des Parents (P4) garde le dégradé vert à trois couleurs de l'Histoire-Géo (#1BC85B → #0C9E42 → #03702B) : la carte de l'Accueil part d'un vert plus foncé pour que le texte blanc reste lisible.
- **Hauteur des écrans** : la fin du contenu s'arrête ~116 px au-dessus du bas pour ne pas passer sous la barre de navigation.

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
13. **X3 à X5b · un niveau dans le HUD de jeu** (validé par Romain le 06/10) : la fiche d'un niveau et son bilan reprennent le panneau de bois d'Explorer au lieu de la feuille blanche des maquettes ; la discussion garde les bulles et la saisie de l'onglet Tutor'IA, dans un cadre clair cerné de bleu nuit, sur le ciel d'Explorer. Toucher un niveau ouvert y fait d'abord marcher l'avatar (2,5 s au plus), comme sur la carte d'un jeu, puis la fiche s'ouvre à son arrivée ; un niveau fermé ouvre sa fiche tout de suite. Les étoiles d'un niveau terminé s'affichent en arc au-dessus de son point, grandes et cernées de bleu nuit, celle du milieu plus haute. La fiche se pose en bas de la carte assombrie : ruban du type, titre en Lilita One, pastilles de durée, d'étapes et d'étoiles, objectifs sur parchemin, règle de l'évaluation sur fond rouge clair, raison du verrouillage, puis « À l'écrit » (vert) et, pour une leçon seulement, « À la voix » (bleu) : à l'oral, le tuteur ne peut pas juger les réponses, la leçon compte alors comme une séance, sans étoiles. L'en-tête de la discussion montre la progression en segments verts, et chaque étape réussie d'une leçon ajoute une carte verte « Étape n réussie ». Le bilan est calculé par le serveur ; « Le bilan de ton tuteur » devient « Ce que tu as travaillé » (les objectifs du niveau) ou la leçon à revoir, et l'XP affichée est celle réellement gagnée (rejouer ne rapporte que les étoiles nouvelles ; rien n'est affiché sans gain).
14. **Formules mathématiques en New Computer Modern** (validé par Romain le 06/10) : dans les bulles du tuteur, les formules sont dessinées par MathJax avec sa police mathématique (fractions empilées, puissances, racines, x en italique), et non en Satoshi, comme dans un manuel. Une formule isolée est centrée sur sa ligne, un peu plus grande que le texte ; une formule trop longue défile sur le côté. Elles prennent la couleur du texte de la bulle.
15. **Le tuteur visuel au-delà des maquettes 2C et 2E** (validé par Romain le 07/10) : en plus du graphique et du tableau blanc, le tuteur peut montrer un diagramme statistique (barres arrondies ou secteurs avec leur légende) et une figure de géométrie (points nommés, longueurs, angle droit codé par un petit carré, cercles), dans le même panneau. Les couleurs que le tuteur peut nommer sont six teintes de la palette (rouge, bleu, vert, orange, violet, gris). Chaque sorte de visuel a sa couleur d'accent, pour se distinguer de la carte du chapitre (rouge Maths) : violet pour le graphique, azur pour le tableau, orange pour les statistiques, cyan pour la figure. Le panneau est teinté de cette couleur, sa tuile est en dégradé, et le dessin reste sur une feuille blanche. Le tableau blanc est une surface blanche nette, sans grille de points, sans cadre et sans les pastilles d'étapes de la maquette (les étapes sont déjà écrites au tableau) ; une ligne n'est jamais coupée : un long calcul fait défiler le tableau sur le côté, un long tableau le fait défiler vers le bas (validé par Romain le 07/10). La pastille « Voir… » est unie, dans la couleur de son visuel. Tout le bandeau ouvre ou replie le panneau, même clavier ouvert. Les boutons du panneau font 48 px au lieu de 44 (zones tactiles). Les mots écrits dans une formule sont en Satoshi.
16. **Bandeau de marque en tête des écrans principaux** (validé par Romain le 07/10) : le design system pose les titres d'écran directement sur le fond `bg`. Sur l'Accueil, les Flashcards · Choix, les Stats et l'espace Parents, le titre est en blanc dans un bandeau en dégradé : bleu côté élève, violet de marque pour les Stats et les Parents. Voir « Bandeau de marque et cartes de section ».
17. **Titres de section dans leur carte, en 22 px Black** (validé par Romain le 07/10) : plus aucun titre de section n'est posé sur le fond. Le titre de la carte « Reprendre » passe aussi en Black (20 px), au lieu du Medium 500 prévu par le design system.
18. **Objectif du jour en vert** (validé par Romain le 07/10) : la carte de l'Accueil passe en dégradé vert foncé (#0C9E42 → #03702B), texte blanc, pour mieux ressortir. Le vert y signale un objectif, comme l'objectif hebdomadaire des Parents.
19. **Le chat libre en couleurs** (demandé par Romain le 07/10) : la carte « Sujet de la discussion » des tuteurs écrit et vocal prend le dégradé de sa matière (bleu de l'élève pour « Toutes les matières »), avec son icône en filigrane, le texte en blanc et la pastille « Leçon n/5 » blanche, au lieu de la carte blanche de la maquette 02a. Une discussion libre encore vide propose quatre idées de départ, en pastilles dégradées de la palette d'accent (violet, orange, vert, cyan) qui défilent sur le côté juste au-dessus de la saisie ; un toucher envoie la demande au tuteur. Le volet « Tes discussions » s'ouvre sur un bandeau bleu de l'élève, dans l'esprit du bandeau de marque (entrée 16).
20. **Appel vocal plein écran, sans barre de navigation** (validé par Romain le 07/10, remplace l'écart 6) : 2B, 2D et 2F sont de vrais écrans d'appel, sur le dégradé de marque et tout en blanc. On en sort par « Écrit » ou « Raccrocher ». La caméra est à côté du bouton raccrocher.
21. **Pastilles d'état colorées** (validé par Romain le 07/10) : verte « Je t'explique… » quand le tuteur parle, rouge « Je t'écoute… » quand c'est à l'élève. Le rouge signale ici l'écoute, pas une erreur ; l'orange est prévu si le rouge gêne à côté du bouton raccrocher.
22. **Le logo du tuteur remplace les barres** (validé par Romain le 07/10, les ondes ont été jugées « cheap ») : il rebondit au niveau de la voix, se pose à chaque pause et penche la tête quand il écoute. Les quatre barres du design system ne servent plus que dans la discussion vocale d'Explorer.
