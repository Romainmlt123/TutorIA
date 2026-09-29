# Whiteboard

Tableau blanc : étapes de calcul écrites ligne à ligne, opérations en marge, résultat encadré.

## Quand l'utiliser

Dans un `VisualPanel` quand le tuteur résout pas à pas (écrit ou vocal).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `subject` | `string` | Matière. |
| `steps` | `{ expr, op?, note? }[]` | Lignes du calcul. |
| `result` | `string` | Résultat encadré. |
| `resultNote` | `string` | Note sous le résultat. |
| `progress` | `number` | Nombre d'étapes déjà écrites (les suivantes apparaissent en fondu) ; tout est visible par défaut. |
| `description` | `string` | Texte accessible. |

## Exemple

```js
const { Whiteboard } = window.TutorIA;
```
