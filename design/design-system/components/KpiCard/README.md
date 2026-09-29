# KpiCard

Chiffre clé sur dégradé coloré avec picto en filigrane et évolution.

## Quand l'utiliser

Grille de chiffres des statistiques élève et du tableau de bord Parents. `compact` pour une grille de 3.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `tone` | `'blue' \| 'hero' \| 'cyan' \| 'violet' \| 'green' \| 'red' \| 'orange' \| 'slate'` | Couleur. |
| `icon` | `string` | Picto. |
| `label` | `string` | Libellé. |
| `value` | `string` | Valeur. |
| `delta` | `string` | Évolution (ex. « +12 % »). |
| `compact` | `boolean` | Version réduite. |

## Exemple

```js
const { KpiCard } = window.TutorIA;
```
