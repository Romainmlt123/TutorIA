# Créer une île d'Explorer

Ce guide décrit comment l'île des Maths (4e, programme 2020) et ses régions ont été construites, du référentiel du programme jusqu'à l'écran. Il sert à refaire le même travail pour les autres îles (Français, Histoire-Géo, Physique-Chimie, SVT, Anglais) en gardant le même rendu.

Il complète :

- `CLAUDE.md`, qui fixe les conventions (thème, textes, chargement 3D) ;
- `ROADMAP.md`, qui fixe l'ordre des chantiers ;
- les « Écarts assumés » 8 à 12 de `design/README.md`, qui décrivent la direction artistique validée.

> **État au 6 octobre 2026.** Les mécanismes sont génériques, mais une douzaine d'endroits du code supposent encore que l'île des Maths est la seule île en 3D. La section 6 les liste et décrit comment les généraliser. Ce travail se fait une fois, au moment de la deuxième île, pas avant.

## Sommaire

1. [Vue d'ensemble](#1-vue-densemble)
2. [Le contenu](#2-le-contenu)
3. [Les régions de l'île](#3-les-régions-de-lîle)
4. [L'île dans Blender](#4-lîle-dans-blender)
5. [Les cartes de région](#5-les-cartes-de-région)
6. [Brancher une nouvelle île dans l'app](#6-brancher-une-nouvelle-île-dans-lapp)
7. [Vérifier](#7-vérifier)
8. [Liste des étapes pour une nouvelle île](#8-liste-des-étapes-pour-une-nouvelle-île)
9. [Dette connue et pièges relevés](#9-dette-connue-et-pièges-relevés)

---

## 1. Vue d'ensemble

### Une île, des régions, des villes, des niveaux

| Explorer | Programme               | Exemple (Maths 4e)                                 |
| -------- | ----------------------- | -------------------------------------------------- |
| Île      | Matière et classe       | `maths` · 4e · programme 2020                      |
| Région   | Domaine du référentiel  | `maths-nombres` · « Nombres et calculs »           |
| Ville    | Chapitre                | `maths-equations` · Ville des Équations (`M4-C06`) |
| Niveau   | Leçon, exercices, bilan | `maths-equations.isoler-x`                         |

Le référentiel propose une autre correspondance (« île = domaine »). Elle n'a pas été suivie. Une région qui n'a qu'un seul chapitre peut devenir un îlot flottant, comme l'Algorithmique.

### Les trois vues de l'onglet

- **X1 · les îles :** un carrousel, l'île flottante qu'on tourne au doigt, et le panneau « Ta quête ».
- **X2a · les régions de l'île :** la caméra monte, les régions se teintent sur l'herbe et on les choisit dans un carrousel de cartes en bois.
- **X2b · la carte d'une région :** vue de haut, comme un plateau de jeu. On y trouve les villes, leurs monuments, les niveaux et le chemin.

Les trois vues partagent un seul écran (`src/features/explorer/ExplorerScreen.tsx`) et une seule scène 3D. La vue est portée par l'adresse (`/explorer?ile=maths&region=maths-nombres`).

### La chaîne de production

```
référentiel JSON ─┬─> contenu de l'app (régions, villes, niveaux, objectifs)
                  └─> contenu du serveur (exercices, corrigés, banque par niveau)

water.json + regions.json (tracés écrits à la main, partagés avec l'app)
        │
        ▼
Blender : island_<matière>.py ──> island-<matière>-3d.glb + image de repli .webp
          islet_<région>.py   ──> islet-<région>.glb (îlots éventuels)
          region_map.py       ──> regionSites.json (passe 1), puis region-<id>.glb + regionDecor.json (passe 2)
          strip_kit.py        ──> strip-kit.glb (décors, communs à toutes les régions)
          strip_monuments.py  ──> strip-<région>.glb (un monument par ville)
        │
        ▼ gltf-transform quantize, puis npm run explorer:clean (données que l'app ne lit pas)
app : IslandStage, MathsIsland3D, RegionWorld, Hd2dPost, HUD de jeu

Carte pré-rendue d'une région (section 5, « La carte pré-rendue ») :
app (npm run explorer:layout) ──> tools/explorer-3d/layouts/<id>.json (disposition + empreinte)
        │
        ▼
Blender : region_tiles.py (passes sol, puis planches) ──> images du rendu + crops.json + segments.json
          node_sprites.py (commun à toutes les régions) ──> sprites des niveaux + sprites.json
        │
        ▼ Pillow : tile_map.py, sprite_pack.py
app : assets/explorer/tiles/<id>/*.webp + tiles/<id>.generated.ts, assets/explorer/sprites/*.webp + tiles/sprites.generated.ts
      RegionMapWorld (React Native), MapAvatarCanvas (seule 3D de la carte)
```

### Direction artistique (validée par Romain)

- **Une maquette réaliste**, et non un dessin animé : herbe de prairie, terre, pierre, bois.
- **Les objets du thème sont des jouets peints**, aux couleurs douces et un peu passées : pour les Maths, une grue en règles, un rapporteur, un compas, des pyramides, des cubes numérotés, un dé. La palette peut sortir de celle de la marque (`tools/explorer-3d/lib/palette.py`).
- **Pas d'arbres ni de buissons réalistes** sur les cartes de région. Romain les trouvait faux : on garde des rochers, des galets et des fleurs.
- **Aucun socle gris sous les objets** : les monuments sont posés à même l'herbe, et soignés comme des figurines.
- **Le HUD est celui d'un jeu vidéo** : police Lilita One, boutons en relief, panneaux de bois (`src/components/game/`).
- **Des images d'inspiration existent déjà pour chaque île**, dans `assets/inspirations/explorer/` (`inspiration_ile_français.png`, `inspiration_ile_histoire-geographie.png`, `inspiration_ile_physique-chimie.png`, etc.). Commencer par là.

---

## 2. Le contenu

### Le référentiel source

Pour les Maths : `programme_mathematique_4e/referentiel_maths_4e.json` (schéma 0.2, « pilote v0.6 »). Le dossier n'est pas suivi par git ; la copie qui fait foi est `server/content/maths-4e-2020/referentiel.json`.

Ce qui sert à Explorer :

- `chapitres[]` : `id` (`M4-C01`), `ordre`, `titre`, `domaine`, `capacites[]`, `prerequis[]`, `anciens_ids[]` ;
- `exercices[]` : `id` (`EX-M4-C01-001`), `chapitre`, `difficulte` (1 à 3), `enonce`, `corrige[]`, `reponse_finale`, `statut_validation` ;
- `meta.explorer` : les types de niveau et le seuil de validation de 70 %.

Les pièges de ce référentiel :

- **`ordre` n'est pas l'identifiant.** C15, l'Algorithmique, a l'ordre 1. Les identifiants ont changé d'une version à l'autre (`anciens_ids`) : on ne s'en sert jamais comme clés.
- **Les domaines sont écrits de façon inégale.** « Organisation et gestion de données, fonctions » côté chapitres, sans « fonctions » côté attendus.
- **Un domaine sans chapitre n'a pas de région.** « Grandeurs et mesures » n'a que deux attendus, portés par d'autres chapitres : il n'y a donc pas de région Grandeurs.
- **`prerequis` mélange deux choses** : des chapitres de la même classe (`"M4-C05"`) et du texte libre des années d'avant (`"5e: symétries"`).
- **Tout le contenu est généré par IA** (`origine: genere_ia`) et n'a pas été relu par un enseignant. Quatre exercices sont encore en brouillon.

### Le contenu de l'app

Fichier : `src/features/explorer/content/maths-4e-2020.ts`. Il a été écrit une fois d'après le référentiel, puis tenu à la main : aucun script ne le régénère. Les tests de garde (plus bas) empêchent qu'il diverge.

- **Types** (`content/types.ts`) :
  - `Island` : `subjectId`, `grade`, `programme`, `regions` ;
  - `Region` : `id`, `name`, `shortName?`, `kind?` (`'ilot'`), `cities` ;
  - `City` : `id`, `name`, `monument`, `source`, `playable`, `levels`, `ref?`, `requires?`, `recall?` ;
  - `Level` : `id`, `type`, `title`, `objectives`, `minutes`, `steps`.
- **Fabriques** (`content/build.ts`) : `city(spec)` et `levels(cityId, specs)`. L'identifiant d'un niveau vaut `` `${cityId}.${slug}` ``. Valeurs par défaut : leçon 10 min et 4 étapes, exercices 10 min et 5 étapes, bilan 15 min et 8 étapes.
- **Ordre :** les régions suivent l'ordre du programme, sauf l'îlot, placé en dernier. Dans une région, les villes suivent `ordre`.
- **`requires` :** les prérequis du référentiel limités aux chapitres de la même classe, traduits en identifiants de villes.
- **`recall` :** le « Rappel de 5e », réécrit à la main d'après les prérequis libres.
- **Niveaux :** une leçon puis des exercices par capacité (ou par groupe de capacités), et un `bilan` de type `evaluation` pour finir, soit 5 à 9 niveaux par ville et 104 en tout. Exception : la ville des Équations garde ses 8 niveaux et leurs identifiants d'origine.
- **`monument` :** le nom du monument de la ville. C'est aussi le nom de la pièce dans le modèle Blender des monuments (section 5).

Conventions d'identifiants, à respecter impérativement :

- **Région :** `<matière>-<thème>` (`maths-nombres`). **Ville :** `<matière>-<chapitre>` (`maths-calcul-litteral`). **Niveau :** `<ville>.<slug>` ; le dernier niveau d'une ville est toujours `<ville>.bilan`. Les îles d'exemple utilisent déjà les préfixes `fr-`, `hg-`, `pc-`, `svt-` et `en-`.
- **Les identifiants de niveau sont enregistrés en base** : on ne les renomme jamais. Un instantané de test rend tout renommage volontaire.
- **Les identifiants de niveau doivent être uniques sur toutes les îles**, car `levelById` cherche dans toutes les îles à la fois.
- **Un identifiant de ville doit être accepté par la base** : il devient `study_sessions.chapter_id`, qui exige `^[a-z0-9]+(-[a-z0-9]+)*$` et 64 caractères au plus.

### Le contenu du serveur

- `server/content/maths-4e-2020/referentiel.json` : la copie du référentiel.
- `server/content/maths-4e-2020/bank.ts` : la banque `MATHS_4E_BANK`. Pour chaque niveau, elle donne `ref`, `capacites` (rangs dans `capacites[]` du chapitre) et `exercises`. Une leçon n'a aucun exercice ; un niveau d'exercices en a 2 à 4 ; chaque bilan a sa propre réserve, jamais partagée. Les exercices en brouillon en sont exclus.
- `server/content/maths4e.ts` : lecture du référentiel (`chapterOfLevel`, `capacitesOfLevel`, `exercisesOfLevel`…). Le tuteur s'en servira à l'étape X4.
- **Énoncés et corrigés ne quittent jamais le serveur.** ESLint interdit à `src/` (hors `src/app/api/`) d'importer `server/`. L'app ne reçoit que la structure : régions, villes, niveaux, objectifs, `ref`, `requires` et `recall`.

### Les tests de garde

`server/content/maths4e.test.ts` vérifie :

1. chaque chapitre est repris une seule fois, et sa région suit son domaine normalisé (`REGION_OF_DOMAIN`, et `domaine.replace(/, fonctions$/, '')`) ;
2. dans une région, les villes suivent `ordre` ;
3. `requires` correspond aux prérequis du référentiel ;
4. chaque ville a 5 à 9 niveaux et finit par `<ville>.bilan`, de type évaluation ;
5. chaque capacité est couverte par au moins un niveau ;
6. la banque couvre tous les niveaux, avec les bons chapitres et assez d'exercices ;
7. aucun exercice n'est utilisé deux fois, et aucun brouillon ;
8. **rien n'est envoyé à l'app** : le contenu de l'app ne contient ni `"enonce"`, ni `"corrige"`, ni `"reponse_finale"`, ni identifiant `EX-M4-` ;
9. toutes les villes sont jouables (voir plus bas) ;
10. un instantané des 104 identifiants de niveau.

**Pour une nouvelle île :** il faut un nouveau fichier de contenu (déclaré dans `ISLANDS` de `content/index.ts`), une copie serveur du référentiel, une banque, un chargeur, et le même test de garde avec son propre `REGION_OF_DOMAIN`, son préfixe d'exercices et son instantané. Les îles d'exemple de `content/samples-4e-2020.ts` sont alors remplacées.

**À élargir au passage :** `Island.grade` n'accepte que `'4e'` et `Programme` que `'fr-2020'`. Le texte `fr.explorer.recall` dit toujours « Rappel de 5e ».

### Progression (déjà générique)

Les règles sont dans `logic/progression.ts`, en fonctions pures testées :

- **Étoiles :** les seuils sont 50 %, 70 % et 90 % (`STAR_THRESHOLDS`). Un indice donne une demi-réponse, et rien pendant un bilan. Une leçon terminée vaut 3 étoiles.
- **Ville validée :** 70 % au bilan (`CITY_PASS_SCORE`). En dessous, la ville est « à consolider ».
- **Ouverture des villes** (`islandPath`) : une ville s'ouvre quand le bilan de chacun de ses prérequis jouables a été tenté. Dans une ville, les niveaux s'ouvrent dans l'ordre, et un niveau terminé ne se referme jamais.
- **État d'une région :** À découvrir, En cours, À consolider ou Validée.
- **Le pion et « Reprendre »** (`currentLevel`) suivent la ville jouée en dernier.

> **Avant publication.** Pour essayer l'île en vraie grandeur, toutes les villes sont aujourd'hui `playable: true`, et un test l'impose. Pourtant, `ROADMAP.md` veut que seules les villes relues par un enseignant ouvrent. Il faudra trancher avant la mise en ligne.

---

## 3. Les régions de l'île

### Tracer les régions

Fichier : `src/features/explorer/stylized3d/regions.json`, écrit à la main. L'app le lit (`logic/regions.ts`), et `region_map.py` aussi.

```json
{
  "regions": [{ "id": "maths-nombres", "polygon": [[x, z], …], "focus": [-1.7, 1.2] }, …],
  "islet": { "region": "maths-algo", "position": [-3.7, -0.3, -3.4], "scale": 0.3 }
}
```

- **Repère de l'app :** x vers la droite, z vers la caméra, en mètres ; le plateau est à y = 0. Les polygones peuvent déborder de l'île : seul le plateau est teinté.
- **Les frontières suivent le relief naturel.** Pour les Maths, la rivière et le lac en π coupent déjà le plateau en trois.
- **Chaque décor doit tomber dans la région de son thème** : le boulier et les cubes dans Nombres, le dé dans Données, la grue et le compas dans Espace. On place donc les régions et les décors ensemble. `logic/regions.test.ts` le vérifie : sa liste `PROPS` recopie les coordonnées des décors de `island_maths.py`.
- **Taille des régions :** la part de chacune doit être à peu près proportionnelle à son nombre de villes. Le même test vérifie ces parts.
- **`focus` :** le point que la caméra vise quand on choisit la région. Il doit se trouver dans la région.
- **Au plus trois régions sur l'île.** Le masque de teinte code une région par canal (rouge, vert, bleu), et le canal alpha sert aux frontières (`regionMask()`, 256 × 256 px sur 8 m). Pour en avoir davantage, il faut un autre format de masque.
- **Une région de plus** peut devenir un îlot flottant (`islet`). Il est modélisé à part, puis placé et mis à l'échelle par l'app.

### Couleurs et numéros

- **Couleurs :** `explorerArt.regions` dans `src/theme/explorerArt.ts`. ESLint refuse toute couleur en dur ailleurs. La même couleur sert de teinte sur l'île, de bande sur la carte en bois et de toit aux villages génériques.
- **Numéro (« RÉGION n ») :** calculé par `useIslandRegions`. Un îlot n'a pas de numéro : il est marqué « ÎLOT ».

### La teinte sur l'île (`stylized3d/regionTint.ts`)

Le matériau cuit de l'île est complété par un shader. La région choisie est éclairée, les autres passent au gris, et des frontières en pointillés blancs apparaissent au ras du sol. Seul ce qui est au-dessus de y = −0,04 est teinté : le plateau et les décors, pas la motte de terre.

---

## 4. L'île dans Blender

### Outils et règles

- **Blender 5.2 en ligne de commande** (`/snap/bin/blender`), avec Cycles sur le processeur.
- **Le snap confine Blender.** Si un rendu ne produit rien, vérifier d'abord que Blender peut écrire dans le dossier de sortie.
- **Une cuisson longue se lance en tâche de fond suivie**, jamais détachée avec `&` (`CLAUDE.md`).
- **Tout est déterministe :** chaque tirage au hasard a sa graine.
- **Tout sort quantifié** (`npx -y @gltf-transform/cli@4.5.1 quantize`) : les sommets passent en entiers 16 bits. L'app doit donc garder la position, la rotation et l'échelle de chaque nœud (voir `copyOf`).
- **Puis tout est nettoyé** (`npm run explorer:clean`, `scripts/clean-glb.ts`, à la fin de `explorer:models` et de `avatar:model`) :
  - chaque GLB ne garde que les attributs que l'app lit, d'après une liste blanche par fichier et par nœud (`src/features/explorer/logic/modelRules.ts`) : ni normales sur les pièces cuites et les brins, ni UV sur les chiffres et l'avatar ;
  - les brins perdent leurs indices, qui ne faisaient que répéter l'ordre des sommets ;
  - chaque attribut est rangé à part (sommets non entrelacés), pour que three.js n'envoie pas deux fois les mêmes octets à la carte graphique ;
  - les textures, les noms, les transformations, les matériaux, les squelettes, les formes et les animations ne changent pas ;
  - un nouveau GLB, ou un nœud sans règle, arrête le script : écrire sa règle d'abord. Un matériau éclairé a besoin de `NORMAL`, une texture de `TEXCOORD_0`.
- **Jamais `gltf-transform optimize`** : il fusionne les dix `chiffre_*` en un seul nœud, retire l'UV des brins (le vent en dépend) et simplifie l'île. Jamais de WebP, de KTX2, de Draco ni de Meshopt dans un GLB non plus : sur téléphone, expo-gl ne décode que le JPEG et le PNG, et l'app n'embarque aucun décodeur.
- **Qualité JPEG :** Blender 5.2 lit `export_image_quality` et ignore `export_jpeg_quality`, que `bake.export` passait jusqu'au 16 octobre 2026. Toutes les textures actuelles sont donc en qualité 75, pas 90. La qualité demandée (90 par défaut, 80 pour les régions, 86 pour les monuments) s'appliquera à la prochaine cuisson et alourdira les textures : environ +0,26 Mo pour l'île à 90 (estimation). La choisir en connaissance de cause.

### Les bibliothèques communes (`tools/explorer-3d/lib/`)

| Module         | Contenu                                                                                                                                                                                                                                                                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `geo.py`       | Repère (`app(x, z, y)` vers Blender), contour de l'île (`edge(a)`, rayon R = 3,2 m), corps de l'île (`island_body()` : plateau, rebord d'herbe festonné, motte de terre), primitives (`box`, `cylinder`, `sphere`, `tube`, `text` en Satoshi Black, `extruded`, `rock`, `blob` pour les feuillages), `join`, `catmull_rom` (la même courbe que three.js) |
| `materials.py` | Matières procédurales, faites pour la cuisson : `grass` (avec rive mouillée), `soil` (strates, racines, galets), `rock`, `wood`, `leaves`, `paint` (jouets peints, usure sur les arêtes), `metal` (volontairement non métallique), `crystal`, `meadow`, `bark`, `masonry`, `plank`                                                                       |
| `palette.py`   | Couleurs nommées, en sRGB, converties en linéaire (`rgb`, `rgba`)                                                                                                                                                                                                                                                                                        |
| `bake.py`      | `apply_all`, `lights()` (soleil de fin d'après-midi et ciel), `unwrap`, `bake` (une seule texture : lumière directe et indirecte, ombres douces, occlusion), `export` (GLB, JPEG), `preview`, `fallback`                                                                                                                                                 |

### La structure du script d'une île (`island_maths.py`)

1. **Tracé de l'eau :** lecture de `src/features/explorer/stylized3d/water.json`, partagé avec l'app. Pour les Maths, il décrit le lac en π, la rivière et la cascade. Le script en tire un masque de rive (`water_mask`), cuit dans l'herbe : herbe mouillée et boue au bord de l'eau.
2. **Corps de l'île** (générique) : `geo.reset()`, puis `geo.island_body(shore=water_mask())`.
3. **Placement :** `claim(x, z, rayon, nom)` réserve la place d'un décor. Le script affiche `ATTENTION … déborde de l'île` ou `… touche l'eau` sans s'arrêter : il faut lire le journal. `free()` cherche une place libre.
4. **Les décors du thème** (propres à chaque île) : pour les Maths, une grue en règles, un rapporteur, un compas, un grand « M », des pyramides, un icosaèdre, un octaèdre, un dé, des cubes 1-2-3, un boulier, une balle, et des arbres-panneaux « + », « × » et « ÷ ».
5. **Végétation :** arbres ronds, buissons sur le pourtour, fleurs (génériques).
6. **Sous l'île :** pierres, cristaux et racines pendantes (génériques).
7. **`water_surfaces()` :** l'eau immobile, utilisée seulement pour l'image de repli.
8. **La ligne repère** `# --- fin de la construction des accessoires (region_map.py reprend la scène jusqu'ici) ---`. `region_map.py` exécute le script jusqu'à cette ligne exacte : ne jamais la déplacer ni la renommer.
9. **Cuisson :** toutes les pièces fixes sont fusionnées en un objet `ile`, dépliées, puis cuites en une texture de 2048 px (128 échantillons par défaut).
10. **Pièces animées par l'app**, qui ne sont pas cuites :
    - `brins`, les brins d'herbe : un triangle par brin, en touffes, plus hautes et plus fournies au bord de l'eau ;
    - `chiffre_0` à `chiffre_9`, les chiffres qui tombent avec la cascade.
11. **Export** de `assets/explorer/models/island-maths-3d.glb`, puis quantification.

### Ce que l'app attend du modèle

Ces contrats ne sont protégés par aucun test, sauf mention contraire. Toute nouvelle île doit les respecter, ou bien l'app doit être généralisée (section 6).

| Contrat          | Détail                                                                                                                                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Noms des nœuds   | `ile` (texture cuite), `brins`, `chiffre_*`. Sinon, `readModel` lève une erreur et l'image de repli s'affiche. Toujours chercher par nom de nœud : le maillage fusionné s'appelle « Bordure ». Vérifiés par `assets.test.ts`. |
| Brins d'herbe    | La coordonnée v de l'UV donne la hauteur le long du brin : 0 au pied, 1 à la pointe. Le vent de `grass.ts` en dépend.                                                                                                         |
| Soleil           | La direction `SUN` de `water.ts` doit être celle de `bake.lights()`, rotation (42°, −28°, −35°). Les reflets de l'eau et les ombres de la carte en dépendent.                                                                 |
| Hauteur de l'eau | `SURFACE = 0,022` m, juste au-dessus des bosses du plateau.                                                                                                                                                                   |
| Largeur          | 7,4 m, inscrite en dur dans le cadrage de l'app (`IslandStage`, `shots.ts`). `stageFrame.ts` suppose aussi la silhouette des Maths (hauteur relative 1,05, visée sous le plateau).                                            |
| Contour          | `geo.edge` est aussi recopié dans `hd2d/MathsIslandHD.tsx`.                                                                                                                                                                   |
| Tracé de l'eau   | `water.json`, lu par Blender et par l'app (`water.test.ts`). Toute modification oblige à tout recuire et à vérifier les polygones de `regions.json`.                                                                          |
| Cadrage          | La caméra de Blender (`_app_camera` : 26° de champ, élévation 24°, azimut −0,2, visée à y = −0,9) reproduit celle du carrousel de l'app. L'image de repli en dépend.                                                          |

### Variables d'environnement

| Variable                  | Effet                                                                                                      |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `EXPLORER_PREVIEW=…png`   | Rendu rapide, sans cuisson (environ une minute), au cadrage de l'app. Sans eau : on voit la rive mouillée. |
| `EXPLORER_PREVIEW_CROP`   | Recadrage de l'aperçu : `"xmin,ymin,xmax,ymax"` en fractions, 0 en bas à gauche.                           |
| `EXPLORER_PREVIEW_SCALE`  | Agrandit l'aperçu (520 × 1126 à 1).                                                                        |
| `EXPLORER_STATS`          | Triangles par pièce et total ; `EXPLORER_STATS=seulement` s'arrête avant la cuisson.                       |
| `EXPLORER_BAKE_SAMPLES`   | Échantillons de la cuisson (128 pour l'île, 32 pour l'îlot).                                               |
| `EXPLORER_FALLBACK=…webp` | Rend l'image de repli au lieu de cuire (chemin absolu).                                                    |

Pour itérer vite sur une île :

```sh
EXPLORER_PREVIEW=/tmp/apercu.png blender -b -P tools/explorer-3d/island_maths.py
EXPLORER_STATS=seulement blender -b -P tools/explorer-3d/island_maths.py
```

### L'image de repli

```sh
EXPLORER_FALLBACK=$PWD/assets/explorer/images/island-maths.webp blender -b -P tools/explorer-3d/island_maths.py
```

- Rendu direct de la scène, avec l'eau immobile mais sans brins ni chiffres : WebP transparent de 900 × 1250 px, 48 échantillons.
- `StageFallback.tsx` l'affiche sans WebGL, ou si la scène 3D échoue, à la place exacte de l'île.
- Changer la taille de l'image oblige à mettre à jour `IMAGE_ASPECT`.

### Les îlots (`islet_algo.py`)

- Le même corps d'île en pleine taille, sans eau, avec les décors de la région : pour l'Algorithmique, des blocs empilés façon Scratch, un engrenage et un panneau-flèche.
- Cuit en 1024 px, puis exporté en un nœud `ilot`.
- La position et l'échelle sont dans `regions.json` (`islet`) ; l'app l'affiche à l'échelle 0,3 et le fait monter des nuages dans la vue des régions.

### Le panneau de bois (`wood_panel.py`)

Il rend `assets/explorer/images/wood-panel.webp` (trois planches, 1200 × 750 px), utilisé par tout le HUD de jeu (`WoodFrame`). Il est commun à toutes les îles.

### Budgets

| Mesure                      | Budget       | Île des Maths aujourd'hui                                       |
| --------------------------- | ------------ | --------------------------------------------------------------- |
| Triangles à l'écran         | < 60 000     | environ 49 000 (île 44 000, brins 2 300, chiffres)              |
| Appels de dessin            | < 60         | île 1, brins 1, chiffres 7, eau 3, nuages 1                     |
| Poids des modèles d'une île | ≤ 1,5 Mo     | **1,53 Mo** (texture 0,6 Mo), plus l'îlot 0,54 Mo : hors budget |
| Texture                     | 2048 px JPEG | 2048 px, qualité 75                                             |

- **Le budget de 1,5 Mo** est à atteindre à la prochaine cuisson de l'île, en choisissant la taille et la qualité de sa texture.
- **`src/features/explorer/assets.test.ts`** vérifie chaque GLB versionné : extensions (la quantification seulement), images (JPEG ou PNG), attributs (la liste blanche), sommets non entrelacés et poids.
- **Le plafond de poids de chaque fichier** est dans `modelRules.ts` : le poids nettoyé du 16 octobre 2026, plus 2 à 4 %. Un modèle recuit plus lourd fait échouer le test : l'alléger, ou relever son plafond en connaissance de cause.

### Durées

- Aperçu : environ 1 min.
- Cuisson de l'île : environ 15 min.
- Carte de région : environ 20 min.
- Chaîne complète (`npm run explorer:models`) : environ 30 min.

---

## 5. Les cartes de région

### Le principe

La carte d'une région est la région elle-même de l'île, agrandie 6 fois autour du centre de l'île. On y garde le même contour et les mêmes repères : pour Nombres, le π d'eau animé, les pyramides, les cubes numérotés et l'arbre « + ». On retire les repères qui gênent (le boulier et l'octaèdre), et on recuit le tout avec la même herbe. Les villes occupent des clairières, chacune avec son monument au centre et ses niveaux en arc autour. Un seul chemin de planches les relie dans l'ordre du programme.

### `region_map.py` : deux passes

`region_map.py` exécute le script de l'île jusqu'à la ligne repère et reprend sa scène. Il en tire le contour de la région : des rayons sont lancés depuis `focus`, à l'intérieur du polygone de `regions.json` et du bord du plateau. Il agrandit ensuite ce contour de `EXPLORER_REGION_SCALE`. Puis il refait le terrain :

- un plateau au centre fait d'un seul polygone, pour ne pas étirer la texture ;
- un rebord d'herbe festonné ;
- une motte de terre de 6,5 m.

**Passe 1, le plan :** elle écrit les emplacements des villes dans `regionSites.json`.

```sh
EXPLORER_PLAN=1 EXPLORER_REGION=maths-nombres EXPLORER_REGION_SCALE=6 EXPLORER_DROP=boulier,octaedre \
EXPLORER_CITIES=maths-relatifs,maths-fractions,maths-fractions-produits,maths-puissances,maths-calcul-litteral,maths-equations \
blender -b -P tools/explorer-3d/region_map.py
```

- **Candidats :** un emplacement est retenu s'il a assez de place, loin de l'eau et des repères (`EXPLORER_CLEARANCE`, 1,85 m), et assez loin des autres villes (`EXPLORER_APART`, 3,9 m).
- **Choix :** sur 800 tirages, le script garde l'ordre de visite au chemin le plus court. Les chemins sont tracés par A* sur une grille de 0,5 m, en contournant l'eau, les repères et les autres villes.
- **Sens :** la première ville est au nord-ouest.
- **Échec :** « Aucune disposition possible ». Agrandir la carte ou réduire `EXPLORER_CLEARANCE` / `EXPLORER_APART`.
- **Ajustement :** les emplacements peuvent être retouchés à la main. L'aperçu (`EXPLORER_PREVIEW`) dessine une grille de repères tous les 2 m, ainsi que les clairières.
- **Test :** `regionMap.test.ts` exige que les villes de `regionSites.json` soient celles du contenu, dans le même ordre. Un chapitre ajouté, retiré ou déplacé oblige à relancer le plan.

**Passe 2, la cuisson :** elle produit `assets/explorer/models/region-<id>.glb`, puis réécrit `regionDecor.json`.

```sh
EXPLORER_REGION=maths-nombres EXPLORER_REGION_SCALE=6 EXPLORER_DROP=boulier,octaedre blender -b -P tools/explorer-3d/region_map.py
npx -y @gltf-transform/cli@4.5.1 quantize assets/explorer/models/region-maths-nombres.glb assets/explorer/models/region-maths-nombres.glb
npm run explorer:clean
```

- **`region` :** le sol, cuit en 3072 px.
- **`reperes` :** les repères gardés, avec leur propre texture de 2048 px, bien plus nette.
- **`brins` :** les brins d'herbe, plus hauts au bord de l'eau, non cuits.
- **`regionDecor.json` :** les emplacements des décors, `[pièce, x, z, angle, échelle]`. La densité est donnée pour 100 m² : 2,2 rochers, 5 tas de galets, 12 touffes de fleurs. Les décors restent hors des clairières, du chemin approché et de l'eau.

**Règles de cohérence :**

- **`EXPLORER_REGION_SCALE` et `EXPLORER_DROP` doivent être les mêmes au plan et à la cuisson.** La valeur par défaut de l'échelle est 3, pas 6 ; `scale` dans `regionSites.json` n'est jamais relu.
- **Chaque cuisson réécrit `regionDecor.json`.** Elle est déterministe, mais un changement d'emplacement des villes déplace aussi les brins.
- **Une ville sans emplacement fait basculer toute la région** sur la disposition de secours (en serpentin), qui ne correspond plus au terrain cuit.

**Variables d'environnement de `region_map.py` :**

| Variable                | Défaut          | Effet                                                 |
| ----------------------- | --------------- | ----------------------------------------------------- |
| `EXPLORER_REGION`       | `maths-nombres` | Région de `regions.json`                              |
| `EXPLORER_REGION_SCALE` | 3               | Agrandissement (6 en production)                      |
| `EXPLORER_DROP`         |                 | Repères retirés, par leur nom de `claim()`            |
| `EXPLORER_CITIES`       |                 | Villes dans l'ordre du programme (plan)               |
| `EXPLORER_PLAN`         |                 | Écrit `regionSites.json` puis s'arrête                |
| `EXPLORER_CLEARANCE`    | 1,85            | Place libre autour d'une ville (plan)                 |
| `EXPLORER_APART`        | 3,9             | Distance minimale entre deux villes (plan)            |
| `EXPLORER_TRIALS`       | 800             | Dispositions essayées (plan)                          |
| `EXPLORER_DECOR`        |                 | Réécrit seulement `regionDecor.json`                  |
| `EXPLORER_PREVIEW`      |                 | Vue de dessus avec grille et clairières, sans cuisson |
| `EXPLORER_REGION_SIZE`  | 3072            | Taille de la texture du sol                           |
| `EXPLORER_BAKE_SAMPLES` | 32              | Échantillons de la cuisson                            |

### Le kit de décors (`strip_kit.py`, commun à toutes les régions)

- **Pièces :** `rocher-a`, `rocher-b`, `cailloux`, `fleurs`, `fleurs-b` et `barriere`.
- **Cuisson :** chaque pièce a sa texture de 512 px, cuite sur un sol de prairie pour avoir l'ombre de contact.
- **App :** `stylized3d/stripKit.ts` exige ces six noms. Il pose les pièces en instances, avec un seul appel de dessin par sorte, et une ombre douce au sol décalée à l'opposé du soleil cuit (`groundShadows.ts`).

### Les monuments (`strip_monuments.py`)

- **Chaque monument est une figurine** d'environ 1,2 m de haut et de moins de 1 m de rayon, sans socle, l'origine au pied, la face vers la caméra.
- **Pour Nombres :** une bascule sur une droite graduée de −4 à +4, une tarte festonnée, un moulin aux ailes 1/4 à 4/4, une tour de cubes 2¹ à 2⁴, un atelier à colombages et une balance « = ».
- **Nom de la pièce = identifiant `monument` de la ville dans le contenu.** Une pièce absente lève une erreur. Les noms des autres régions des Maths sont déjà dans le contenu : `moulin-engrenages`, `tours-barres`, `des-roue` (Données) ; `palais-mosaiques`, `vitrail-losanges`, `phare-rayons`, `temple-triangle`, `cristaux-solides` (Espace).
- **Le script ne fait aujourd'hui que Nombres** : la liste `MONUMENTS` et le fichier de sortie `strip-nombres.glb` sont écrits en dur. Pour une autre région, il faut le paramétrer.
- **Aperçu :** `EXPLORER_PREVIEW`, et `EXPLORER_ONLY=<pièce>` pour une seule pièce.

### Déclarer une région cuite dans l'app

1. `stylized3d/terrainScales.ts` : `TERRAIN_SCALES['<id>'] = 6`, qui doit valoir `EXPLORER_REGION_SCALE` : il règle aussi l'échelle de l'eau, et celle des reflets d'une carte pré-rendue. Puis `stylized3d/terrains.ts` : `TERRAIN_MODELS['<id>'] = { asset: require('…/region-<id>.glb'), scale: TERRAIN_SCALES['<id>']! }`. Une région pré-rendue garde son échelle même sans GLB (`ambientLayout.test.ts` le vérifie).
2. `stylized3d/monuments.ts` : `MONUMENT_MODELS['<id>'] = require('…/strip-<région>.glb')`. C'est tout ou rien pour une région.
3. `package.json`, script `explorer:models` : ajouter la cuisson et la quantification (avant le `npm run explorer:clean` final), avec `EXPLORER_REGION=<id>` écrit explicitement.
4. `src/features/explorer/logic/modelRules.ts` : la règle de chaque nouveau GLB (attributs gardés par nœud, plafond de poids). Sans elle, `explorer:clean` s'arrête et `assets.test.ts` échoue.

**Sans modèle, la région reste jouable** grâce à une carte simple :

- des disques de terre unie autour des villes et le long du chemin ;
- des décors du kit semés par l'app ;
- des brins d'herbe ;
- un village générique de trois maisons, aux toits de la couleur de la région.

### Le rendu de la carte (déjà générique)

- **Caméra :** 52° d'élévation (62° jusqu'au 06/10) et 4° de champ, donc presque sans perspective, comme un plateau de jeu. 4 m de carte occupent la largeur de l'écran.
- **Déplacement :** la carte se déplace au doigt avec de l'élan, bornée au rectangle des niveaux.
- **Chemin :** des planches posées en travers, dessinées par le shader, sans texture (`mapPath.ts`) : bois miel jusqu'à l'avatar, bois grisé ensuite.
- **Points de niveau** (`levelNodes.ts`) : disque à la couleur du type, rebord doré en relief (argenté s'il est fermé), halo jaune au sol autour des niveaux ouverts, qui pulse sous l'avatar.
- **Avatar** (`MapAvatar.tsx`) : la figurine de l'élève à la place du pion ; il salue en entrant, marche le long du chemin quand le pion avance (`logic/avatarWalk.ts`), puis saute en arrivant.
- **Boutons :** chaque point de niveau a un bouton de 48 px, posé sur sa position projetée à l'écran. La position est recalculée dès que la caméra se pose, et suivie sur le fil d'interface pendant le déplacement (`MapOverlay`).
- **Ouverture :** la carte attend les résultats de l'élève avant de s'ouvrir sur la ville du pion.
- **Effet d'image :** `Hd2dPost` sans flou de maquette (`tiltShift={false}`) : la carte est nette d'un bord à l'autre, et ses deux passes les plus chères sont économisées.

### La carte pré-rendue (tuiles)

**Le principe.** Une région listée dans `PRERENDERED_MAPS` (`src/features/explorer/tiles/index.ts`) n'a plus de carte 3D. Blender rend la carte une fois pour toutes, et React Native l'affiche en tuiles. Les autres régions gardent la carte 3D décrite plus haut.

- **Caméra de Blender :** orthographique, 52° d'élévation, azimut nul, 224 px par mètre du plan image. Plan image : `x` de la carte, et `v = z·sin 52° − y·cos 52°` vers le bas, en mètres. Sans perspective, l'app retrouve chaque pixel par le calcul (`logic/mapProjection.ts`, vérifié au millième de pixel contre Blender).
- **Ce que l'image contient :** le terrain de la région, ses repères (réduits autour de leur pied), l'eau du π immobile (la formule de l'app à t = 0), les monuments, les décors du kit, l'herbe et les planches grisées du chemin. Le ciel reste transparent.
- **Ce que l'app pose dessus** (`RegionMapWorld`, dans un seul plan que le fil de l'interface déplace) : les tronçons miel du chemin jusqu'à l'avatar, les sprites des disques et des halos, les icônes, les étoiles, les bandeaux des villes et les boutons de 48 dp (`RegionMapMarkers`), l'avatar dans son petit Canvas (`MapAvatarView`), et la vie de la carte (`MapAmbient`) : des nuages qui dérivent sous l'île, visibles là où le rendu est transparent, et des reflets du soleil qui scintillent sur l'eau du π.
- **Rectangle rendu :** les bornes des niveaux, plus un demi-écran de chaque côté, sur l'écran le plus haut prévu (20:9). Le défilement ne sort jamais de l'image.

**La disposition vient de l'app.** `logic/mapExport.ts` exporte les villes, les niveaux, les échantillons du chemin, les décors posés, les touffes, l'étalonnage, le soleil, les couleurs de l'eau et le rectangle à rendre, avec leur empreinte (`layoutHash`, les 16 premiers caractères du SHA-256 des villes, niveaux, chemin, décors et touffes).

```sh
npm run explorer:layout   # réécrit tools/explorer-3d/layouts/<id>.json pour chaque région de PRERENDERED_MAPS
```

Sans la variable de mise à jour, `mapExport.test.ts` vérifie que le fichier est à jour et que les tuiles installées ont la même empreinte. **Un chapitre, un niveau ou un décor qui change impose de refaire les tuiles de la région.**

**Le rendu, en deux passes** (`tools/explorer-3d/region_tiles.py`, Cycles, en morceaux de 1 600 px débruités). C'est un rendu long : le lancer en tâche de fond suivie, jamais détaché avec `&`.

```sh
EXPLORER_LAYOUT=tools/explorer-3d/layouts/maths-nombres.json EXPLORER_REGION_SCALE=6 EXPLORER_DROP=boulier,octaedre \
EXPLORER_TILES_OUT=<dossier> EXPLORER_TILES_PASS=sol blender -b -P tools/explorer-3d/region_tiles.py
# puis la même commande avec EXPLORER_TILES_PASS=planches
python3 -I tools/explorer-3d/tile_map.py <dossier> assets/explorer/tiles/maths-nombres src/features/explorer/tiles/maths-nombres.generated.ts
```

- **Passe `sol` :** tout, sauf le chemin parcouru. Elle écrit les morceaux du rendu (PNG 8 bits sRGB, étalonnés comme l'île, alpha droit) et `crops.json`.
- **Passe `planches` :** les planches miel seules, tronçon par tronçon (entre le niveau `i` et le suivant). Le reste de la scène est en découpe : il cache les planches et leur fait de l'ombre, mais reste transparent. Elle écrit `segments.json`.
- **`EXPLORER_REGION_SCALE` et `EXPLORER_DROP`** sont ceux du plan de `region_map.py`, dont le script reprend la scène.
- **Autres variables :** `EXPLORER_TILES_ZONE=x0,x1,v0,v1` (une zone seulement), `EXPLORER_TILES_SAMPLES` (64), `EXPLORER_TILES_THREADS` (4), `EXPLORER_TILES_CROP` (1 600 px), `EXPLORER_TILES_LOG` (journal dans un fichier).
- **Eau refaite sans relancer Cycles :** `tools/explorer-3d/rewater.py` recalcule l'eau pleine des images déjà rendues ; relancer ensuite `tile_map.py`.

**La découpe** (`tile_map.py`, Python du système avec Pillow) :

- tuiles WebP (qualité 80) de 512 px, avec 1 px de recouvrement de chaque côté : agrandies par l'écran, deux voisines ne laissent pas de joint ;
- les tuiles entièrement transparentes ne sont pas écrites : l'app dessine le ciel ;
- une sous-couche, l'image entière au quart (`sous-couche.webp`), posée sous les tuiles pour qu'aucun trou n'apparaisse pendant un lancer ;
- un tronçon miel par écart entre deux niveaux (`troncon-<i>.webp`) ;
- le manifeste (`manifest.json`) et le module de l'app (`<id>.generated.ts`, un `require` statique par image, à ne jamais modifier à la main).

**Le manifeste :** `version`, `regionId`, `ppm` (224), `elevation` (52), `x0` et `v0` (point du plan image du pixel (0, 0)), `width` et `height` (pixels), `tile` (512), `bleed` (1), `layoutHash`, `underlay` (`file`, `factor`), `tiles` (`col`, `row`, `file`, `x`, `y`, `width`, `height`) et `doneSegments` (`gap`, `file`, `x`, `y`, `width`, `height`). `tile_map.py` refuse des planches rendues pour une autre zone ou une autre empreinte que le sol.

**Les sprites des niveaux**, communs à toutes les régions (`node_sprites.py`, puis `sprite_pack.py`) :

```sh
EXPLORER_SPRITES_COLORS=couleurs.json EXPLORER_SPRITES_OUT=<dossier> blender -b -P tools/explorer-3d/node_sprites.py
python3 -I tools/explorer-3d/sprite_pack.py <dossier> assets/explorer/sprites src/features/explorer/tiles/sprites.generated.ts
```

- `couleurs.json` (couleurs en `#rrggbb`, rayons en mètres), écrit à la main depuis le thème et la disposition :

  ```json
  {
    "node": { "lecon": "…", "exercices": "…", "evaluation": "…", "locked": "…" },
    "nodeRim": { "light": "…", "face": "…", "dark": "…", "glow": "…" },
    "nodeRimLocked": { "light": "…", "face": "…", "dark": "…" },
    "ink": "…",
    "radius": { "normal": 0.26, "evaluation": 0.34 }
  }
  ```

  - `node`, `nodeRim` et `nodeRimLocked` : `explorerArt.map.node`, `explorerArt.map.nodeRim` et `explorerArt.map.nodeRimLocked`, tels quels ;
  - `ink` : `explorerArt.hud.ink` (le liseré bleu nuit) ;
  - `radius` : `MAP_LAYOUT.nodeRadius` et `MAP_LAYOUT.evaluationRadius` (`logic/mapLayout.ts`) ;
  - `node_sprites.py` lit toutes ces clés : une clé absente l'arrête (`KeyError`).

- Sprites : `niveau-lecon`, `niveau-exercices`, `niveau-evaluation`, `niveau-verrou`, `niveau-verrou-grand`, et le halo des niveaux ouverts en deux pièces, l'anneau net (`anneau`, `anneau-grand`) et la lueur douce (`lueur`, `lueur-grand`). Rendus à 336 px par mètre (3x), avec la même caméra et le même soleil que la carte ; le point d'ancrage est le pied du niveau.
- L'app pose l'icône du type (ou le cadenas) par-dessus. **Les disques restent vifs, tels que Romain les a validés.**

**Les règles de l'app** (`CLAUDE.md`, « Carte pré-rendue d'une région ») :

- aucun commit React pendant que la carte bouge : toutes les tuiles sont montées d'un coup, avec `fadeDuration={0}` ;
- jamais de react-native-svg pour une grande surface ;
- les animations (halo, reflets, nuages) suivent une seule horloge à 30 Hz (`useMapClock`), arrêtée hors de l'onglet et avec « Réduire les animations » ; le compteur de performance affiche son rythme, puis celui des images du fil de l'interface ;
- l'avatar est la seule 3D de la carte, dans un petit Canvas posé dans le plan qui défile ;
- les reflets ne vont que sur l'eau du π d'une région à terrain cuit (`TERRAIN_SCALES`, `stylized3d/terrainScales.ts`, dont l'échelle agrandit le π) ; la rivière, hors de Nombres, n'en a pas encore.

**Les budgets** (`src/features/explorer/tiles/budget.test.ts`) :

| Élément                                      | Budget             | Nombres (17 octobre 2026) |
| -------------------------------------------- | ------------------ | ------------------------- |
| Une région : tuiles, sous-couche et tronçons | ≤ 2 000 000 octets | 1 153 354 octets          |
| Tuiles d'une région                          | ≤ 100              | 85 (et 42 tronçons)       |
| Sprites des niveaux (toutes les régions)     | ≤ 150 000 octets   | 98 896 octets             |

Le test vérifie aussi que chaque image importée existe et qu'aucune image du dossier n'est sans usage.

---

## 6. Brancher une nouvelle île dans l'app

### Déjà générique

- La navigation entre les vues (`explorerView.ts`), le contenu et la progression.
- Le carrousel des régions, la carte d'une région (`RegionWorld`, `mapLayout`, `regionMap`, `terrainLayout`, `mapScroll`) et sa carte simple de secours.
- L'herbe animée, les nuages, l'effet d'image (`Hd2dPost`, réglage `natural`), le HUD de jeu.
- Le chargement des modèles et la robustesse (voir plus bas).

### Encore propre aux Maths, à généraliser au moment de la deuxième île

1. **`logic/islands.ts` :** `ISLANDS_IN_3D = new Set(['maths'])` décide quelles îles le carrousel montre.
2. **`IslandStage.tsx` :** `mathsIndex` et un seul groupe `<MathsIsland3D>` avec `<IsletAlgo>`. La largeur de 7,4 m est écrite en dur.
3. **`MathsIsland3D.tsx` :** le modèle, les noms de nœuds attendus et les chiffres de la cascade, qui sont obligatoires.
4. **`water.ts` et `water.json` :** le π, la rivière et la cascade.
5. **`logic/regions.ts`, `regions.json` et `regionTint.ts` :** une seule disposition, lue au chargement du module.
6. **`IsletAlgo.tsx` :** un seul îlot, celui de l'Algorithmique.
7. **`StageFallback.tsx` :** une seule image de repli (`island-maths.webp`), et rien pour les autres îles.
8. **`stageFrame.ts` et `shots.ts` :** la silhouette et la largeur de l'île des Maths.
9. **`ExplorerScreen.tsx` :** `?? 'maths'`. La caméra vise l'île du carrousel même dans les vues des régions, si bien que l'adresse `?ile=francais` ouvrirait les régions du Français sur l'île des Maths.
10. **`RegionWorld.buildTerrain` :** ajoute toujours l'eau des Maths à un terrain cuit.
11. **`region_map.py` :** reprend toujours `island_maths.py`.
12. **L'atelier `/dev/explorer-atelier` :** il ne montre que l'île des Maths.

### La généralisation proposée

1. **Un registre des îles en 3D**, par exemple `stylized3d/islands3d.ts` : pour chaque matière, le modèle, l'image de repli, les régions, l'eau (ou `null`), les pièces animées (ou `null`), les îlots et les dimensions. `ISLANDS_IN_3D` découle de ses clés.
2. **`MathsIsland3D` devient `Island3D({ config })`** : chiffres et eau deviennent facultatifs.
3. **Régions par île** : `regionMask(layout)`, `focusOf(subjectId, regionId)` ; la teinte reçoit la disposition.
4. **L'eau en paramètre** : le π devient un « polygone de lac », la rivière est facultative, la carte de région n'a de l'eau que si son terrain en déclare.
5. **`Islet` générique**, un par îlot déclaré.
6. **`IslandStage` affiche toutes les îles du registre**, chacune à sa place (8 m d'écart). La teinte ne s'applique qu'à l'île regardée.
7. **`ExplorerScreen`** vise l'île de l'adresse, et refuse une île qui n'existe pas en 3D.
8. **`region_map.py`** reçoit le script de l'île en paramètre (`EXPLORER_ISLAND`).
9. **L'atelier** reçoit `?ile=` et des interrupteurs (teinte, îlots, animations réduites).

### Règles de robustesse (`CLAUDE.md`)

- **Modèles :** `useModel` / `preloadModel` de `@/lib/three/useModel`, jamais `useLoader` ni rien qui suspende sous un `Canvas`.
- **Rythme des images :** le Canvas est en `frameloop="never"` et `FrameDriver` calcule les images, 60 par seconde au plus. Il fait aussi avancer l'horloge de la scène (`SCENE_TIME`, `@/lib/three/sceneClock`) : toute animation la lit, jamais `clock` de R3F, et toute scène qui montre l'eau, l'herbe ou les nuages prend `FrameDriver`.
- **Écran caché :** `useSceneActive()` arrête tout à fait la boucle de `FrameDriver` quand l'onglet est caché ou l'app en arrière-plan.
- **Une seule scène, montée à la racine sur Android :** Android détruit le contexte 3D d'un écran que react-native-screens retire de la fenêtre (onglet caché, niveau ou avatar ouvert par-dessus). La scène d'Explorer y est donc montée sous la pile de navigation, hors de react-native-screens, par `ExplorerStageHost` (`stage/`), à la première visite d'Explorer, et gardée jusqu'à la déconnexion. L'écran Explorer confie ses props à l'hôte (`ExplorerStage`, `stageStore.ts`). Sur iOS et le web, où le contexte survit, `ExplorerStage` dessine la scène dans l'écran, comme avant (`ROOT_STAGE`). Une île de plus s'ajoute donc dans `IslandStage`, comme avant, sans rien changer à l'hôte.
- **Fonds transparents :** sur Android, la scène se voit à travers trois fonds transparents : l'espace élève, l'onglet Explorer (`SEE_THROUGH`) et l'écran Explorer. Tout nouvel écran ou onglet garde le fond du thème, y compris dans un `contentStyle` ou un `sceneStyle` qui lui est propre (garde : `opaqueScreens.test.ts`, qui ne lit que les `_layout.tsx`). Rien de 3D ne passe au-dessus des vues de l'écran : un panneau ou un bouton sur l'île est une vue React Native posée par-dessus.
- **Scène cachée hors de l'onglet :** l'écran Explorer publie `shown` (`useTabShown`) : vrai tant qu'Explorer est l'onglet choisi, même sous un niveau ou l'avatar. Faux, l'hôte rend la scène transparente (opacité nulle, jamais `display: 'none'`) : la transition d'un écran ouvert depuis un autre onglet laisse voir le fond de l'app, pas l'île, et la vue 3D garde son contexte.
- **Contexte détruit malgré tout :** `Hd2dPost` saute l'image tant que le contexte est mort (`isContextDead`), et R3F reconstruit la scène dans le nouveau. Pas de `useSceneKey()` pour Explorer.
- **Erreur dans la scène :** `SceneBoundary` journalise l'erreur et affiche l'image de repli, puis la scène est retentée à la visite suivante d'Explorer (`StageView`), retour au premier plan compris.
- **Sans WebGL :** image fixe pour l'île et vue en liste pour la carte. La vue en liste sert aussi avec un lecteur d'écran.
- **« Réduire les animations » :** l'île est figée, l'eau et l'herbe sont immobiles, la caméra saute sans glisser. La scène ne se dessine alors que quand elle change : un geste ou un déplacement demandé hors du Canvas appelle `requestSceneFrames()`, une pièce qui bouge encore appelle `invalidate()` dans son `useFrame`.
- **Couleurs :** uniquement dans `src/theme/explorerArt.ts`.
- **Textes :** uniquement dans `src/i18n/fr.ts`, y compris `fr.explorer.islandNames`, qui contient déjà les six matières.

---

## 7. Vérifier

- **`npm run check`** : lint, types et tests, dont :
  - les gardes du contenu (`server/content/*.test.ts`) ;
  - les régions (`regions.test.ts`) ;
  - les emplacements des villes (`regionMap.test.ts`) ;
  - l'eau (`water.test.ts`) ;
  - les modèles 3D (`assets.test.ts`) : extensions, images, attributs et poids de chaque GLB ;
  - les cartes pré-rendues : disposition à jour et empreinte des tuiles (`mapExport.test.ts`), budgets (`tiles/budget.test.ts`) ;
  - la progression.
- **L'atelier `/dev/explorer-atelier`** (`npm run web`) : faire le tour de l'île et vérifier la texture cuite, le vent dans l'herbe, l'eau calée sur les rives peintes et la cascade.
- **Le web en 390 px de large :** les trois vues, l'aller-retour X1 → X2a → X2b, la vue en liste.
- **Le Pixel, dans Expo Go :**
  - fluidité ;
  - boutons touchables ;
  - bouton retour d'Android ;
  - retour depuis un autre onglet (dont plusieurs allers-retours avec l'Accueil) et depuis un écran empilé (niveau, avatar), sans erreur ni rechargement : avec le compteur de performance allumé dans l'atelier, le `Contexte n°` ne change pas et un seul contexte est vu ;
  - aucun autre écran ne laisse voir l'île, une fois Explorer visité ;
  - « Réduire les animations » ;
  - TalkBack ;
  - ces vérifications de la scène montée à la racine sont à refaire à chaque montée de version de React Native, react-native-screens, expo-gl ou R3F : le détachement des écrans et leur composition peuvent changer.
- **Les budgets :** triangles (`EXPLORER_STATS`) et poids des fichiers GLB (tableau affiché par `npm run explorer:clean`, plafonds vérifiés par `assets.test.ts`).
- **Une carte pré-rendue, sur le Pixel, avec le compteur de performance :**
  - au repos, la ligne « Animations de la carte » reste à 30 mises à jour par seconde au plus, et tombe à 0 avec « Réduire les animations » ;
  - la ligne « Fil de l'interface » donne le rythme des images, leur p95, la pire et celles en retard (plus d'une fois et demie l'image médiane). La relever au repos et pendant un lancer, animations allumées puis réduites : un écart net entre les deux dit ce que coûtent les nuages et les reflets. S'il est trop lourd, passer les bouffées et les reflets en petites images douces, ou en poser moins ;
  - chaque relevé affiché est un commit React (quelques-uns par seconde : celui de la carte n'est publié que s'il change, celui du Canvas de l'avatar deux fois par seconde), qui suspend un instant les mises à jour de Reanimated : juger la fluidité d'un lancer au doigt, compteur éteint ;
  - sur iOS, le serveur de rendu (ombres floues composées hors écran) ne retarde pas le fil de l'interface : il se mesure dans Instruments (Core Animation) ;
  - les nuages ne se voient que dans le ciel, les reflets jamais sur la berge.
- **La validation de Romain sur son téléphone, à chaque étape** (`ROADMAP.md`).

---

## 8. Liste des étapes pour une nouvelle île

Chaque étape se termine par une validation de Romain sur son téléphone.

1. **Le référentiel :** relire son schéma, repérer les domaines, l'ordre, les prérequis et les brouillons.
2. **Le contenu :**
   - fichier de l'app ;
   - copie serveur, banque et chargeur ;
   - test de garde et instantané.
3. **Les régions :**
   - au plus trois régions sur l'île, plus des îlots ;
   - les décors du thème prévus pour chaque région ;
   - les couleurs dans `explorerArt.regions`.
4. **L'inspiration :** partir de l'image de `assets/inspirations/explorer/`, puis fixer le relief (eau ou non, et sa forme) et les décors avec Romain.
5. **Le script Blender de l'île** (`island_<matière>.py`), en reprenant la structure de `island_maths.py` et sa ligne repère :
   - aperçus rapides jusqu'à validation ;
   - puis cuisson, quantification, nettoyage (`npm run explorer:clean`, avec la règle du nouveau GLB dans `modelRules.ts`) et image de repli.
6. **`regions.json` et `water.json`** pour cette île, puis le test des régions (`PROPS`).
7. **La généralisation de l'app** (section 6), la première fois seulement.
8. **Les cartes de région :** pour chaque région, le plan, l'aperçu et l'ajustement, les monuments, la cuisson, puis la déclaration dans `terrains.ts` et `monuments.ts`. Puis la carte pré-rendue : `npm run explorer:layout`, les passes `sol` et `planches`, la découpe, et la région ajoutée à `PRERENDERED_MAPS`. Validation région par région.
9. **Le script `explorer:models`**, mis à jour avec les nouvelles commandes.
10. **Les budgets :** vérifier le poids et les triangles, et alléger si besoin.
11. **La documentation :** mettre à jour ce guide, `README.md` et `CLAUDE.md` (commandes), et `ROADMAP.md` (statut).

---

## 9. Dette connue et pièges relevés

Ces points ont été relevés en relisant le code le 6 octobre 2026. Aucun n'est encore corrigé. Ils sont à traiter quand on y touche, ou avant la publication.

**Rendu et accessibilité**

- **Chiffres de la cascade avec « Réduire les animations »** (probable, non vérifié à l'écran). Ils ne sont placés que lorsque l'animation tourne. Sinon, ils restent tous au centre du plateau.
- **Flèches du panneau de ville :** 44 px de large, sous les 48 px minimum.
- **Un modèle qui ne se charge pas** (réseau, fichier abîmé) est seulement journalisé : l'île ne s'affiche jamais, et l'image de repli non plus.
- **L'image de repli** semble environ 4 % plus grande que l'île en 3D (`IMAGE_MARGIN` appliqué dans le mauvais sens). À vérifier à l'œil.

**Modèles et poids**

- **L'île des Maths pèse 1,53 Mo** (budget 1,5) et l'îlot 0,54 Mo, après le nettoyage du 16 octobre 2026 (normales et UV inutiles retirés).
- **La carte de Nombres pèse 3,40 Mo** après le même nettoyage (5,6 Mo avant), dont 57 % pour les brins. À charger à la demande (`ROADMAP.md`).
- **Les fleurs du kit ne sont pas allégées :** environ 207 000 triangles pour toutes leurs instances sur la carte de Nombres.
- **Le modèle de l'île date d'avant un changement de `grass()`.** Une nouvelle cuisson donnerait une herbe un peu différente.
- **Les pièces du kit n'ont pas leur origine au pied :** la barrière est à moitié enterrée sur les cartes simples.
- **L'aperçu des monuments** utilise 12° de champ, l'app 4°.

**Code**

- **`regionMap.ts` écrit 0,7 en dur** au lieu de `CITY_PASS_SCORE`.
- **Les régions déjà vues sont gardées par appareil**, pas par compte (`explorer.regionsSeen.v1`). Deux élèves sur un même téléphone partagent cette liste.
- **Des commentaires parlent encore d'une « brume »** sur les régions, retirée le 1er octobre.
- **La passe de plan de `region_map.py`** n'est pas dans `package.json`.
- **Les capacités d'un niveau** ne sont pas dans le contenu de l'app (`Level`). Elles sont dans la banque du serveur.

**Contenu**

- **Toutes les villes sont jouables,** alors que seules les villes relues par un enseignant devraient l'être avant publication.
- **Il manque 14 évaluations « Bilan »** dans le référentiel.
