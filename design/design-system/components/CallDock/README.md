# CallDock

Commandes de l’appel dans une barre en verre : micro, sous-titres, caméra et raccrocher (rond rouge de 64 px avec le combiné). Un bouton activé passe en blanc.

## Quand l'utiliser

En bas de l’appel vocal, à 32 px du bas (pas de barre de navigation pendant l’appel). La caméra ouvre l’appareil photo pour montrer un exercice : le micro est mis en pause pendant la prise de vue. Elle disparaît si les parents l’ont désactivée (`cameraVisible`).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `muted` | `boolean` | Micro coupé. |
| `captionsOn` | `boolean` | Sous-titres affichés (true par défaut). |
| `cameraOn` | `boolean` | Photo en cours. |
| `cameraVisible` | `boolean` | Bouton caméra présent (true par défaut). |
| `onToggleMute` | `function` | Micro. |
| `onToggleCaptions` | `function` | Sous-titres. |
| `onCamera` | `function` | Montrer un exercice. |
| `onHangUp` | `function` | Raccrocher et revenir au chat écrit. |

## Exemple

```js
const { CallDock } = window.TutorIA;
```
