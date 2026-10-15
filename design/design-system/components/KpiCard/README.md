# KpiCard

Chiffre clé sur dégradé coloré, avec picto et évolution.

## Quand l'utiliser

Grille de chiffres des statistiques élève (`compact` pour une grille de 3) et chiffres clés du tableau de bord Parents (`centered`).

## Variantes

- Par défaut : picto et libellé en haut, grande valeur, évolution dans une pastille, picto en filigrane.
- `compact` : valeur 22 Black puis libellé, pour une grille de 3.
- `centered` (v2.10, P1) : pastille d'icône, valeur 22 Black et libellé 12 centrés les uns sous les autres, sans évolution ni filigrane. Les parents voient la semaine, pas une comparaison.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `tone` | `'blue' \| 'hero' \| 'cyan' \| 'violet' \| 'green' \| 'red' \| 'orange' \| 'slate'` | Couleur. |
| `icon` | `string` | Picto. |
| `label` | `string` | Libellé. |
| `value` | `string` | Valeur. |
| `delta` | `string` | Évolution (ex. « +12 % »). |
| `compact` | `boolean` | Version réduite. |
| `centered` | `boolean` | Version centrée de P1. |
| `lifted` | `boolean \| 'parents'` | Posée à cheval sur le bandeau de marque : ombre portée de sa couleur (v2.17). `'parents'` sur le bandeau violet. |

## Exemple

```js
const { KpiCard } = window.TutorIA;
h(KpiCard, { tone: 'cyan', icon: 'clock', value: '4 h 40', label: 'd’étude', centered: true });
```
