# SegmentedControl

Sélecteur à segments dans une piste grise ; le segment choisi passe en blanc surélevé.

## Quand l'utiliser

Filtres de période (Semaine / Mois / Trimestre), choix entre deux vues. Pour écrit / vocal, utiliser `ModeToggle`.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `options` | `{ id, label, icon? }[]` | Segments. |
| `value` | `string` | Segment sélectionné. |
| `onChange` | `(id) => void` | Changement. |
| `fullWidth` | `boolean` | Pleine largeur, segments égaux. |
| `label` | `string` | Libellé accessible du groupe. |

## Exemple

```js
const { SegmentedControl } = window.TutorIA;
```
