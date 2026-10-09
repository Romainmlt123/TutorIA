# CallControls

Commandes d'appel du tuteur vocal : micro, raccrocher (rouge, au centre), caméra.

> Depuis la v2.6, l’appel du tuteur (2B, 2D, 2F) utilise `CallDock` (commandes en verre avec les sous-titres). `CallControls` reste pour la discussion vocale d’Explorer (X4b).

## Quand l'utiliser

Bas du tuteur vocal, au-dessus de la barre de navigation. La caméra, à droite du bouton raccrocher, sert à montrer un exercice.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `muted` | `boolean` | Micro coupé. |
| `cameraOn` | `boolean` | Caméra active. |
| `onToggleMute` | `function` | Micro. |
| `onToggleCamera` | `function` | Caméra. |
| `onHangUp` | `function` | Fin de séance. |

## Exemple

```js
const { CallControls } = window.TutorIA;
```
