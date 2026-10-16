# GradePicker

Choix de la classe du CP à la Terminale, groupé par cycle ou en grille compacte.

## Quand l'utiliser

Onboarding élève (groupé Primaire / Collège / Lycée). Ajout d'un enfant côté parent (L5, v2.11) : `filled`, violet, pastilles remplies sur une grille de 5 colonnes par cycle, dans la feuille blanche de `AuthScreen`. `grouped: false` reste possible pour une grille compacte de 4 colonnes.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `value` | `string` | Classe (contrôlée). |
| `defaultValue` | `string` | Classe initiale. |
| `onChange` | `(grade) => void` | Choix. |
| `grouped` | `boolean` | `false` : grille 4 colonnes. |
| `filled` | `boolean` | Pastilles remplies, 5 colonnes (feuille blanche). |
| `tone` | `'eleve' \| 'parents'` | Couleur. |
| `label` | `string` | Libellé accessible. |

## Exemple

```js
const { GradePicker } = window.TutorIA;
h(GradePicker, { tone: 'parents', filled: true, defaultValue: '4e' });
```
