# Icon

Icône au trait fin (grille 24), en `currentColor`, pour l'interface et les six matières.

## Quand l'utiliser

Toutes les icônes de l'app passent par ce composant : navigation, boutons, cartes, pictos de matière. Au repos en `gray-400`/`gray-500`, en `primary` quand l'élément est actif. `flame` est la seule icône pleine (série).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `name` | `string` | Nom de l'icône : `home`, `map`, `cards`, `stats`, `chat`, `mic`, `video`, `flame`, `star`, `bulb`, `graph`, `pen`… et les matières `maths`, `francais`, `histoire-geo`, `anglais`, `svt`, `physique-chimie`. |
| `size` | `number` | Taille en px (24 par défaut). |
| `strokeWidth` | `number` | Épaisseur du trait (1.75 par défaut). |
| `color` | `string` | Couleur CSS ; hérite de `currentColor` sinon. |
| `filled` | `boolean` | Version pleine (onglet actif). |
| `label` | `string` | Libellé accessible ; sans lui l'icône est décorative. |

## Exemple

```js
const { Icon } = window.TutorIA;
```
