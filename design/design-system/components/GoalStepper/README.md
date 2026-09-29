# GoalStepper

Réglage d'un objectif chiffré avec deux boutons − / + et la valeur en grand.

## Quand l'utiliser

Objectif de temps par jour ou de séances par semaine, dans l'espace Parents.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `value` | `number` | Valeur (contrôlée ou initiale). |
| `min` | `number` | Minimum. |
| `max` | `number` | Maximum. |
| `unit` | `string` | Unité affichée après la valeur. |
| `title` | `string` | Titre du réglage. |
| `hint` | `string` | Aide sous le titre. |
| `onChange` | `(value) => void` | Changement. |

## Exemple

```js
const { GoalStepper } = window.TutorIA;
```
