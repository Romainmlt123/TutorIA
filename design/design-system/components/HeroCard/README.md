# HeroCard

Grande carte héros sur dégradé bleu → violet, avec logo, surtitre, titre et message.

## Quand l'utiliser

Haut du tableau de bord Parents (résumé de la semaine). Une par écran.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `kicker` | `string` | Surtitre. |
| `title` | `string` | Titre. |
| `caption` | `string` | Ligne sous le titre. |
| `logo` | `boolean` | Pastille logo. |
| `big` | `boolean` | Titre 28px. |
| `icon` | `string` | Picto en filigrane. |
| `badge` | `string` | Pastille verte de progrès. |
| `label` | `string` | Libellé accessible. |
| `children` | `node` | Message. |
| `lifted` | `boolean \| 'parents'` | Posée à cheval sur le bandeau de marque : ombre portée de sa couleur (v2.17). `'parents'` sur le bandeau violet. |

## Exemple

```js
const { HeroCard } = window.TutorIA;
```
