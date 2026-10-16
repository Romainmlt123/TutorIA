# TrophyBadge

Une médaille du côté jeu (v2.10) : disque de sa couleur avec son icône blanche, dans un anneau doré cerné de bleu nuit, posé sur un rebord ; nom du trophée dessous en Lilita One blanc cerné (deux lignes au plus). Pas encore gagnée : creusée dans le bois, avec un cadenas, et le nom en parchemin.

## Quand l'utiliser

Dans `TrophyShelf`, et sur une future page « Tous mes trophées ».

## Couleurs

Une teinte par famille : orange pour les séries, bleu pour les niveaux de joueur, vert pour Explorer et les régions, rouge pour les évaluations, violet pour les étoiles, cyan pour la ville parfaite et les notions.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `label` | `string` | Nom du trophée. |
| `icon` | `string` | Icône (flame, rocket, compass, crown, star, map, check…). |
| `tone` | `'orange' \| 'violet' \| 'blue' \| 'green' \| 'red' \| 'cyan'` | Couleur. |
| `locked` | `boolean` | Pas encore gagné. |
| `onClick` | `function` | Détail du trophée. |

## Exemple

```js
const { TrophyBadge } = window.TutorIA;
h(TrophyBadge, { icon: 'crown', tone: 'red', label: '1re évaluation réussie' });
```
