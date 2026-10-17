# Explorer : passation pour un agent sans contexte

**Pour qui :** un agent de code qui découvre le projet (par exemple Claude Opus 5.5 dans Devin, sur sa propre machine virtuelle), sans accès à l'historique des sessions précédentes.
**État décrit :** branche `explorer/rendu-v2` au 17 octobre 2026, partie de `dev` au commit `f9562ec`.
**Ordre de lecture :** ce fichier en entier, puis `CLAUDE.md` (conventions du dépôt, elles font foi), puis `docs/explorer-creer-une-ile.md` (chaîne Blender).

Ce document dit d'où l'on part, ce que Romain (le porteur du projet) veut, comment il le veut, et comment travailler. En cas de contradiction, l'ordre de priorité est : les validations de Romain, puis `CLAUDE.md`, puis ce document, puis le code.

---

## 0. Règles absolues

À respecter avant toute action. Une seule entorse peut coûter des données réelles ou une publication ratée.

1. **Aucune donnée réelle.**
   - Ne jamais écrire dans la base Supabase partagée : pas de migration, pas de seed, pas de connexion avec un vrai compte.
   - Travailler en mode simulé : `EXPO_PUBLIC_BACKEND=mock EXPO_PUBLIC_TUTOR_MODE=mock`. Les comptes sont en mémoire : `lea@tutoria.test` (élève de 4e, reliée à Claire), `claire@tutoria.test` (parent), `hugo@tutoria.test` (5e, sans onboarding). N'importe quel mot de passe non vide est accepté.
   - Aucune clé réelle dans la machine : pas de `.env` rempli. Sans `.env`, l'app passe d'elle-même en mode simulé.
2. **Git.**
   - Créer chaque branche depuis `explorer/rendu-v2`, avec un nom clair en français : `explorer/eau-et-rives`, `explorer/disposition-nombres`.
   - Ne jamais pousser sur `main`, `dev` ni `explorer/rendu-v2`. Ne jamais faire de force push, de merge ni de rebase d'une branche partagée.
   - Commits au format Conventional Commits, petits et cohérents.
   - Ouvrir une pull request vers `explorer/rendu-v2`. C'est Romain qui fusionne.
3. **Fichiers interdits.**
   - Ne pas toucher à `.env*`, `eas.json`, `supabase/` ni `.github/`.
   - Une autre session travaille sur ces fichiers, qui restent en lecture seule : `src/theme/explorerArt.ts`, `src/features/explorer/LevelScreen.tsx`, `src/features/explorer/components/level/LevelSheet.tsx`, `src/app/niveau.tsx`, `src/app/dev/catalogue.tsx`.
   - Les nouvelles couleurs de la carte vont dans `src/theme/mapArt.ts`.
4. **Rien qui publie.** Pas de `npm run update:preview`, pas de build ni de déploiement EAS, pas de déploiement du serveur.
5. **Honnêteté.** Ne jamais présenter comme vérifié ce qui n'a pas été exécuté ou regardé. Montrer les images avant/après de tout changement visible.

---

## 1. Le produit et l'onglet Explorer

