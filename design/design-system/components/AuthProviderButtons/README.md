# AuthProviderButtons

Boutons « Continuer avec Apple » et « Continuer avec Google », placés sous le formulaire.

## Quand l'utiliser

Empilés en pleine largeur sous « ou continuer avec » : connexion élève et parent (L2, L3). Côte à côte (`layout: 'row'`) : inscription élève (E1). Dans l'app, remplacer par les boutons officiels des SDK Apple et Google, avec leurs logos.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `layout` | `'stack' \| 'row'` | Empilés ou côte à côte. |
| `onApple` | `function` | Apple. |
| `onGoogle` | `function` | Google. |

## Exemple

```js
const { AuthProviderButtons } = window.TutorIA;
```
