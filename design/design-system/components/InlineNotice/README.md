# InlineNotice

Bandeau vert de confirmation dans un formulaire (v2.11) : pastille cochée, phrase 14 Bold en vert foncé, action en lien souligné.

## Quand l'utiliser

Connexion élève avec un code parent gardé (L2b) : « Code 482 913 gardé : il sera relié à ta connexion. », puis « Retirer le code ». Le lien « J'ai un code de mon parent » disparaît tant que le code est gardé.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `children` | `node` | Phrase. |
| `actionLabel` | `string` | Action (« Retirer le code »). |
| `onAction` | `function` | Action. |
| `icon` | `string` | Icône (coche). |

## Exemple

```js
const { InlineNotice } = window.TutorIA;
h(InlineNotice, { actionLabel: 'Retirer le code', onAction: removeCode }, 'Code 482 913 gardé : il sera relié à ta connexion.');
```
