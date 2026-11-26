# Explorer : passation pour un agent sans contexte

**Pour qui :** un agent de code qui découvre le projet (par exemple Claude Opus 5.5 dans Devin, sur sa propre machine virtuelle), sans accès à l'historique des sessions précédentes.
**État décrit :** branche `explorer/rendu-v2` au 17 octobre 2026, partie de `dev` au commit `f9562ec`.
**Ordre de lecture :** ce fichier en entier, puis `CLAUDE.md` (conventions du dépôt, elles font foi), puis `docs/explorer-creer-une-ile.md` (chaîne Blender).

Ce document dit d'où l'on part, ce que Romain (le porteur du projet) veut, comment il le veut, et comment travailler. En cas de contradiction, l'ordre de priorité est : les validations de Romain, puis `CLAUDE.md`, puis ce document, puis le code.

## État livré de C5

Les visuels v9 et v10 sont approuvés. Le premier cadrage général se centre sur les nœuds du parcours ; le zoom minimal garde son propre cadre. Nombres dispose d'un terrain de contexte basse définition couvrant l'île, avec les silhouettes jointives des régions voisines sous le terrain rendu. Les transitions ont des nuages progressifs ; le vent visuel et le souffle audio ne se jouent que pendant le trajet aller vers la carte. Aucune secousse de caméra ni vibration n'est souhaitée.

Les règles temporelles testées vivent dans `src/features/explorer/logic/`. Les hooks d'orchestration sont dans `hooks/`, les composants d'affichage dans `components/`, et les outils de génération dans `tools/explorer-3d/`. Commandes de régénération : `npm run explorer:region-shadows`, `python3 -I tools/explorer-3d/context_map.py <dossier-rendu> maths-nombres`, `blender -b -P tools/explorer-3d/cloud_sprite.py` et `python3 -I tools/explorer-3d/generate_dive_wind.py`.

---

## 0. Règles absolues

À respecter avant toute action. Une seule entorse peut coûter des données réelles ou une publication ratée.

1. **Aucune donnée réelle.**
   - Ne jamais écrire dans la base Supabase partagée : pas de migration, pas de seed, pas de connexion avec un vrai compte.
   - Travailler en mode simulé : `EXPO_PUBLIC_BACKEND=mock EXPO_PUBLIC_TUTOR_MODE=mock`. Les comptes sont en mémoire : `lea@tutoria.test` (élève de 4e, reliée à Claire), `claire@tutoria.test` (parent), `hugo@tutoria.test` (5e, sans onboarding). N'importe quel mot de passe non vide est accepté.
   - Aucune clé réelle dans la machine : pas de `.env` rempli. Sans `.env`, l'app passe d'elle-même en mode simulé.
2. **Git.**
   - Tout le travail d'Explorer est sur `explorer/rendu-v2` (pas encore sur `main` ni `dev`, la branche par défaut du dépôt étant `main`). Créer chaque branche depuis `origin/explorer/rendu-v2` à jour, avec un nom clair en français : `git fetch origin` puis `git switch --no-track -c explorer/c1-direction-artistique origin/explorer/rendu-v2`.
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

### 2.2 Carte blanche, et ce qui ne bouge pas

**Carte blanche (décision de Romain, 18 octobre 2026).** Tout ce qui existe dans Explorer peut être refait, si c'est pour faire mieux : l'île (par exemple pour y poser de vraies villes), les régions, la carte, les monuments, le soleil, l'herbe, l'avatar, le HUD de jeu, la chaîne Blender. **La seule condition de Romain : rester optimisé pour une app mobile, sans alourdir l'app** (budgets du § 3.5, bloquants).

Ce qui ne bouge pas pour autant :

