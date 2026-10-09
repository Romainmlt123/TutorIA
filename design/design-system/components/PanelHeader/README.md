# PanelHeader

En-tête d’un visuel du tuteur : tuile et surtitre dans la couleur du visuel (violet pour le graphique, azur pour le tableau), titre, agrandir, replier.

## Quand l'utiliser

Via `VisualPanel`, ou seul quand le panneau est replié. Tout le bandeau ouvre ou replie le panneau quand `onToggle` est fourni ; le chevron n’est qu’un repère.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `kind` | `'graph' | 'whiteboard'` | Sorte de visuel (couleurs, icône). |
| `subject` | `string` | Matière, pour le surtitre « Graphique · Maths ». |
| `kicker` | `string` | Surtitre. |
| `title` | `string` | Titre. |
| `live` | `boolean` | Point rouge clignotant (le tuteur dessine). |
| `open` | `boolean` | Chevron ouvert / fermé. |
| `collapsible` | `boolean` | Chevron présent (true par défaut). |
| `expandable` | `boolean` | Bouton agrandir présent (true par défaut). |
| `onToggle` | `function` | Replier / déplier. |
| `onExpand` | `function` | Plein écran. |

## Exemple

```js
const { PanelHeader } = window.TutorIA;
```
