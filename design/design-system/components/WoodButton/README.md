# WoodButton

Bouton de bois du côté jeu (v2.10) : une planche du panneau « Ta quête », texturée, avec un cadre sombre, un biseau clair et un rebord dessous ; elle s'enfonce d'un pixel quand on appuie. Libellé en `GameText`, icône blanche après.

## Quand l'utiliser

Actions du côté jeu posées hors d'Explorer : « Modifier l'avatar » sur le profil, et les boutons des panneaux de bois. Les actions d'étude gardent le `Button` de la marque.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `label` | `string` | Libellé. |
| `icon` | `string` | Icône après le libellé. |
| `size` | `number` | Hauteur de la planche (48 ; rebord de 5 px en plus). |
| `width` | `number \| string` | Largeur (100 %). |
| `badge` | `number \| string` | Pastille orange en haut à droite. |
| `ariaLabel` | `string` | Libellé accessible complet. |
| `onClick` | `function` | Action. |

## Exemple

```js
const { WoodButton } = window.TutorIA;
h(WoodButton, { label: 'Modifier l’avatar', icon: 'pencil', size: 46, width: 190, badge: 2, onClick: openEditor });
```
