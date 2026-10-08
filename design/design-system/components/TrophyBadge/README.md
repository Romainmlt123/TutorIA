# TrophyBadge

Une médaille (v2.8) : disque de 64 px en dégradé de sa couleur avec son icône blanche et un liseré clair, nom du trophée dessous (12 Bold, deux lignes au plus). Pas encore gagnée : disque gris, cadenas, nom grisé.

## Quand l'utiliser

Dans `TrophyShelf`, et sur une future page « Tous mes trophées ».

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `label` | `string` | Nom du trophée. |
| `icon` | `string` | Icône (crown, flame, compass, star, trophy…). |
| `tone` | `'orange' \| 'violet' \| 'blue' \| 'green' \| 'red' \| 'cyan'` | Couleur. |
| `locked` | `boolean` | Pas encore gagné. |
| `onClick` | `function` | Détail du trophée. |

## Exemple

```js
const { TrophyBadge } = window.TutorIA;
h(TrophyBadge, { icon: 'crown', tone: 'red', label: '1re évaluation réussie' });
```
