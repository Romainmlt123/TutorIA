# Ajouter un vêtement ou un skin d'avatar

## Ajouter un vêtement ou un accessoire

1. Dans `tools/avatar-3d/avatar.py`, écris le constructeur `build` et ajoute une entrée à `PIECES` avec un nom préfixé selon son emplacement : `haut-`, `bas-`, `chaussures-`, `tete-`, `visage-`, `cou-` ou `dos-`. Le constructeur doit renvoyer un objet Blender qui porte exactement ce nom.
2. Pour chaque haut et bas, fournis le prédicat de zone `covers(point, part, t)` et déclare dans `PIECES` les mêmes coupes que celles données à `shell`. Partage la fonction qui construit ces plans : `with_hem_contract` ajoute automatiquement une marge de 1,2 cm du côté gardé. La jupe et les pièces sans plan gardent leur prédicat actuel. La zone et les coupes suffisent : le générateur calcule `src/features/avatar/avatar3d/bodyZones.json` en vérifiant les centres de toutes les faces à chaque carrure. L'application masque une zone seulement si le vêtement couvre toutes ses faces aux trois carrures, marge d'ourlet comprise ; les contrôles de mouvement et de trous utilisent ce même résultat.

   Si un vêtement ne couvre aucune zone entière, il ne masque rien : la zone reste dessinée en entier, y compris sous la partie du vêtement qui la recouvre. Il faut donc déclarer un prédicat cohérent avec la géométrie, sans ajouter manuellement une entrée au JSON. Les contrôles parcourent automatiquement toutes les paires haut × bas ; un contrat manquant ou une association de zones inattendue arrête l'export. Utilise `follows_build=True` si la pièce doit suivre la carrure.

   Pour une pièce qui suit la carrure, chaque sommet s'ancre sur le point de peau du corps le plus proche ; le déplacement est un champ continu partagé par les couches intérieure et extérieure, sans appariement de sommets. Pour une coque épaissie, le générateur ne plaque la couche intérieure que si la zone du point de peau le plus proche est masquée par cette pièce : l'épaisseur nominale est gardée à moins de 2 cm d'une ouverture, puis une transition linéaire de 1 cm mène à la peau de référence décalée de 2 mm vers l'intérieur. Dans une zone non masquée, l'épaisseur nominale est conservée. Une pièce qui ne masque aucune zone, comme la jupe, n'est pas plaquée.

   Une pièce portée par-dessus une autre déclare les slots recouverts dans `Piece.over` (`bas-salopette` déclare `("haut",)`). Pour la bavette, le décalage est calculé à partir du haut enregistré le plus épais — déplacement maximal plus épaisseur nominale — avec 3 mm de marge. Le filtre `over_region` limite le contrôle au panneau réellement superposé, sans inclure les bretelles.

3. Vérifie le plafond du slot dans `PIECE_TRIANGLE_CAPS` et ajuste-le seulement si le budget de la pièce le permet. Les plafonds de base du corps, de la tête et des cheveux sont dans `BASE_TRIANGLE_CAPS`.
4. Dans `src/features/avatar/logic/avatarLook.ts`, ajoute l'identifiant dans la liste du slot (`TOPS`, `BOTTOMS`, `SHOES`, `HATS`, `GLASSES`, `NECKWEAR` ou `BACKS`). Dans `src/features/avatar/logic/wardrobe.ts`, ajoute son entrée `WARDROBE` avec le slot et sa condition de déblocage.
5. Ajoute les libellés de l'objet et de sa condition dans `src/i18n/fr.ts`. Vérifie les règles de `src/features/explorer/logic/modelRules.ts` : l'avatar utilise déjà une règle `*` pour tous les nœuds de `assets/avatar/avatar.glb`; une nouvelle pièce ne requiert donc pas une règle particulière tant qu'elle garde les attributs du rig.
6. Mets à jour les tests de garde-robe et d'apparence (`src/features/avatar/logic/wardrobe.test.ts`, `avatarLook.test.ts`) et, si le GLB change, les tests d'assets. Lance `npm run avatar:model` pour construire toutes les pièces et faire tourner les validations de couverture, de mouvement, de budget et de rig.

