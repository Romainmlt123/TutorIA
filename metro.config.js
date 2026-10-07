// Configuration Metro : celle d'Expo, avec deux exceptions (three.js et MathJax).
const path = require('node:path');

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/*
 * three.js (≥ r180) : sa version CommonJS appelle `process.emitWarning`, absent de React Native
 * et du navigateur. Les paquets qui font `require('three')` (entrée native de React Three Fiber)
 * plantent au chargement. On sert donc toujours la version module ES, la seule maintenue.
 */
const threeModule = path.join(path.dirname(require.resolve('three')), 'three.module.js');
/*
 * MathJax 4 (formules du tuteur) : ses fichiers s'importent entre eux par des « imports » de
 * package.json (`#default-font/…`, `#js/…`), que Metro ne connaît pas. On les traduit vers la
 * version CommonJS, la même que celle chargée par l'app, pour n'avoir qu'un exemplaire de chaque
 * classe.
 */
const MATHJAX_IMPORTS = {
  '#js/': '@mathjax/src/cjs/',
  '#source/': '@mathjax/src/components/cjs/',
  '#root/': '@mathjax/src/cjs/components/cjs/',
  '#default-font/': '@mathjax/mathjax-newcm-font/cjs/',
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'three') return { type: 'sourceFile', filePath: threeModule };
  const prefix = Object.keys(MATHJAX_IMPORTS).find((p) => moduleName.startsWith(p));
  if (prefix) {
    const target = MATHJAX_IMPORTS[prefix] + moduleName.slice(prefix.length);
    return { type: 'sourceFile', filePath: require.resolve(target) };
  }
  return (defaultResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

// Modèles 3D d'Explorer (assets/explorer/models), chargés comme des images ou des polices.
config.resolver.assetExts.push('glb');

module.exports = config;
