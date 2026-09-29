/*
 * Équivalent de :focus-visible pour React Native Web : l'anneau de focus n'apparaît
 * que si la dernière interaction vient du clavier, pas après un clic ou un toucher.
 */
let keyboard = false;

if (typeof document !== 'undefined') {
  document.addEventListener('keydown', () => (keyboard = true), true);
  document.addEventListener('pointerdown', () => (keyboard = false), true);
}

export function isKeyboardModality(): boolean {
  return keyboard;
}
