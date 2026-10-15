# CaptionBubble

Les sous-titres du tuteur dans la leçon à la voix d'Explorer (X4b, v2.13) : bulle de dialogue blanche cernée de bleu nuit, rebord dur, ruban bleu « Tutor'IA » en Lilita One sur le bord haut, comme une boîte de dialogue de jeu. Dedans, `LiveCaptions` sur fond clair : les mots s'allument au fil de la voix (gris `#A3ABBD` puis `text`).

## Quand l'utiliser

Sous le logo du tuteur et sa pastille d'état. Sous-titres du tuteur seulement (écart 24) : quand l'élève parle, la dernière phrase du tuteur reste affichée.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `text` | `string` | Phrase du tuteur. |
| `spoken` | `number` | Mots déjà dits. |
| `name` | `string` | Ruban (« Tutor'IA »). |
| `maxLines` | `number` | 3 lignes. |

## Exemple

```js
const { CaptionBubble } = window.TutorIA;
```
