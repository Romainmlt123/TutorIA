# DurationPicker

Choix du temps de travail par jour (10, 15, 20, 30 min).

## Quand l'utiliser

Onboarding élève et objectif du jour.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `options` | `number[]` | Durées. |
| `value` | `number` | Durée (contrôlée). |
| `defaultValue` | `number` | Durée initiale. |
| `onChange` | `(minutes) => void` | Choix. |
| `unit` | `string` | « min » par défaut. |
| `tone` | `'eleve' \| 'parents'` | Couleur. |

## Exemple

```js
const { DurationPicker } = window.TutorIA;
```
