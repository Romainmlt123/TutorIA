# TopicCard

Encadré du sujet en cours en haut du tuteur : pastille matière, notion, badge d'état.

## Quand l'utiliser

Tuteur écrit et vocal. `live` fait clignoter un point rouge dans le badge (séance vocale en cours).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `subject` | `string` | Matière. |
| `title` | `string` | Notion travaillée. |
| `badge` | `string` | Texte du badge (ex. « En cours », « En direct »). |
| `live` | `boolean` | Point clignotant. |

## Exemple

```js
const { TopicCard } = window.TutorIA;
```
