# TrophyShelf

Carte « Mes trophées » du profil (v2.8) : titre 22 Black, compteur « 6 sur 24 » à droite, puis les médailles (`TrophyBadge`) sur une ligne qui défile sur le côté, les gagnées d'abord, la première à gagner en dernier (grisée).

## Quand l'utiliser

Profil de l'élève, sous le résumé. Les trophées récompensent la régularité (séries), Explorer (régions, évaluations) et les révisions (quiz parfaits).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `title` | `string` | « Mes trophées ». |
| `trophies` | `TrophyBadgeProps[]` | Les médailles. |
| `earned` | `number` | Nombre gagné. |
| `total` | `number` | Nombre total. |

## Exemple

```js
const { TrophyShelf } = window.TutorIA;
h(TrophyShelf, { earned: 6, total: 24, trophies: [
  { icon: 'crown', tone: 'red', label: '1re évaluation réussie' },
  { icon: 'flame', tone: 'orange', label: '7 jours de suite' },
  { label: '30 jours de suite', locked: true }
] });
```
