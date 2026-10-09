import { Component, type ReactNode } from 'react';

import { logError } from '@/lib/logger';

type Props = {
  fallback: ReactNode;
  children: ReactNode;
  /** Origine de l'erreur dans le journal (`explorer.scene`, `avatar.scene`). */
  scope: string;
};
type State = { failed: boolean };

/**
 * Filet de sécurité de la scène 3D : si elle échoue (contexte WebGL refusé ou perdu, shader non
 * compilé), l'erreur est journalisée et le repli prend le relais (image fixe, aperçu absent), sans
 * écran d'erreur.
 */
export class SceneBoundary extends Component<Props, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: unknown) {
    logError(this.props.scope, error);
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