- **Les budgets mobiles du § 3.5** et la compatibilité avec Expo Go. Un module du SDK présent dans Expo Go (`expo-audio`, `expo-haptics`) demande l'accord de Romain et un nouveau build EAS ; aucun autre module natif.
- **La famille de style :** une maquette réaliste miniature, sans contour noir ni toon (Romain l'a validée, et la variante de C1 s'y tient). Les couleurs du monde sont libres (palette d'art, hors charte de la marque).
- **Les disques de niveau restent vifs** et toujours plus contrastés que le décor (Romain a refusé une version plus « calibrée ») ; jamais la couleur seule pour dire un état.
- **Les contrats de données :** identifiants des niveaux, des villes et des régions, de la garde-robe et de `AvatarLook` (voir `CLAUDE.md` §10), progression enregistrée par le serveur.
- **Les règles techniques prouvées** (§ 4 et § 9) : la carte d'une région en tuiles affichées par React Native, le défilement sur le fil UI sans commit React, l'avatar dans la vue déplacée, la scène de l'île à la racine sur Android. Les remplacer demande une mesure qui prouve mieux, montrée à Romain.
- **L'accessibilité** (§ 3.4) et les règles des stores pour un public mineur (`CLAUDE.md` §6).

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

- **Matières :** une maquette miniature réaliste. Herbe de prairie avec des zones sèches, terre sombre, pierre grise, bois clair. Jouets peints aux couleurs douces et passées, arêtes usées, biseaux. Monuments soignés comme des figurines. Arbres et buissons seulement dans les villes, en petit nombre (direction C1 ci-dessous), jamais sur le chemin ni contre un disque.
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

### 3.2 bis Direction C1 : « Diorama habité » (choisie par Romain, 18 octobre 2026)

Inspiration : _Captain Toad: Treasure Tracker_ pour le diorama, _Royal Match_ pour la lisibilité. Chaque ville est un petit diorama habité autour de son monument. Image cible validée : la Ville des Relatifs (pull request de C1). Elle s'applique aux six villes en C2, à l'île en C3.

- **Place :** un socle de pierre (rayon 1,16 m, pierre `#8e7f68`) qui dépasse de l'herbe, une bordure de pierres taillées, puis des pavés en anneaux concentriques de deux tons proches (`#bfae90`, `#cdbd9f`) jusqu'à 1,02 m du centre. Le monument est posé dessus. Les pavés restent peu contrastés : le monument et les disques passent devant.
- **Maisons-jouets :** cinq par ville, entre 1,95 et 4,6 m du centre, à au moins 0,44 m du chemin et des disques, la porte tournée vers la place. Corps de 0,38 à 0,46 m sur 0,32 à 0,37 m, un étage (0,27 à 0,32 m) ou deux (0,46 m), soubassement de pierre, murs de plâtre (`#efe4cc`, `#faf3e2`, `#e2d6bd`), toit à deux pans de 0,21 m avec débord et faîtage plus sombre, porte encadrée de blanc et seuil de pierre, fenêtres à volets verts (`#4f8a5b`), une jardinière fleurie, une cheminée de brique.
- **Couleur porteuse de sens :** les toits reprennent les couleurs du monument. Pour les Relatifs, toits rouges (`#b8283c`, faîtage `#8a1f2e`) du côté des négatifs, bleus (`#3b6ea8`, faîtage `#2a4d7c`) du côté des positifs.
- **Végétation et mobilier :** trois arbres ronds (tronc d'écorce, couronne fondue `crown`), deux lanternes de fer à lumière chaude (`#ffd27a`) près de la place. Fleurs et rochers de la carte gardés autour, mais jamais sous une maison.
- **Lumières d'ambiance :** fenêtres émissives chaudes (`#ffad3d`, `#e8782a`), lampe de porte, lanternes à halo additif diffus et flaques chaudes (`#ff9c33`). Une lanterne reste à au moins 0,45 m du bord de tout disque ; son halo et sa flaque ne passent jamais sous un disque.
- **Disques :** rayon de 0,195 m pour un niveau et de 0,255 m pour une évaluation.
- **Herbe :** plus profonde que l'herbe vive actuelle : `grass` `#4f7d2d`, `grass-light` `#6f9a3f`, `grass-dry` `#93904f`, `moss` `#3f6826` ; brins `base` `#2e461b`, `tip` `#86a047`, `dry` `#a9a261`.
- **Lumière :** même direction `sun`, même couleur, mais un soleil plus net (diamètre apparent 4° au lieu de 6°, énergie 5,6) et un ciel moins fort (1,0) : des ombres plus franches, qui posent les maisons au sol.
- **Étalonnage (`post.natural`) :** saturation 1,06, exposition 1,02, teinte des ombres 0,12 (`#8a7ad6`), des lumières 0,12 (`#ffe2b0`).
- **Lisibilité :** l'interface reste le plus contrasté de l'écran. Les maisons, arbres et lanternes ne touchent ni le chemin ni les disques, et le centre de la place reste calme.
- **Coût mobile :** tout est pré-rendu dans les tuiles : aucun objet, aucun appel de dessin en plus à l'exécution. Seul le poids des tuiles WebP peut monter avec le détail : il reste sous le budget du § 3.5 (2 000 000 octets par région).

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

### 3.5 Budgets mobiles (bloquants, vérifiés par les tests)

Ils reprennent ceux du rapport d'origine de Romain (`docs/explorer_compte_rendu.md`, qui n'est pas dans le dépôt). Seuls ses budgets sont repris : sa direction artistique (toon, contours, texture-palette) et ses conseils de compression (`gltf-transform optimize`, Draco, Meshopt, KTX2) **ne s'appliquent pas** ici (§ 2.2 et § 9).

| Élément              | Budget                                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Île (GLB)            | ≤ 1 500 000 octets ; ≤ 40 000 triangles à l'écran ; ≤ 30 appels de dessin                                                     |
| Avatar               | ≤ 5 000 triangles par tenue affichée (8 000 au plus si Romain l'accepte) ; ≤ 30 os ; ≤ 600 Ko avec ses animations             |
| Carte d'une région   | ≤ 2 000 000 octets (tuiles, sous-couche et tronçons) ; ≤ 100 tuiles. Aujourd'hui : 85 tuiles, ≈ 1,15 Mo                       |
| Sprites des niveaux  | ≤ 150 Ko. Aujourd'hui : ≈ 99 Ko                                                                                               |
| Scène entière        | < 50 appels de dessin, passes de post comprises                                                                               |
| Cadence              | 60 images/s au plus, 30 au repos, 0 avec « Réduire les animations » ; p95 ≤ 16,7 ms sur un Android milieu de gamme            |
| Défilement           | aucun commit React, aucun montage pendant que la carte bouge                                                                  |
| Poids de l'app       | l'île de départ et la première région embarquées ; les autres régions téléchargées à la demande dès que le poids l'exige (C7) |
| Textures dans un GLB | JPEG ou PNG seulement (expo-gl)                                                                                               |

-------------------- | ------------------------------------------------------------------------------------------------------- |
| Carte d'une région | ≤ 2 000 000 octets (tuiles, sous-couche et tronçons) ; ≤ 100 tuiles. Aujourd'hui : 85 tuiles, ≈ 1,15 Mo |
| Sprites des niveaux | ≤ 150 Ko. Aujourd'hui : ≈ 99 Ko |
| Cadence | 60 images/s au plus, 30 au repos, 0 avec « Réduire les animations » |
| Défilement | aucun commit React, aucun montage pendant que la carte bouge |
| Textures dans un GLB | JPEG ou PNG seulement (expo-gl) |

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
- `src/lib/feedback/` : préférence « Sons et vibrations », cues audio et vibrations de l'Explorer.
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

### 8.0 Le programme « vrai jeu vidéo » (décision de Romain, 18 octobre 2026)

Romain veut que **tout ce qui existe dans Explorer soit refait en mieux**, jusqu'à ce que l'onglet soit un vrai jeu vidéo mobile, digne d'être vendu, et donne **carte blanche** pour y arriver (§ 2.2) : l'île peut être refaite, par exemple pour y poser de vraies villes. La seule condition : rester optimisé pour une app mobile (§ 3.5).

**Périmètre :** l'onglet Explorer (île, régions, carte, niveaux vus depuis la carte), l'avatar et son éditeur, le HUD de jeu (`src/components/game/`), la chaîne Blender (`tools/explorer-3d/`, `tools/avatar-3d/`). **Hors périmètre :** les autres onglets, l'espace Parents, le serveur, Supabase, le tuteur, et les fichiers interdits du § 0.

**Méthode, pour chaque chantier :**

1. une branche `explorer/<chantier>` créée depuis `origin/explorer/rendu-v2` à jour, et une pull request vers `explorer/rendu-v2` ;
2. d'abord une **image cible** (une vue retouchée jusqu'au niveau voulu, sur une petite zone), validée par Romain, **avant** de l'appliquer partout ;
3. des captures avant/après dans la pull request, `npm run check` au vert, les budgets du § 3.5 tenus ;
4. un chantier fini et fusionné par Romain avant d'attaquer le suivant, sauf s'il en décide autrement.

**Les chantiers, dans l'ordre :**

| #   | Chantier                                               | Contenu                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Fini quand                                                                                      |
| --- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| C1  | Direction artistique                                   | Romain n'a pas de captures de référence : partir des références que Romain a choisies, _The Legend of Zelda: Link's Awakening_ (Switch, 2019 : jouets peints, façon maquette), _Captain Toad: Treasure Tracker_ (niveaux en dioramas) et _Tiny Glade_ (paysages miniatures doux), plus _Royal Match_ et _Candy Crush Saga_ pour la lisibilité d'une carte de niveaux sur mobile (inspiration seulement : rien n'est copié ni ajouté au dépôt), puis rendre **trois variantes de la même ville** (la Ville des Relatifs), toutes dans la famille « maquette réaliste miniature » validée, avec pour chacune une planche de style (palette, lumière, matières, densité de détail). Note de style de la variante choisie ajoutée au § 3. | Romain a choisi une variante et validé sa vue de ville.                                         |
| C2  | La carte de Nombres                                    | La piste A ci-dessous (A1 eau et rives, A2 disposition, A3 herbe, A5 passe beauté), au niveau de C1, puis une seule recuisson (A4).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Les 6 villes au niveau de la vue validée en C1, sans aucun défaut du § 2.3.                     |
| C3  | L'île des Maths (X1, X2a)                              | Même niveau d'art que la carte : eau, rives, matières, lumière, grands repères, transitions entre l'île, les régions et la carte. Recuisson par `npm run explorer:models`, budgets tenus (île ≤ 1,5 Mo).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Romain valide l'île sur son téléphone ; plus de rechargement visible.                           |
| C4  | Avatar v2                                              | Identité à faire choisir par Romain (recommandé : une figurine originale aux proportions de Tutor'IA, plutôt que « façon Mii », plus sûr pour les stores) ; visage dessiné par le shader gardé ; ≤ 5 000 triangles par tenue affichée (§ 3.5) ; même étalonnage partout ; clips `attente`, `marche`, `saut`, `salut`, plus « bravo » et « encouragement ». Les contrats du § 10 de `CLAUDE.md` (garde-robe, `AvatarLook`) ne cassent pas.                                                                                                                                                                                                                                                                                             | Planche de référence validée, puis la figurine dans l'éditeur, le profil et la carte.           |
| C5  | **Livré — sensation de jeu, zoom, contexte et nuages** | Zoom par pincement et recentrage, vue d'ensemble du parcours, terrain de contexte de Nombres, ombres jointives, transitions nuageuses progressives et souffle avec stries pendant le trajet aller (`logic/`, `hooks/`, `components/`, `tools/explorer-3d/`). Le cue de plongée ne déclenche pas de vibration ; aucun tremblement de caméra.                                                                                                                                                                                                                                                                                                                                                                                           | Visuels v9/v10 approuvés ; « Réduire les animations » respecté ; aucun son sans l'interrupteur. |
| C6  | Les trois autres régions des Maths                     | Données, Espace, Algorithmique : 9 monuments, la même chaîne que Nombres, au niveau de C1 à C3.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Les 4 régions jouables, budgets tenus.                                                          |
| C7  | Qualité de sortie                                      | Mesure sur un Android milieu de gamme (Romain), mémoire, temps d'ouverture d'Explorer, poids de l'app ; régions téléchargées à la demande si le poids l'exige.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Seuils notés dans `CLAUDE.md`, tenus.                                                           |

**Décisions qui reviennent quand même à Romain** (les lui demander, ne pas les prendre) : le choix de la variante de style en C1, l'ajout d'un paquet (`expo-audio`, `expo-haptics` : modules natifs, donc un nouveau build EAS), tout dépassement d'un budget du § 3.5, et tout ce qui touche aux invariants du § 2.2.

Les sections suivantes détaillent le chantier C2 (piste A) et ce qui reste de la finition de l'app (piste B).

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

- **Périmètre :** la carte pré-rendue (sol, eau, monuments, décor, planches, sprites des disques). L'île en 3D (X1, X2a) relève du chantier C3.
- **Pistes, par ordre d'effet attendu :**
  1. **Lumière et matières :** une occlusion ambiante plus présente au pied des objets, des ombres de contact douces, une lumière chaude qui accroche les arêtes biseautées des monuments, un léger dégradé de brume sur les bords de l'île.
  2. **Une ambiance par ville :** une teinte de sol propre à chaque clairière et quelques accessoires autour du monument qui racontent sa notion (sans arbres ni buissons).
  3. **Des décors plus riches :** décors groupés en massifs plutôt que semés au hasard, plusieurs espèces de fleurs (une par massif), de vraies pierres moussues, des repères à mi-hauteur (murets de pierre sèche, panneau à l'entrée de chaque ville, bouts de barrière).
  4. **Des planches vivantes :** clous, coins ébréchés, planches à venir un peu envahies par l'herbe, chemin parcouru dégagé, planches plus courtes dans les virages serrés.
  5. **Des contrôles automatiques de l'art** à chaque rendu (`tools/explorer-3d/check_tiles.py`) : teinte et contraste de l'herbe, pixels saturés, ordre des valeurs (sol plus sombre que les planches à faire, elles-mêmes plus sombres que les planches faites), contraste des disques sur le sol à chaque position du manifeste.
- **Ce qui ne bouge pas :**
  - les invariants du § 2.2 (budgets mobiles, disques vifs, famille de style « maquette réaliste miniature ») ;
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
Tout le travail d'Explorer est sur la branche explorer/rendu-v2 du dépôt Romainmlt123/TutorIA, pas sur main ni sur dev (qui ne l'ont pas encore). Commence par : git fetch origin, puis git switch --no-track -c explorer/c1-direction-artistique origin/explorer/rendu-v2, puis npm ci.
Lis ensuite docs/explorer-passation.md en entier, puis CLAUDE.md, tels qu'ils sont sur cette branche : ils font foi.
Je veux que tout l'onglet Explorer soit refait en mieux, jusqu'à être un vrai jeu vidéo mobile digne d'être vendu : suis le programme du § 8.0, chantier par chantier, dans l'ordre (C1 direction artistique, puis C2 la carte de Nombres, puis C3 l'île, etc.).
Pour chaque chantier : une nouvelle branche explorer/<chantier> créée depuis origin/explorer/rendu-v2 à jour (git fetch d'abord), une image cible que je valide avant d'appliquer partout, des avant/après, npm run check au vert, puis une pull request vers explorer/rendu-v2. Attends que j'aie fusionné un chantier avant d'attaquer le suivant.
Tu as carte blanche pour tout refaire, y compris l'île (par exemple pour y poser de vraies villes) : la seule condition est de rester optimisé pour une app mobile, sans alourdir l'app (budgets du § 3.5, bloquants).
Commence par C1 : inspire-toi de Link's Awakening (Switch, 2019), Captain Toad: Treasure Tracker et Tiny Glade, plus Royal Match et Candy Crush Saga pour la lisibilité de la carte, puis montre-moi trois variantes de la Ville des Relatifs, et je choisis.
Règles git strictes : pousse seulement tes branches explorer/<chantier> ; ne pousse jamais sur dev, main ni explorer/rendu-v2 ; jamais de force push, de merge ni de rebase de ces branches. Ne fusionne rien.
Reste dans le périmètre du § 8.0 (Explorer, avatar, HUD de jeu, chaîne Blender) : ne touche ni aux autres onglets, ni à l'espace Parents, ni au serveur, ni à Supabase.
Mode simulé uniquement (EXPO_PUBLIC_BACKEND=mock), aucune connexion à Supabase, aucune clé.
Pose-moi les décisions listées au § 8.0 au lieu de les prendre.
```

## 11. Rendre compte à Romain

Romain écrit en français ; lui répondre en français, avec des phrases courtes. Chaque pull request contient :

1. ce qui a été fait, fichier par fichier ;
2. les commandes lancées et leur résultat (la fin de `npm run check`) ;
3. les **captures avant et après**, au même endroit et à la même taille ;
4. ce qui reste à vérifier sur le téléphone ;
5. les décisions qui lui reviennent, formulées comme des questions fermées.
