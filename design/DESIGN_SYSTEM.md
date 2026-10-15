# Tutor'IA

Tutor'IA est un compagnon de révision par IA pour tous les élèves, du primaire au lycée, en passant par le collège. L'application est pensée d'abord pour le mobile (iOS et Android) et existe aussi en version web. L'élève apprend à son rythme en dialoguant avec un tuteur, par écrit ou à la voix, et voit sa progression sur une carte d'aventure gamifiée (l'onglet **Explorer**). Un **espace Parents** permet aux familles de suivre les progrès de leurs enfants.

Ce système sert à concevoir tout ce qui porte la marque : écrans de l'app, pages web, présentations, visuels. Tutor'IA doit trouver le juste milieu entre le sérieux et l'accessible. Un parent doit y voir un outil fiable, un élève de CM1 doit s'y retrouver sans aide, et un lycéen ne doit pas le trouver enfantin. En cas de doute, la question à se poser : est-ce que ça marche pour ces trois personnes à la fois ?

## Personnalité

- **Pédagogue et complice.** Tutor'IA parle comme un grand frère ou une grande sœur qui s'y connaît : accessible, patient, jamais austère comme un professeur, jamais niais comme une mascotte.
- **Entre pro et accessible.** L'esthétique est celle des bons outils grand public : épurée, soignée, rassurante pour les parents, sans rien de froid ni de trop « appli d'entreprise » pour les enfants.
- **Stimulant sans pression.** L'effort est encouragé et dédramatisé. On donne envie par la curiosité, pas par la contrainte ou la peur de la note.

## Deux publics : élèves et parents

- **Côté élève** : le ton complice, la gamification (carte Explorer, séries, étoiles, badges, XP) et le tutoiement décrits ci-dessous.
- **Côté parents** : le même univers visuel que côté élève (Satoshi, `brand`, arrondis, couleurs des matières, chiffres clés sur fond coloré), aussi aéré et coloré. Pas de gamification (ni série, ni XP, ni badges) : on montre des informations claires, temps passé, notions travaillées, progrès, points à revoir. Le ton reste chaleureux mais factuel, et s'adresse aux parents en les vouvoyant.
- **Adapter au niveau scolaire** : en primaire, des mots simples, des phrases très courtes et davantage d'encouragements. Au lycée, un ton plus direct, qui traite l'élève en adulte. Les règles visuelles restent les mêmes pour tous.

## Voix et ton

- **Tutoiement, toujours, avec les élèves.** Direct, chaleureux, bienveillant. Les parents sont vouvoyés.
- **Phrases courtes.** Pas de longs blocs de cours : on découpe en petites étapes et on relance par une question (« Tu vois pourquoi ? », « On essaie avec un autre exemple ? »).
- **Emojis avec modération.** Un au maximum dans un message important (encouragement, réussite), jamais de suites d'emojis. Aucun dans les titres, boutons ou libellés d'interface.
- **Pas de jargon inutile.** Un terme technique du programme est expliqué la première fois qu'il apparaît.

| Situation | À éviter | À écrire |
| --- | --- | --- |
| Erreur de l'élève | « Faux. La bonne réponse était X. » · « Tu as tort. » | « Presque ! Regarde bien l'étape précédente. » · « Pas tout à fait, voyons ensemble où ça bloque. » |
| Réussite | « Félicitations, ton travail est satisfaisant. » | « Propre ! Tu as chopé le truc. » · « Bien joué, on passe à la suite ? » |
| Bouton d'action | « Valider la soumission » | « Vérifier ma réponse » |

Une erreur n'est jamais présentée comme un échec : le rouge (`red-*`) ne sert pas à signaler une mauvaise réponse dans le chat. On le garde pour les vraies erreurs système (connexion perdue, formulaire invalide).

## Principes visuels

