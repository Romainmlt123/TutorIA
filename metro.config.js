// Configuration Metro : celle d'Expo, avec une seule exception pour three.js.
const path = require('node:path');

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/*
 * three.js (≥ r180) : sa version CommonJS appelle `process.emitWarning`, absent de React Native
 * et du navigateur. Les paquets qui font `require('three')` (entrée native de React Three Fiber)
 * plantent au chargement. On sert donc toujours la version module ES, la seule maintenue.
 */
const threeModule = path.join(path.dirname(require.resolve('three')), 'three.module.js');
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'three') return { type: 'sourceFile', filePath: threeModule };
  return (defaultResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

// Modèles 3D d'Explorer (assets/explorer/models), chargés comme des images ou des polices.
config.resolver.assetExts.push('glb');

module.exports = config;
