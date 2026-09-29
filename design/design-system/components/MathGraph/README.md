# MathGraph

Repère cartésien en SVG : quadrillage, droites y = mx + b, points (avec halo et pointillés de lecture).

## Quand l'utiliser

Dans un `VisualPanel` pour les fonctions affines, les lectures graphiques et les systèmes.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `subject` | `string` | Matière (couleur des tracés). |
| `xRange` | `[min, max]` | Bornes en x. |
| `yRange` | `[min, max]` | Bornes en y. |
| `yStep` | `number` | Pas des graduations y. |
| `lines` | `{ m, b, color?, dashed?, label? }[]` | Droites. |
| `points` | `{ x, y, pulse?, guide?, label? }[]` | Points. |
| `description` | `string` | Texte accessible. |

## Exemple

```js
const { MathGraph } = window.TutorIA;
```
