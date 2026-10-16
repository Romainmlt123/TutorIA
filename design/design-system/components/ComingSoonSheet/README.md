# ComingSoonSheet

« Bientôt disponible » pour ce qui n'a pas encore d'écran (B1) : réglages des révisions, Apple et Google, conditions. Validé le 15 octobre 2026 (v2.19).

- Une feuille du bas sur l'écran d'où l'on vient (voile `rgba(0,6,18,0.40)`), au lieu d'une page plein écran.
- Tuile de 56 px (dégradé de l'élève), pastille « Bientôt » orange doux, titre 20/26 Black, bouton pour fermer.
- Ce qui arrive vraiment, une ligne par élément (pas le même texte pour tous les sujets), puis un bouton qui ramène à l'écran (« Continuer mes révisions »).
- Les notifications et l'abonnement auront leurs propres écrans.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `title` | `string` | Le sujet. |
| `icon`, `badge` | `string` | Tuile (sliders) et pastille (« Bientôt »). |
| `body`, `items` |  | Ce qui arrive. |
| `actionLabel`, `onAction`, `actionHref` |  | Bouton principal (« Continuer »). |
| `onClose` | `function` | Fermer. |
| `veil` | `boolean` | `false` : la feuille seule. |

## Exemple

```js
const { ComingSoonSheet } = window.TutorIA;
h(ComingSoonSheet, { title: 'Réglages des révisions', items: [...], actionLabel: 'Continuer mes révisions', onClose: close });
```
