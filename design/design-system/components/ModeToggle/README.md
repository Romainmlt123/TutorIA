# ModeToggle

Bascule entre le tuteur écrit et le tuteur vocal, en haut des écrans Tutor'IA.

## Quand l'utiliser

Sur les écrans du tuteur (écrit, vocal, avec graphique ou tableau blanc). Quand un parent a coupé le vocal (P4), la bascule reste visible, « Vocal » verrouillé (`voiceLocked`), au lieu de disparaître sans explication.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `mode` | `'ecrit' \| 'vocal'` | Mode affiché. |
| `onChange` | `(mode) => void` | Changement de mode. |
| `voiceLocked` | `boolean` | Vocal coupé par un parent (R7, v2.15) : « Vocal » grisé avec un cadenas ; le toucher affiche « Le vocal est coupé dans les réglages de tes parents. ». |
| `lockedHint` | `string` | Texte de l'explication. |

## Exemple

```js
const { ModeToggle } = window.TutorIA;
```
