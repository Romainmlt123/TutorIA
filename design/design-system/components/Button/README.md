# Button

Bouton d'action, 48px de haut, arrondi `radius-2xl`, en huit variantes.

## Quand l'utiliser

`primary` pour l'action principale (un par écran avec `brand` pour l'ombre bleue), `vivid` pour l'appel à jouer en violet vif (« C'est parti »), `soft` pour une action secondaire, `white` sur un dégradé, `ghost` pour un lien discret, `danger` (rouge doux) pour une action destructive. Depuis la v2.16 : `vividSoft` (violet doux) pour une action secondaire côté parent, `dangerSolid` (rouge plein) seulement pour la suppression définitive confirmée par une case (`ConfirmDialog`).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `variant` | `'primary' \| 'vivid' \| 'vividSoft' \| 'soft' \| 'white' \| 'ghost' \| 'danger' \| 'dangerSolid'` | Style (`primary` par défaut). |
| `size` | `'md' \| 'sm'` | `sm` : 40px, texte 14 gras. |
| `brand` | `boolean` | Ombre bleue `shadow-brand` (un seul par écran). |
| `icon` | `string` | Icône à gauche. |
| `iconRight` | `string` | Icône à droite. |
| `fullWidth` | `boolean` | Pleine largeur. |
| `disabled` | `boolean` | Désactivé. |
| `href` | `string` | Rend un lien. |
| `onClick` | `function` | Action. |

## Exemple

```js
const { Button } = window.TutorIA;
```
