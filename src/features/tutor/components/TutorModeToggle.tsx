import { SegmentedControl } from '@/components/SegmentedControl';
import { fr } from '@/i18n/fr';

export type TutorMode = 'written' | 'voice';

const OPTIONS = [
  { value: 'written', label: fr.tutor.written, icon: 'clavier' },
  { value: 'voice', label: fr.tutor.voice, icon: 'micro' },
] as const;

/** Bascule Écrit / Vocal, centrée en haut du tuteur. */
export function TutorModeToggle({
  value,
  onChange,
}: {
  value: TutorMode;
  onChange: (mode: TutorMode) => void;
}) {
  return (
    <SegmentedControl
      options={OPTIONS}
      value={value}
      onChange={onChange}
      accessibilityLabel={fr.tutor.modeLabel}
    />
  );
}
