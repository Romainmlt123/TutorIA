# LevelHeader

En-tête de la leçon d'un niveau dans le HUD (comme `LevelHeader` du code) : retour jaune en relief (`GameButton`), pastille du type cernée de bleu nuit (vert leçon, bleu exercices, rouge évaluation), titre en Lilita One, puis la progression en segments et « Étape 2 sur 4 · Ville des Équations ». Les segments faits sont verts (`#2FD35A`), ceux à faire en blanc translucide (v2.13, au lieu du bois creusé, trop sombre sur le ciel).

## Quand l'utiliser

En haut de X4a et X4b, sur `LevelBackdrop`. À la voix, `callTime` remplace la progression par « À la voix · 02:14 · Ville des Équations » : à l'oral, rien n'est jugé. Remplace `LevelProgressHeader` depuis la v2.13 (plus de bascule écrit / vocal : le mode se choisit sur la fiche du niveau).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `type` | `'lecon' \| 'exercices' \| 'evaluation'` | Type de niveau. |
| `title` | `string` | Titre. |
| `done` / `total` | `number` | Progression. |
| `city` | `string` | Ville. |
| `callTime` | `string` | Durée de l'appel (à la voix). |
| `onBack` / `backHref` | | Retour à la carte (raccroche à la voix). |

## Exemple

```js
const { LevelHeader } = window.TutorIA;
```
