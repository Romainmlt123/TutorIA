# Feuille de route — Tutor'IA

Le fil rouge du projet : ce qu'on fait maintenant, dans quel ordre, et ce qui attend. Ce fichier fait foi pour l'ordre des chantiers. Les conventions techniques restent dans `CLAUDE.md`, et les points à régler avant la publication dans son § 11.

## Règles du fil rouge

1. **Une seule étape en cours à la fois.** La suivante ne commence qu'après la validation de Romain sur son téléphone.
2. **Une idée nouvelle ne détourne pas l'étape en cours.** Elle va dans « En attente », en bas de ce fichier. Elle n'entre dans le plan que sur décision de Romain, notée dans le journal des décisions.
3. **Une étape est terminée quand :**
   - `npm run check` passe ;
   - les écrans sont vérifiés sur le web en 390 px et sur le Pixel via Expo Go ;
   - Romain l'a validée ;
   - elle est commitée, à la demande de Romain ;
   - ce fichier est à jour (statut, date, décisions).
4. **Avant de coder une étape**, son contenu est relu ici. S'il faut s'en écarter, on le dit à Romain et on corrige ce fichier d'abord.

## Où on en est — 7 octobre 2026

| Chantier      | Étape                                                                         | Statut      | Branche               |
| ------------- | ----------------------------------------------------------------------------- | ----------- | --------------------- |
| Explorer      | X1 · les îles                                                                 | ✅ validé   | `feat/explorer-3d`    |
| Explorer      | X2a · les régions de l'île                                                    | ✅ validé   | `feat/explorer-3d`    |
| Explorer      | X2b · la carte d'une région (art de la région Nombres)                        | ✅ validé   | `feat/explorer-3d`    |
| Avatar        | Figurine, visage et atelier `/dev/avatars`                                    | ✅ validé   | `feat/avatar`         |
| Avatar        | A1 · l'éditeur « Crée ton avatar »                                            | ✅ validé   | `feat/avatar`         |
| Avatar        | A2 · l'avatar sur la carte                                                    | ✅ validé   | `feat/avatar`         |
| Avatar        | **A3 · la garde-robe**                                                        | ✅ validé   | `feat/avatar`         |
| Avatar        | A4 · l'avatar dans Supabase                                                   | ✅ validé   | `feat/avatar-en-base` |
| Explorer      | **X3 à X5b · fiche, discussion et bilan d'un niveau**                         | ✅ validé   | `feat/avatar`         |
| Explorer      | La suite (art des régions, contenu, allègement…)                              | ⏸️ en pause |                       |
| Tuteur visuel | **V1 à V3 · graphiques, statistiques, géométrie et tableau blanc, à l'écrit** | ✅ validé   | `feat/tuteur-visuel`  |
| Tuteur visuel | V4 · les visuels à la voix                                                    | à venir     |                       |
| Chat libre    | **C1 à C3 · historique, nouvelles discussions, titres, volet**                | ✅ validé   | `feat/chat-libre`     |
| Chat libre    | **C4 · la photo d'un exercice**                                               | ✅ validé   | `feat/photo-exercice` |
| Interface     | **v2.5 · bandeau de marque et cartes de section**                             | ✅ validé   | `feat/interface-v2-6` |
| Interface     | v2.6 · l'appel vocal plein écran                                              | à venir     | `feat/interface-v2-6` |

