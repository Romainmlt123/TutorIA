# VisualChip

Pastille « Voir le graphique » ou « Voir le tableau » sous la réponse du tuteur qui avait un visuel (v2.12) : fond uni dans la couleur du visuel (violet 600, azur 600), de la taille de son texte, alignée sur les bulles du tuteur.

## Quand l'utiliser

Dans le fil du tuteur écrit (2C, 2E) et d'un niveau d'Explorer, quand le panneau du visuel est replié ou a défilé. Un toucher rouvre le visuel (ou l'agrandit).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `kind` | `'graph' \| 'whiteboard'` | Sorte de visuel. |
| `label` | `string` | Remplace « Voir le graphique ». |
| `inChat` | `boolean` | Décalée de 40 px, sous les bulles du tuteur. |
| `onClick` | `function` | Ouvre le visuel. |

## Exemple

```js
const { VisualChip } = window.TutorIA;
h(VisualChip, { kind: 'graph', inChat: true, onClick: expand });
```
