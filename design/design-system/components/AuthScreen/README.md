# AuthScreen

Écran de compte plein écran (v2.7, étendu à tout le compte en v2.11) : le dégradé de l'espace couvre tout l'écran, le logo du tuteur (dans son disque blanc, comme pendant l'appel vocal) fait un petit rebond pour dire bonjour, puis le titre et la phrase en blanc. Le formulaire est dans une feuille blanche qui monte du bas.

## Quand l'utiliser

Tous les écrans de compte, sauf la bienvenue (L1) :

- élève, en bleu et au tutoiement : connexion (L2, L2b), code de mon parent (L7), mot de passe oublié (M1 à M3), inscription (E1), vérification de l'e-mail (E2), relier un parent depuis l'app (C2) ;
- parent, en violet et au vouvoiement : connexion (L3), inscription (L4, L4b, L5, L6), invitation (C3, sans flèche : `onBack: null`) et validation du compte de l'enfant (C4).

Le titre et la phrase s'équilibrent sur deux lignes (`text-wrap: balance`). Le tuteur en attente (C1) n'utilise pas `AuthScreen` : c'est un onglet, avec la barre du bas.

## Contenu de la feuille

1. Les champs en version remplie (`TextField` avec `filled`), « Mot de passe oublié ? » aligné à droite sous le mot de passe. Côté compte : `CodeInput`, `PasswordRules` `pills`, `PasswordMatch`, `SwitchField`, `HelpCard`, `InlineNotice` ; dans un parcours en étapes, `StepHeader` `back: false` en tête de la feuille.
2. Le bouton principal pleine largeur, juste sous ce qu'il valide (le clavier occupe le bas) : bleu côté élève, violet côté parent.
3. `OrDivider` « ou continuer avec », puis `AuthProviderButtons` empilés (boutons officiels Apple et Google dans l'app, avec leurs logos).
4. En bas (`footer`) : « J'ai un code de mon parent » (élève seulement) et « Pas encore de compte ? Créer… ».

## Comportement

- Le logo rebondit une fois à l'arrivée (0,35 s → 2,1 s), puis respire. Rien ne bouge si l'utilisateur a demandé moins d'animations.
- La feuille monte du bas en 0,55 s. Quand le clavier s'ouvre, elle défile ; le logo et le titre peuvent sortir de l'écran.
- La flèche de retour ramène à l'écran de bienvenue (L1).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `space` | `'eleve' \| 'parents'` | Couleur et ton de l'espace. |
| `title` | `string` | Titre (« Content de te revoir ! », « Bon retour parmi nous »). |
| `subtitle` | `string` | Phrase sous le titre. |
| `onBack` | `function \| null` | Retour ; `null` masque la flèche. |
| `greet` | `boolean` | Petit rebond du logo à l'arrivée (vrai par défaut). |
| `height` | `number` | Hauteur minimale (844 par défaut). |
| `footer` | `ReactNode` | Liens du bas de la feuille. |
| `children` | `ReactNode` | Formulaire et boutons. |

## Exemple

```js
const { AuthScreen, TextField, Button, OrDivider, AuthProviderButtons } = window.TutorIA;
h(AuthScreen, { space: 'eleve', title: 'Content de te revoir !', subtitle: 'Connecte-toi pour reprendre tes révisions.', onBack: goBack,
  footer: [h('a', { key: 'code' }, 'J’ai un code de mon parent'), h('span', { key: 'new' }, 'Pas encore de compte ? ', h('a', null, 'Créer mon compte'))] },
  h(TextField, { label: 'E-mail', icon: 'mail', type: 'email', filled: true }),
  h(TextField, { label: 'Mot de passe', icon: 'lock', type: 'password', filled: true }),
  h(Button, { fullWidth: true, brand: true, iconRight: 'arrowRight' }, 'Me connecter'),
  h(OrDivider, { label: 'ou continuer avec' }),
  h(AuthProviderButtons, {}));
```
