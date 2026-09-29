# ParentCodeCard

Carte violette qui affiche le code à 6 chiffres pour relier le compte de l'enfant, avec sa validité et un bouton de partage.

## Quand l'utiliser

Fin de l'inscription parent, après la création du profil de l'enfant. L'enfant saisit ce code dans le champ « Code parent ».

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `code` | `string` | Code (ex. « 482 913 »). |
| `name` | `string` | Prénom de l'enfant. |
| `validity` | `string` | « Valable 24 h » par défaut. |
| `onShare` | `function` | Partager. |
| `shareLabel` | `string` | Libellé du bouton. |

## Exemple

```js
const { ParentCodeCard } = window.TutorIA;
```
