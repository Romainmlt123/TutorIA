# AdviceCard

« Comment l'encourager » (v2.10) : un conseil aux parents en violet `accent`, avec une ampoule, puis deux questions à poser à l'enfant dans un encadré blanc.

## Quand l'utiliser

Tableau de bord Parents (P1), sous « À surveiller ». Un seul conseil à la fois.

## Comportement

- Le conseil et les questions sont choisis parmi des formulations **rédigées à l'avance** (expliquer une notion, prendre un rythme, féliciter l'effort) : rien n'est écrit par l'IA.
- Les questions sont ouvertes, du parent à l'enfant, et reprennent le chapitre du conseil quand il y en a un.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `title` | `string` | « Comment l'encourager » par défaut. |
| `children` | `node` | Conseil. |
| `questions` | `string[]` | Questions à poser. |
| `questionsTitle` | `string` | « Questions à lui poser » par défaut. |

## Exemple

```js
const { AdviceCard } = window.TutorIA;
h(AdviceCard, { questions: ['Tu peux me montrer comment on fait « Équations du 1er degré » sur un exemple ?', 'Qu’est-ce qui t’a aidé à comprendre ?'] },
  'Demandez-lui de vous expliquer « Équations du 1er degré ». Expliquer à quelqu’un aide à retenir.');
```
