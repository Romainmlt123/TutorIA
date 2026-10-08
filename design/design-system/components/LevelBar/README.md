# LevelBar

Barre de niveau (v2.8) : pastille du niveau atteint (dégradé violet → bleu), barre en dégradé bleu → violet avec un curseur blanc cerclé de violet, pastille du niveau suivant en pointillés ; dessous « Niveau 7 · 340 / 500 XP » et « encore 160 XP ».

## Quand l'utiliser

Dans `ProfileSummary`, ou partout où l'on montre la progression d'XP. La barre est un `progressbar` accessible ; elle glisse en 0,6 s quand l'XP change.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `level` | `number` | Niveau atteint. |
| `xp` | `number` | XP dans ce niveau. |
| `xpMax` | `number` | Seuil du suivant. |

## Exemple

```js
const { LevelBar } = window.TutorIA;
h(LevelBar, { level: 7, xp: 340, xpMax: 500 });
```
