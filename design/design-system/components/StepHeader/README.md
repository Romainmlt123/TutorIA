# StepHeader

En-tête des parcours en plusieurs étapes : retour, « Étape n sur N », barre segmentée et lien « Passer ».

## Quand l'utiliser

Onboarding élève (bleu). Dans l'inscription parent plein écran (L4 à L6, v2.11), `back: false` : la flèche de retour est dans l'en-tête de `AuthScreen`, et l'étape se pose en tête de la feuille blanche, avec des barres de 6 px.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `step` | `number` | Étape en cours. |
| `total` | `number` | Nombre d’étapes (4 par défaut). |
| `tone` | `'eleve' \| 'parents'` | Couleur. |
| `onBack` | `function` | Retour. |
| `backHref` | `string` | Retour en lien. |
| `back` | `boolean` | `false` : sans flèche (dans la feuille). |
| `onSkip` | `function` | Affiche « Passer ». |
| `skipLabel` | `string` | Libellé du lien. |

## Exemple

```js
const { StepHeader } = window.TutorIA;
h(StepHeader, { step: 1, total: 2, tone: 'parents', back: false });
```
