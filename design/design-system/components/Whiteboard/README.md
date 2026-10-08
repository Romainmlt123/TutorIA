# Whiteboard

Tableau blanc : le calcul ligne à ligne en écriture mathématique, l’opération de chaque passage en bleu (« ↓ − 5 »), les notes numérotées dans la marge et le résultat entouré de rouge.

## Quand l'utiliser

Dans un `VisualPanel`, à l’écrit ou en vocal. En vocal, il s’écrit pendant que le tuteur parle : `progress` augmente, `writing` place le stylo bleu au bout de la dernière ligne, puis le résultat s’entoure.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `subject` | `string` | Matière. |
| `steps` | `{ expr, op?, note? }[]` | Lignes du calcul ; `op` est l’opération qui mène à cette ligne. |
| `result` | `string` | Résultat entouré. |
| `resultNote` | `string` | Note du résultat (« Solution »). |
| `progress` | `number` | Nombre de lignes déjà écrites (le résultat compte pour une) ; tout est visible par défaut. |
| `writing` | `boolean` | Stylo au bout de la dernière ligne écrite. |
| `circled` | `boolean` | Résultat entouré (true par défaut). |
| `description` | `string` | Texte accessible. |

## Exemple

```js
const { Whiteboard } = window.TutorIA;
```
