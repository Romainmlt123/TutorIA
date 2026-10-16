# ChatStarters

Idées de départ d'une **discussion libre encore vide** (v2.12, écart 19) : quatre pastilles de 40 px en dégradé de la palette d'accent, qui défilent sur le côté juste au-dessus de la saisie. Un toucher envoie la demande au tuteur.

## Quand l'utiliser

2G (nouvelle discussion, l'arrivée sur l'onglet Tutor'IA), tant que l'élève n'a rien envoyé. Elles disparaissent au premier message.

| Idée | Couleur | Icône |
| --- | --- | --- |
| Explique-moi une notion | violet `#662EE6 → #3B0DA2` | ampoule |
| Aide-moi sur un exercice | orange `#E6992E → #A3640D` | crayon |
| Fais-moi réviser | vert `#1BC85B → #03702B` | cartes |
| Montre-moi un graphique | cyan `#17A5BE → #026273` | graphique |

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `items` | `Array<{ id, label, message?, icon, colors }>` | Idées (les quatre ci-dessus par défaut). |
| `onPick` | `(message, id) => void` | Envoi de la demande. |
| `inset` | `number` | Marge de côté (20). |

## Exemple

```js
const { ChatStarters } = window.TutorIA;
h(ChatStarters, { onPick: send });
```
