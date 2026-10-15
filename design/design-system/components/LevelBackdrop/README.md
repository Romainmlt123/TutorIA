# LevelBackdrop

Le ciel d'Explorer derrière la leçon d'un niveau (X4a, X4b) : dégradé `#2F6FD0 → #5F9CE8 → #8FC0F2` (le ciel « naturel » du code, `explorerArt.post.natural.sky`) et quelques nuages blancs qui dérivent lentement (figés avec « Réduire les animations »).

## Quand l'utiliser

Remplace `IslandBackdrop` (fond rose des anciennes maquettes) depuis la v2.13. Le contenu (en-tête, ardoise, discussion ou appel) se pose dessus en `children`.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `height` | `number \| string` | Hauteur (100 %). |
| `clouds` | `Array<[x, y, largeur, opacité]>` | Nuages. |
| `night` | `boolean` | Ciel de nuit `#16244F → #2D3F8A → #5A6FC0`, lune et étoiles : un niveau ouvert pendant la pause du soir (R6, v2.15). |
| `children` | `node` | Contenu. |

## Exemple

```js
const { LevelBackdrop, LevelHeader } = window.TutorIA;
h(LevelBackdrop, { height: 844 }, h(LevelHeader, { title: 'Isoler x', done: 1, total: 4, city: 'Ville des Équations' }));
```
