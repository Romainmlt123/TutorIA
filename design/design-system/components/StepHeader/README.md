# StepHeader

En-tête des parcours en plusieurs étapes : retour, « Étape n sur N », barre segmentée et lien « Passer ».

## Quand l'utiliser

Onboarding élève (bleu) et inscription parent (violet).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `step` | `number` | Étape en cours. |
| `total` | `number` | Nombre d’étapes (4 par défaut). |
| `tone` | `'eleve' \| 'parents'` | Couleur. |
| `onBack` | `function` | Retour. |
| `backHref` | `string` | Retour en lien. |
| `onSkip` | `function` | Affiche « Passer ». |
| `skipLabel` | `string` | Libellé du lien. |

## Exemple

```js
const { StepHeader } = window.TutorIA;
```