- **Tutor'IA** est un compagnon de révision scolaire par IA pour des élèves du primaire au lycée, **souvent mineurs**. Le ton est complice et tutoie. Une erreur n'est jamais présentée comme un échec : pas d'animation de déception, des encouragements.
- **Stack :** Expo SDK 57 (React Native 0.86, nouvelle architecture, React 19.2), Expo Router, TypeScript strict, Reanimated 4.5, react-native-gesture-handler 2.32, React Three Fiber 9.8 et three 0.186 sur expo-gl 57.0.2. L'app est d'abord mobile (iOS, Android), puis web avec le même code.
- **L'onglet Explorer** est le côté « jeu vidéo » de l'app :
  - **X1** : le carrousel des îles (une île par matière ; seule l'île des Maths est construite), en 3D temps réel ;
  - **X2a** : les régions d'une île, toujours en 3D ;
  - **X2b** : la **carte d'une région**. Les villes sont des clairières, chacune avec un monument et un arc de niveaux, reliées par un seul chemin de planches. L'avatar de l'élève y marche de niveau en niveau ;
  - **X3** : l'écran d'un niveau (`/niveau`), hors du périmètre de ce document.
- **Région pilote :** `maths-nombres` (« Nombres et calculs »), 6 villes et 43 niveaux, dans l'ordre du chemin : Relatifs (balance des signes), Fractions (tartes), Produits de fractions (moulin), Puissances (tour de cubes), Calcul littéral (maison des lettres), Équations (balance). Chaque ville finit par une évaluation (disque rouge, plus grand).
- **Objectif de Romain**, dans ses mots : « que le jeu soit d'un niveau professionnel et ait un niveau de production pour commercialiser l'app ».

---

## 2. D'où l'on part

### 2.1 Ce qui est fait dans `explorer/rendu-v2`

Rien n'est encore vérifié sur un vrai téléphone. Romain teste sur un Pixel 8 Pro, avec une variante « Tutor'IA Labo » de l'app (`npm run start:labo:tunnel`, voir `CLAUDE.md` §9).

**P0 · Fondations**

- **Mesure :** `src/lib/three/PerfProbe.tsx` et `PerfHud.tsx` (affichage en développement).
- **Cadence :** `FrameDriver` (60 images/s au plus, aucune si l'onglet est caché) et horloge de l'app `SCENE_TIME` (`src/lib/three/sceneClock.ts`).
- **Netteté :** FXAA et rendu à 2 px/dp au plus dans `hd2d/Hd2dPost.tsx` (`postSize.ts`).
- **Poids :** GLB allégés par `scripts/clean-glb.ts`, d'après la liste blanche de `logic/modelRules.ts`.
- **Android :** la scène de l'île est montée à la racine de l'app, sous la navigation (`src/features/explorer/stage/`), pour ne plus perdre le contexte GL à chaque changement d'onglet. Les règles sont dans `CLAUDE.md` §10 (« Contexte 3D sur Android »).

**P1 · La carte X2b pré-rendue**

- Le sol de la carte est **une image rendue par Blender (Cycles)**, découpée en tuiles WebP et affichée par React Native. Il n'y a plus de 3D pour le sol de la carte.
- Les tuiles sont toutes montées dans une vue que le **fil UI** déplace (Reanimated), sans commit React pendant le défilement.
- Les disques de niveau, les halos et le chemin parcouru sont des **sprites** rendus par Blender.
- Les icônes, les étoiles, les bannières des villes et les cibles tactiles de 48 dp sont des composants React Native.
- L'avatar est la seule 3D de la carte : une **petite scène R3F transparente posée dans la vue déplacée**, qui bouge donc exactement avec les tuiles.
- Les étapes :
  - P1.2 : projection et export de la disposition ;
  - P1.4 : tuiles et défilement ;
  - P1.5 : disques et chemin ;
  - P1.6 : avatar ;
  - P1.7 : vie de la carte (reflets, nuages) ;
  - P1.8 : sensation de jeu (étoiles qui apparaissent, chemin qui avance, déverrouillage, ville validée, retours au toucher).

  Chaque étape a été codée puis relue deux fois (conformité et qualité). Les points mineurs relevés sont repris dans le backlog (§ 8).

### 2.2 Décisions déjà prises (ne pas les rouvrir)

- **Style du monde :** une maquette réaliste miniature, sans contour noir, sans toon. Les couleurs du monde sont libres (palette d'art, hors charte de la marque).
- **Disques de niveau :** couleurs **vives**, telles qu'installées. Romain a refusé une version plus « calibrée » : ne pas les recolorer ni les recalibrer sans lui montrer.
- **Herbe des tuiles :** la version « intermédiaire » (propre mais vive), choisie par Romain.
- **L'île (X1, X2a) :** gardée telle quelle. Seules les améliorations techniques sont permises, et l'anticrénelage doit être montré avant/après.
- **Caméra de la carte :** orthographique, 52° d'élévation, azimut nul. Tuiles à 224 px/m (« 2x »), WebP q80 de 512 px.
- **Pas de module natif nouveau :** tout doit marcher dans Expo Go.

### 2.3 Défauts constatés et confirmés par Romain

Ils viennent de captures de l'app web en 390 px, avec Léa :

1. **L'eau du π est moche.** Elle est granuleuse, comme une moquette, et sombre près de la Ville des Équations. La **démarcation entre la terre et l'eau est trop forte** : une ligne droite, sans rive ni pente.
2. **La Tour des Puissances :** l'évaluation des Puissances (nœud 25) et la première leçon du Calcul littéral (nœud 26) se chevauchent (0,4 m d'écart sur le plan image), et le disque 25 semble posé au sommet de la tour. C'est le seul chevauchement de la région.
3. **(Corrigé, piste B.) Les bannières des villes cachaient des disques :** « Ville des Puissances » en recouvre deux, « Ville du Calcul littéral » un.
4. **(Corrigé, piste B.) Le chemin miel traversait des niveaux fermés :** il est coloré jusqu'au niveau le plus avancé, alors que les villes ne s'ouvrent pas forcément dans l'ordre du chemin. La carte 3D d'avant avait déjà ce défaut.
5. **(Corrigé, piste B.) Les noms longs débordaient dans le titre du HUD :** « Ville des Produits de fractions » passe sous le bouton de droite.
6. **Des traînées d'herbe en étoile** convergent vers le moulin (Produits de fractions), sur sa gauche. C'est un défaut de la cuisson.

---

## 3. Ce qu'on veut : bible de style et budgets

### 3.1 Trois couches

- **Le monde** (île, terrain, eau, monuments, décor, avatar) : palette d'art libre (`tools/explorer-3d/lib/palette.py`, `src/theme/explorerArt.ts`, `src/theme/mapArt.ts`), jamais de contour.
- **Le HUD posé sur le monde** (disques, étoiles, bannières, panneaux, boutons) : vocabulaire de jeu vidéo (police Lilita One, bois, boutons en relief, liseré bleu nuit `#16244f`). Ses pièces sont dans `src/components/game/`.
- **L'UI de la marque** (les autres onglets) : le design system de `design/`.

### 3.2 Le monde

- **Matières :** une maquette miniature réaliste. Herbe de prairie avec des zones sèches, terre sombre, pierre grise, bois clair. Jouets peints aux couleurs douces et passées, arêtes usées, biseaux. Monuments soignés comme des figurines. Pas d'arbres ni de buissons sur les cartes.
- **Lumière :** un seul soleil de fin d'après-midi plus le ciel, le même partout (cuisson, eau, pré-rendu, avatar) : direction `sun` de la disposition exportée, `[-0.67, 0.656, 0.348]`. Les ombres sont teintées, jamais noires.
- **Détail par fréquence (contre le bruit) :** des variations à grande échelle (0,5 à 5 m : zones sèches, bande foulée le long du chemin, clairières plus claires, bords humides) ; touffes, trèfle et galets en vraie géométrie ; **aucun détail cuit sous 2 px à l'écran**.
- **Zones calmes :** sous le chemin, les niveaux et les bannières, l'herbe est moins contrastée. L'interface reste l'élément le plus contrasté de l'écran.
- **Contact :** chaque objet touche le sol (occlusion et ombre douce à l'opposé du soleil), l'avatar et les disques compris.
- **Eau :** elle doit ressembler à de l'eau de maquette réaliste, comme celle de l'île en 3D (`src/features/explorer/stylized3d/water.ts`) :
  - claire et turquoise près du bord, plus profonde au centre, avec le ciel qui s'y reflète ;
  - des caustiques douces, sans grain visible à l'agrandissement du téléphone (×1,3) ;
  - une **rive** qui fait la transition : berge humide plus sombre, légère pente, fine ligne d'écume ;
  - jamais une coupure nette entre l'herbe et l'eau.
- **Étalonnage :** un seul, `post.natural`, défini dans `hd2d/grade.ts`, appliqué à l'île en temps réel, aux tuiles pré-rendues et à l'avatar.

### 3.3 Le HUD de la carte

- **Disques :** couleurs de `explorerArt.map.node` (leçon `#2fbf5f`, exercices `#3f86f0`, évaluation `#e0504f` et plus grand, fermé `#aab2c0` avec cadenas), rebord doré (argenté si fermé), liseré `#16244f`. L'icône est à l'encre. Jamais la couleur seule : il y a toujours une icône, une taille et un libellé.
- **Halo :** `#ffd84a` sur les niveaux ouverts. Il pulse sous l'avatar, et reste immobile avec « Réduire les animations ».
- **Étoiles** en arc au-dessus des niveaux terminés ; bannière de ville en bois avec la couleur **et** l'icône de son statut.
- **Chemin :** planches posées en travers, miel `#c98f52` pour le parcouru, gris `#9b948a` pour le reste.

### 3.4 Accessibilité

- Cibles de 48 dp et contraste d'au moins 3:1 (disque sur l'herbe, icône sur le disque).
- Libellés complets : type, titre, état, étoiles, « tu es ici », statut de la ville.
- Une vue en liste existe pour les lecteurs d'écran et sans WebGL.
- « Réduire les animations » fige le halo, l'eau, les nuages et la marche, et la 3D ne calcule plus d'images au repos.

### 3.5 Budgets (bloquants, vérifiés par les tests)

| Élément              | Budget                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| Carte d'une région   | ≤ 2 000 000 octets (tuiles, sous-couche et tronçons) ; ≤ 100 tuiles. Aujourd'hui : 85 tuiles, ≈ 1,15 Mo |
| Sprites des niveaux  | ≤ 150 Ko. Aujourd'hui : ≈ 99 Ko                                                                         |
| Cadence              | 60 images/s au plus, 30 au repos, 0 avec « Réduire les animations »                                     |
| Défilement           | aucun commit React, aucun montage pendant que la carte bouge                                            |
| Textures dans un GLB | JPEG ou PNG seulement (expo-gl)                                                                         |

---

## 4. Comment c'est construit

### 4.1 Flux de données de la carte pré-rendue

```
app (logic/regionMap.ts, mapLayout.ts, terrainLayout.ts)
  └─ npm run explorer:layout ──▶ tools/explorer-3d/layouts/maths-nombres.json  (disposition + layoutHash)
        └─ Blender : region_tiles.py (passe « sol » puis « planches ») ──▶ morceaux PNG + crops.json + segments.json
              └─ tile_map.py ──▶ assets/explorer/tiles/maths-nombres/*.webp + manifest.json
                                  + src/features/explorer/tiles/maths-nombres.generated.ts
Blender : node_sprites.py ──▶ sprite_pack.py ──▶ assets/explorer/sprites/*.webp + tiles/sprites.generated.ts
```

- **La disposition vient de l'app, jamais de Blender.** Les positions des villes, des niveaux, du chemin, des décors et des touffes sont calculées par l'app. Blender les reproduit.
- **Empreinte :** `layoutHash` = les 16 premiers caractères hexadécimaux du sha256 de `JSON.stringify([cities, nodes, path, decor, tufts])`. `src/features/explorer/logic/mapExport.test.ts` refuse des tuiles dont l'empreinte ne correspond plus à la disposition. **Toute modification de la disposition oblige à recuire les tuiles.**
- La disposition exportée contient aussi l'étalonnage, l'eau et l'herbe lus dans `explorerArt.ts`. Si ces valeurs changent, le test échoue jusqu'à `npm run explorer:layout`, et une nouvelle cuisson peut être nécessaire.

### 4.2 Projection (plan image)

- Coordonnées : `x` vers la droite, `z` vers la caméra, `y` vers le haut, en mètres.
- Plan image : `v = z·sin52° − y·cos52°`. Le pixel du rendu vaut `px = (x − x0)·ppm` et `py = (v − v0)·ppm`, avec `ppm = 224`. `x0` et `v0` sont dans le manifeste.
- Écran : la carte montre 4 m de large (`MAP_VISIBLE_WIDTH`), donc `k = largeur de l'écran en dp / 4` dp par mètre. Le point visé se trouve à 45 % de la hauteur.
- Tout cela est dans `src/features/explorer/logic/mapProjection.ts`, vérifié à 0,001 px près contre Blender.

### 4.3 Couches à l'écran, du fond vers l'avant

1. Le ciel (`components/SkyBackdrop.tsx`).
2. La vue déplacée (`components/map/RegionMapWorld.tsx`), qui contient :
   1. la sous-couche, toute l'image au quart, contre les trous ;
   2. les 85 tuiles (`MapTiles.tsx`) ;
   3. les tronçons de chemin parcouru ;
   4. les halos (anneau net, puis lueur douce) ;
   5. les disques, triés du fond vers l'avant (`LevelDisc.tsx`) ;
   6. la vie de la carte (`MapAmbient.tsx`) ;
   7. l'avatar (`MapAvatarView.tsx`, qui contient `stylized3d/MapAvatarCanvas.tsx`) ;
   8. les cibles, les étoiles et les bannières (`RegionMapMarkers.tsx`, `NodeStars.tsx`, `CityBanner.tsx`).
3. Le HUD (`RegionMapHud.tsx`), le panneau de la ville et la barre d'onglets.

### 4.4 Fichiers clés

- `src/features/explorer/ExplorerScreen.tsx` : l'écran. Il choisit la carte pré-rendue quand la région a une entrée dans `PRERENDERED_MAPS` (`tiles/index.ts`), et sinon l'ancienne carte 3D.
- `hooks/useMapPan.ts` et `logic/mapScroll.ts` : le défilement sur le fil UI (élan, élastique), en worklets.
- `hooks/useAvatarWalk.ts`, `logic/avatarWalk.ts`, `logic/avatarFrame.ts` et `stylized3d/avatarChoreo.ts` : la marche de l'avatar.
- `logic/mapMarkers.ts`, `logic/occluders.ts` et `logic/ambientLayout.ts` : le placement des marqueurs, l'occultation par les monuments et la vie de la carte.
- `tools/explorer-3d/region_tiles.py` : la cuisson de la carte. Son eau est calculée en numpy (`lib/mapwater.py`), pas par Cycles.
- `tools/explorer-3d/region_map.py` : la région de l'île agrandie (terrain, repères), que `region_tiles.py` réutilise.
- `tools/explorer-3d/lib/materials.py` (`meadow_map` : le pré) et `lib/palette.py` (couleurs du monde).
- `tools/explorer-3d/rewater.py` : refait l'eau sur des morceaux déjà rendus, sans relancer Cycles.

---

## 5. Chaîne de pré-rendu : commandes exactes

Elle se lance depuis la racine du dépôt, avec Blender 5.2.2 (`blender` dans le `PATH`) et Python 3 avec Pillow. `<sortie>` est un dossier de travail **hors du dépôt**.

```bash
# 1. Disposition (après tout changement de villes, de niveaux, de chemin ou de décor)
npm run explorer:layout

# 2. Sol : terrain, eau, monuments, décor, herbe, planches grises (≈ 60 à 80 min sur 6 fils d'un i5 portable)
EXPLORER_TILES_PASS=sol EXPLORER_TILES_THREADS=6 EXPLORER_TILES_LOG=<sortie>/render-sol.log \
EXPLORER_REGION_SCALE=6 EXPLORER_DROP=boulier,octaedre \
EXPLORER_LAYOUT=tools/explorer-3d/layouts/maths-nombres.json EXPLORER_TILES_OUT=<sortie> \
nice -n 19 blender -b --factory-startup --python-exit-code 1 -P tools/explorer-3d/region_tiles.py

# 3. Planches miel du chemin parcouru, tronçon par tronçon (≈ 35 min)
EXPLORER_TILES_PASS=planches EXPLORER_TILES_THREADS=6 EXPLORER_TILES_LOG=<sortie>/render-planches.log \
EXPLORER_REGION_SCALE=6 EXPLORER_DROP=boulier,octaedre \
EXPLORER_LAYOUT=tools/explorer-3d/layouts/maths-nombres.json EXPLORER_TILES_OUT=<sortie> \
nice -n 19 blender -b --factory-startup --python-exit-code 1 -P tools/explorer-3d/region_tiles.py

# 4. (facultatif) Refaire seulement l'eau sur les morceaux rendus, sans Cycles
EXPLORER_TILES_OUT=<sortie> EXPLORER_LAYOUT=tools/explorer-3d/layouts/maths-nombres.json EXPLORER_REGION_SCALE=6 \
blender -b --factory-startup --python-exit-code 1 -P tools/explorer-3d/rewater.py

# 5. Tuiles WebP, manifeste et module TypeScript (retirer d'abord les anciennes tuiles)
rm -f assets/explorer/tiles/maths-nombres/*.webp assets/explorer/tiles/maths-nombres/manifest.json
python3 -I tools/explorer-3d/tile_map.py <sortie> assets/explorer/tiles/maths-nombres \
  src/features/explorer/tiles/maths-nombres.generated.ts

# 6. Sprites des niveaux (seulement si les disques changent ; quelques minutes)
EXPLORER_SPRITES_COLORS=tools/explorer-3d/sprite-colors.json EXPLORER_SPRITES_OUT=<sortie-sprites> \
blender -b --factory-startup --python-exit-code 1 -P tools/explorer-3d/node_sprites.py
python3 -I tools/explorer-3d/sprite_pack.py <sortie-sprites> assets/explorer/sprites \
  src/features/explorer/tiles/sprites.generated.ts

# 7. Toujours, après Blender
rm -rf tools/explorer-3d/__pycache__ tools/explorer-3d/lib/__pycache__
npm run check
```

**Réglages utiles :**

- `EXPLORER_TILES_ZONE=x0,x1,v0,v1` limite le rendu à un rectangle du plan image, en mètres. C'est l'outil d'itération : une zone de 4 m × 3 m se rend en quelques minutes. Par défaut, la zone est `renderedRect`, tout ce que la caméra de l'app peut montrer.
- Autres réglages : `EXPLORER_TILES_SAMPLES` (64 par défaut), `EXPLORER_TILES_CROP` (côté d'un morceau, 1600 px) et `EXPLORER_TILES_PPM` (224).
- `tools/explorer-3d/sprite-colors.json` reprend les couleurs des disques de `explorerArt.ts` (`map.node`, `nodeRim`, `nodeRimLocked`, `hud.ink`). Il doit rester identique au thème.
- `<sortie>` garde les morceaux PNG 8 bits (`morceau-*.png`), `crops.json`, les `troncon-XX.png` et `segments.json`. **Garde ce dossier** : `rewater.py` en a besoin pour refaire l'eau sans relancer le rendu.
- Lancer les rendus longs en tâche de fond suivie (journal), jamais détachés sans suivi. Un rendu par machine à la fois.

**La machine compte :** ces durées sont celles d'un portable à 4 cœurs, en CPU. Une machine à 16 cœurs ou plus divise le temps d'autant. Sur une carte NVIDIA, Cycles peut rendre en CUDA ou OptiX, mais les scripts imposent `cycles.device = "CPU"` (`region_tiles.py`, `lib/bake.py`). Un réglage par variable d'environnement serait une petite modification, à faire si la machine a un GPU. Le rendu GPU ne donne pas exactement les mêmes pixels, mais la différence ne se voit plus après le débruitage.

---

## 6. Préparer la machine

Exemple de configuration Devin (Settings > Environment > Blueprints, ou `.devin/blueprint.yaml`), **à adapter** : les versions de Node et de Blender sont imposées, le reste est indicatif.

```yaml
initialize: |
  # Node 24.13.0 et npm 11 (fixés par .nvmrc et engines : npm 10 refuse le fichier de verrouillage)
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  . "$HOME/.nvm/nvm.sh" && nvm install 24.13.0 && nvm alias default 24.13.0
  # Blender 5.2.2 (cuissons) et Pillow (tuiles)
  curl -fsSL https://download.blender.org/release/Blender5.2/blender-5.2.2-linux-x64.tar.xz | tar -xJ -C "$HOME"
  sudo ln -sf "$HOME/blender-5.2.2-linux-x64/blender" /usr/local/bin/blender
  python3 -m pip install --user pillow

maintenance: |
  . "$HOME/.nvm/nvm.sh" && npm ci

knowledge:
  - name: lire d'abord
    contents: docs/explorer-passation.md puis CLAUDE.md
  - name: vérifier
    contents: npm run check (lint, types, tests) ; npm run explorer:layout après un changement de disposition
  - name: mode simulé
    contents: EXPO_PUBLIC_BACKEND=mock EXPO_PUBLIC_TUTOR_MODE=mock, jamais de vraies clés
```

**Vérifications après installation :**

- `node -v` doit donner `v24.13.0`, et `blender --version` doit donner `Blender 5.2.2`.
- `npm run check` doit passer. Exception connue : `src/components/ConfirmDialog.test.tsx` peut dépasser son délai de 20 s quand toute la suite tourne sur une petite machine, et passe seul. Ne pas le modifier.

---

## 7. Vérifier son travail

### 7.1 Tests

- `npm run check` lance le lint, les types et tous les tests. Il doit passer avant chaque commit (le hook pre-commit lance aussi `lint-staged` et `npm run typecheck`).
- Les gardes de la carte :
  - `logic/mapExport.test.ts` : la disposition et l'empreinte ;
  - `tiles/budget.test.ts` : poids, nombre de fichiers, fichiers présents ;
  - `assets.test.ts` : les GLB ;
  - `logic/occluders.test.ts` : les monuments qui cachent un niveau ; il signale aujourd'hui le nœud 25, défaut à corriger.

### 7.2 Voir l'app (web, 390 px)

- Le plus simple est le serveur de développement en mode simulé, cache vidé :
  ```bash
  EXPO_PUBLIC_BACKEND=mock EXPO_PUBLIC_TUTOR_MODE=mock npx expo start --web -c
  ```
  **Le `-c` est indispensable.** Metro garde en cache les variables `EXPO_PUBLIC_*` inlinées. Sans lui, un ancien cache peut rebrancher l'app sur le vrai Supabase alors que la variable dit `mock`. Pour vérifier, chercher `backend:'mock'` dans le bundle web. Pour un export (`npx expo export --platform web`), donner un `TMPDIR` propre pour isoler le cache de Metro.
- **Navigation :**
  1. Accueil : « Continuer comme élève ».
  2. E-mail `lea@tutoria.test`, n'importe quel mot de passe, puis « Me connecter ».
  3. Onglet Explorer, puis la région Nombres.
- La session simulée vit en mémoire : un rechargement de la page la perd. Pour aller directement à la carte après la connexion, naviguer côté client vers `/explorer?ile=maths&region=maths-nombres` (`history.pushState` puis un événement `popstate`), sans recharger.
- Les boutons de React Native Web réagissent aux vrais événements de pointeur ou de toucher, pas à un `element.click()` synthétique.
- La flèche gauche du panneau de ville fait glisser la carte jusqu'à la ville précédente : c'est le moyen le plus fiable de visiter les 6 villes.
- Capturer en 390 × 844 dp à une densité de 3, et comparer toujours **avant et après** au même endroit.
- Le rendu 3D (île, avatar) marche dans un Chrome sans carte graphique (SwiftShader), mais lentement. Compter 10 à 15 s avant la capture.

### 7.3 Ce qui ne se vérifie que sur le téléphone

- La fluidité du défilement et des lancers.
- La tenue de l'avatar sur les planches pendant un lancer.
- La mémoire avec les 85 tuiles montées.
- Le retour depuis un niveau et le changement d'onglet sur Android.

Ces points se notent dans la pull request, sous « À vérifier sur le téléphone ». Romain les vérifie sur son Pixel.

---

## 8. Backlog, par ordre de priorité

Il y a deux pistes indépendantes. **La piste A (cuisson) touche `tools/explorer-3d/`, la disposition et les assets ; la piste B (app) touche `src/`.** Romain dit dans sa demande quelle piste prendre. Ne pas faire les deux en parallèle d'une autre session sans qu'il l'ait dit, car les fichiers se recouvrent.

### Piste A · Cuisson de la carte (une seule recuisson pour A1, A2, A3 et A5)

**A1. Eau du π et rives.**

- Fichiers : `tools/explorer-3d/lib/mapwater.py` (formule de l'eau), `region_tiles.py` (fond et berge sous l'eau), éventuellement le terrain de `region_map.py`.
- Le but est celui du § 3.2 (Eau) :
  - pas de grain ;
  - un dégradé de profondeur crédible, avec le reflet du ciel ;
  - une berge humide et une légère pente entre l'herbe et l'eau ;
  - une fine écume ;
  - des caustiques discrètes et sans motif répété.
- Itérer sur une petite zone (`EXPLORER_TILES_ZONE`) qui contient la Ville des Équations et un coin du π, puis comparer à l'eau de l'île en 3D (X2a).
- Fini quand : l'image à 100 % et à ×1,3 ne montre ni grain ni coupure nette, et Romain a validé l'avant/après.

**A2. Disposition autour de la Tour des Puissances.**

- Le nœud 25 (évaluation des Puissances) chevauche le nœud 26 (Calcul littéral) et paraît posé sur la tour.
- Corriger dans la logique de disposition de l'app (`logic/mapLayout.ts`, `logic/regionMap.ts`, ou les emplacements des villes dans `stylized3d/regionSites.json`, produits par `region_map.py` en mode plan). Voir `docs/explorer-creer-une-ile.md` et `CLAUDE.md` §9.
- Ajouter un **test** qui refuse, pour chaque région pré-rendue :
  - deux disques qui se chevauchent sur le plan image (ellipses de rayon `r` et `r·sin52°`, avec une marge) ;
  - un disque caché par un monument (réutiliser `logic/occluders.ts`).
- Puis `npm run explorer:layout` et la recuisson.
- Fini quand : le test passe pour les 43 niveaux, l'empreinte des tuiles correspond, et la capture de la Tour des Puissances est propre.

**A3. Traînées d'herbe en étoile autour du moulin.**

- Trouver la cause dans `region_tiles.py` (`blade_chance`, l'adoucissement autour des monuments, l'orientation des brins) ou dans `meadow_map`.
- Fini quand : plus aucune traînée radiale autour d'aucun monument (capture des 6 villes).

**A4. Recuisson complète et livraison.**

- Lancer les passes `sol` et `planches`, puis `tile_map.py`, puis `npm run check` (budgets compris).
- Livrer les captures des 6 villes, avant et après, dans la pull request.

**A5. Passe beauté des rendus de la carte (demandée par Romain).**

Le but : que la carte de Nombres ait l'air d'un grand jeu mobile, pas seulement « propre et cohérente ». Cette passe se fait **après A1 à A3**, et se termine par la même recuisson que A4 (une seule cuisson complète pour tout).

- **Périmètre :** la carte pré-rendue (sol, eau, monuments, décor, planches, sprites des disques). L'île en 3D (X1, X2a) n'en fait pas partie, sauf si Romain le demande.
- **Pistes, par ordre d'effet attendu :**
  1. **Lumière et matières :** une occlusion ambiante plus présente au pied des objets, des ombres de contact douces, une lumière chaude qui accroche les arêtes biseautées des monuments, un léger dégradé de brume sur les bords de l'île.
  2. **Une ambiance par ville :** une teinte de sol propre à chaque clairière et quelques accessoires autour du monument qui racontent sa notion (sans arbres ni buissons).
  3. **Des décors plus riches :** décors groupés en massifs plutôt que semés au hasard, plusieurs espèces de fleurs (une par massif), de vraies pierres moussues, des repères à mi-hauteur (murets de pierre sèche, panneau à l'entrée de chaque ville, bouts de barrière).
  4. **Des planches vivantes :** clous, coins ébréchés, planches à venir un peu envahies par l'herbe, chemin parcouru dégagé, planches plus courtes dans les virages serrés.
  5. **Des contrôles automatiques de l'art** à chaque rendu (`tools/explorer-3d/check_tiles.py`) : teinte et contraste de l'herbe, pixels saturés, ordre des valeurs (sol plus sombre que les planches à faire, elles-mêmes plus sombres que les planches faites), contraste des disques sur le sol à chaque position du manifeste.
- **Ce qui ne bouge pas :**
  - les décisions du § 2.2 (disques vifs, herbe « intermédiaire », caméra, densité des tuiles) ;
  - les règles du § 3 (aucun détail sous 2 px à l'écran, zones calmes sous le chemin et les niveaux, l'interface reste l'élément le plus contrasté) ;
  - les budgets du § 3.5 (2 Mo par région au plus).
- **À demander à Romain avant de le faire :** déplacer le soleil (il est partagé par l'île, l'eau et l'avatar, donc tout serait recuit), et réduire ou retirer les grands repères de l'île visibles sur la carte.
- **Méthode :**
  1. Si Romain a joint des captures de jeux de référence, s'en servir comme cible commune.
  2. Rendre de petites zones (`EXPLORER_TILES_ZONE`) qui contiennent une ville entière, et montrer à Romain des planches avant/après à 100 % et à la taille du téléphone.
  3. Ne garder que ce que Romain valide, puis faire la recuisson complète.

### Piste B · Finition de l'app (faite le 17 octobre, sauf la fin de B4)

- **B1. Bannières des villes : fait.** `cityBannerPlaces` (`logic/mapMarkers.ts`) place chaque bandeau derrière le cercle de ses niveaux si la place est libre, sinon devant, à gauche ou à droite. Un test vérifie, à Nombres, qu'aucun bandeau ne cache un disque, une rangée d'étoiles ni un autre bandeau.
- **B2. Chemin miel : fait, règle validée par Romain.** Un tronçon est miel s'il relie deux niveaux terminés, ou un niveau terminé au niveau à jouer (`honeyGaps`). La même règle sert à la carte 3D (`mapPath.ts`) et à la célébration (`progressSince`).
- **B3. Titre du HUD : fait.** Un nom de plus de 20 lettres passe à 18 pt, sur deux lignes au besoin (`RegionMapHud.tsx`).
- **B4. Points mineurs des relectures de P1 :**
  - fait : la boucle d'inertie ne tourne plus que pendant que la carte glisse (`useMapPan.ts`), avec `scheduleOnUI` à la place de `runOnUI` ;
  - fait : sous la vue en liste, les nuages, les reflets, le halo et la scène de l'avatar s'arrêtent ;
  - fait : sur le web, la vue de l'avatar suit la densité réelle du Canvas (2 au plus) ;
  - fait par P1.6 : `MapTiles` est mémoïsé, et l'ouverture d'une fiche ne recalcule plus les 85 tuiles ;
  - gardé tel quel, par choix : le halo qui pulse marque le niveau à jouer (le pion), et « tu es ici » l'endroit où se tient l'avatar. Les deux peuvent différer, comme sur la carte d'un jeu ;
  - reste : mettre en pause la scène de l'avatar quand il sort de l'écran, sans commit React pendant le défilement ;
  - reste : faire attendre au voile les sprites des disques ;
  - reste : synchroniser le départ d'une marche (1 à 3 images de glissade possibles).
- **B5. Défilement au doigt sur le web : vérifié, il marche.** Le premier essai partait du panneau de la ville, qui ne fait pas défiler la carte.

### Plus tard (ne pas commencer sans l'accord de Romain)

- **Avatar v2.** Figurine originale, budgets par tenue (8 000 triangles par défaut, 12 000 au plus), même étalonnage partout. Ne jamais casser les identifiants de la garde-robe, les rangs de `AvatarLook` ni les noms des pièces (voir `CLAUDE.md` §10).
- **Chaîne de production :** `npm run explorer:tiles -- <région>`, budgets en CI, régions téléchargées à la demande.
- **Les trois autres régions des Maths,** et la passe « effet waouh » de `ROADMAP.md` (section « En attente »).
- **Nettoyage :** suppression de `region-maths-nombres.glb` et de `strip-nombres.glb` une fois l'ancienne carte inutile pour Nombres. Attention : `occluders.test.ts` lit aujourd'hui `strip-nombres.glb`.

---

## 9. Pièges connus

- **expo-gl** ne décode que le JPEG et le PNG, n'a pas de MSAA dans une texture et pas de textures compressées. Jamais `gltf-transform optimize`, ni WebP, KTX2, Draco ou Meshopt **dans un GLB**. Le WebP est parfait pour les images affichées par React Native, comme les tuiles.
- **R3F en natif ignore la prop `dpr`** et dessine à la densité de l'écran (jusqu'à 3).
- **Pendant que la carte bouge :** Reanimated suspend ses mises à jour à chaque commit React. Il ne faut donc ni `setState` ni montage pendant un défilement. Jamais de react-native-svg pour une grande surface : un seul SvgView de la taille de la carte pèserait 110 à 170 Mio.
- **Android et react-native-screens :** une vue retirée de la fenêtre détruit le contexte GL. Ne jamais changer les fonds transparents de la scène (`SEE_THROUGH`) ; `opaqueScreens.test.ts` le garde.
- **Modèles 3D :** toujours `useModel` et `preloadModel` (`@/lib/three/useModel`), jamais `useLoader` ni rien qui suspende sous un Canvas.
- **Blender :**
  - la sortie standard de Blender en tâche de fond peut perdre ses messages : utiliser `EXPLORER_TILES_LOG`, qui redirige tout vers un fichier ;
  - toujours passer `--python-exit-code 1` ;
  - supprimer les `__pycache__` après coup ;
  - la qualité JPEG des GLB se règle par `export_image_quality` (Blender 5.2 ignore `export_jpeg_quality`).
- **Couleurs en dur** interdites hors de `src/theme/` (ESLint). Les textes affichés vont dans `src/i18n/fr.ts`. Les erreurs sont journalisées par `logError`.
- **Fichiers générés :** ne jamais modifier à la main `*.generated.ts` ni `tools/explorer-3d/layouts/*.json` ; les régénérer.

---

## 10. Lancer une session Devin

Premier message à coller, sur une session ouverte sur le dépôt `Romainmlt123/TutorIA` :

```
Lis d'abord docs/explorer-passation.md en entier, puis CLAUDE.md : ils font foi.
Crée ta branche explorer/eau-et-rives à partir de origin/explorer/rendu-v2.
Prends la piste A du backlog (§ 8), dans l'ordre : A1 eau et rives, A2 disposition autour de la Tour des Puissances (avec le test anti-chevauchement), A3 traînées d'herbe autour du moulin, puis A5 la passe beauté des rendus de la carte, et termine par une seule recuisson complète (A4).
Ne touche pas aux fichiers de l'app hors de la piste A (src/features/explorer/components, hooks, ExplorerScreen.tsx) : une autre session y travaille.
Règles git strictes : ne pousse jamais sur dev, main ni explorer/rendu-v2 ; jamais de force push, de merge ni de rebase de ces branches. Pousse seulement explorer/eau-et-rives et ouvre une pull request vers explorer/rendu-v2. Ne fusionne rien.
Mode simulé uniquement (EXPO_PUBLIC_BACKEND=mock), aucune connexion à Supabase, aucune clé.
Itère sur de petites zones (EXPLORER_TILES_ZONE) et montre-moi les avant/après (eau d'abord, puis chaque idée de la passe beauté) avant la recuisson complète.
```

## 11. Rendre compte à Romain

Romain écrit en français ; lui répondre en français, avec des phrases courtes. Chaque pull request contient :

1. ce qui a été fait, fichier par fichier ;
2. les commandes lancées et leur résultat (la fin de `npm run check`) ;
3. les **captures avant et après**, au même endroit et à la même taille ;
4. ce qui reste à vérifier sur le téléphone ;
5. les décisions qui lui reviennent, formulées comme des questions fermées.
