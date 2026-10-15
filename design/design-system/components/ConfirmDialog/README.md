# ConfirmDialog

La confirmation d'une action qui efface : supprimer son compte (élève, depuis le Profil ou Confidentialité, D2), supprimer le compte de son enfant (parent, depuis Données personnelles, D4). Validé le 14 octobre 2026 (v2.16).

- Un badge corbeille rouge doux, le titre (« Supprimer ton compte ? »), ce qui sera effacé.
- **Le choix sûr d'abord** : « Garder mon compte » est le bouton principal (bleu côté élève, violet côté parent) ; la suppression vient en second, en rouge doux.
- Avant d'effacer, proposer d'emporter ses données : « Télécharger mes données d'abord » (`extraLabel`).
- **Deuxième confirmation** (`ackLabel`) : la case « Je comprends que c'est définitif. » active la suppression, en rouge plein ; tant qu'elle n'est pas cochée, le bouton est estompé et ne répond pas.
- Sur un voile `rgba(0,6,18,0.40)`, centrée, marges de 20 px.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `title`, `body` | `string` | Titre et texte. |
| `tone` | `'eleve' \| 'parents'` | Bleu ou violet pour le choix sûr. |
| `keepLabel`, `onKeep`, `keepHref` | | Le choix sûr (« Garder mon compte »). |
| `confirmLabel`, `onConfirm` | | La suppression (« Supprimer définitivement »). |
| `extraLabel`, `extraIcon`, `onExtra`, `extraHref` | | Lien au-dessus des boutons. |
| `ackLabel` | `string` | Case à cocher qui active la suppression. |
| `acked` | `boolean` | Case cochée d'emblée (aperçu). |
| `icon` | `string` | Icône du badge (`trash`). |
| `veil` | `boolean` | `false` : la carte seule. |

## Exemple

```js
const { ConfirmDialog } = window.TutorIA;
h(ConfirmDialog, { tone: 'parents', title: 'Supprimer le compte de Léa ?', body: 'Le compte de Léa et toutes ses données (séances, progression, flashcards) seront supprimés définitivement.', keepLabel: 'Garder le compte', ackLabel: 'Je comprends que c’est définitif.' });
```
