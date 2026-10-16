# TrophyShelf

« Mes trophées » du profil (v2.10) : une armoire de bois du côté jeu (`WoodFrame`) avec le ruban « Mes trophées », le compte « 10 sur 24 » dans une pastille dorée, puis les médailles (`TrophyBadge`) alignées sur une étagère creusée, sur une ligne qui défile sur le côté.

## Quand l'utiliser

Profil de l'élève, sous le résumé. Les trophées relèvent du côté jeu de l'app, d'où le bois et la police Lilita One (écart 28 de l'app, 8 octobre 2026).

## Comportement

- Les 24 trophées sont calculés à partir de la progression et ne se perdent jamais : séries (3, 7, 14, 30 jours), niveaux de joueur (2, 5, 10), niveaux d'Explorer terminés (1, 10, 25), évaluations réussies (1, 5), étoiles (10, 25, 50, 100), les quatre régions, la ville parfaite et les notions acquises (1, 5, 10).
- Les gagnés d'abord, dans cet ordre, puis le prochain à gagner, creusé dans le bois avec un cadenas.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `title` | `string` | Texte du ruban (« Mes trophées »). |
| `trophies` | `TrophyBadgeProps[]` | Les médailles. |
| `earned` | `number` | Nombre gagné (calculé sinon). |
| `total` | `number` | Nombre total. |

## Exemple

```js
const { TrophyShelf } = window.TutorIA;
h(TrophyShelf, { earned: 10, total: 24, trophies: [
  { icon: 'flame', tone: 'orange', label: '3 jours de suite' },
  { icon: 'rocket', tone: 'blue', label: 'Niveau 5' },
  { label: '30 jours de suite', locked: true }
] });
```
