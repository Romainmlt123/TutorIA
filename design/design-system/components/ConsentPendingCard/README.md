# ConsentPendingCard

Carte blanche du tuteur en attente (v2.11, écran C1) : un élève de moins de 15 ans dont aucun parent n'a validé le compte. Sablier violet, « Un parent doit valider ton compte », l'adresse du parent à qui la demande est partie, le bouton « Relier un parent » (vers la saisie d'un code ou l'envoi d'un e-mail), et le délai avant suppression.

## Quand l'utiliser

Onglet Tuteur bloqué (le tuteur transmet des contenus à OpenAI : il faut l'accord d'un parent, CNIL). Au-dessus : le logo du tuteur, « Ton tuteur t'attend », « Il s'ouvre dès qu'un parent a validé ton compte. » ; dessous : « Réviser avec mes flashcards », qui restent ouvertes. La barre du bas reste visible.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `parentEmail` | `string` | Adresse du parent (nouveau : l'app doit la connaître). |
| `days` | `number` | Jours avant suppression (28). |
| `title` | `string` | Titre. |
| `linkLabel` | `string` | « Relier un parent ». |
| `onLink` / `linkHref` | `function` / `string` | Vers « Relier mon compte à un parent ». |

## Exemple

```js
const { ConsentPendingCard } = window.TutorIA;
h(ConsentPendingCard, { parentEmail: 'claire.martin@exemple.fr', days: 28, onLink: openParentLink });
```
