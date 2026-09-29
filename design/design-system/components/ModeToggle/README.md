# ModeToggle

Bascule entre le tuteur écrit et le tuteur vocal, en haut des écrans Tutor'IA.

## Quand l'utiliser

Sur les six écrans tuteur (écrit, vocal, avec graphique ou tableau blanc).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `mode` | `'ecrit' \| 'vocal'` | Mode affiché. |
| `onChange` | `(mode) => void` | Changement de mode. |

## Exemple

```js
const { ModeToggle } = window.TutorIA;
```
