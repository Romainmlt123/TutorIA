# PhotoSourceDialog

Choix de la **photo d'un exercice** (v2.12, 2I) : carte blanche posée en bas de l'écran sur un voile, titre « La photo de ton exercice », aide « Cadre seulement l'exercice, sans ton nom. », puis « Prendre une photo » (bleu), « Choisir dans la galerie » (bleu doux) et « Annuler ».

## Quand l'utiliser

Au toucher du bouton photo de `ChatInput`. La photo choisie se pose ensuite en aperçu dans la saisie (2J), puis part dans la bulle de l'élève (2K).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `onChoose` | `('camera' \| 'library') => void` | Source choisie. |
| `onCancel` | `function` | Annuler (ou toucher le voile). |
| `title` | `string` | Titre. |
| `hint` | `string` | Aide. |

## Exemple

```js
const { PhotoSourceDialog } = window.TutorIA;
```
