# VoiceStatus

Pastille qui dit qui a la parole : verte « Je t’explique… » (haut-parleur) quand le tuteur parle, rouge « Je t’écoute… » (micro) quand c’est le tour de l’élève, neutre pour le micro coupé, la connexion et la fin d’appel.

## Quand l'utiliser

Sous le logo du tuteur. Elle est annoncée aux lecteurs d’écran (`aria-live`). Le rouge signale ici l’écoute, comme un voyant d’enregistrement, jamais une erreur ; `listenColor="orange"` l’adoucit.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `state` | `'speaking' | 'listening' | 'muted' | 'connecting' | 'ended' | 'error'` | État de l’appel. |
| `listenColor` | `'red' | 'orange'` | Couleur de « Je t’écoute… » (rouge par défaut). |
| `size` | `'md' | 'sm'` | Hauteur 40 ou 32 px. |
| `label` | `string` | Remplace le libellé. |

## Exemple

```js
const { VoiceStatus } = window.TutorIA;
```
