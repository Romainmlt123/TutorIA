# ConversationDrawer

Volet « **Tes discussions** » qui glisse de la gauche quand on touche ☰ dans le tuteur (v2.12, 2H) : bandeau bleu de l'élève avec le titre et la croix, bouton blanc « Nouvelle discussion », puis les discussions rangées par jour (Aujourd'hui, Hier, 7 derniers jours), chacune avec la tuile de sa matière. Celle en cours est sur fond bleu clair.

## Quand l'utiliser

Par-dessus le tuteur, sur un voile `rgba(0,6,18,0.40)`, 335 px de large. Appui long sur une discussion pour la supprimer (aide en bas du volet). Une discussion libre a la tuile bleue à bulle.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `groups` | `Array<{ label, items: Array<{ id, subject, title, active }> }>` | Discussions par jour. |
| `onOpen` | `(id) => void` | Ouvre une discussion. |
| `onNew` | `function` | Nouvelle discussion. |
| `onClose` | `function` | Ferme le volet. |
| `hint` | `string \| false` | Aide du bas. |
| `width` / `height` | `number` | 335 × 100 %. |
| `topInset` | `number` | Marge du haut du bandeau (56). |

## Exemple

```js
const { ConversationDrawer } = window.TutorIA;
```
