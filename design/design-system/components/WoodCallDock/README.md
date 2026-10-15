# WoodCallDock

Les commandes de la leçon à la voix d'Explorer (X4b, v2.13) sur une **planche de bois** (texture, clous) : Micro, Sous-titres et Caméra en boutons bleus en relief, **jaunes quand ils sont actifs**, et Raccrocher en bouton rouge de 64 px ; libellés en Lilita One.

## Quand l'utiliser

Bas de X4b, à la place de `CallControls` et de ses barres. La caméra disparaît si un parent l'a coupée. Raccrocher ramène à la carte.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `muted`, `captionsOn`, `cameraOn` | `boolean` | États. |
| `cameraVisible` | `boolean` | Caméra autorisée. |
| `onToggleMute`, `onToggleCaptions`, `onCamera` | `function` | Actions. |
| `onHangUp` / `hangUpHref` | | Raccrocher. |

## Exemple

```js
const { WoodCallDock } = window.TutorIA;
```
