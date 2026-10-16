# TopicCard

Carte « Sujet de la discussion » en haut du tuteur, dans le **dégradé de sa matière** (v2.12, écart 19) : icône de la matière en filigrane, pastille d'icône voilée, surtitre et titre en blanc, badge blanc à l'encre de la matière.

## Quand l'utiliser

Tuteur écrit et vocal (2A à 2K), sous la ligne ☰ · Écrit/Vocal · +. Une discussion libre (sans matière) est en **bleu de l'élève** avec l'icône bulle (« Toutes les matières », 2G) ; quand le tuteur reconnaît la matière, la carte prend sa couleur (2K). `live` met un point rouge clignotant dans le badge (chrono de l'appel).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `subject` | `SubjectId \| 'toutes'` | Matière ; absente ou `toutes` : discussion libre. |
| `subjectName` | `string` | Remplace le nom de la matière. |
| `title` | `string` | Chapitre, ou titre de la discussion libre. |
| `badge` | `string` | « Leçon 3/5 », chrono ; rien pour une discussion libre. |
| `live` | `boolean` | Point clignotant. |

## Exemple

```js
const { TopicCard } = window.TutorIA;
h(TopicCard, { subject: 'maths', title: 'Équations du 1er degré', badge: 'Leçon 3/5' });
```
