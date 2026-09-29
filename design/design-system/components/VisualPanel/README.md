# VisualPanel

Panneau repliable qui accueille un graphique ou un tableau blanc au-dessus du chat.

## Quand l'utiliser

Tuteur écrit ou vocal quand le tuteur illustre son explication. Contrôlé (`open`) ou non (`defaultOpen`).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `kind` | `'graph' \| 'whiteboard'` | Type. |
| `subject` | `string` | Matière. |
| `kicker` | `string` | Surtitre. |
| `title` | `string` | Titre. |
| `live` | `boolean` | Dessin en cours. |
| `open` | `boolean` | Contrôlé. |
| `defaultOpen` | `boolean` | Ouvert au départ. |
| `onToggle` | `function` | Replier. |
| `onExpand` | `function` | Agrandir. |
| `children` | `node` | Contenu (`MathGraph`, `Whiteboard`). |
| `footer` | `node` | Légende sous le visuel. |

## Exemple

```js
const { VisualPanel } = window.TutorIA;
```
