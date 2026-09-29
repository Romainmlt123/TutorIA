import type { Flashcard } from '../types';

/** Flashcards QCM fictives, programme de 4e. Données de démonstration (pas de base de données). */
export const flashcards: readonly Flashcard[] = [
  // Maths — Équations du 1er degré
  {
    id: 'maths-equations-01',
    chapterId: 'maths-equations',
    question: 'Résous : 2x − 7 = 9',
    options: ['x = 1', 'x = 8', 'x = 16', 'x = −8'],
    answerIndex: 1,
    explanation: 'On ajoute 7 des deux côtés : 2x = 16, puis on divise par 2.',
  },
  {
    id: 'maths-equations-02',
    chapterId: 'maths-equations',
    question: 'Que vaut x si 5x = −35 ?',
    options: ['x = −7', 'x = 7', 'x = −30', 'x = −40'],
    answerIndex: 0,
    explanation: 'On divise les deux membres par 5 : −35 ÷ 5 = −7.',
  },
  {
    id: 'maths-equations-03',
    chapterId: 'maths-equations',
    question: 'Résous : x + 12 = 4',
    options: ['x = 16', 'x = 8', 'x = −8', 'x = −16'],
    answerIndex: 2,
    explanation: 'On retire 12 des deux côtés : 4 − 12 = −8.',
  },
  {
    id: 'maths-equations-04',
    chapterId: 'maths-equations',
    question: 'Résous : 4x + 3 = 2x + 11',
    options: ['x = 7', 'x = 1', 'x = 2', 'x = 4'],
    answerIndex: 3,
    explanation: 'On regroupe les x : 2x + 3 = 11, donc 2x = 8 et x = 4.',
  },
  {
    id: 'maths-equations-05',
    chapterId: 'maths-equations',
    question: 'x = 3 est-il solution de 2x + 1 = 7 ?',
    options: ['Oui', 'Non', 'Seulement si x > 0', 'On ne peut pas savoir'],
    answerIndex: 0,
    explanation: '2 × 3 + 1 = 7 : l’égalité est vraie.',
  },
  {
    id: 'maths-equations-06',
    chapterId: 'maths-equations',
    question: 'Résous : 3x − 5 = 10',
    options: ['x = 15', 'x = 5/3', 'x = 5', 'x = −5'],
    answerIndex: 2,
    explanation: 'On ajoute 5 des deux côtés : 3x = 15, puis on divise par 3 : x = 5.',
  },
  {
    id: 'maths-equations-07',
    chapterId: 'maths-equations',
    question: 'Résous : (2/3)x = 8',
    options: ['x = 16/3', 'x = 24', 'x = 4', 'x = 12'],
    answerIndex: 3,
    explanation: 'On multiplie les deux membres par 3/2, l’inverse de 2/3 : x = 8 × 3/2 = 12.',
  },
  {
    id: 'maths-equations-08',
    chapterId: 'maths-equations',
    question: 'Résous : 7 − x = 10',
    options: ['x = 3', 'x = −3', 'x = 17', 'x = −17'],
    answerIndex: 1,
    explanation: 'On retire 7 des deux côtés : −x = 3, donc x = −3.',
  },
  {
    id: 'maths-equations-09',
    chapterId: 'maths-equations',
    question: 'Résous : 3(x + 2) = 21',
    options: ['x = 5', 'x = 7', 'x = 19/3', 'x = 23/3'],
    answerIndex: 0,
    explanation: 'On divise les deux membres par 3 : x + 2 = 7, puis on retire 2 : x = 5.',
  },
  {
    id: 'maths-equations-10',
    chapterId: 'maths-equations',
    question: 'Résous : 5x − 2 = 3x − 10',
    options: ['x = 4', 'x = −6', 'x = −4', 'x = −1'],
    answerIndex: 2,
    explanation: 'On retire 3x et on ajoute 2 des deux côtés : 2x = −8, donc x = −4.',
  },
  {
    id: 'maths-equations-11',
    chapterId: 'maths-equations',
    question: 'Je triple un nombre et j’ajoute 5 : j’obtiens 26. Quel est ce nombre ?',
    options: ['21', '7', '31/3', '8'],
    answerIndex: 1,
    explanation: 'On pose 3x + 5 = 26. On retire 5 : 3x = 21, puis on divise par 3 : x = 7.',
  },
  {
    id: 'maths-equations-12',
    chapterId: 'maths-equations',
    question: 'Léa a 3 fois l’âge de Tom. À eux deux, ils ont 48 ans. Âge de Tom ?',
    options: ['16 ans', '36 ans', '24 ans', '12 ans'],
    answerIndex: 3,
    explanation: 'Avec x l’âge de Tom : x + 3x = 48, donc 4x = 48 et x = 12. Léa a donc 36 ans.',
  },

  // Maths — Calcul littéral
  {
    id: 'maths-calcul-litteral-01',
    chapterId: 'maths-calcul-litteral',
    question: 'Développe : −2(x − 5)',
    options: ['−2x + 10', '−2x − 10', '−2x − 5', '2x + 10'],
    answerIndex: 0,
    explanation: 'On multiplie chaque terme par −2 : −2 × x = −2x et −2 × (−5) = +10.',
  },
  {
    id: 'maths-calcul-litteral-02',
    chapterId: 'maths-calcul-litteral',
    question: 'Réduis : 5x + 3 − 2x + 4',
    options: ['7x + 7', '10x', '3x + 7', '3x − 1'],
    answerIndex: 2,
    explanation: 'On regroupe les x : 5x − 2x = 3x, puis les nombres : 3 + 4 = 7.',
  },
  {
    id: 'maths-calcul-litteral-03',
    chapterId: 'maths-calcul-litteral',
    question: 'Développe : (x + 2)(x + 3)',
    options: ['x² + 6', 'x² + 5x + 6', 'x² + 6x + 5', '2x + 5'],
    answerIndex: 1,
    explanation: 'On multiplie chaque terme par chaque terme : x² + 3x + 2x + 6 = x² + 5x + 6.',
  },
  {
    id: 'maths-calcul-litteral-04',
    chapterId: 'maths-calcul-litteral',
    question: 'Factorise : 6x + 9',
    options: ['6(x + 9)', '3(2x + 9)', '3(3x + 2)', '3(2x + 3)'],
    answerIndex: 3,
    explanation: 'On repère le facteur commun 3 : 6x = 3 × 2x et 9 = 3 × 3.',
  },
  {
    id: 'maths-calcul-litteral-05',
    chapterId: 'maths-calcul-litteral',
    question: 'Calcule 2x² − 3x pour x = −2',
    options: ['2', '22', '14', '−14'],
    answerIndex: 2,
    explanation: 'On remplace x par −2 : 2 × 4 − 3 × (−2) = 8 + 6 = 14.',
  },

  // Maths — Théorème de Pythagore
  {
    id: 'maths-pythagore-01',
    chapterId: 'maths-pythagore',
    question: 'Les côtés de l’angle droit mesurent 3 cm et 4 cm. Hypoténuse ?',
    options: ['7 cm', '5 cm', '25 cm', '12 cm'],
    answerIndex: 1,
    explanation: '3² + 4² = 9 + 16 = 25, et √25 = 5 : l’hypoténuse mesure 5 cm.',
  },
  {
    id: 'maths-pythagore-02',
    chapterId: 'maths-pythagore',
    question: 'ABC est rectangle en A. Quelle est son hypoténuse ?',
    options: ['[AB]', '[AC]', 'On ne peut pas savoir', '[BC]'],
    answerIndex: 3,
    explanation: 'L’hypoténuse est le côté opposé à l’angle droit : ici, c’est [BC].',
  },
  {
    id: 'maths-pythagore-03',
    chapterId: 'maths-pythagore',
    question: 'Triangle rectangle : hypoténuse 10 cm, un côté 6 cm. 3e côté ?',
    options: ['8 cm', '4 cm', '16 cm', '64 cm'],
    answerIndex: 0,
    explanation: '10² − 6² = 100 − 36 = 64, et √64 = 8 : le troisième côté mesure 8 cm.',
  },
  {
    id: 'maths-pythagore-04',
    chapterId: 'maths-pythagore',
    question: 'Un triangle de côtés 5, 12 et 13 cm est-il rectangle ?',
    options: ['Non', 'Seulement s’il est isocèle', 'Oui', 'On ne peut pas savoir'],
    answerIndex: 2,
    explanation: '5² + 12² = 25 + 144 = 169 = 13² : d’après la réciproque, il est rectangle.',
  },

  // Maths — Puissances
  {
    id: 'maths-puissances-01',
    chapterId: 'maths-puissances',
    question: 'Combien vaut 2⁵ ?',
    options: ['10', '25', '64', '32'],
    answerIndex: 3,
    explanation: 'On multiplie 2 par lui-même 5 fois : 2 × 2 × 2 × 2 × 2 = 32.',
  },
  {
    id: 'maths-puissances-02',
    chapterId: 'maths-puissances',
    question: 'Quelle est l’écriture décimale de 10⁻³ ?',
    options: ['−1 000', '0,001', '0,0001', '−0,001'],
    answerIndex: 1,
    explanation: 'Un exposant négatif donne un inverse : 10⁻³ = 1 ÷ 1 000 = 0,001.',
  },
  {
    id: 'maths-puissances-03',
    chapterId: 'maths-puissances',
    question: 'Simplifie : 10⁴ × 10³',
    options: ['10⁷', '10¹²', '100⁷', '10¹'],
    answerIndex: 0,
    explanation: 'On additionne les exposants : 4 + 3 = 7, donc 10⁴ × 10³ = 10⁷.',
  },
  {
    id: 'maths-puissances-04',
    chapterId: 'maths-puissances',
    question: 'Quelle est l’écriture scientifique de 45 000 ?',
    options: ['45 × 10³', '0,45 × 10⁵', '4,5 × 10⁴', '4,5 × 10³'],
    answerIndex: 2,
    explanation: 'On garde un seul chiffre, différent de 0, avant la virgule : 45 000 = 4,5 × 10⁴.',
  },

  // Français — Accord du participe passé
  {
    id: 'fr-participe-passe-01',
    chapterId: 'fr-participe-passe',
    question: 'Complète : « Les fleurs que j’ai cueilli… »',
    options: ['cueilli', 'cueillis', 'cueillies', 'cueillie'],
    answerIndex: 2,
    explanation:
      'Avec avoir, on accorde avec le COD placé avant : « que », mis pour « les fleurs », féminin pluriel.',
  },
  {
    id: 'fr-participe-passe-02',
    chapterId: 'fr-participe-passe',
    question: 'Complète : « Elles sont parti… hier soir. »',
    options: ['parties', 'partis', 'parti', 'partie'],
    answerIndex: 0,
    explanation:
      'Avec être, le participe passé s’accorde avec le sujet « elles », féminin pluriel.',
  },
  {
    id: 'fr-participe-passe-03',
    chapterId: 'fr-participe-passe',
    question: 'Complète : « Nous avons mang… des pommes. »',
    options: ['mangées', 'mangés', 'manger', 'mangé'],
    answerIndex: 3,
    explanation: 'Avec avoir, pas d’accord ici : le COD « des pommes » est placé après le verbe.',
  },
  {
    id: 'fr-participe-passe-04',
    chapterId: 'fr-participe-passe',
    question: 'Complète : « La lettre a été écrit… par Paul. »',
    options: ['écrit', 'écrite', 'écrits', 'écrites'],
    answerIndex: 1,
    explanation:
      'Au passif, avec être, le participe s’accorde avec le sujet « la lettre », féminin singulier.',
  },
  {
    id: 'fr-participe-passe-05',
    chapterId: 'fr-participe-passe',
    question: 'Avec quel auxiliaire le participe s’accorde-t-il avec le sujet ?',
    options: ['Être', 'Avoir', 'Les deux', 'Aucun des deux'],
    answerIndex: 0,
    explanation:
      'Avec être, on accorde avec le sujet ; avec avoir, on regarde si le COD est placé avant.',
  },

  // Français — Les figures de style
  {
    id: 'fr-figures-de-style-01',
    chapterId: 'fr-figures-de-style',
    question: '« Cet homme est un lion. » Quelle figure de style ?',
    options: ['Une comparaison', 'Une métaphore', 'Une hyperbole', 'Une antithèse'],
    answerIndex: 1,
    explanation: 'On rapproche l’homme du lion sans mot de comparaison : c’est une métaphore.',
  },
  {
    id: 'fr-figures-de-style-02',
    chapterId: 'fr-figures-de-style',
    question: '« Il est fort comme un lion. » Quelle figure de style ?',
    options: ['Une métaphore', 'Une personnification', 'Une anaphore', 'Une comparaison'],
    answerIndex: 3,
    explanation: 'Le mot « comme » relie les deux éléments rapprochés : c’est une comparaison.',
  },
  {
    id: 'fr-figures-de-style-03',
    chapterId: 'fr-figures-de-style',
    question: '« Je meurs de faim ! » Quelle figure de style ?',
    options: ['Une litote', 'Une métaphore', 'Une hyperbole', 'Une comparaison'],
    answerIndex: 2,
    explanation: 'On exagère volontairement pour insister sur la faim : c’est une hyperbole.',
  },
  {
    id: 'fr-figures-de-style-04',
    chapterId: 'fr-figures-de-style',
    question: '« Les arbres pleurent sous la pluie. » Quelle figure de style ?',
    options: ['Une personnification', 'Une hyperbole', 'Une comparaison', 'Une antithèse'],
    answerIndex: 0,
    explanation:
      'On prête aux arbres un comportement humain, pleurer : c’est une personnification.',
  },

  // Français — Le récit fantastique
  {
    id: 'fr-recit-fantastique-01',
    chapterId: 'fr-recit-fantastique',
    question: 'Qu’est-ce qui caractérise le récit fantastique ?',
    options: [
      'Des fées et des dragons',
      'Une fin toujours heureuse',
      'Un futur très technologique',
      'Le doute face à l’étrange',
    ],
    answerIndex: 3,
    explanation:
      'Le fantastique fait hésiter entre une explication rationnelle et une explication surnaturelle.',
  },
  {
    id: 'fr-recit-fantastique-02',
    chapterId: 'fr-recit-fantastique',
    question: 'Qui a écrit « Le Horla » ?',
    options: ['Guy de Maupassant', 'Victor Hugo', 'Jules Verne', 'Émile Zola'],
    answerIndex: 0,
    explanation:
      'C’est Guy de Maupassant, au XIXe siècle : le narrateur s’y croit hanté par un être invisible.',
  },
  {
    id: 'fr-recit-fantastique-03',
    chapterId: 'fr-recit-fantastique',
    question: 'Au début d’un récit fantastique, le cadre est souvent…',
    options: ['Magique', 'Réaliste', 'Futuriste', 'Mythologique'],
    answerIndex: 1,
    explanation:
      'Le cadre est d’abord banal et réaliste, pour que l’irruption de l’étrange surprenne davantage.',
  },
  {
    id: 'fr-recit-fantastique-04',
    chapterId: 'fr-recit-fantastique',
    question: 'Qui a écrit « La Vénus d’Ille » ?',
    options: ['Charles Perrault', 'Molière', 'Prosper Mérimée', 'Jean de La Fontaine'],
    answerIndex: 2,
    explanation:
      'Prosper Mérimée publie cette nouvelle en 1837 : une statue de bronze semble y prendre vie.',
  },

  // Français — Les subordonnées
  {
    id: 'fr-subordonnees-01',
    chapterId: 'fr-subordonnees',
    question: '« Je pense que tu as raison. » Quelle subordonnée ?',
    options: ['Complétive', 'Relative', 'Circonstancielle', 'Interrogative indirecte'],
    answerIndex: 0,
    explanation: 'Elle complète le verbe « pense », dont elle est COD : c’est une complétive.',
  },
  {
    id: 'fr-subordonnees-02',
    chapterId: 'fr-subordonnees',
    question: '« Le livre que je lis est passionnant. » Quelle subordonnée ?',
    options: ['Complétive', 'Circonstancielle', 'Interrogative indirecte', 'Relative'],
    answerIndex: 3,
    explanation:
      'Elle commence par le pronom relatif « que » et complète le nom « livre » : c’est une relative.',
  },
  {
    id: 'fr-subordonnees-03',
    chapterId: 'fr-subordonnees',
    question: '« Je sors quand il fait beau. » La subordonnée exprime…',
    options: ['La cause', 'Le temps', 'Le but', 'La conséquence'],
    answerIndex: 1,
    explanation:
      'La conjonction « quand » introduit une circonstancielle de temps : elle dit à quel moment.',
  },
  {
    id: 'fr-subordonnees-04',
    chapterId: 'fr-subordonnees',
    question: '« Il reste chez lui parce qu’il est malade. » La subordonnée exprime…',
    options: ['Le but', 'Le temps', 'La cause', 'La condition'],
    answerIndex: 2,
    explanation:
      'La locution « parce que » introduit une circonstancielle de cause : elle explique pourquoi.',
  },

  // Histoire-géo — La Révolution française
  {
    id: 'hg-revolution-01',
    chapterId: 'hg-revolution',
    question: 'En quelle année a eu lieu la prise de la Bastille ?',
    options: ['1792', '1799', '1804', '1789'],
    answerIndex: 3,
    explanation:
      'Le 14 juillet 1789, les Parisiens prennent la Bastille, symbole du pouvoir absolu du roi.',
  },
  {
    id: 'hg-revolution-02',
    chapterId: 'hg-revolution',
    question: 'Que proclame la Déclaration des droits de l’homme et du citoyen ?',
    options: [
      'Le pouvoir absolu du roi',
      'L’égalité en droits',
      'Le retour des privilèges',
      'L’abolition de l’esclavage',
    ],
    answerIndex: 1,
    explanation:
      'Son article 1 affirme que les hommes naissent et demeurent libres et égaux en droits.',
  },
  {
    id: 'hg-revolution-03',
    chapterId: 'hg-revolution',
    question: 'Quand la Première République est-elle proclamée ?',
    options: ['Juillet 1789', 'Août 1789', 'Septembre 1792', 'Janvier 1793'],
    answerIndex: 2,
    explanation:
      'Après la chute de la monarchie le 10 août 1792, la République est proclamée en septembre 1792.',
  },
  {
    id: 'hg-revolution-04',
    chapterId: 'hg-revolution',
    question: 'Quel roi est guillotiné en janvier 1793 ?',
    options: ['Louis XVI', 'Louis XIV', 'Louis XV', 'Charles X'],
    answerIndex: 0,
    explanation: 'Jugé par la Convention pour trahison, Louis XVI est exécuté le 21 janvier 1793.',
  },
  {
    id: 'hg-revolution-05',
    chapterId: 'hg-revolution',
    question: 'Que se passe-t-il dans la nuit du 4 août 1789 ?',
    options: [
      'La prise des Tuileries',
      'L’abolition des privilèges',
      'Le sacre de Napoléon',
      'La fuite du roi',
    ],
    answerIndex: 1,
    explanation:
      'Cette nuit-là, les députés de l’Assemblée abolissent les privilèges de la noblesse et du clergé.',
  },

  // Histoire-géo — L’Empire napoléonien
  {
    id: 'hg-empire-01',
    chapterId: 'hg-empire',
    question: 'En quelle année Napoléon est-il sacré empereur ?',
    options: ['1799', '1815', '1804', '1789'],
    answerIndex: 2,
    explanation: 'Le 2 décembre 1804, Napoléon Ier est sacré empereur à Notre-Dame de Paris.',
  },
  {
    id: 'hg-empire-02',
    chapterId: 'hg-empire',
    question: 'Quel ensemble de lois Napoléon fait-il adopter en 1804 ?',
    options: ['Le Code civil', 'Le Code de la route', 'La Constitution de 1791', 'Le Code noir'],
    answerIndex: 0,
    explanation:
      'Le Code civil de 1804 fixe les règles de la vie en société : famille, propriété, contrats.',
  },
  {
    id: 'hg-empire-03',
    chapterId: 'hg-empire',
    question: 'Quelle bataille marque la défaite finale de Napoléon ?',
    options: ['Austerlitz', 'Iéna', 'Wagram', 'Waterloo'],
    answerIndex: 3,
    explanation:
      'En juin 1815, Napoléon est battu à Waterloo, puis exilé sur l’île de Sainte-Hélène.',
  },
  {
    id: 'hg-empire-04',
    chapterId: 'hg-empire',
    question: 'Comment Bonaparte prend-il le pouvoir en 1799 ?',
    options: ['Par une élection', 'Par un coup d’État', 'Par héritage', 'Par un tirage au sort'],
    answerIndex: 1,
    explanation:
      'Le 18 Brumaire (novembre 1799), Bonaparte renverse le Directoire et devient Premier consul.',
  },

  // Histoire-géo — L’urbanisation du monde
  {
    id: 'hg-urbanisation-01',
    chapterId: 'hg-urbanisation',
    question: 'Quelle part de l’humanité vit en ville aujourd’hui ?',
    options: ['Plus de la moitié', 'Environ 10 %', 'Environ 25 %', 'Presque 100 %'],
    answerIndex: 0,
    explanation:
      'Depuis la fin des années 2000, plus de la moitié de l’humanité vit en ville, et cette part augmente.',
  },
  {
    id: 'hg-urbanisation-02',
    chapterId: 'hg-urbanisation',
    question: 'Une ville de plus de 10 millions d’habitants est une…',
    options: ['Mégalopole', 'Métropole', 'Mégapole', 'Banlieue'],
    answerIndex: 2,
    explanation:
      'On parle de mégapole au-delà de 10 millions d’habitants, comme Tokyo, Lagos ou Mexico.',
  },
  {
    id: 'hg-urbanisation-03',
    chapterId: 'hg-urbanisation',
    question: 'Qu’est-ce qu’un bidonville ?',
    options: [
      'Un quartier d’affaires',
      'Une ville nouvelle',
      'Un centre historique',
      'Un habitat précaire',
    ],
    answerIndex: 3,
    explanation:
      'Ses logements sont construits avec des matériaux de fortune, souvent sans eau courante ni électricité.',
  },
  {
    id: 'hg-urbanisation-04',
    chapterId: 'hg-urbanisation',
    question: 'Comment appelle-t-on l’avancée des villes sur les campagnes ?',
    options: ['L’exode rural', 'L’étalement urbain', 'La gentrification', 'La mondialisation'],
    answerIndex: 1,
    explanation:
      'Les villes s’étendent sur les terres agricoles autour d’elles : on parle d’étalement urbain.',
  },

  // Histoire-géo — Les mobilités humaines
  {
    id: 'hg-mobilites-01',
    chapterId: 'hg-mobilites',
    question: 'Pour le pays où il s’installe, un migrant est un…',
    options: ['Émigré', 'Touriste', 'Immigré', 'Nomade'],
    answerIndex: 2,
    explanation: 'On est immigré dans le pays d’arrivée, et émigré pour le pays que l’on a quitté.',
  },
  {
    id: 'hg-mobilites-02',
    chapterId: 'hg-mobilites',
    question: 'Un réfugié est une personne qui…',
    options: [
      'Part en vacances',
      'Voyage pour son travail',
      'Déménage dans sa ville',
      'Fuit guerre ou persécutions',
    ],
    answerIndex: 3,
    explanation:
      'Un réfugié a dû quitter son pays pour se protéger d’une guerre ou de persécutions.',
  },
  {
    id: 'hg-mobilites-03',
    chapterId: 'hg-mobilites',
    question: 'Pourquoi la plupart des migrants quittent-ils leur pays ?',
    options: [
      'Pour trouver du travail',
      'Pour faire du tourisme',
      'Pour leurs études',
      'Pour le climat',
    ],
    answerIndex: 0,
    explanation:
      'La majorité des migrations sont économiques : on part chercher un emploi et une vie meilleure.',
  },
  {
    id: 'hg-mobilites-04',
    chapterId: 'hg-mobilites',
    question: 'Un touriste passe hors de chez lui au moins…',
    options: ['Une heure', 'Une nuit', 'Un mois', 'Un an'],
    answerIndex: 1,
    explanation:
      'Un touriste passe au moins une nuit hors de son domicile habituel, et moins d’un an.',
  },

  // Anglais — Le prétérit simple
  {
    id: 'en-preterit-01',
    chapterId: 'en-preterit',
    question: 'Quel est le prétérit de « go » ?',
    options: ['goed', 'gone', 'goes', 'went'],
    answerIndex: 3,
    explanation:
      'Le verbe « go » est irrégulier : go, went, gone. Au prétérit, on dit donc « went ».',
  },
  {
    id: 'en-preterit-02',
    chapterId: 'en-preterit',
    question: 'Complète : « She ___ TV last night. » (watch)',
    options: ['watched', 'watch', 'watches', 'was watch'],
    answerIndex: 0,
    explanation:
      'Avec « last night », l’action est passée et terminée : verbe régulier, donc on ajoute -ed.',
  },
  {
    id: 'en-preterit-03',
    chapterId: 'en-preterit',
    question: 'Mets à la forme négative : « He played. »',
    options: ['He not played.', 'He didn’t played.', 'He didn’t play.', 'He doesn’t play.'],
    answerIndex: 2,
    explanation: 'À la forme négative, on utilise didn’t suivi de la base verbale, sans -ed.',
  },
  {
    id: 'en-preterit-04',
    chapterId: 'en-preterit',
    question: 'Complète : « ___ you see the film yesterday? »',
    options: ['Do', 'Did', 'Does', 'Were'],
    answerIndex: 1,
    explanation: 'Au prétérit, la question se forme avec did + sujet + base verbale.',
  },
  {
    id: 'en-preterit-05',
    chapterId: 'en-preterit',
    question: 'Quel est le prétérit de « buy » ?',
    options: ['buyed', 'brought', 'buied', 'bought'],
    answerIndex: 3,
    explanation:
      'Le verbe « buy » est irrégulier : buy, bought, bought. « Brought » est le prétérit de « bring ».',
  },

  // Anglais — Les comparatifs
  {
    id: 'en-comparatifs-01',
    chapterId: 'en-comparatifs',
    question: 'Quel est le comparatif de « big » ?',
    options: ['bigger', 'biger', 'more big', 'biggest'],
    answerIndex: 0,
    explanation:
      'Adjectif court terminé par consonne-voyelle-consonne : on double la consonne et on ajoute -er.',
  },
  {
    id: 'en-comparatifs-02',
    chapterId: 'en-comparatifs',
    question: 'Complète : « This film is ___ than the book. » (interesting)',
    options: ['interestinger', 'most interesting', 'more interesting', 'as interesting'],
    answerIndex: 2,
    explanation: 'Pour un adjectif long, on place « more » devant, puis « than » pour comparer.',
  },
  {
    id: 'en-comparatifs-03',
    chapterId: 'en-comparatifs',
    question: 'Quel est le comparatif de « good » ?',
    options: ['gooder', 'better', 'more good', 'best'],
    answerIndex: 1,
    explanation: 'Le comparatif de « good » est irrégulier : good, better, the best.',
  },
  {
    id: 'en-comparatifs-04',
    chapterId: 'en-comparatifs',
    question: 'Comment dit-on « aussi grand que » ?',
    options: ['so tall than', 'taller as', 'as tall than', 'as tall as'],
    answerIndex: 3,
    explanation: 'Pour exprimer l’égalité, on encadre l’adjectif avec « as … as ».',
  },

  // Anglais — Vocabulaire : le voyage
  {
    id: 'en-voyage-01',
    chapterId: 'en-voyage',
    question: 'Comment dit-on « une valise » en anglais ?',
    options: ['a backpack', 'a suitcase', 'a ticket', 'a wallet'],
    answerIndex: 1,
    explanation: 'Une valise se dit « a suitcase » ; « a backpack » désigne un sac à dos.',
  },
  {
    id: 'en-voyage-02',
    chapterId: 'en-voyage',
    question: 'Que signifie « a boarding pass » ?',
    options: ['Une carte d’embarquement', 'Un passeport', 'Un billet de train', 'Un bagage à main'],
    answerIndex: 0,
    explanation: 'Le « boarding pass » te permet de monter à bord de l’avion.',
  },
  {
    id: 'en-voyage-03',
    chapterId: 'en-voyage',
    question: 'Comment dit-on « un billet aller-retour » ?',
    options: ['a single ticket', 'a one-way ticket', 'a trip ticket', 'a return ticket'],
    answerIndex: 3,
    explanation:
      'En anglais britannique, l’aller-retour est « a return ticket » ; l’aller simple, « a single ».',
  },
  {
    id: 'en-voyage-04',
    chapterId: 'en-voyage',
    question: 'Que signifie « to miss the train » ?',
    options: ['Regretter le train', 'Prendre le train', 'Rater le train', 'Attendre le train'],
    answerIndex: 2,
    explanation: 'Ici, « to miss » veut dire rater, manquer : le train est parti sans toi.',
  },

  // Anglais — Le present perfect
  {
    id: 'en-present-perfect-01',
    chapterId: 'en-present-perfect',
    question: 'Comment forme-t-on le present perfect ?',
    options: [
      'have/has + participe passé',
      'did + base verbale',
      'be + verbe en -ing',
      'will + base verbale',
    ],
    answerIndex: 0,
    explanation: 'On utilise have, ou has à la 3e personne du singulier, suivi du participe passé.',
  },
  {
    id: 'en-present-perfect-02',
    chapterId: 'en-present-perfect',
    question: 'Complète : « She ___ already finished. »',
    options: ['have', 'has', 'does', 'did'],
    answerIndex: 1,
    explanation: 'Avec « she », 3e personne du singulier, l’auxiliaire have devient « has ».',
  },
  {
    id: 'en-present-perfect-03',
    chapterId: 'en-present-perfect',
    question: 'Complète : « I have ___ to London twice. »',
    options: ['went', 'go', 'goes', 'been'],
    answerIndex: 3,
    explanation:
      'Pour une expérience vécue, on dit « have been to » : je suis déjà allé deux fois à Londres.',
  },
  {
    id: 'en-present-perfect-04',
    chapterId: 'en-present-perfect',
    question: 'Quel mot accompagne souvent le present perfect ?',
    options: ['yesterday', 'last week', 'ever', 'in 2010'],
    answerIndex: 2,
    explanation:
      'Des mots comme « ever », « never » ou « just » relient le passé au présent ; « yesterday » va avec le prétérit.',
  },

  // SVT — La digestion
  {
    id: 'svt-digestion-01',
    chapterId: 'svt-digestion',
    question: 'Où commence la digestion ?',
    options: ['Dans l’estomac', 'Dans la bouche', 'Dans l’intestin grêle', 'Dans le gros intestin'],
    answerIndex: 1,
    explanation:
      'Dès la bouche, les dents broient les aliments et la salive commence à les transformer.',
  },
  {
    id: 'svt-digestion-02',
    chapterId: 'svt-digestion',
    question: 'Où les nutriments passent-ils dans le sang ?',
    options: [
      'Dans l’œsophage',
      'Dans l’estomac',
      'Dans l’intestin grêle',
      'Dans le gros intestin',
    ],
    answerIndex: 2,
    explanation:
      'La paroi de l’intestin grêle, très repliée et riche en vaisseaux sanguins, absorbe les nutriments.',
  },
  {
    id: 'svt-digestion-03',
    chapterId: 'svt-digestion',
    question: 'Quel est le rôle des enzymes digestives ?',
    options: [
      'Simplifier les aliments',
      'Transporter l’oxygène',
      'Stocker les graisses',
      'Fabriquer le sang',
    ],
    answerIndex: 0,
    explanation:
      'Les enzymes découpent les grosses molécules des aliments en petits nutriments assimilables.',
  },
  {
    id: 'svt-digestion-04',
    chapterId: 'svt-digestion',
    question: 'En quoi l’amidon est-il transformé lors de la digestion ?',
    options: ['En protéines', 'En vitamines', 'En lipides', 'En glucose'],
    answerIndex: 3,
    explanation:
      'Grâce à des enzymes, comme l’amylase de la salive, l’amidon est découpé en glucose.',
  },
  {
    id: 'svt-digestion-05',
    chapterId: 'svt-digestion',
    question: 'Que devient la partie des aliments non digérée ?',
    options: [
      'Elle passe dans le sang',
      'Elle retourne à l’estomac',
      'Elle forme les selles',
      'Elle devient de la salive',
    ],
    answerIndex: 2,
    explanation:
      'Les résidus non digérés traversent le gros intestin, puis sont évacués sous forme de selles.',
  },

  // SVT — La reproduction humaine
  {
    id: 'svt-reproduction-01',
    chapterId: 'svt-reproduction',
    question: 'Où sont produits les spermatozoïdes ?',
    options: ['Dans les testicules', 'Dans les ovaires', 'Dans l’utérus', 'Dans la vessie'],
    answerIndex: 0,
    explanation: 'Les testicules produisent des spermatozoïdes en continu, à partir de la puberté.',
  },
  {
    id: 'svt-reproduction-02',
    chapterId: 'svt-reproduction',
    question: 'Où a lieu la fécondation ?',
    options: ['Dans l’ovaire', 'Dans le vagin', 'Dans l’utérus', 'Dans une trompe'],
    answerIndex: 3,
    explanation:
      'Le spermatozoïde rencontre l’ovule dans une trompe, près de l’ovaire : c’est la fécondation.',
  },
  {
    id: 'svt-reproduction-03',
    chapterId: 'svt-reproduction',
    question: 'Combien de temps dure en moyenne un cycle menstruel ?',
    options: ['7 jours', '28 jours', '14 jours', '9 mois'],
    answerIndex: 1,
    explanation:
      'Un cycle dure environ 28 jours, avec une ovulation vers le 14e jour ; il varie d’une personne à l’autre.',
  },
  {
    id: 'svt-reproduction-04',
    chapterId: 'svt-reproduction',
    question: 'Comment appelle-t-on l’implantation de l’embryon dans l’utérus ?',
    options: ['L’ovulation', 'La fécondation', 'La nidation', 'La puberté'],
    answerIndex: 2,
    explanation:
      'Environ une semaine après la fécondation, l’embryon se fixe dans la paroi de l’utérus.',
  },

  // SVT — Séismes et volcans
  {
    id: 'svt-seismes-volcans-01',
    chapterId: 'svt-seismes-volcans',
    question: 'Où commence la rupture des roches lors d’un séisme ?',
    options: ['À l’épicentre', 'Au cratère', 'Dans la cheminée', 'Au foyer'],
    answerIndex: 3,
    explanation:
      'Le foyer est le point de rupture en profondeur ; l’épicentre se trouve juste au-dessus, en surface.',
  },
  {
    id: 'svt-seismes-volcans-02',
    chapterId: 'svt-seismes-volcans',
    question: 'Une éruption avec des coulées de lave fluide est…',
    options: ['Effusive', 'Explosive', 'Sismique', 'Glaciaire'],
    answerIndex: 0,
    explanation: 'Une lave fluide s’écoule facilement en coulées : on parle d’éruption effusive.',
  },
  {
    id: 'svt-seismes-volcans-03',
    chapterId: 'svt-seismes-volcans',
    question: 'Où se produisent la plupart des séismes et des volcans ?',
    options: [
      'Au centre des plaques',
      'Près des pôles',
      'Aux limites des plaques',
      'Dans les déserts',
    ],
    answerIndex: 2,
    explanation:
      'Les plaques lithosphériques se déplacent : c’est à leurs frontières que se concentrent séismes et volcans.',
  },
  {
    id: 'svt-seismes-volcans-04',
    chapterId: 'svt-seismes-volcans',
    question: 'Quel appareil enregistre les ondes sismiques ?',
    options: ['Un baromètre', 'Un sismographe', 'Un thermomètre', 'Un anémomètre'],
    answerIndex: 1,
    explanation:
      'Le sismographe enregistre les vibrations du sol ; le tracé obtenu s’appelle un sismogramme.',
  },

  // SVT — Le système nerveux
  {
    id: 'svt-systeme-nerveux-01',
    chapterId: 'svt-systeme-nerveux',
    question: 'Quel organe commande les mouvements volontaires ?',
    options: ['Le cerveau', 'La moelle épinière', 'Le muscle', 'Le cœur'],
    answerIndex: 0,
    explanation:
      'Le cerveau élabore le message nerveux, transmis aux muscles par la moelle épinière et les nerfs.',
  },
  {
    id: 'svt-systeme-nerveux-02',
    chapterId: 'svt-systeme-nerveux',
    question: 'Quelle cellule transmet les messages nerveux ?',
    options: ['Le globule rouge', 'La cellule musculaire', 'Le neurone', 'Le spermatozoïde'],
    answerIndex: 2,
    explanation:
      'Le neurone est une cellule spécialisée : il transmet des messages nerveux de nature électrique.',
  },
  {
    id: 'svt-systeme-nerveux-03',
    chapterId: 'svt-systeme-nerveux',
    question: 'Comment s’appelle la zone de contact entre deux neurones ?',
    options: ['L’axone', 'Le nerf', 'Le noyau', 'La synapse'],
    answerIndex: 3,
    explanation:
      'À la synapse, le message passe d’un neurone à l’autre grâce à des substances chimiques.',
  },
  {
    id: 'svt-systeme-nerveux-04',
    chapterId: 'svt-systeme-nerveux',
    question: 'Quel est l’effet de l’alcool sur le système nerveux ?',
    options: [
      'Il accélère les réflexes',
      'Il ralentit les réflexes',
      'Il renforce la mémoire',
      'Il n’a aucun effet',
    ],
    answerIndex: 1,
    explanation:
      'L’alcool perturbe la transmission des messages nerveux : on réagit plus lentement.',
  },

  // Physique-chimie — La masse volumique
  {
    id: 'pc-masse-volumique-01',
    chapterId: 'pc-masse-volumique',
    question: 'Quelle formule donne la masse volumique ρ ?',
    options: ['ρ = m × V', 'ρ = V ÷ m', 'ρ = m ÷ V', 'ρ = m + V'],
    answerIndex: 2,
    explanation:
      'La masse volumique est la masse par unité de volume : on divise la masse m par le volume V.',
  },
  {
    id: 'pc-masse-volumique-02',
    chapterId: 'pc-masse-volumique',
    question: 'Quelle est la masse volumique de l’eau liquide ?',
    options: ['1 g/cm³', '1 kg/cm³', '10 g/cm³', '1 g/m³'],
    answerIndex: 0,
    explanation:
      'Un litre d’eau a une masse d’environ 1 kg : sa masse volumique vaut 1 g/cm³, soit 1 kg/L.',
  },
  {
    id: 'pc-masse-volumique-03',
    chapterId: 'pc-masse-volumique',
    question: 'Un objet de 60 g a un volume de 20 cm³. Sa masse volumique ?',
    options: ['1 200 g/cm³', '3 g/cm³', '0,33 g/cm³', '40 g/cm³'],
    answerIndex: 1,
    explanation: 'On applique ρ = m ÷ V : 60 ÷ 20 = 3 g/cm³.',
  },
  {
    id: 'pc-masse-volumique-04',
    chapterId: 'pc-masse-volumique',
    question: 'Un objet flotte sur l’eau si sa masse volumique est…',
    options: [
      'Supérieure à celle de l’eau',
      'Égale à sa masse',
      'Égale à son volume',
      'Inférieure à celle de l’eau',
    ],
    answerIndex: 3,
    explanation:
      'Un corps de masse volumique plus faible que l’eau flotte, comme le bois ou la glace.',
  },
  {
    id: 'pc-masse-volumique-05',
    chapterId: 'pc-masse-volumique',
    question: 'Un litre, c’est combien de cm³ ?',
    options: ['1 000 cm³', '100 cm³', '10 cm³', '1 cm³'],
    answerIndex: 0,
    explanation: '1 L = 1 dm³ = 1 000 cm³ : c’est le volume d’un cube de 10 cm de côté.',
  },

  // Physique-chimie — Les circuits électriques
  {
    id: 'pc-circuits-01',
    chapterId: 'pc-circuits',
    question: 'Avec quel appareil mesure-t-on une tension ?',
    options: ['Un ampèremètre', 'Un ohmmètre', 'Un thermomètre', 'Un voltmètre'],
    answerIndex: 3,
    explanation: 'La tension se mesure en volts (V) avec un voltmètre, branché en dérivation.',
  },
  {
    id: 'pc-circuits-02',
    chapterId: 'pc-circuits',
    question: 'Quelle est l’unité de l’intensité du courant ?',
    options: ['Le volt (V)', 'L’ampère (A)', 'L’ohm (Ω)', 'Le watt (W)'],
    answerIndex: 1,
    explanation: 'L’intensité se mesure en ampères avec un ampèremètre, branché en série.',
  },
  {
    id: 'pc-circuits-03',
    chapterId: 'pc-circuits',
    question: 'Loi d’Ohm : U = 6 V et R = 3 Ω. Que vaut I ?',
    options: ['18 A', '0,5 A', '2 A', '9 A'],
    answerIndex: 2,
    explanation: 'D’après la loi d’Ohm, U = R × I, donc I = U ÷ R = 6 ÷ 3 = 2 A.',
  },
  {
    id: 'pc-circuits-04',
    chapterId: 'pc-circuits',
    question: 'Dans un circuit en série, l’intensité est…',
    options: [
      'La même partout',
      'Plus faible à la fin',
      'Plus forte près de la pile',
      'Divisée par chaque dipôle',
    ],
    answerIndex: 0,
    explanation:
      'Dans une boucle unique, le même courant traverse tous les dipôles : l’intensité est partout identique.',
  },

  // Physique-chimie — Atomes et molécules
  {
    id: 'pc-atomes-molecules-01',
    chapterId: 'pc-atomes-molecules',
    question: 'Quelle est la formule de la molécule d’eau ?',
    options: ['HO₂', 'H₂O', 'H₂O₂', 'HO'],
    answerIndex: 1,
    explanation: 'Une molécule d’eau contient 2 atomes d’hydrogène et 1 atome d’oxygène : H₂O.',
  },
  {
    id: 'pc-atomes-molecules-02',
    chapterId: 'pc-atomes-molecules',
    question: 'Combien d’atomes compte une molécule de CO₂ ?',
    options: ['1', '2', '4', '3'],
    answerIndex: 3,
    explanation: 'CO₂ contient 1 atome de carbone et 2 atomes d’oxygène, soit 3 atomes en tout.',
  },
  {
    id: 'pc-atomes-molecules-03',
    chapterId: 'pc-atomes-molecules',
    question: 'Quel atome a pour symbole N ?',
    options: ['L’azote', 'Le sodium', 'Le néon', 'Le nickel'],
    answerIndex: 0,
    explanation:
      'N vient de « nitrogène », l’autre nom de l’azote ; le sodium, lui, a pour symbole Na.',
  },
  {
    id: 'pc-atomes-molecules-04',
    chapterId: 'pc-atomes-molecules',
    question: 'Lors d’une transformation chimique, les atomes…',
    options: ['Disparaissent', 'Changent de nature', 'Se conservent', 'Se multiplient'],
    answerIndex: 2,
    explanation:
      'Les atomes se réarrangent en nouvelles molécules, mais leur nombre et leur nature restent les mêmes.',
  },

  // Physique-chimie — La combustion
  {
    id: 'pc-combustion-01',
    chapterId: 'pc-combustion',
    question: 'Quel gaz est nécessaire à une combustion ?',
    options: ['Le diazote', 'Le dioxyde de carbone', 'L’hélium', 'Le dioxygène'],
    answerIndex: 3,
    explanation:
      'Une combustion a besoin d’un combustible et d’un comburant : le dioxygène, présent dans l’air.',
  },
  {
    id: 'pc-combustion-02',
    chapterId: 'pc-combustion',
    question: 'Quel gaz trouble l’eau de chaux ?',
    options: ['Le dioxygène', 'Le dioxyde de carbone', 'La vapeur d’eau', 'Le diazote'],
    answerIndex: 1,
    explanation:
      'L’eau de chaux se trouble en présence de dioxyde de carbone : c’est le test qui permet de l’identifier.',
  },
  {
    id: 'pc-combustion-03',
    chapterId: 'pc-combustion',
    question: 'Complète l’équation : C + O₂ → …',
    options: ['CO₂', 'CO', 'C₂O', 'CH₄'],
    answerIndex: 0,
    explanation:
      'Un atome de carbone et une molécule de dioxygène donnent une molécule de CO₂ : les atomes se conservent.',
  },
  {
    id: 'pc-combustion-04',
    chapterId: 'pc-combustion',
    question: 'Quel gaz toxique peut produire une combustion incomplète ?',
    options: ['Le dioxygène', 'Le diazote', 'Le monoxyde de carbone', 'La vapeur d’eau'],
    answerIndex: 2,
    explanation:
      'Sans assez de dioxygène, il se forme du monoxyde de carbone, un gaz toxique, incolore et inodore.',
  },
];
