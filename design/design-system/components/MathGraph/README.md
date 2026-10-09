# MathGraph

Repère cartésien en SVG : quadrillage, droites y = mx + b, points (avec halo et pointillés de lecture), légende en pastilles.

## Quand l'utiliser

Dans un `VisualPanel`. En vocal, `focus` met en avant ce que le tuteur nomme (« la droite rouge ») : halo de sa couleur, trait plus épais, pastille de légende allumée ; `focus="point"` fait pulser le point clé.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `subject` | `string` | Matière (couleur des tracés). |
| `xRange` | `[min, max]` | Bornes en x. |
| `yRange` | `[min, max]` | Bornes en y. |
| `yStep` | `number` | Pas des graduations y. |
| `lines` | `{ m, b, color?, dashed?, label?, from?, to? }[]` | Droites (`from` et `to` bornent le tracé). |
| `points` | `{ x, y, pulse?, guide?, key?, label?, labelSide? }[]` | Points ; l’étiquette se place à droite par défaut. |
| `focus` | `number | 'point'` | Droite (index) ou point clé mis en avant. |
| `pointLegend` | `string` | Pastille de légende du point clé (« Solution »). |
| `description` | `string` | Texte accessible. |

## Exemple

```js
const { MathGraph } = window.TutorIA;
```
