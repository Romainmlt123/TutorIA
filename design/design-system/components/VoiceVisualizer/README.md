# VoiceVisualizer

Quatre barres animées bleu → violet qui suivent la voix du tuteur, avec l'état en dessous.

> Plus utilisé dans les maquettes depuis la v2.13 : l’appel du tuteur (2B, 2D, 2F, depuis la v2.6) et la leçon à la voix d’Explorer (X4b) montrent le logo qui rebondit (`VoiceAvatar`), la pastille d’état (`VoiceStatus`) et les sous-titres (`LiveCaptions`, `CaptionBubble`). Gardé pour l’existant du code.

## Quand l'utiliser

Tuteur vocal. `compact` quand un graphique ou un tableau blanc occupe l'écran. Toute la zone interrompt le tuteur au toucher.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `state` | `'speaking' \| 'listening' \| 'idle' \| 'muted' \| 'writing' \| 'explaining'` | État de la conversation. |
| `compact` | `boolean` | Version réduite. |
| `status` | `string` | Remplace le libellé d'état. |
| `hint` | `string \| false` | Aide sous l'état (`false` pour la masquer). |
| `onInterrupt` | `function` | Toucher pour interrompre. |

## Exemple

```js
const { VoiceVisualizer } = window.TutorIA;
```