- **Mobile d'abord.** Chaque écran est conçu pour un téléphone tenu d'une main, puis adapté au web. Les actions principales sont en bas de l'écran, les zones tactiles font au moins 48px de haut (`space-12`), pour que les plus jeunes élèves visent facilement, et les éléments sont bien espacés.
- **Clair et aéré.** Fond blanc ou `gray-100`, beaucoup d'espace, une seule idée forte par écran. Aucune sensation de surcharge.
- **Le bleu domine.** `brand` (`blue-500`) est la couleur de l'app : boutons principaux, liens, onglet actif, éléments sélectionnés. Les dégradés restent doux et dans les bleus (par exemple `blue-100` vers `azure-100` en fond de section) et ne passent jamais sous du texte courant.
- **Le violet accentue.** `accent` (`violet-500`) attire l'attention sur un message ou un événement ponctuel : notification, nouveau message du tuteur, conseil, nouveauté. Il reste rare. S'il apparaît partout, il n'attire plus l'œil.
- **80 / 20 : l'étude est calme, le jeu est vif.** Environ 80 % de l'interface (chat, cours, exercices, réglages) reste sobre : neutres, `brand` et beaucoup de blanc. Les couleurs vives et saturées (vert, orange, cyan…) sont réservées aux événements de jeu (niveaux, séries, badges, jauges d'XP) et aux **couleurs des matières** : chaque matière a sa teinte, qui la signale partout où elle apparaît (voir « Couleurs des matières »).
- **Formes arrondies.** Coins généreux, jamais d'angles droits : `radius-2xl` (16px) pour les cartes, champs, boutons et bulles de chat, `radius-3xl` (24px) pour les grandes surfaces (modales, cartes héros, feuilles du bas). Les cartes sont légèrement surélevées par une ombre douce et diffuse (`shadow-md`), jamais une ombre dure.

## Logo

Le logo est une bulle de discussion avec un clin d'œil, coiffée d'un mortier d'étudiant. Il dit à la fois « dialogue » et « réussite scolaire ». **Il est toujours bleu** (`blue-500`).

- **Sur fond blanc ou clair** : `Logo_tutoria_fond_blanc.png`.
- **Icône d'app, avatar, favicon** : `Logo_tutoria_fond_bleu.png`, avec le carré bleu arrondi.
- **Interdits** : le recolorer (pas de version blanche seule, violette ou monochrome), l'étirer, le déformer, l'incliner, ajouter un effet 3D ou une ombre dure. Sur une photo ou un fond chargé, on utilise la version sur carré bleu.

## Icônes et images

- **Icônes** : style contour, trait fin et minimaliste, en gris neutre (`gray-400` à `gray-500`) au repos. Un onglet actif ou une action clé passe en `brand`, en version pleine ou dans une pastille ronde.
- **Illustrations** : vectorielles, en 2D douce. L'onglet Explorer montre des îles flottantes (une par matière) et une carte façon jeu d'aventure : mer, bande de terre, chemin en vague, villes et niveaux. Formes simples, sans texture ni 3D.
- **À exclure** : photos de stock d'élèves en classe, visuels 3D criards, néons futuristes, personnages trop enfantins qui rebuteraient les collégiens et les lycéens.

## Espacements

Tous les espacements sont des multiples de 4px : `space-1` (4), `space-2` (8), `space-3` (12), `space-4` (16), `space-5` (20), `space-6` (24), `space-8` (32), `space-10` (40), `space-12` (48), `space-16` (64).

- **Marge des écrans mobiles** : `space-5` (20px) à gauche et à droite.
- **Intérieur des cartes et boutons** : `space-4` (16px) ; grandes cartes, modales et feuilles du bas : `space-6` (24px).
- **Plus d'espace entre les groupes qu'à l'intérieur** : `space-2` dans une carte, `space-3` entre deux cartes ou deux bulles de chat, `space-8` entre deux sections.
- **Zones tactiles** : 48px de haut minimum (`space-12`), boutons principaux compris.

## Ombres

Les ombres sont douces, diffuses et teintées de `gray-800` pour s'accorder au fond bleuté.

- **Quatre niveaux de hauteur, pas plus** : `shadow-sm` pour ce qui est posé (puces, champs), `shadow-md` pour les cartes (par défaut), `shadow-lift` pour la rangée posée à cheval sur le bandeau de marque, `shadow-lg` pour ce qui flotte (barre de navigation, feuilles du bas, modales). Ce qui est dans le bandeau reste à plat.
- **`shadow-lift`, l'ombre portée** (v2.17) : seules les sections à cheval sur le bandeau la prennent (la série et le niveau de l'Accueil, « Révision du jour », la première rangée des Stats, le résumé du Profil, la première carte de P1 à P4). Posées sur deux fonds, le bleu et le fond clair, elles se lisent comme un seul objet qui flotte. L'ombre descend sous la carte et prend sa couleur : orange sous la série, bleu nuit sous le niveau et les cartes blanches, violet dans l'espace Parents (`shadow-lift-parents`, `TutorIA.liftShadow`, prop `lifted` des composants). Les cartes posées entièrement sur le fond clair gardent `shadow-md` : si tout flotte, plus rien ne ressort.
- **`shadow-brand`**, l'ombre bleue, met en avant un seul élément par écran : le bouton « Commencer », le prochain niveau sur la carte.
- **`shadow-focus`** entoure tout élément interactif sélectionné au clavier.
- Pas d'ombres dures, noires ou décalées sans flou, ni d'ombre sur le logo.

## Typographie

Tutor'IA utilise **Satoshi** (Indian Type Foundry, via Fontshare) pour tout le texte : titres, texte courant et interface. Une seule famille, déclinée en graisses, suffit à créer la hiérarchie.

