# VoiceAvatar

Le visage du tuteur pendant l’appel : son logo dans un disque blanc qui rebondit quand il parle, au niveau de sa voix, avec une ombre au sol qui rétrécit quand il est en l’air. Il se pose à chaque pause, penche la tête quand il écoute et respire à peine au repos.

## Quand l'utiliser

Au centre de l’appel vocal : 148 px seul (2B), 96 px sous un visuel (2D, 2F). Toucher le logo interrompt le tuteur ; un appui long signale la réponse. Sans `level`, le rebond est simulé (maquettes).

Rebond : un saut toutes les 0,42 s, de 18 px (14 px en 96) × `level`, avec un léger écrasement au sol. Pause à la ponctuation : `level` × 0,25. Écoute : rotation de −8° en 0,5 s. Repos : respiration de 1 à 1,025 en 3,2 s. Tout s’arrête si l’utilisateur a demandé moins d’animations.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `state` | `'speaking' | 'listening' | 'idle' | 'muted' | 'connecting'` | Qui a la parole : rebond si `speaking`, tête penchée si `listening`. |
| `level` | `number` | Niveau de la voix du tuteur, de 0 à 1, lissé (hauteur du rebond). Simulé s’il est absent. |
| `size` | `number` | 148 (par défaut) ou 96. |
| `label` | `string` | Libellé accessible. |
| `onInterrupt` | `function` | Toucher pendant que le tuteur parle. |
| `onLongPress` | `function` | Appui long (600 ms) : signaler. |

## Exemple

```js
const { VoiceAvatar } = window.TutorIA;
```
