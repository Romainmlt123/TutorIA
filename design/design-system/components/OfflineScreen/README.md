# OfflineScreen

Pas de réseau au premier lancement : le compte ne peut pas être lu (H2). Validé le 15 octobre 2026 (v2.19).

- L'écran de marque de la pause (`StudyPauseScreen`) : fond bleu, le tuteur avec un badge blanc sans réseau (orange).
- « Pas de connexion pour le moment », « Tutor’IA a besoin d’Internet pour ouvrir le compte la première fois. »
- « Réessayer » en blanc, l'aide « Wi-Fi ou données mobiles : on réessaie tout seul. », et « Changer de compte » en lien souligné.
- Élève ou parent : le texte reste neutre, ni « tu » ni « vous ».

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `title`, `body` | `string` | Titre et texte. |
| `retryLabel`, `onRetry`, `retryHref` |  | « Réessayer ». |
| `hint` | `string \| null` | Aide sous le bouton. |
| `linkLabel`, `onLink`, `linkHref` |  | « Changer de compte ». |

## Exemple

```js
const { OfflineScreen } = window.TutorIA;
h(OfflineScreen, { onRetry: retry, onLink: signOut });
```
