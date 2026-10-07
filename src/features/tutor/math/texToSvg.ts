import type * as FontModule from '@mathjax/mathjax-newcm-font/js/svg.js';
import type * as LiteAdaptorModule from '@mathjax/src/js/adaptors/liteAdaptor.js';
import type * as HtmlModule from '@mathjax/src/js/handlers/html.js';
import type * as TexModule from '@mathjax/src/js/input/tex.js';
import type * as MathJaxModule from '@mathjax/src/js/mathjax.js';
import type * as SvgModule from '@mathjax/src/js/output/svg.js';

import { logError } from '@/lib/logger';

/*
 * LaTeX → SVG avec MathJax 4, entièrement sur l'appareil (aucun réseau). Une formule que MathJax
 * ne sait pas dessiner (LaTeX invalide, caractère d'une police non incluse) reste affichée en texte.
 */

/** Formule mise en page : le SVG et ses dimensions en ex (hauteur d'un x de la police). */
export type RenderedTex = {
  xml: string;
  width: number;
  height: number;
  /** Profondeur sous la ligne de base (positif : la formule descend sous la ligne). */
  depth: number;
  /** LaTeX invalide : MathJax a dessiné un message d'erreur à la place de la formule. */
  error: boolean;
};

type Converter = (tex: string, display: boolean) => RenderedTex;

type NavigatorLike = { appVersion?: string; userAgent?: string };

/**
 * MathJax lit `navigator.appVersion` et `navigator.userAgent` à son chargement, pour deviner le
 * système ; React Native n'a ni l'un ni l'autre. On les pose le temps de le charger, puis on rend
 * au navigator de l'app son état d'origine.
 */
function withBrowserNavigator<T>(load: () => T): T {
  const nav = (globalThis as { navigator?: NavigatorLike }).navigator;
  const missing = (['appVersion', 'userAgent'] as const).filter(
    (key) => nav && typeof nav[key] !== 'string',
  );
  for (const key of missing) nav![key] = '';
  try {
    return load();
  } finally {
    for (const key of missing) delete nav![key];
  }
}

/**
 * Chargé au premier besoin, et jamais au démarrage de l'app : si MathJax ne se charge pas sur un
 * appareil, seules les formules restent en texte.
 */
function loadMathJax() {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { mathjax } = require('@mathjax/src/js/mathjax.js') as typeof MathJaxModule;
  const { liteAdaptor } =
    require('@mathjax/src/js/adaptors/liteAdaptor.js') as typeof LiteAdaptorModule;
  const { RegisterHTMLHandler } = require('@mathjax/src/js/handlers/html.js') as typeof HtmlModule;
  const { TeX } = require('@mathjax/src/js/input/tex.js') as typeof TexModule;
  const { SVG } = require('@mathjax/src/js/output/svg.js') as typeof SvgModule;
  require('@mathjax/src/js/input/tex/base/BaseConfiguration.js');
  require('@mathjax/src/js/input/tex/ams/AmsConfiguration.js');
  const { MathJaxNewcmFont } =
    require('@mathjax/mathjax-newcm-font/js/svg.js') as typeof FontModule;
  // Caractères chargés à la demande par MathJax, inclus d'avance : ensembles (ℝ), lettres
  // calligraphiques, symboles mathématiques.
  require('@mathjax/mathjax-newcm-font/js/svg/dynamic/calligraphic.js');
  require('@mathjax/mathjax-newcm-font/js/svg/dynamic/double-struck.js');
  require('@mathjax/mathjax-newcm-font/js/svg/dynamic/math.js');
  /* eslint-enable @typescript-eslint/no-require-imports */
  return { mathjax, liteAdaptor, RegisterHTMLHandler, TeX, SVG, MathJaxNewcmFont };
}

function createConverter(): Converter {
  const { mathjax, liteAdaptor, RegisterHTMLHandler, TeX, SVG, MathJaxNewcmFont } =
    withBrowserNavigator(loadMathJax);
  const adaptor = liteAdaptor();
  RegisterHTMLHandler(adaptor);
  const output = new SVG({
    fontCache: 'none',
    fontData: MathJaxNewcmFont,
    linebreaks: { inline: false },
  });
  // Les fichiers de police importés ci-dessus s'installent sans attendre ; les autres sont marqués
  // absents : une formule qui en aurait besoin échoue, et reste affichée en texte.
  mathjax.asyncLoad = () => undefined;
  mathjax.asyncIsSynchronous = true;
  output.font.loadDynamicFilesSync();
  mathjax.asyncIsSynchronous = false;
  mathjax.asyncLoad = (name: string) => {
    throw new Error(`fichier de police non inclus : ${name}`);
  };
  const document = mathjax.document('', {
    InputJax: new TeX({ packages: ['base', 'ams'] }),
    OutputJax: output,
  });
  return (tex, display) => {
    const container = document.convert(tex, { display });
    const svg = adaptor.firstChild(container) as Parameters<typeof adaptor.outerHTML>[0];
    const xml = adaptor.outerHTML(svg);
    const ex = (name: string) =>
      parseFloat(xml.match(new RegExp(`${name}="(-?[\\d.]+)ex"`))?.[1] ?? '0');
    const align = parseFloat(xml.match(/vertical-align: (-?[\d.]+)ex/)?.[1] ?? '0');
    return {
      // react-native-svg ne lit pas l'attribut style (l'alignement est appliqué par le composant),
      // et les attributs data-* de MathJax ne servent qu'au navigateur.
      xml: xml.replace(/ style="[^"]*"/, '').replace(/ data-[a-z-]+="[^"]*"/g, ''),
      error: xml.includes('data-mjx-error'),
      width: ex('width'),
      height: ex('height'),
      depth: -align,
    };
  };
}

/** undefined : pas encore chargé ; null : le chargement a échoué, on ne le retente pas. */
let converter: Converter | null | undefined;

function getConverter(): Converter | null {
  if (converter === undefined) {
    try {
      converter = createConverter();
    } catch (error) {
      logError('tutor.math.load', error);
      converter = null;
    }
  }
  return converter;
}
const cache = new Map<string, RenderedTex | null>();

/**
 * Formule mise en page, ou null si MathJax ne sait pas la dessiner (LaTeX invalide, caractère non
 * inclus) : l'appelant l'affiche alors en texte. Les résultats sont gardés en mémoire.
 */
export function renderTex(tex: string, display: boolean): RenderedTex | null {
  const key = `${display ? 'D' : 'I'}${tex}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  const convert = getConverter();
  let rendered: RenderedTex | null = null;
  if (!convert) {
    cache.set(key, null);
    return null;
  }
  try {
    rendered = convert(tex, display);
    // Erreur de syntaxe LaTeX : MathJax dessine un message d'erreur, qu'on ne montre pas.
    if (rendered.error) rendered = null;
  } catch (error) {
    // Police non incluse : MathJax demande d'attendre un chargement qui échouera ; on le laisse tomber.
    (error as { retry?: Promise<unknown> }).retry?.catch(() => undefined);
    logError('tutor.math', error);
    rendered = null;
  }
  cache.set(key, rendered);
  return rendered;
}
