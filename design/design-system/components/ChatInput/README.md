# ChatInput

Saisie du tuteur écrit : **bouton photo** rond à gauche (v2.12), champ, bouton d'envoi bleu. Quand une photo est prête, son **aperçu** se pose au-dessus (vignette, « Cadre seulement l'exercice, sans ton nom. », croix pour la retirer) ; l'envoi part avec la photo.

## Quand l'utiliser

Bas du tuteur écrit, au-dessus de la barre de navigation, et dans la discussion d'un niveau d'Explorer. Le bouton photo n'apparaît pas si un parent a coupé la caméra, hors connexion et pendant une évaluation : ne pas passer `onCamera` dans ces cas. Placeholder « Pose ta question… » dans une discussion libre neuve.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `value` | `string` | Valeur contrôlée. |
| `defaultValue` | `string` | Valeur initiale. |
| `onChange` | `(v) => void` | Saisie. |
| `onSend` | `(v, attachment) => void` | Envoi. |
| `placeholder` | `string` | « Écris ta réponse… » par défaut. |
| `label` | `string` | Libellé accessible. |
| `onCamera` / `cameraHref` | `function` / `string` | Bouton photo (ouvre `PhotoSourceDialog`). |
| `attachment` | `{ src?, thumb?, hint?, onRemove? }` | Photo prête à partir. |
| `disabled` | `boolean` | Pendant la réponse du tuteur. |
| `game` | `boolean` | Leçon d’Explorer (X4a, v2.13) : photo en `GameButton` blanc, champ cerné de bleu nuit, envoi en `GameButton` bleu (le bleu d’envoi de l’app). |

## Exemple

```js
const { ChatInput } = window.TutorIA;
h(ChatInput, { onCamera: openPhoto, attachment: photo && { src: photo.uri, onRemove: clear } });
```
