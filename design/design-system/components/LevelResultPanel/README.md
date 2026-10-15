# LevelResultPanel

Bilan d'un niveau d'Explorer (comme `LevelResultPanel` du code, X5a et X5b), calculé par le serveur et posé sur la leçon dans un panneau de bois (`WoodFrame`), sous un voile `rgba(9,17,34,0.45)` :

- le ruban « type · verdict » (« Leçon · réussie », « Exercices · à revoir », « Évaluation · à consolider ») ;
- « Bien joué, Léa ! » ou « Presque, Léa ! » en Lilita One, puis « Tu as validé « Isoler x ». » ou ce qu'il faut pour réussir ;
- trois étoiles, celle du milieu plus grande, en or `#FFC933` ou en bois creusé `#2D1808` ;
- le score dans une encoche sombre (« 4 étapes sur 4 », « 5 sur 8 · 63 % ») et la médaille d'XP dorée (absente quand rejouer ne rapporte rien) ;
- réussi : ce que tu as travaillé (les objectifs du niveau), et pour des exercices ou une évaluation sous 3 étoiles « Rejoue quand tu veux pour décrocher plus d'étoiles. » ; pas réussi : la leçon à revoir ;
- la suite : « Continuer » en vert, ou « Retour à la carte » en jaune et « Revoir la notion » en vert.

Règles du code : étoiles à 50, 70 et 90 % ; des exercices sont réussis avec une étoile, une évaluation à 70 % (sinon la ville est « à consolider ») ; une leçon terminée est toujours réussie ; 10 XP la première fois, plus 10 XP par étoile nouvelle. Pour une évaluation, la leçon à revoir est la première leçon de la ville.

Remplace `LevelResultCard` et `TutorFeedback` (cartes de couleur des anciennes maquettes).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `type` | `'lecon' \| 'exercices' \| 'evaluation'` | Type du niveau. |
| `passed` | `boolean` | Réussi (vrai par défaut). |
| `levelTitle`, `firstName` | `string` | Titre du niveau, prénom. |
| `stars` | `number` | 0 à 3. |
| `correct`, `total` / `score` | | Score calculé, ou texte du score. |
| `xp` | `number` | XP gagnée. |
| `objectives` | `string[]` | Ce que tu as travaillé (si réussi). |
| `review` | `string` | Leçon à revoir (si pas réussi). |
| `onContinue` / `continueHref`, `onReview` / `reviewHref` | | La suite. |
| `veil` | `boolean` | `false` : le panneau seul. |

## Exemple

```js
const { LevelResultPanel } = window.TutorIA;
h(LevelResultPanel, { type: 'evaluation', passed: false, firstName: 'Léa', stars: 1, correct: 5, total: 8, xp: 20, review: 'Qu’est-ce qu’une équation ?' });
```
