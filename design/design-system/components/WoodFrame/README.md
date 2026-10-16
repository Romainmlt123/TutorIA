# WoodFrame

Panneau de bois du côté jeu (v2.10) : planches texturées, cadre sombre, biseau clair, un clou à chaque coin et un ruban bleu en Lilita One posé sur le bord haut. Le contenu va dans `children`.

## Quand l'utiliser

Panneaux du côté jeu : « Ta quête » d'Explorer, la fiche et le bilan d'un niveau dans l'app, l'armoire « Mes trophées » du profil (`TrophyShelf`), une question (`WoodDialog`). Le texte courant va sur un parchemin (`Parchment`). Le panneau laisse 14 px au-dessus de lui pour le ruban.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `tab` | `string` | Texte du ruban ; sans ruban s'il est absent. |
| `ariaLabel` | `string` | Libellé accessible. |
| `style` | `object` | Style du cadre. |
| `children` | `node` | Contenu. |

## Exemple

```js
const { WoodFrame, GameText } = window.TutorIA;
h(WoodFrame, { tab: 'Ta quête' }, h(GameText, { size: 17 }, 'Termine la Ville des Équations'));
```
