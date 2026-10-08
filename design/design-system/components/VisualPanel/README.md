# VisualPanel

Carte d’un visuel du tuteur, teintée de sa couleur (violet clair et bord violet pour le graphique, azur pour le tableau), avec le dessin sur une feuille blanche.

## Quand l'utiliser

Au-dessus du chat écrit (repliable), ou en haut de l’appel vocal avec `elevated` et `collapsible={false}` : elle occupe alors la moitié haute de l’écran.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `kind` | `'graph' | 'whiteboard'` | Sorte de visuel. |
| `subject` | `string` | Matière. |
| `kicker` | `string` | Surtitre. |
| `title` | `string` | Titre. |
| `live` | `boolean` | Dessin en cours. |
| `open` | `boolean` | Contrôlé. |
| `defaultOpen` | `boolean` | Ouvert au départ. |
| `collapsible` | `boolean` | Repliable (true par défaut). |
| `expandable` | `boolean` | Bouton agrandir (true par défaut). |
| `elevated` | `boolean` | Ombre forte, pour l’appel vocal sur le dégradé. |
| `onToggle` | `function` | Replier. |
| `onExpand` | `function` | Agrandir. |
| `children` | `node` | Contenu (`MathGraph`, `Whiteboard`). |
| `footer` | `node` | Légende sous le visuel. |

## Exemple

```js
const { VisualPanel } = window.TutorIA;
```