`feat/explorer-3d`, `feat/avatar` et `feat/avatar-en-base` sont fusionnées dans `dev` (pull requests #5 et #6, le 07/10).

## Chantier 1 · L'avatar de l'élève (phase 1, sans achat)

**Principes validés :**

- Chaque élève a **sa** figurine, façon Mii : il n'y a pas de mascotte commune.
- La figurine est faite maison dans Blender (`tools/avatar-3d/`), dans la direction artistique validée.
- Les vêtements et accessoires se **gagnent en progressant**, et rien ne s'achète.
- **Aucune donnée personnelle :** l'élève compose sa figurine à la main, sans photo, et rien n'est envoyé à OpenAI.
- Une apparence enregistre des rangs dans les palettes et des noms de formes (`AvatarLook`), toujours relus par `normalizeLook`.

### A1 · L'éditeur « Crée ton avatar » — validé le 02/10

- **L'écran,** dans le HUD de jeu d'Explorer (ciel, boutons en relief, panneau de bois), pour que le côté jeu de l'app garde la même direction artistique :
  - la figurine en 3D en haut, qu'on tourne au doigt ;
  - quatre onglets : **Visage**, **Cheveux**, **Corps** et **Tenue** ;
  - la caméra cadre le visage pour Visage et Cheveux, la figurine en pied pour Corps et Tenue.
- **Les choix :**
  - **Visage :** forme et couleur des yeux, écart et hauteur des yeux, sourcils, nez, bouche, joues roses, taches de rousseur ;
  - **Cheveux :** 8 coiffures et 12 couleurs ;
  - **Corps :** 10 teintes de peau, la taille et la **carrure** (nouvelle) ;
  - **Tenue :** les couleurs du t-shirt, du short et des baskets. Les autres vêtements arrivent avec A3.
- **Les actions :**
  - « Au hasard » propose une figurine complète ;
  - « Enregistrer » garde la figurine, qui salue ;
  - quitter sans enregistrer demande une confirmation.
- **Les accès :**
  - depuis le profil ;
  - proposé **une seule fois**, à la première visite d'Explorer, avec « Plus tard ».
- **L'enregistrement :**
  - sur l'appareil, **par compte**, pour que deux élèves sur le même téléphone aient chacun le leur ;
  - derrière un service `avatarService`, qu'A4 branchera sur Supabase sans toucher à l'écran.
- **L'accessibilité :**
  - boutons de 48 px avec leurs libellés ;
  - « Réduire les animations » fige la figurine ;
  - sans WebGL, tous les choix restent possibles, mais sans aperçu 3D.
- **Les retouches de la figurine :**
  - l'encoche sous les bras du t-shirt ;
  - des baskets qui ne ressemblent plus à des bottines ;
  - le regard « endormi » qui paraît grognon avec les sourcils « décidé » ;
  - la carrure, qui manque encore.
- **Terminé quand :** Romain a validé l'éditeur sur le Pixel.

### A2 · L'avatar sur la carte — validé le 06/10

- Dans X2b, la figurine de l'élève remplace le pion :
  - elle marche le long du chemin jusqu'au niveau en cours ;
  - elle saute en arrivant ;
  - elle salue quand on entre dans la région ;
  - elle reste immobile avec « Réduire les animations ».
- Le chemin et les points de niveau sont refondus pour aller avec la figurine et le décor : selon Romain, ils jurent avec le reste de la carte.
- Tant qu'aucune figurine n'est enregistrée, la carte en montre une par défaut, et l'éditeur reste proposé.

### A3 · La garde-robe — validée le 06/10

- Une quinzaine de vêtements et d'accessoires, **gagnés en progressant**. Exemples retenus :
  - une casquette au premier bilan ;
  - un sac à dos à la première ville validée ;
  - des lunettes à 10 étoiles ;
  - une écharpe après 7 jours de série ;
  - un chapeau d'explorateur à la première région ;
  - un sweat à capuche à 25 étoiles.
- Dans l'onglet Tenue, un objet pas encore gagné montre ce qu'il faut faire pour l'obtenir (« Valide ta première ville »). Ce n'est jamais présenté comme un échec.
- Un petit moment de fête accompagne chaque objet gagné.
- Les nouvelles pièces sont ajoutées dans `avatar.py` : vêtements qui suivent le corps, et accessoires portés par la tête ou le dos.
- **Plan validé le 06/10, en deux livraisons :**
  1. le mécanisme complet et les six objets ci-dessus (validée le 06/10) ;
  2. neuf autres objets (validée le 06/10) : bandana (premier niveau), bonnet (5 étoiles), pantalon (2 villes), bottes de pluie (15 étoiles), jupe (3 villes), salopette (5 villes), cape (série de 14 jours), lunettes de soleil (50 étoiles), couronne (une ville avec 3 étoiles à chaque niveau).
- Sous un couvre-chef, les cheveux sont tassés sous la calotte (forme « chapeau » de chaque coiffure) : la coiffure reste visible sous le bord, au lieu d'être remplacée par la coiffure courte comme prévu d'abord.

### A4 · L'avatar dans Supabase

- **Prérequis :** la migration `level_progress` d'Explorer, car les objets se gagnent sur la progression enregistrée en base (appliquée en ligne le 06/10).
- L'apparence et les objets gagnés sont enregistrés en base :
  - les objets gagnés sont calculés par l'app, à partir de la progression protégée en base (seul le serveur écrit `level_progress`), puis enregistrés en base et gardés pour toujours ; l'élève ne choisit que parmi les siens. Le calcul par la base attendra la phase 2 (achats) ;
  - les parents ne voient pas l'avatar ;
  - la figurine de l'appareil est reprise à la première connexion ;
  - l'export des données et la suppression du compte incluent l'avatar.
- La migration est montrée à Romain avant d'être appliquée en ligne.

### Phase 2 · Les achats (plus tard, sur décision de Romain)

- Une revue juridique d'abord : mineurs, règles Apple et Google Play « Familles ».
- Un achat ne se fait que **par le parent**, avec un prix affiché en euros.
- Il n'y a ni coffre à surprise (loot box) ni monnaie virtuelle.
- Rien de ce qui s'achète ne donne d'avantage pour apprendre.

## Chantier 2 · Explorer (suite) — en pause depuis le 07/10

Romain met Explorer en pause : chaque essai d'art attend de longues cuissons Blender. On y reviendra dans cet ordre, à partir du point 5. Le plan détaillé reste celui validé le 30 septembre :

1. **X3 / X3b · la fiche d'un niveau :** objectifs, puis « À l'écrit » et « À la voix ».
2. **X4 / X4b · la discussion de niveau,** écrite et vocale, sur le fond de l'île.
3. **X5 / X5b · le bilan :** étoiles, XP, réussi ou à revoir.
4. **La migration `level_progress`** (SQL montré d'abord), qui remplace la progression simulée : faite avec X3 à X5, appliquée en ligne le 06/10.
5. **L'art des autres régions :** Données, Espace et Algorithmique (9 monuments).
6. **Le contenu :** les exercices générés par IA doivent être relus par un enseignant (référentiel v0.7), et il manque 14 évaluations « Bilan ». Avant cette relecture, aucune autre ville que les Équations n'ouvre.
7. **L'allègement :**
   - l'île pèse 1,98 Mo, pour un budget de 1,5 ;
   - les cartes de région doivent être téléchargées à la demande. Cela demande `expo-file-system`, donc un nouveau build EAS.
8. **Les autres îles,** une par matière.
9. **Les builds EAS,** une fois tout l'onglet Explorer terminé, comme Romain l'a demandé.

## Chantier 3 · Le tuteur visuel (maquettes 2C à 2F)

**Principes validés le 07/10 :**

- Le tuteur ne dessine pas : il **décrit** un visuel par un appel d'outil (graphique, statistiques, figure de géométrie, tableau blanc). Le serveur valide et modère cette description ; l'app la dessine avec ses propres composants, dans la charte (couleurs du thème, Satoshi, formules MathJax). Jamais d'image générée.
- Le dernier visuel s'affiche dans un panneau repliable au-dessus de la discussion (maquettes 2C et 2E), dans l'onglet Tutor'IA comme dans les niveaux d'Explorer.
- Le visuel est gardé avec le message (même conservation, jamais lu par les parents), pour que le tuteur s'en souvienne.
- Si un parent a désactivé les visuels (P4), le tuteur n'a pas ces outils.
- Aucune nouvelle dépendance : `react-native-svg`, Reanimated et MathJax suffisent.

**Les étapes :**

1. **V1 · le serveur :** les quatre outils, leur validation et leur modération, la consigne pédagogique, l'événement `visual` du flux, et la migration `messages.visual` (SQL montré d'abord).
2. **V2 · les composants :** le panneau, le graphique (droites et courbes), les statistiques (barres, secteurs), la figure de géométrie et le tableau blanc, visibles dans `/dev/catalogue` ; le tuteur simulé dessine aussi.
3. **V3 · dans la discussion :** le panneau réduit, agrandi en plein écran, et les pastilles « Voir » sur les messages → validation de Romain sur le Pixel.
4. **V4 · à la voix (2D, 2F) :** les visuels dessinés en direct. À la voix, les appels d'outils arrivent sur le téléphone sans passer par le serveur : à reprendre avec la surveillance du vocal (§ 11 du CLAUDE.md).

## Chantier 4 · Le chat libre

**Principes validés le 07/10 :**

- L'onglet Tutor'IA devient un vrai chat libre, comme ChatGPT : l'élève pose une question spontanée ou demande de l'aide sur un exercice de classe.
- Un volet glissant garde ses discussions (Aujourd'hui, Hier, 7 derniers jours, Plus ancien). Il permet d'en ouvrir une nouvelle, d'en rouvrir une, ou d'en supprimer une après confirmation.
- Une nouvelle discussion part sur toutes les matières. Après le premier échange, le modèle lui donne un titre (modéré, à défaut le début de la question) et reconnaît sa matière, dans le même appel (décision du 07/10, à la place des pastilles de matière).
- « Reprendre » rouvre la dernière discussion du chapitre affiché sur l'Accueil, ou en ouvre une nouvelle.
- Les parties des niveaux d'Explorer n'entrent pas dans le volet.
- Les parents ne voient jamais les discussions.

**Les étapes :**

1. **C1 · la base :** titre des discussions, suppression par l'élève (avec ses messages), et purge des discussions vides au bout de 6 mois. C'est la migration `free_chat`, testée en local, avec SQL montré à Romain avant de l'appliquer en ligne.
2. **C2 · le serveur :** le sujet facultatif (`subjectId`, `chapterId`), la consigne du chat libre, le titre (`server/tutor/title.ts`). Une discussion reprise garde le sujet de sa séance. Après 30 minutes de silence, elle ouvre une nouvelle séance.
3. **C3 · l'app :** le service des discussions, le volet, « Reprendre », et l'identifiant de discussion tenu par l'écran (plus par le service du tuteur) → validation de Romain sur le Pixel.
4. **C4 · la photo d'un exercice :** l'élève photographie son exercice (ou le choisit dans sa galerie) dans la discussion écrite de l'onglet Tutor'IA, et dans les leçons et exercices d'Explorer, jamais en évaluation. La photo est modérée, envoyée au modèle, et jamais gardée : une mention la remplace, et le tuteur recopie l'énoncé dans sa réponse pour s'en souvenir.

## Chantier 5 · L'interface v2.5 et v2.6

Maquettes validées par Romain le 07/10 (`design/`, entrées 16 à 23 des écarts).

1. **v2.5 · bandeau de marque et cartes de section :** tokens `screenBand`, `sectionTitle`, `goal` et `voiceCall` exportés par le générateur ; composants `ScreenBand` et `SectionCard` ; Accueil et Flashcards · Choix en bleu, Stats et espace Parents (P1 à P4) en violet ; titres de section de 22 px dans leur carte ; objectif du jour en vert.
2. **v2.6 · l'appel vocal plein écran (2B, 2D, 2F) :** en-tête d'appel, logo qui rebondit selon la voix, pastille d'état, sous-titres, commandes en verre ; les visuels pendant l'appel, validés et modérés par le serveur (`/api/tutor/visual-check`).

## Journal des décisions

- **30/09 :**
  - les villes s'ouvrent selon leurs prérequis ;
  - les niveaux sont bâtis sur les capacités du référentiel ;
  - l'Algorithmique est un îlot flottant.
- **01/10 :** les régions se choisissent avec un carrousel de cartes en bois, puis un vrai zoom mène à la carte de la région.
- **02/10 :**
  - la carte et le décor de la région Nombres sont validés ;
  - le chemin, les points et le pion seront revus plus tard ;
  - un avatar personnel pour chaque élève, façon Mii, remplacera le pion ;
  - la phase 1 n'a aucun achat, et les cosmétiques se gagnent en progressant ;
  - l'ordre A1 → A2 → A3 → A4 est validé ;
  - la figurine et son visage sont validés ;
  - l'éditeur d'avatar reprend le HUD de jeu d'Explorer, et tout écran du « côté jeu » fera de même ;
  - l'éditeur (A1) est validé sur le Pixel ;
  - l'avatar n'apparaît pas encore dans la vue ville : c'est l'étape A2.
- **06/10 :**
  - la figurine sur la carte est validée ;
  - le chemin est en planches de bois (piste B) ; les points de niveau gardent leur disque coloré, avec un rebord doré et lumineux façon Mario à la place du contour bleu marine ;
  - les clairières des villes reçoivent de l'herbe et des fleurs, et la caméra de la carte descend de 62° à 52° ;
  - l'étape A2 est validée.
  - le plan d'A3 est validé : 15 objets à gagner, tous ouverts à tous, gardés pour toujours, en deux livraisons ;
  - la première livraison (six objets) est validée ;
  - la deuxième livraison (neuf objets) est validée : A3 est terminée.
  - X3 à X5 (niveaux jouables, avec la migration `level_progress`) passent avant A4 : l'avatar dans Supabase s'appuiera sur une vraie progression.
  - le plan de X3 à X5 est validé :
    - la fiche et le bilan reprennent le HUD de jeu, la discussion garde les bulles de la marque ;
    - XP d'un niveau : 10 XP la première fois qu'il est terminé, réussi ou non (la maquette X5b donne +20 XP à un bilan raté), et 10 XP par étoile ; rejouer ne rapporte que les étoiles nouvelles ;
    - une leçon à la voix compte comme une séance, sans étoiles ni validation du niveau ;
    - la maîtrise du chapitre ne bouge pas pour l'instant.
  - X3 à X5b sont livrés, à valider sur le Pixel :
    - la migration `explorer_levels` (`level_attempts`, `level_progress`, `finish_level`) est testée en local ;
    - « Le bilan de ton tuteur » montre pour l'instant les objectifs du niveau ou la leçon à revoir, sans texte écrit par le tuteur.
  - retours de Romain sur le Pixel : le parcours lui plaît ; l'avatar doit marcher jusqu'au niveau touché avant que la fiche s'ouvre, et les étoiles se placent au-dessus du niveau, façon Mario (fait) ;
  - la migration `explorer_levels` est appliquée en ligne (version `20261006135139`), avec l'accord de Romain.
  - après le premier essai du vrai tuteur, validé par Romain :
    - une réponse longue ne coupe plus la leçon : l'app n'attend que le début de la réponse, puis surveille les silences ;
    - les leçons sont enseignées comme par un professeur d'un très grand lycée (utilité dans la vie, notion, exemple résolu, question), avec le programme du niveau tiré du référentiel, et ses exercices corrigés hors leçon ;
    - les formules du tuteur sont de vraies formules (LaTeX dessiné par MathJax sur l'appareil, environ 1,5 Mo de JavaScript ajoutés à l'app).

- **07/10 :**
  - X3 à X5b sont validés par Romain sur le Pixel, avec le vrai tuteur : fiche, marche vers le niveau touché, étoiles façon Mario, leçons de grand professeur, formules MathJax, pause parentale avant d'entrer dans un niveau, clavier qui ne cache plus la saisie.
  - Prochaine étape : A4.
  - Plan d'A4 validé : objets calculés par l'app (pas de déclencheurs SQL avant la phase 2), avatar invisible pour les parents, branche `feat/avatar-en-base` tirée de `dev`.
  - La migration `avatars` est appliquée en ligne (version `20261007073406`), avec l'accord de Romain.
  - A4 est validée par Romain : sa figurine a été reprise du téléphone, et un changement fait sur le web se retrouve sur le téléphone.

- **07/10 (suite) :**
  - Explorer est mis en pause ; le chantier 3, le tuteur visuel, commence, à l'écrit d'abord, avec les statistiques et la géométrie dès le départ.
  - V1 à V3 sont validés par Romain sur le Pixel, sur `feat/tuteur-visuel` : quatre outils de dessin, migration `messages.visual` (appliquée en ligne le 07/10, version `20261007091113`, avec l'accord de Romain), composants dans la charte et panneau dans les deux discussions. Les mots d'une formule (`\text{…}`) sont écrits en Satoshi par l'app : ils gardent la police de la marque, et les accents n'exigent pas une police mathématique de plus (370 Ko).
  - Retours de Romain intégrés : une couleur d'accent par sorte de visuel, un tableau blanc net (sans points, sans cadre, sans légende) qui défile dans les deux sens, des pastilles « Voir… » unies, et le bandeau touchable même clavier ouvert.
  - Corrigé en chemin : le tuteur libre refusait les chapitres d'Explorer (`maths-relatifs`) repris par « Reprendre » ; le catalogue des chapitres les reconnaît désormais.
  - Le chantier 4, le chat libre, est validé par Romain (principes ci-dessus), sur `feat/chat-libre`, empilée sur `feat/tuteur-visuel` en attendant la fusion de la pull request #7.
  - C1 à C3 sont livrés, à valider sur le Pixel. La migration `free_chat` est appliquée en ligne (version `20261007133630`, par Romain avec `supabase db push`, après son accord).
  - Retour de Romain sur le Pixel : le clavier recouvrait la saisie du chat libre (la zone qui évite le clavier n'était plus placée directement dans l'écran). C'est corrigé.
  - Les fonctions du chat libre sont validées par Romain. Plus de couleur, à sa demande : la carte du sujet en dégradé de la matière, des idées de départ en pastilles colorées qui défilent au-dessus de la saisie, et un bandeau bleu en tête du volet.
  - Une discussion sans titre (y compris d'avant les titres) reçoit le sien au prochain échange.
  - La matière n'est plus choisie par l'élève : elle est reconnue par le modèle avec le titre, puis écrite dans la séance (la liste des séances des parents, P3, montre donc la matière de ces séances, sans aucun contenu).
  - C1 à C3 sont validés par Romain sur le Pixel, puis commités sur `feat/chat-libre`. Prochaine étape : C4, la photo d'un exercice.
- **07/10 (C4) :**
  - Plan de C4 validé par Romain : appareil photo et galerie, photo jamais gardée, et la photo aussi dans les leçons et exercices d'Explorer, interdite en évaluation (décision de Romain). Branche `feat/photo-exercice`, tirée de `dev` après la fusion des pull requests #7 et #8.
  - C4 est validée par Romain sur le Pixel (prompt `2026-10-07.3`).
  - La nouvelle version de l'interface (design v2.5) est déjà dans `design/`. Elle sera implémentée plus tard.

- **08/10 :**
  - La v2.5 est validée par Romain sur le Pixel, avec ses retours intégrés :
    - P1 sans le badge « Espace Parents », chiffres clés centrés sans évolution, et « Comment l'encourager » propose deux questions à poser (rédigées à l'avance, sans IA) ;
    - P2 : chaque matière de « Par matière » est un bloc teinté de sa couleur ;
    - l'objectif du jour passe en dégradé violet → bleu (écart 18) ;
    - la saisie du chat libre remonte au-dessus du logo de la barre.
  - Corrigé : le résumé de la semaine était coupé au milieu d'une phrase. Le modèle consomme une partie des jetons de sortie pour réfléchir, et la limite de 300 jetons l'arrêtait. Les résumés passent à 1 500 jetons, et une réponse coupée n'est plus jamais enregistrée.

## En attente

Ces idées ne sont pas planifiées. Elles entrent dans le plan sur décision de Romain.

- Des vignettes dessinées pour les formes du visage dans l'éditeur, à la place des libellés.
- L'avatar de l'élève ailleurs dans l'app : accueil, profil, tuteur.
- La dette d'Explorer relevée le 06/10 (§ 9 de `docs/explorer-creer-une-ile.md`), à traiter quand on y touche ou avant la publication. Les points les plus visibles : les chiffres de la cascade avec « Réduire les animations », les flèches de 44 px du panneau de ville, le poids de l'île (1,98 Mo) et de la carte de Nombres (5,6 Mo).
