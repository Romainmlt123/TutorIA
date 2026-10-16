# LinkRequestCard

La demande de liaison d'un enfant, en tête du tableau de bord parent (P1, F4). L'enfant a saisi le code de son parent ; s'il a moins de 15 ans, accepter valide son compte. Validé le 15 octobre 2026 (v2.18).

- La carte violet doux de l'app (`accent-soft`) : le rond de l'enfant, « Tom souhaite relier son compte au vôtre », ce qu'accepter veut dire.
- **« Refuser » en rouge doux** (`Button` `danger`), « Accepter » en violet (`Button` `vivid`) : les deux réponses ne se confondent pas. C'est le seul rouge doux de l'app qui n'efface rien (décision de Romain).
- Pendant l'envoi, les deux boutons s'estompent (`pending`) ; une erreur s'affiche sous le texte (`error`).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `name` | `string` | Prénom de l'enfant. |
| `title`, `body` | `string` | Titre et texte (par défaut ceux de l'app). |
| `acceptLabel`, `onAccept`, `acceptHref` | | « Accepter ». |
| `declineLabel`, `onDecline`, `declineHref` | | « Refuser ». |
| `pending` | `boolean` | Boutons estompés pendant l'envoi. |
| `error` | `string` | Message d'erreur. |

## Exemple

```js
const { LinkRequestCard } = window.TutorIA;
h(LinkRequestCard, { name: 'Tom', onAccept: accept, onDecline: decline });
```
