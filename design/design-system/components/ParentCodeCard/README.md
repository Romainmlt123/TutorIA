# ParentCodeCard

Carte violette qui affiche le code à 6 chiffres pour relier le compte de l'enfant, avec sa validité en pastille et un bouton de partage pleine largeur.

## Quand l'utiliser

Fin de l'inscription parent (L6), après la création du profil de l'enfant. Sur son téléphone, l'enfant touche « J'ai un code de mon parent » (sous la connexion, ou « Relier mon compte à un parent » dans l'app) et saisit ce code dans les cases (`CodeInput`). Il n'y a plus de champ « Code parent » dans la connexion depuis la v2.7.

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
h(ParentCodeCard, { code: '482 913', name: 'Léa', onShare: share });
```
