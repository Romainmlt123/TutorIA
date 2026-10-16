# OfflineNotice

Le tuteur n'a plus de réseau (H1). Validé le 15 octobre 2026 (v2.19), décision de Romain : juste un message, sans entraînement de remplacement. En jaune et dans la conversation depuis la v2.19.1 (plus lisible et plus clair que le violet en haut de l'écran).

- Jaune plein `#FFD43B` (hors palette, écart validé n° 12), texte `orange-900`, ombre `0 6px 16px rgba(163,100,13,0.22)`.
- Dans la conversation, juste sous la question de l'élève qui n'est pas partie, sur toute la largeur (`alignSelf: stretch`) : on voit tout de suite quel message attend.
- Rond de 36 px blanc à 45 % avec l'icône sans réseau, « Pas de connexion » 15/20 Bold, « Vérifie ton Wi-Fi ou tes données mobiles. » 13/18 Medium.
- Bouton rond blanc de 40 px (`refresh`, `orange-900`) pour réessayer : il renvoie la question. La discussion reste.
- Le bouton photo est masqué tant qu'il n'y a pas de réseau.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `title`, `body` | `string` | Titre et texte. |
| `onRetry`, `retryHref`, `retryLabel` |  | Réessayer (rond blanc). |

## Exemple

```js
const { OfflineNotice } = window.TutorIA;
h(OfflineNotice, { onRetry: retry });
```
