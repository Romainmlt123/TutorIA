# LevelNode

Point de niveau sur la carte. Couleur et icône selon le type : leçon verte (livre), exercices bleus (crayon), évaluation rouge (couronne, plus grande, double anneau). États terminé (coche et étoiles), en cours (halo pulsé) et verrouillé (gris, cadenas).

## Quand l'utiliser

Uniquement sur la carte (via `WorldMap`). Un clic ouvre la `LevelSheet`, jamais l'écran Tutor'IA.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `type` | `'lecon' \| 'exercices' \| 'evaluation'` | Type de niveau. |
| `state` | `'completed' \| 'active' \| 'locked'` | État. |
| `stars` | `number` | Étoiles si terminé. |
| `title` | `string` | Titre (libellé accessible). |
| `onClick` | `() => void` | Ouvre la fiche du niveau. |

## Exemple

```js
const { LevelNode } = window.TutorIA;
```