- **Famille** : `var(--font-sans)` = `"Satoshi", system-ui, -apple-system, "Segoe UI", sans-serif`.
- **Graisses disponibles** : Light 300, Regular 400, Medium 500, Bold 700, Black 900, chacune en romain et en italique (fichiers `.woff2` dans `fonts/`).
- **Usage des graisses** : Black (900) sert au style `display` et aux titres forts de l'app : titre d'écran, titres des cartes en couleur, grands chiffres des statistiques. Bold (700) sert aux titres `h1`/`h2` plus calmes (« Révision du jour »), aux surtitres et aux titres de sujet du tuteur. Medium (500) va aux titres de carte sur fond blanc (la carte « Reprendre »), libellés et boutons. Regular (400) est la graisse du texte courant. Light (300) reste pour les textes décoratifs, jamais en dessous de 18px.
- **Italique** : pour mettre en valeur un terme dans une explication (une notion, un mot de vocabulaire), pas pour des paragraphes entiers.
- **Échelle** : `display` 48, `h1` 36, `h2` 28, `h3` 22, `body-lg` 18, `body` 16, `body-sm` 14, `caption` 12, plus `label` 14 et `overline` 12 en capitales espacées. Le texte courant ne descend pas sous 16px dans les écrans de cours et de chat.
- Les titres de grande taille ont un interlettrage légèrement resserré (-0.02em pour `display`, -0.01em pour `h1`).

## Couleurs par rôle

On construit les écrans avec ces rôles, pas directement avec les nuances : `var(--primary)` plutôt que `var(--blue-500)`. Les nuances restent disponibles pour jouer à l'intérieur de la même direction artistique (illustrations, gamification, graphiques).

| Rôle | Token | Valeur | Pour quoi |
| --- | --- | --- | --- |
| Fond | `bg` | `gray-100` #F5F8FF | Fond de toutes les pages |
| Surface | `surface` | #FFFFFF | Cartes, bulles, champs, feuilles du bas |
| Texte | `text` | `gray-900` #000612 | Texte principal et titres |
| Texte secondaire | `text-secondary` | `gray-500` | Descriptions, métadonnées |
| Principale | `primary` | `blue-500` #2E6BE6 | Actions, liens, onglet actif |
| Accentuation | `accent` | `violet-500` #662EE6 | Notifications, nouveaux messages, conseils |
| Succès | `success` / `success-strong` | `green-700` / `green-800` | Réussite, validation |
| Avertissement | `warning` / `warning-strong` | `orange-700` / `orange-800` | Attention, action à vérifier |
| Erreur | `error` / `error-strong` | `red-500` / `red-600` | Bugs et erreurs système |

- **Chaque couleur d'état a trois niveaux.** Le niveau de base (`success`, `warning`, `error`) sert aux icônes, bordures et jauges. `-strong` sert au texte et aux boutons pleins avec texte blanc. `-soft` (nuance 100) sert aux fonds de bandeaux et de cartes.
- **Pourquoi pas le vert 500 ou l'orange 500 ?** Ces nuances vives sont trop claires pour être lues sur le fond : `green-500` n'atteint que 1.6:1 sur `bg`. Elles restent disponibles pour la gamification (badges, XP, carte Explorer), toujours avec un texte foncé par-dessus.
- **Les autres teintes** (`cyan`, `azure` et les nuances de `violet` autres que `accent`) sont des couleurs d'accentuation libres, surtout pour la partie jeu, les illustrations et les graphiques.

## Couleurs

La palette de Tutor'IA compte **8 teintes déclinées en 9 nuances**, soit 72 couleurs. Les valeurs sont reprises telles quelles du fichier de marque `Palette_TutorIA.svg`.

- **Couleur de marque** : `brand` = `blue-500` (`#2e6be6`), le bleu du logo. C'est la couleur des boutons principaux, des liens et des éléments actifs. `accent` = `violet-500` (`#662ee6`) sert aux notifications et aux messages à mettre en avant. `azure` est un second bleu, plus vif, pour les dégradés et les nuances : il ne remplace pas le bleu de marque.
- **Teintes** : `gray`, `blue`, `cyan`, `violet`, `green`, `orange`, `red`, `azure`.
- **Nuances** : de `100` (la plus claire) à `900` (la plus foncée). `500` est la nuance de référence de chaque teinte, par exemple `blue-500` = `#2e6be6` et `azure-500` = `#035cf9`.
- **Nommage** : `<teinte>-<nuance>`, utilisé en CSS sous la forme `var(--blue-500)`.
- **Règle de lisibilité** : sur fond blanc, un texte courant utilise la première nuance lisible de sa teinte (liste ci-dessous) ou une plus foncée. Les nuances 100 à 300 servent aux fonds et aux surfaces, avec un texte foncé (`gray-700` ou `gray-800`) par-dessus. La note de chaque token indique son contraste sur blanc.
- **Première nuance lisible en texte sur blanc (4.5:1)** : `gray-500`, `blue-500`, `cyan-800`, `violet-400`, `green-800`, `orange-700`, `red-600`, `azure-500`. Cyan, vert et orange sont lumineux : pour du texte de ces couleurs, il faut monter plus haut dans les nuances que pour le bleu ou le violet.

## Couleurs des matières

Chaque matière garde la même teinte partout : carte de l'accueil, encadré du sujet dans le tuteur, flashcards, statistiques et espace Parents. Les cartes de matière sont pleines, en dégradé de trois nuances de la teinte (du clair en haut à gauche au foncé en bas à droite), avec le texte et le picto en blanc et le picto repris en grand filigrane.

