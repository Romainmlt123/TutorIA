# GradePicker

Choix de la classe du CP à la Terminale, groupé par cycle ou en grille compacte.

## Quand l'utiliser

Onboarding élève (groupé Primaire / Collège / Lycée) et ajout d'un enfant côté parent (`grouped: false`, violet).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `value` | `string` | Classe (contrôlée). |
| `defaultValue` | `string` | Classe initiale. |
| `onChange` | `(grade) => void` | Choix. |
| `grouped` | `boolean` | `false` : grille 4 colonnes. |
| `tone` | `'eleve' \| 'parents'` | Couleur. |
| `label` | `string` | Libellé accessible. |

## Exemple

```js
const { GradePicker } = window.TutorIA;
```
