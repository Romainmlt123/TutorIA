# IconButton

Bouton carré arrondi 48px avec une icône, pour les actions d'en-tête (retour, notifications, réglages).

## Quand l'utiliser

En haut des écrans. `badge` signale une nouveauté par une pastille `accent`.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `icon` | `string` | Icône. |
| `label` | `string` | Libellé accessible (obligatoire). |
| `badge` | `boolean` | Pastille violette de notification. |
| `tone` | `'surface' \| 'soft'` | Fond blanc surélevé (défaut) ou fond `bg` sans ombre. |
| `size` | `number` | Taille (48 par défaut). |
| `onClick` | `function` | Action. |

## Exemple

```js
const { IconButton } = window.TutorIA;
```