| Matière | Token | Dégradé des cartes | Texte sur blanc | Fond doux |
| --- | --- | --- | --- | --- |
| Maths | `subject-maths` (`red-500`) | `red-400` → `red-600` → `red-700` | `red-600` | `red-100` |
| Français | `subject-francais` (`blue-500`) | `blue-400` → `blue-600` → `blue-700` | `blue-600` | `blue-100` |
| Histoire-Géo | `subject-histoire-geo` (`green-700`) | `green-600` → `green-700` → `green-800` | `green-800` | `green-100` |
| Physique-Chimie | `subject-physique-chimie` (`violet-500`) | `violet-400` → `violet-600` → `violet-700` | `violet-600` | `violet-100` |
| SVT | `subject-svt` (`orange-700`, brun) | `orange-700` → `orange-800` → `orange-900` | `orange-800` | `orange-100` |
| Anglais | `subject-anglais` (`cyan-700`) | `cyan-600` → `cyan-700` → `cyan-800` | `cyan-800` | `cyan-100` |

- **Le rouge des Maths est une couleur de matière, pas une erreur.** Il ne sert jamais à signaler une mauvaise réponse : une réponse fausse passe en orange doux.
- **Jeu** : la série (`streak`, `orange-500` plein, sans dégradé, texte blanc en gras), le niveau (`level`, ardoise `gray-600`) et la jauge d'XP (`xp`, `green-500`) ont leurs propres couleurs, distinctes de celles des matières.

## Écarts validés dans l'app

Ces choix ont été validés sur les maquettes de l'application et priment sur les règles générales plus haut :

1. **Texte blanc sur l'orange vif** (`orange-500`), uniquement sur les encadrés de jeu (série, carte « À retravailler », alerte Parents), en gras.
2. **Titres en Black (900)** sur les écrans et les cartes en couleur, avec trois exceptions en Bold ou Medium : « Révision du jour » (700), la carte « Reprendre » de l'accueil (500) et les titres de sujet du tuteur (700).
3. **Espace Parents coloré** comme l'espace élève (dégradés, chiffres sur fond coloré, 24px entre les blocs), sans gamification.
4. **L'appel vocal est plein écran**, sur le dégradé de marque et sans barre de navigation : on en sort par « Écrit » ou « Raccrocher » (validé le 7 octobre 2026 ; avant, la barre restait visible).
5. **Flashcards en QCM** : quatre réponses en grille 2×2, sans boutons d'auto-évaluation ; le bouton « C'est parti » est en violet vif.
6. **Pas de date sur l'accueil** : une citation courte en italique discret la remplace sous le bonjour.
7. **Rouge pour « Je t'écoute… »** dans l'appel vocal : il signale l'écoute, comme un voyant d'enregistrement, jamais une erreur (orange possible).
8. **Violet et azur pour les visuels du tuteur** : le graphique est violet, le tableau azur (tuile, surtitre, carte teintée), pour les distinguer de la carte du chapitre ; le dessin reste sur une feuille blanche, le tableau sans grille de points.
9. **Objectif du jour en violet → bleu** (`GoalCard`) : le dégradé de la marque glisse lentement d'un bout à l'autre de la carte ; le vert, trop proche de la carte Histoire-Géo juste en dessous, est abandonné.
10. **Le chat libre en couleurs** (v2.12) : la carte du sujet du tuteur prend le dégradé de sa matière (`TopicCard`), bleu de l'élève pour « Toutes les matières », au lieu d'une carte blanche ; une discussion libre encore vide propose quatre idées de départ en dégradés d'accent (`ChatStarters`).
11. **Le bilan des flashcards en violet → bleu** (`SessionComplete`, v2.12) : comme l'objectif du jour, il quitte le vert d'Histoire-Géo pour le dégradé de la marque.
12. **Jaune pour « Pas de connexion »** (`OfflineNotice`, v2.19.1, demande de Romain) : `#FFD43B`, hors des 8 teintes de la palette, texte `orange-900`. C'est le seul jaune de l'app : il signale une coupure réseau, jamais une erreur de l'élève.

## Connexion, inscription et onboarding

