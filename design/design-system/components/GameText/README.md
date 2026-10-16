# GameText

Texte du côté jeu (v2.10) : police Lilita One, blanc cerné de bleu nuit `#16244F`, avec une ombre portée. C'est le texte des boutons de bois, des rubans, des compteurs et des noms de trophées.

## Quand l'utiliser

Uniquement sur le côté jeu de l'app (Explorer, avatar, trophées) : sur le ciel, le bois ou un bouton en relief. Jamais pour un texte à lire longuement, ni côté étude.

## Comportement

- Contour : taille ÷ 9 (2 px au moins) ; ombre : taille ÷ 8 vers le bas. `stroke: 0` et `drop: 0` les retirent.
- Dans l'app, le contour est dessiné par huit copies décalées du texte, cachées aux lecteurs d'écran ; ici, par `text-shadow`.
- Police : `--font-game` (Lilita One, licence OFL, `fonts/LilitaOne-Regular.woff2`).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `size` | `number` | Taille (17). |
| `stroke` | `number` | Contour. |
| `drop` | `number` | Ombre portée. |
| `color` | `string` | Couleur (blanc). |
| `align` | `string` | Alignement. |

## Exemple

```js
const { GameText } = window.TutorIA;
h(GameText, { size: 28 }, 'Explorer');
```
