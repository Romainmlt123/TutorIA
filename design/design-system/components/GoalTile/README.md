# GoalTile

Tuile d'objectif à cocher, qui se remplit du dégradé de sa couleur une fois choisie.

## Quand l'utiliser

Onboarding « Qu’est-ce que tu veux réussir ? », en grille 2 colonnes, choix multiple.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `label` | `string` | Objectif. |
| `icon` | `string` | Picto. |
| `tone` | `'green' \| 'violet' \| 'red' \| 'brown' \| 'cyan' \| 'blue'` | Couleur. |
| `selected` | `boolean` | Coché. |
| `onClick` | `function` | Basculer. |

## Exemple

```js
const { GoalTile } = window.TutorIA;
```