- **Deux couleurs, deux espaces.** Tout ce qui concerne l'élève est en bleu (`primary`, dégradé des cartes Français) et le tutoie ; tout ce qui concerne les parents est en violet (`accent`, dégradé Physique-Chimie) et les vouvoie. L'écran de bienvenue les présente côte à côte, sans autre texte que « Je suis élève » et « Je suis parent ».
- **L'élève est autonome.** Il peut créer son compte et se connecter seul. Le code parent (6 chiffres, valable 24 h) relie les deux comptes ; depuis la v2.7, ce n'est plus un champ de la connexion mais un lien « J'ai un code de mon parent » sous le formulaire, qui ouvre sa saisie (L7) : le code est gardé (bandeau vert sur la connexion) puis relié dès la connexion. Il peut aussi être ajouté plus tard (« Relier mon compte à un parent », par code ou par e-mail). Si l'élève indique avoir moins de 15 ans, on demande l'e-mail d'un parent pour valider le compte ; en attendant, le tuteur est en attente (`ConsentPendingCard`) et les flashcards restent ouvertes.
- **Connexion plein écran (v2.7), tout le compte en v2.11.** Les écrans de compte reprennent l'univers de l'appel vocal : le dégradé de l'espace couvre tout l'écran, le logo du tuteur, dans son disque blanc, fait un petit rebond pour dire bonjour, et le formulaire est dans une feuille blanche qui monte du bas (`AuthScreen`). Les champs y sont remplis (`TextField` `filled`), comme tout ce qui est rangé dans une carte blanche. Depuis la v2.11, c'est vrai de la connexion, de l'inscription élève et parent, du mot de passe oublié, de la vérification de l'e-mail et de l'accord parental. L'écran de bienvenue (L1) ne change pas.
- **Un code se tape dans des cases** (`CodeInput`, v2.11) : six cases en deux groupes de trois, le curseur clignote dans la case en cours, le code reçu par e-mail se propose au-dessus du clavier. Le bouton qui valide vient juste dessous, jamais au bas de l'écran.
- **Un nouveau mot de passe se tape deux fois** (v2.11, demandé par Romain) : règles en pastilles (`PasswordRules` `pills`), puis « Confirme le mot de passe » et la pastille `PasswordMatch` (« Les deux sont identiques »). Une règle pas encore suivie est grise, jamais rouge.
- **Formulaire d'abord, Apple et Google ensuite.** Les champs e-mail et mot de passe viennent en premier, puis le séparateur « ou continuer avec » et les boutons Apple / Google, empilés en pleine largeur. Dans l'app, ces boutons sont les boutons officiels des SDK.
- **Onboarding en quatre étapes, toutes passables** : classe, auto-évaluation par matière (« Galère », « Bof », « Ça va », « À l'aise », jamais présentée comme une note), objectifs et temps par jour, façon d'apprendre et moment de révision. Il se termine sur un plan personnalisé qui commence par la matière la moins à l'aise.

## Profil de l'élève

- **On y arrive en touchant son rond sur l'accueil.** Il reprend le bandeau de marque bleu (`ProfileHero`) : le prénom en grand, la classe, et la figurine de l'élève à droite, avec le bouton de bois « Modifier l'avatar » (pastille orange quand la garde-robe a des nouveautés).
- **Un résumé qui donne envie** (`ProfileSummary`) : trois chiffres centrés sous leur icône en dégradé (série, étoiles, temps de la semaine), puis la barre de niveau (`LevelBar`). Puis les trophées dans une armoire de bois (`TrophyShelf`, médailles dorées sur une étagère, les gagnées d'abord, la prochaine sous cadenas).
- **Le reste en cartes** : Ma famille (parents reliés, « Lien depuis le 2 septembre », sans « Retirer » : ce n'est pas à l'élève de défaire le lien ; phrase de transparence « Jamais tes conversations », « Relier un autre parent » en violet), Préférences et Compte et données (`SettingRow`).
- **Deux boutons à part, en bas** : « Se déconnecter » en bleu doux (`Button` `soft`) puis « Supprimer mon compte » en rouge doux (`Button` `danger`). Le rouge reste réservé à la seule action qui efface ; il ouvre la confirmation (`ConfirmDialog`, v2.16). Seule exception : « Refuser » une demande de liaison, côté parent (v2.18).
- **Le côté jeu garde son style partout** (v2.10) : ce qui relève du jeu (l'avatar, les trophées) reprend le HUD d'Explorer même hors de l'onglet, avec le bois (`WoodButton`, `WoodFrame`) et la police Lilita One (`GameText`, `--font-game`). Le reste du profil garde les cartes blanches de la marque.

## Explorer

- **Une île = une matière.** L'onglet Explorer (boussole dans la barre du bas, ex-« Parcours ») s'ouvre sur un carrousel d'îles flottantes. Chaque île est découpée en **régions** (thèmes du programme), puis en **villes** (chapitres), puis en **niveaux**.
- **Trois types de niveaux, trois couleurs, trois icônes.** Leçon en vert avec un livre, exercices en bleu avec un crayon, évaluation en rouge avec une couronne. L'évaluation ferme chaque ville : son point est plus grand et entouré d'un double anneau. La couleur n'est jamais le seul repère, l'icône et le libellé l'accompagnent.
- **États d'un niveau** : terminé (coche et 0 à 3 étoiles), en cours (halo pulsé et avatar de l'élève au-dessus) et verrouillé (gris avec cadenas). Le chemin est orange jusqu'au niveau en cours, gris ensuite.
- **Chaque point lance un chat, sans quitter Explorer.** La fiche du niveau propose « À l'écrit » ou « À la voix » (le dernier mode utilisé en premier). La leçon se déroule dans le HUD de jeu (v2.13) : le ciel d'Explorer (`LevelBackdrop`), l'en-tête du niveau en Lilita One avec sa progression (`LevelHeader`) et le tableau du tuteur en ardoise dans un cadre de bois (`SlateBoard`) ; elle ne renvoie jamais vers l'onglet Tutor'IA.
- **À l'écrit (X4a)**, la discussion garde les bulles de l'onglet Tutor'IA dans un cadre clair cerné de bleu nuit, avec la saisie en bas (`ChatInput` `game`) ; l'ardoise, épinglée au-dessus, se replie ; chaque étape réussie s'affiche en bandeau vert de jeu (`LevelStepCard`).
- **À la voix (X4b)**, le logo du tuteur flotte sur le ciel et rebondit (`VoiceAvatar`), sa pastille d'état est cernée de bleu nuit (`VoiceStatus` `hud`), les sous-titres sont dans une bulle de dialogue (`CaptionBubble`) et les commandes sur une planche de bois (`WoodCallDock`). À l'oral rien n'est jugé : ni progression ni étoiles, et raccrocher ramène à la carte.
- **Le tuteur change de comportement selon le type.** Leçon : il explique, montre des exemples et vérifie la compréhension. Exercices : il laisse chercher et donne des indices progressifs. Évaluation : il est exigeant, ne donne ni indice ni correction pendant l'épreuve et corrige seulement dans le bilan.
- **Quitter une partie commencée (X4c)** demande d'abord, sur un panneau de bois (`WoodDialog`) : la progression du niveau n'est pas gardée, une évaluation est à recommencer. « Continuer » (vert) est l'action conseillée.
- **Bilan de fin de niveau (X5a, X5b, v2.14)** : un panneau de bois posé sur la leçon (`LevelResultPanel`), avec le ruban « type · verdict », « Bien joué, Léa ! » ou « Presque, Léa ! », trois étoiles (or ou bois creusé), le score et l'XP gagnée, puis ce que tu as travaillé, ou la leçon à revoir avec « Retour à la carte » et « Revoir la notion ». Une évaluation sous 70 % met la ville « à consolider » au lieu de la bloquer.
- **La scène est en 3D dans l'app** (l'île, la carte, l'eau, les nuages et l'avatar qui marche) : pour le carrousel des îles, la carte et la fiche d'un niveau (X1 à X3b), le code fait foi ; les maquettes plates du canevas datent d'avant le HUD de jeu.

## Appel vocal

- **Un vrai écran d'appel.** Le tuteur vocal occupe tout l'écran sur le dégradé de marque (`blue-500` → `blue-800`, à 170°), tout en blanc, sans barre de navigation. En haut, « Écrit » et le chrono (`CallTopBar`) ; en bas, les commandes en verre (`CallDock`).
- **Le tuteur a un visage.** Son logo, dans un disque blanc (`VoiceAvatar`), rebondit quand il parle, au niveau de sa voix, et se pose à chaque pause ; quand c'est à l'élève, il s'arrête et penche la tête. Toucher le logo interrompt le tuteur. Pas de barres ni d'ondes.
- **Une pastille dit qui a la parole** (`VoiceStatus`) : verte « Je t'explique… », rouge « Je t'écoute… », neutre pour le micro coupé, la connexion ou la fin d'appel.
- **Sous-titres en direct** (`LiveCaptions`), activés par défaut : les mots s'allument au fil de la voix ; une couleur nommée par le tuteur s'affiche dans une pastille de sa couleur.
- **Avec un graphique ou un tableau blanc**, le visuel prend la moitié haute dans sa carte teintée (`VisualPanel` `elevated`), le logo passe à 96 px dessous. La voix et le visuel avancent ensemble : la courbe nommée s'épaissit (`MathGraph` `focus`), le tableau s'écrit ligne à ligne avec un stylo (`Whiteboard` `progress` et `writing`), puis le résultat s'entoure.

## Tuteur et révisions

- **L'onglet Tutor'IA ouvre une discussion libre neuve** (v2.12) : « Toutes les matières », un mot d'accueil du tuteur, les quatre idées de départ et « Pose ta question… ». En tête, ☰ ouvre le volet « Tes discussions » (`ConversationDrawer`, rangé par jour) et + en commence une nouvelle ; au milieu, la bascule Écrit / Vocal.
- **La photo d'un exercice** : le bouton photo de la saisie (`ChatInput`) ouvre le choix appareil ou galerie (`PhotoSourceDialog`), la photo se pose en aperçu dans la saisie, puis part dans la bulle de l'élève (`ChatBubble` `image`). Le bouton n'apparaît pas si un parent a coupé la caméra, hors connexion ni pendant une évaluation. Quand le tuteur reconnaît la matière, la carte du sujet prend sa couleur.
- **Une session de flashcards se fait sans barre de navigation**, comme l'appel vocal. Avant la réponse, le bouton dit « Choisis une réponse » en gris (jamais un bouton estompé) ; après, il passe en violet « Carte suivante » (`NextCardButton`). Le retour porte une pastille : coche sur vert, flèche sur orange. Jamais de rouge.
- **Le bilan d'une session** (`SessionComplete`) montre les compteurs, les XP gagnés et l'objectif du jour, puis « Recommencer » et « Choisir un autre chapitre ».

## Règles des parents, côté élève

- **Une pause est un message bienveillant, jamais une punition** (v2.15). Le soir après 21 h, hors de la plage horaire ou quand le temps du jour est atteint (réglages de P4), le tuteur, les flashcards et les niveaux d'Explorer attendent ; les stats, le profil et la carte restent ouverts. L'écran (`StudyPauseScreen`) reprend C1 : fond de marque, le logo du tuteur avec un badge (lune, horloge, trophée), le titre et le texte sur le bleu, un bouton blanc « Revenir à l'accueil ». Le temps du jour atteint félicite d'abord dans une carte verte, puis propose aussi « Voir mes progrès ».
- **Dans Explorer**, la pause reste dans le jeu : panneau de bois (`WoodDialog`) sur un ciel de nuit (`LevelBackdrop` `night`) et « Revenir à la carte ».
- **Appels du jour faits** : pastille « Appels du jour terminés » (`VoiceStatus` `limit`), le message en clair, un seul bouton blanc « Continuer à l'écrit ».
- **Vocal ou caméra coupés par un parent** : « Vocal » reste visible, grisé avec un cadenas (`ModeToggle` `voiceLocked`) ; le toucher explique pourquoi. Le bouton photo reste masqué.
- **Compte à valider** (moins de 15 ans) : sur l'Accueil et le Profil, la carte violette « Un parent doit valider ton compte » et « Relier un parent ».

## Données et confidentialité

- **Dire ce qui est partagé, en listes** (v2.16). La page Confidentialité de l'élève (ligne « Confidentialité » du Profil) range les mêmes textes en cartes (`PrivacyCard`) : une coche verte pour ce que voient les parents (temps de travail, progrès par matière, un court résumé), un cadenas pour ce qui reste privé (« Jamais tes conversations avec le tuteur »), la durée de conservation en pastilles (« 6 mois, puis effacés », « Jamais enregistrées »). « Tes droits » porte les actions : « Télécharger mes données », « Supprimer mon compte ».
- **Les écrans parents restent violets**, même pour les données : bandeau violet comme les Réglages (P4), ce que Tutor'IA garde en pastilles violettes cochées, boutons violets doux (`Button` `vividSoft`). L'enfant a sa carte (`ChildDataCard`) : son accord, « Retirer le lien », et la suppression à part, sous un trait, avec son explication.
- **Supprimer, c'est toujours le choix sûr d'abord** (`ConfirmDialog`) : une corbeille, ce qui sera effacé, « Garder mon compte » en bouton principal, la suppression en second, en rouge doux, et « Télécharger mes données d'abord ».
- **Supprimer le compte d'un enfant demande une case** : « Je comprends que c'est définitif. » active le bouton rouge plein (`Button` `dangerSolid`) ; c'est le seul rouge plein de l'app.

## Famille

- **Ajouter un enfant reste dans l'espace Parents** (v2.18) : bandeau violet et « Ajouter un enfant » (pas « Étape 2 sur 2 », qui ne vaut qu'à l'inscription). Le prénom (`TextField` `filled`) et la classe (`GradePicker` `filled`, ton parents, groupée Primaire, Collège, Lycée) tiennent dans une carte posée sur le bandeau (`shadow-lift-parents`), puis un rappel des enfants déjà reliés (« Déjà dans votre famille : Léa, 4e ») et « Créer le profil de Tom ».
- **Le titre dit ce qui vient de se passer** : « Le profil de Tom est prêt ». Puis la carte du profil avec « Modifier », le code à partager (`ParentCodeCard`), ce que l'enfant fait sur son téléphone (`StepList` `plain`, « J'ai un code de mon parent ») et « Terminé », qui revient aux Réglages.
- **Modifier un profil, c'est le même formulaire** prérempli, sous « Modifier le profil de Léa », avec « Enregistrer ».
- **Choisir l'enfant affiché dans une feuille du bas** (`ChildPickerSheet`) : la classe et le temps de la semaine de chacun, l'enfant affiché en violet, « Ajouter un enfant » en pointillés.
- **La demande de liaison** (`LinkRequestCard`) garde la carte violet doux de l'app ; seul « Refuser » passe en rouge doux (`Button` `danger`) pour ne pas se confondre avec « Accepter ». C'est la seule exception à la règle « le rouge est réservé à ce qui efface ».

