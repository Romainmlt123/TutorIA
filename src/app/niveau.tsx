import { StudyGate } from '@/features/access/StudyGate';
import { LevelPauseScreen } from '@/features/explorer/LevelPauseScreen';
import { LevelScreen } from '@/features/explorer/LevelScreen';

/** Un niveau d'Explorer passe par le tuteur : mêmes règles (consentement, réglages parentaux). */
export default function LevelRoute() {
  return (
    <StudyGate
      requireConsent
      pause={(block, rules) => <LevelPauseScreen block={block} rules={rules} />}>
      <LevelScreen />
    </StudyGate>
  );
}
