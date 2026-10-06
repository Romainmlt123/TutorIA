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

## Où on en est — 6 octobre 2026

| Chantier | Étape                                                  | Statut                                           | Branche            |
| -------- | ------------------------------------------------------ | ------------------------------------------------ | ------------------ |
| Explorer | X1 · les îles                                          | ✅ validé                                        | `feat/explorer-3d` |
| Explorer | X2a · les régions de l'île                             | ✅ validé                                        | `feat/explorer-3d` |
| Explorer | X2b · la carte d'une région (art de la région Nombres) | ✅ validé                                        | `feat/explorer-3d` |
| Avatar   | Figurine, visage et atelier `/dev/avatars`             | ✅ validé                                        | `feat/avatar`      |
| Avatar   | A1 · l'éditeur « Crée ton avatar »                     | ✅ validé                                        | `feat/avatar`      |
| Avatar   | A2 · l'avatar sur la carte                             | ✅ validé                                        | `feat/avatar`      |
| Avatar   | **A3 · la garde-robe**                                 | 🔨 1re livraison validée, 2e en cours (9 objets) | `feat/avatar`      |
| Avatar   | A4 · l'avatar dans Supabase                            | à venir                                          |                    |
| Explorer | X3 à X5b · fiche, discussion et bilan d'un niveau      | à venir                                          |                    |

`feat/explorer-3d` et `feat/avatar` ne sont pas encore fusionnées dans `dev`.

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

### A3 · La garde-robe — en cours

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
  2. neuf autres objets : bandana (premier niveau), bonnet (5 étoiles), pantalon (2 villes), bottes de pluie (15 étoiles), jupe (3 villes), salopette (5 villes), cape (série de 14 jours), lunettes de soleil (50 étoiles), couronne (une ville avec 3 étoiles à chaque niveau).
- Sous un couvre-chef, les cheveux sont tassés sous la calotte (forme « chapeau » de chaque coiffure) : la coiffure reste visible sous le bord, au lieu d'être remplacée par la coiffure courte comme prévu d'abord.

### A4 · L'avatar dans Supabase

- **Prérequis :** la migration `level_progress` d'Explorer, car les objets se gagnent sur la progression enregistrée en base.
- L'apparence et les objets gagnés sont enregistrés en base :
  - les objets gagnés sont **calculés par la base** (déclencheurs), et l'élève ne choisit que parmi les siens ;
  - la figurine de l'appareil est reprise à la première connexion ;
  - l'export des données et la suppression du compte incluent l'avatar.
- La migration est montrée à Romain avant d'être appliquée en ligne.

### Phase 2 · Les achats (plus tard, sur décision de Romain)

- Une revue juridique d'abord : mineurs, règles Apple et Google Play « Familles ».
- Un achat ne se fait que **par le parent**, avec un prix affiché en euros.
- Il n'y a ni coffre à surprise (loot box) ni monnaie virtuelle.
- Rien de ce qui s'achète ne donne d'avantage pour apprendre.

## Chantier 2 · Explorer (suite)

Le plan détaillé d'Explorer reste celui validé le 30 septembre. Dans l'ordre :

1. **X3 / X3b · la fiche d'un niveau :** objectifs, puis « À l'écrit » et « À la voix ».
2. **X4 / X4b · la discussion de niveau,** écrite et vocale, sur le fond de l'île.
3. **X5 / X5b · le bilan :** étoiles, XP, réussi ou à revoir.
4. **La migration `level_progress`** (SQL montré d'abord), qui remplace la progression simulée.
5. **L'art des autres régions :** Données, Espace et Algorithmique (9 monuments).
6. **Le contenu :** les exercices générés par IA doivent être relus par un enseignant (référentiel v0.7), et il manque 14 évaluations « Bilan ». Avant cette relecture, aucune autre ville que les Équations n'ouvre.
7. **L'allègement :**
   - l'île pèse 1,98 Mo, pour un budget de 1,5 ;
   - les cartes de région doivent être téléchargées à la demande. Cela demande `expo-file-system`, donc un nouveau build EAS.
8. **Les autres îles,** une par matière.
9. **Les builds EAS,** une fois tout l'onglet Explorer terminé, comme Romain l'a demandé.

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
  - la première livraison (six objets) est validée.

## En attente

Ces idées ne sont pas planifiées. Elles entrent dans le plan sur décision de Romain.

- Des vignettes dessinées pour les formes du visage dans l'éditeur, à la place des libellés.
- L'avatar de l'élève ailleurs dans l'app : accueil, profil, tuteur.
- La dette d'Explorer relevée le 06/10 (§ 9 de `docs/explorer-creer-une-ile.md`), à traiter quand on y touche ou avant la publication. Les points les plus visibles : les chiffres de la cascade avec « Réduire les animations », les flèches de 44 px du panneau de ville, le poids de l'île (1,98 Mo) et de la carte de Nombres (5,6 Mo).