## Zones du corps et capuchons

- Construis, simplifie, remodèle et pèse d'abord le corps complet. La découpe en zones est la dernière opération avant l'export : chaque zone copie les positions, normales, poids et forme `fort` du corps final.
- Après le classement des faces, la propagation ne peut déplacer une face vers une zone que si toutes les pièces qui masquent cette zone couvrent son centre aux trois carrures avec le même prédicat et la marge d'ourlet que `bodyZones.json`. Pour résoudre un îlot ou un pincement, privilégie parmi les voisines la zone masquée par le moins de pièces (`corps` en dernier recours) ; la connexité et la fermeture restent bloquantes.
- Ferme chaque boucle de bord de chaque zone, `corps` compris, par un capuchon triangulé. Contrôle l'orientation par la normale pondérée par l'aire du capuchon et l'enroulement cohérent de ses arêtes, pas triangle par triangle.
- `ZONE_SEAM_CHECK` bloque l'export si les coutures ne coïncident pas, si une zone capuchonnée n'est pas fermée et 2-variété, ou si l'orientation agrégée d'un capuchon est incohérente. La couverture statique et la caméra officielle en liaison contrôlent ensuite les tenues ; les impacts caméra sont regroupés en cellules de 2 cm reliées par six voisins, et un amas de 20 impacts ou plus est signalé par `VISIBLE_DEFECT_WARNING` sans bloquer l'export.
- Le contrôle caméra ne compte que deux défauts : une première face vue de dos, et une pièce qui traverse une autre pièce portée au-dessus. Pour cette dernière, le deuxième impact doit être à 1,5 cm au plus, le slot du premier objet doit figurer dans `over` du second et le point doit appartenir à sa région `over_region`. Les ouvertures légitimes de la couche intérieure ne sont pas classées comme défauts.
- À l'export, le contrôle animé échantillonne huit images de `marche`, `saut`, `bravo` et `encouragement` pour chaque tenue et carrure, en plus des 24 cas de liaison. `MOTION_CHECK` contrôle les six actions, la flexion des bras levés et les pénétrations main-torse.
- Le clip `bravo` exprime une joie bras grands ouverts avec de petits sauts sur un cycle de 1,0 s.

## Ajouter un skin

Un skin est une apparence du même avatar : il réutilise le même corps, le même squelette et les mêmes animations. Il change les rangs de couleurs enregistrés dans `AvatarLook`, pas la géométrie ni le rig. N'enlève ni ne réordonne les couleurs existantes : les apparences enregistrent leurs rangs.

Les couleurs sont définies dans `src/theme/avatarArt.ts`. `Avatar3D.tsx` associe les matériaux du GLB à ces rôles :

- `peau` et `cheveux` utilisent respectivement `avatarArt.skins` et `avatarArt.hairs` ; l'éditeur choisit leur couleur.
- `tissu` et `tissu-2` sont colorés d'après le préfixe du nom de pièce (`haut-`, `bas-`, etc.) et le rang de couleur de cet emplacement dans `avatarArt.cloths`. L'éditeur choisit la couleur séparément pour chaque emplacement.
- `semelle`, `detail`, `verre` et `bijou` utilisent les couleurs fixes `avatarArt.sole`, `detail`, `lens` et `jewel`. Le visage est dessiné par l'application et prend aussi ses couleurs dans `avatarArt`.

Les rôles et couleurs sont appliqués dans `src/features/avatar/avatar3d/Avatar3D.tsx` (`roleOf` et `dress`) ; les choix éditables et leurs palettes sont définis dans `src/features/avatar/logic/editor.ts`.
