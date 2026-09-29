import { StudyGate } from '@/features/access/StudyGate';
import { SessionScreen } from '@/features/flashcards/SessionScreen';

export default function FlashcardSessionRoute() {
  return (
    <StudyGate>
      <SessionScreen />
    </StudyGate>
  );
}
