# Parchment

Étiquette de parchemin posée sur le bois (comme `Parchment` du code, exporté avec `WoodFrame`) : papier crème `#FFF2D9` cerné de caramel `#CAA06A`, légende 12/16 en gras, encre brune `#5B3713`. C'est le texte courant des panneaux du côté jeu, bien lisible sur les planches.

## Quand l'utiliser

Dans un `WoodFrame` seulement : la prochaine étape de « Ta quête », le texte d'une question (`WoodDialog`), le message et la suite d'un bilan (`LevelResultPanel`).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `children` | `node` | Texte. |
| `style` | `object` | Style de l'étiquette. |

## Exemple

```js
const { WoodFrame, GameText, Parchment } = window.TutorIA;
h(WoodFrame, { tab: 'Ta quête' }, h(GameText, { size: 17 }, 'Ville des Équations'), h(Parchment, null, 'Prochaine étape : Leçon · Isoler x'));
```