## Premiers jours et hors connexion

- **Le premier jour, l'Accueil invite au lieu de compter** (v2.19) : « Ta série commence aujourd'hui » (`StreakCard` à 0 jour), la carte « Ta première séance » (`ResumeCard` `first` : la leçon, « 10 min », « D'après ton parcours », « Commencer »), « Une séance pour lancer ta journée » (`GoalCard` à 0) et « À découvrir » sous chaque matière (`SubjectCard` `fresh`). Pas de 0 %, ni de « Reprendre » sur une leçon jamais ouverte.
- **Les Stats du premier jour et la semaine sans séance d'un parent gardent l'écran de l'app** (décision de Romain).
- **Espace Parents sans enfant** : « Bienvenue dans l'espace Parents », la carte posée sur le bandeau (`AddChildCard` : trois étapes, « Ajouter un enfant ») et ce que le parent verra chaque semaine (`FeatureList`, avec « Jamais ses conversations avec le tuteur »).
- **Hors ligne, juste un message** (`OfflineNotice`) : jaune, dans la conversation, sous la question de l'élève qui n'est pas partie : « Pas de connexion », « Vérifie ton Wi-Fi ou tes données mobiles. » et un bouton rond pour réessayer. Pas d'entraînement de remplacement : la discussion reste, la question attend.
- **Pas de réseau au premier lancement** (`OfflineScreen`) : l'écran de marque de la pause, le tuteur avec un badge sans réseau, « Réessayer » en blanc, une aide et « Changer de compte » en lien. Texte neutre, ni « tu » ni « vous ».
- **« Bientôt disponible » dans une feuille du bas** (`ComingSoonSheet`), sur l'écran d'où l'on vient : la pastille « Bientôt », ce qui arrive vraiment (une ligne par sujet) et un bouton pour continuer.

## Composants

Les 128 composants de l'app sont dans `components/` et exposés par `window.TutorIA` (React 18). Chacun a sa fiche (README et aperçu en direct) ; les props sont typées dans `components/index.d.ts`.

- **Fondations** : `Icon`, `Logo`, `StatusChip`, `ProgressRing`, `Quote`.
- **Actions** : `Button`, `IconButton`, `SegmentedControl`, `Switch`, `GoalStepper`.
- **Navigation** : `BottomNav` (élève avec Explorer, et Parents), `ModeToggle` (écrit / vocal), `ChildSwitcher`.
- **Élève** : `SubjectCard`, `StreakCard`, `LevelCard`, `ResumeCard`, `GoalCard`.
- **Tuteur** : `TopicCard`, `ChatBubble`, `TipCard`, `ChatInput`, `ChatStarters`, `VisualChip`, `ConversationDrawer`, `PhotoSourceDialog`, `PanelHeader`, `VisualPanel`, `MathGraph`, `Whiteboard`, `OfflineNotice`, et pour l'existant du code `VoiceVisualizer` et `CallControls`.
- **Appel vocal** : `CallTopBar`, `VoiceAvatar`, `VoiceStatus`, `LiveCaptions`, `CallDock`.
- **Flashcards** : `DailyReviewCard`, `ChapterRow`, `SessionProgress`, `AnswerOption`, `QuizCard`, `NextCardButton`, `TallyChips`, `SessionComplete`.
- **Stats** : `KpiCard`, `BarChart`, `LineChart`, `Heatmap`, `SubjectProgressRow`, `InsightList`.
- **Parents** : `HeroCard`, `AlertCard`, `AdviceCard`, `SubjectProgressCard`, `SessionSummaryCard`, `SettingRow`, `ChildDataCard`, `ChildPickerSheet`, `LinkRequestCard`, `AddChildCard`, `FeatureList`.
- **Profil** : `ProfileHero`, `ProfileSummary`, `LevelBar`, `TrophyShelf`, `TrophyBadge`.
- **Jeu** : `GameText`, `GameButton`, `WoodButton`, `WoodFrame`, `Parchment`, `WoodDialog` (le bois, les boutons en relief et la police Lilita One du HUD d'Explorer).
- **Connexion et compte** : `ProfileChoiceCard`, `SubjectCluster`, `AuthScreen`, `AuthHero`, `TextField`, `PasswordRules`, `PasswordMatch`, `CodeInput`, `SwitchField`, `Checkbox`, `OrDivider`, `AuthProviderButtons`, `HelpCard`, `InlineNotice`, `ConsentPendingCard`, `StudyPauseScreen`, `OfflineScreen`, `ComingSoonSheet`, `ConfirmDialog`, `PrivacyCard`, `ParentCodeCard`, `StepList`.
- **Onboarding** : `StepHeader`, `GradePicker`, `SelfAssessmentRow`, `GoalTile`, `DurationPicker`, `ChoiceRow`, `ToggleChip`, `PlanRow`.
- **Explorer** : `IslandIllustration`, `IslandCarousel`, `IslandProgressCard`, `ExplorerHud`, `WorldMap`, `LevelNode`, `MapAvatar`, `CityBanner`, `RegionSign`, `Stars`, `LevelTypePill`, `LevelSheet`, `LevelBackdrop`, `LevelHeader`, `SlateBoard`, `LevelStepCard`, `CaptionBubble`, `WoodCallDock`, `LevelResultPanel`, et les anciens `IslandBackdrop`, `LevelProgressHeader`, `VoiceBoardCard`, `LevelResultCard`, `TutorFeedback`.

Les matières s'identifient partout par le même identifiant : `maths`, `francais`, `histoire-geo`, `anglais`, `svt`, `physique-chimie`. `TutorIA.SUBJECTS` donne pour chacune son nom, son dégradé et ses nuances. Les types de niveau s'identifient par `lecon`, `exercices` et `evaluation` ; `TutorIA.LEVEL_TYPES` donne leur libellé, leur icône et leurs couleurs.
