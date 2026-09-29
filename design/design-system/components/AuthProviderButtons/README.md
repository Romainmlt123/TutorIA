# AuthProviderButtons

Boutons « Continuer avec Apple » et « Continuer avec Google », placés sous le formulaire.

## Quand l'utiliser

Connexion parent (empilés) et inscription élève (`layout: 'row'`). Dans l'app, remplacer par les boutons officiels des SDK Apple et Google, avec leurs logos.

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
