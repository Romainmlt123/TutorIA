# StatusChip

Pastille d'état d'une notion : acquis, en cours, à consolider, pas commencé, ou bilan d'une séance.

## Quand l'utiliser

Dans les listes de chapitres (espace Parents, stats) et le résumé d'une séance. Couleurs pleines, texte blanc, sauf « Pas commencé » en gris.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `status` | `'acquired' \| 'inProgress' \| 'toConsolidate' \| 'notStarted' \| 'understood' \| 'progressing' \| 'toReview'` | État affiché. |
| `icon` | `boolean` | Ajoute l'icône de l'état. |
| `label` | `string` | Remplace le libellé par défaut. |

## Exemple

```js
const { StatusChip } = window.TutorIA;
```
