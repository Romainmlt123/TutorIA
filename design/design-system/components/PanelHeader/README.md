# PanelHeader

En-tête d'un panneau visuel (graphique ou tableau blanc) : surtitre matière, titre, agrandir, replier.

## Quand l'utiliser

Utilisé seul quand le panneau est replié, ou via `VisualPanel`.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `kind` | `'graph' \| 'whiteboard'` | Type de panneau. |
| `subject` | `string` | Matière (couleurs). |
| `kicker` | `string` | Surtitre (par défaut « Graphique · Maths »). |
| `title` | `string` | Titre. |
| `live` | `boolean` | Point rouge clignotant (le tuteur dessine). |
| `open` | `boolean` | Chevron ouvert / fermé. |
| `onToggle` | `function` | Replier / déplier. |
| `onExpand` | `function` | Plein écran. |

## Exemple

```js
const { PanelHeader } = window.TutorIA;
```
