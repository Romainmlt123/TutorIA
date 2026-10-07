# LevelProgressHeader

En-tête du chat d'un niveau : retour à la carte, type et titre, bascule écrit / vocal et progression en segments de la couleur du type.

## Quand l'utiliser

En haut de la discussion d'un niveau (X4). Le libellé change selon le type : Étape, Exercice ou Question.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `type` | `'lecon' \| 'exercices' \| 'evaluation'` | Type de niveau. |
| `title` | `string` | Titre. |
| `step` | `number` | Étape en cours. |
| `total` | `number` | Nombre d'étapes. |
| `city` | `string` | Ville (ajoutée au libellé). |
| `mode` | `'ecrit' \| 'vocal'` | Mode actif. |
| `onModeChange` | `(mode) => void` | Bascule de mode. |
| `onBack` | `() => void` | Retour à la carte. |

## Exemple

```js
const { LevelProgressHeader } = window.TutorIA;
```
