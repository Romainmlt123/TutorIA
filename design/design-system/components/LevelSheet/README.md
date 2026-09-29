# LevelSheet

Fiche d'un niveau en feuille du bas : type, titre, lieu, durée, étoiles, objectifs, règle de l'évaluation et lancement du chat à l'écrit ou à la voix (le dernier mode utilisé en premier).

## Quand l'utiliser

Au clic sur un point de la carte (X3). Le chat se lance dans l'onglet Explorer. `lockedMessage` grise les boutons.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `type` | `'lecon' \| 'exercices' \| 'evaluation'` | Type de niveau. |
| `title` | `string` | Titre. |
| `where` | `string` | Île, ville, région. |
| `minutes` | `number` | Durée estimée. |
| `stars` | `number` | Meilleur score. |
| `objectives` | `string[]` | Objectifs. |
| `rule` | `string` | Règle spéciale (évaluation : pas d'indice). |
| `lockedMessage` | `string` | Niveau verrouillé : explication. |
| `lastMode` | `'ecrit' \| 'vocal'` | Dernier mode utilisé. |
| `onWritten` | `() => void` | Lance le chat écrit. |
| `onVoice` | `() => void` | Lance le chat vocal. |
| `onClose` | `() => void` | Ferme la fiche. |

## Exemple

```js
const { LevelSheet } = window.TutorIA;
```
