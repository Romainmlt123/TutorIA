# StreakCard

Série de jours d'affilée, en orange plein (`orange-500`) avec texte blanc, sur une seule ligne.

## Quand l'utiliser

Accueil élève, à côté ou au-dessus du niveau. Seul endroit avec `LevelCard` où l'orange vif porte du texte blanc (écart validé).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `days` | `number` | Nombre de jours. À 0 (premier jour, v2.19) : « Ta série », « commence aujourd’hui ». |
| `label` | `string` | Texte à la place du nombre de jours. |
| `caption` | `string` | Relance (ex. « Plus que 4 jours pour ton record »). |
| `lifted` | `boolean \| 'parents'` | Posée à cheval sur le bandeau de marque : ombre portée de sa couleur (v2.17). `'parents'` sur le bandeau violet. |

## Exemple

```js
const { StreakCard } = window.TutorIA;
```
