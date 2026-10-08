# CallTopBar

Barre du haut de l’appel vocal : bouton « Écrit » (passer au chat écrit) et chrono de l’appel avec un point blanc qui clignote.

## Quand l'utiliser

En haut des écrans d’appel (2B, 2D, 2F), à 56 px du haut, sur le dégradé de marque. « Écrit » garde la conversation : la transcription devient les bulles du chat.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `elapsed` | `string` | Durée affichée, « 02:17 ». |
| `live` | `boolean` | Point qui clignote (true par défaut). |
| `onWritten` | `function` | Passer à l’écrit. |

## Exemple

```js
const { CallTopBar } = window.TutorIA;
```
